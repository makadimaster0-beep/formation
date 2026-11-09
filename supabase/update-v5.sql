-- MISE À JOUR v5 : limite d'élèves, présence en direct visible par le prof seul, exclusion d'un élève
-- À exécuter une fois dans Supabase > SQL Editor (après update-v4.sql)
alter table sessions add column if not exists capacity int;
create table if not exists live_links(session_id uuid primary key references sessions on delete cascade, link text not null);
do $$ begin
  if exists(select 1 from information_schema.columns where table_schema='public' and table_name='sessions' and column_name='link') then
    insert into live_links select id,link from sessions where link is not null on conflict do nothing;
    alter table sessions drop column link;   -- le lien n'est plus lisible par les élèves
  end if;
end $$;
create table if not exists live_participants(session_id uuid references sessions on delete cascade, user_id uuid references profiles on delete cascade, status text not null default 'in' check(status in('in','kicked')), joined_at timestamptz default now(), primary key(session_id,user_id));

create or replace function can_edit_session(sid uuid) returns boolean language sql stable security definer set search_path=public as $$
  select exists(select 1 from sessions s where s.id=sid and can_edit(s.course_id)) $$;

alter table live_links enable row level security;
alter table live_participants enable row level security;
drop policy if exists ll_sel on live_links;        create policy ll_sel on live_links for select to authenticated using(can_edit_session(session_id));
drop policy if exists lp_sel on live_participants; create policy lp_sel on live_participants for select to authenticated using(user_id=auth.uid() or can_edit_session(session_id));

-- Lancer le live (limite d'élèves facultative)
drop function if exists start_live(uuid,text);
create or replace function start_live(cid uuid, link text, cap int default null) returns void language plpgsql security definer set search_path=public as $$
declare sid uuid;
begin
  if not can_edit(cid) then raise exception 'Non autorisé'; end if;
  update courses set live=true where id=cid;
  update sessions set ended_at=now() where course_id=cid and ended_at is null;
  insert into sessions(course_id,capacity) values(cid,cap) returning id into sid;
  if coalesce(link,'')<>'' then insert into live_links values(sid,link); end if;
  insert into notifications(user_id,course_id,msg)
    select e.user_id, cid, 'LIVE|'||c.title from enrollments e join courses c on c.id=cid where e.course_id=cid;
end $$;

-- Rejoindre le live : vérifie inscription, exclusion et nombre de places, puis donne le lien
create or replace function join_live(cid uuid) returns text language plpgsql security definer set search_path=public as $$
declare s sessions; l text; n int; st text;
begin
  select * into s from sessions where course_id=cid and ended_at is null order by started_at desc limit 1;
  if s.id is null then raise exception 'NO_LIVE'; end if;
  if not has_access(cid) then raise exception 'NOT_ENROLLED'; end if;
  if not can_edit(cid) then
    perform pg_advisory_xact_lock(hashtext(s.id::text));
    select status into st from live_participants where session_id=s.id and user_id=auth.uid();
    if st='kicked' then raise exception 'KICKED'; end if;
    if st is null then
      if s.capacity is not null then
        select count(*) into n from live_participants where session_id=s.id and status='in';
        if n>=s.capacity then raise exception 'FULL'; end if;
      end if;
      insert into live_participants(session_id,user_id) values(s.id,auth.uid());
    end if;
  end if;
  select link into l from live_links where session_id=s.id;
  return l;
end $$;

create or replace function leave_live(sid uuid) returns void language sql security definer set search_path=public as $$
  delete from live_participants where session_id=sid and user_id=auth.uid() and status='in' $$;

-- Le professeur retire un élève perturbateur (et peut le réadmettre)
create or replace function kick_live(sid uuid, uid uuid) returns void language plpgsql security definer set search_path=public as $$
declare cid uuid; ttl text;
begin
  if not can_edit_session(sid) then raise exception 'Non autorisé'; end if;
  insert into live_participants(session_id,user_id,status) values(sid,uid,'kicked')
    on conflict(session_id,user_id) do update set status='kicked';
  select s.course_id,c.title into cid,ttl from sessions s join courses c on c.id=s.course_id where s.id=sid;
  insert into notifications(user_id,course_id,msg) values(uid,cid,'KICK|'||ttl);
end $$;
create or replace function readmit_live(sid uuid, uid uuid) returns void language plpgsql security definer set search_path=public as $$
begin
  if not can_edit_session(sid) then raise exception 'Non autorisé'; end if;
  delete from live_participants where session_id=sid and user_id=uid;
end $$;

alter publication supabase_realtime add table live_participants;
