-- LinguaPlus : à coller dans Supabase > SQL Editor > Run
-- Le PREMIER compte créé devient administrateur, les suivants sont élèves.

create table profiles(id uuid primary key references auth.users on delete cascade, name text not null, role text not null default 'eleve' check(role in('admin','prof','eleve')));
create table courses(id uuid primary key default gen_random_uuid(), title text not null, lang text not null check(lang in('EN','FR')), level text, descr text, teacher uuid references profiles(id) on delete set null, live boolean default false, live_link text, created_at timestamptz default now());
create table lessons(id uuid primary key default gen_random_uuid(), course_id uuid not null references courses on delete cascade, title text not null, content text, q text, opts jsonb default '[]', a int default 0, created_at timestamptz default now());
create table books(id uuid primary key default gen_random_uuid(), course_id uuid not null references courses on delete cascade, title text not null, author text, link text, descr text);
create table enrollments(user_id uuid references profiles on delete cascade, course_id uuid references courses on delete cascade, primary key(user_id,course_id));
create table progress(user_id uuid references profiles on delete cascade, lesson_id uuid references lessons on delete cascade, primary key(user_id,lesson_id));
create table notifications(id uuid primary key default gen_random_uuid(), user_id uuid not null references profiles on delete cascade, course_id uuid references courses on delete cascade, msg text not null, read boolean default false, created_at timestamptz default now());

-- Fonctions
create function my_role() returns text language sql stable security definer set search_path=public as $$ select role from profiles where id=auth.uid() $$;
create function can_edit(cid uuid) returns boolean language sql stable security definer set search_path=public as $$ select my_role()='admin' or exists(select 1 from courses where id=cid and teacher=auth.uid()) $$;

create function handle_new_user() returns trigger language plpgsql security definer set search_path=public as $$
begin insert into profiles(id,name,role) values(new.id, coalesce(new.raw_user_meta_data->>'name',split_part(new.email,'@',1)), case when not exists(select 1 from profiles) then 'admin' else 'eleve' end); return new; end $$;
create trigger on_auth_user_created after insert on auth.users for each row execute function handle_new_user();

-- Lancer un cours en direct + notifier tous les élèves inscrits
create function start_live(cid uuid, link text) returns void language plpgsql security definer set search_path=public as $$
begin
  if not can_edit(cid) then raise exception 'Non autorisé'; end if;
  update courses set live=true, live_link=nullif(link,'') where id=cid;
  insert into notifications(user_id,course_id,msg)
    select e.user_id, cid, '🔴 Le cours « '||c.title||' » vient de démarrer en direct !'
    from enrollments e join courses c on c.id=cid where e.course_id=cid;
end $$;

-- Sécurité (RLS)
alter table profiles enable row level security;
alter table courses enable row level security;
alter table lessons enable row level security;
alter table books enable row level security;
alter table enrollments enable row level security;
alter table progress enable row level security;
alter table notifications enable row level security;

create policy p_sel on profiles for select to authenticated using(true);
create policy p_upd on profiles for update to authenticated using(my_role()='admin');

create policy c_sel on courses for select to authenticated using(true);
create policy c_ins on courses for insert to authenticated with check(my_role() in('admin','prof') and (my_role()='admin' or teacher=auth.uid()));
create policy c_upd on courses for update to authenticated using(can_edit(id));
create policy c_del on courses for delete to authenticated using(can_edit(id));

create policy l_sel on lessons for select to authenticated using(true);
create policy l_all on lessons for all to authenticated using(can_edit(course_id)) with check(can_edit(course_id));
create policy b_sel on books for select to authenticated using(true);
create policy b_all on books for all to authenticated using(can_edit(course_id)) with check(can_edit(course_id));

create policy e_sel on enrollments for select to authenticated using(user_id=auth.uid() or can_edit(course_id));
create policy e_ins on enrollments for insert to authenticated with check(user_id=auth.uid());
create policy e_del on enrollments for delete to authenticated using(user_id=auth.uid());

create policy g_all on progress for all to authenticated using(user_id=auth.uid()) with check(user_id=auth.uid());
create policy g_adm on progress for select to authenticated using(my_role()='admin');

create policy n_sel on notifications for select to authenticated using(user_id=auth.uid());
create policy n_upd on notifications for update to authenticated using(user_id=auth.uid());

-- Notifications en temps réel
alter publication supabase_realtime add table notifications, courses;
alter table sessions enable row level security;
create policy s_sel on sessions for select to authenticated using(true);
create policy s_all on sessions for all to authenticated using(can_edit(course_id)) with check(can_edit(course_id));
-- Page d'accueil publique : les visiteurs voient la liste des formations
create policy c_sel_anon on courses for select to anon using(true);
-- Chaque utilisateur peut modifier son nom (mais pas son rôle)
create policy p_self on profiles for update to authenticated using(id=auth.uid()) with check(id=auth.uid() and role=my_role());
create or replace function start_live(cid uuid, link text) returns void language plpgsql security definer set search_path=public as $$
begin
  if not can_edit(cid) then raise exception 'Non autorisé'; end if;
  update courses set live=true, live_link=nullif(link,'') where id=cid;
  update sessions set ended_at=now() where course_id=cid and ended_at is null;
  insert into sessions(course_id,link) values(cid,nullif(link,''));
  insert into notifications(user_id,course_id,msg)
    select e.user_id, cid, 'LIVE|'||c.title from enrollments e join courses c on c.id=cid where e.course_id=cid;
end $$;
alter publication supabase_realtime add table sessions;
-- MISE À JOUR v3 : cours payants, date/heure, accès réservé aux élèves inscrits
-- À exécuter une fois dans Supabase > SQL Editor (après schema.sql + update-v2.sql)
alter table courses add column if not exists price numeric not null default 0;
alter table courses add column if not exists currency text not null default 'eur';
alter table courses add column if not exists live_at timestamptz;
alter table courses drop column if exists live_link;   -- le lien vit désormais dans sessions (protégé)
alter table enrollments add column if not exists paid boolean default false;

create table if not exists payments(id uuid primary key default gen_random_uuid(), user_id uuid references profiles on delete set null, course_id uuid references courses on delete set null, amount numeric, currency text, status text default 'paid', stripe_session text unique, created_at timestamptz default now());
alter table payments enable row level security;
drop policy if exists pay_sel on payments;
create policy pay_sel on payments for select to authenticated using(user_id=auth.uid() or my_role()='admin');

-- Accès au contenu : admin, professeur du cours, ou élève inscrit (gratuit ou payé)
create or replace function has_access(cid uuid) returns boolean language sql stable security definer set search_path=public as $$
  select can_edit(cid) or exists(select 1 from enrollments where course_id=cid and user_id=auth.uid()) $$;
drop policy if exists l_sel on lessons; create policy l_sel on lessons for select to authenticated using(has_access(course_id));
drop policy if exists b_sel on books;   create policy b_sel on books   for select to authenticated using(has_access(course_id));
drop policy if exists s_sel on sessions; create policy s_sel on sessions for select to authenticated using(has_access(course_id));

-- Inscription : libre si le cours est gratuit ; sinon uniquement par paiement (webhook) ou par l'admin
drop policy if exists e_ins on enrollments;
drop policy if exists e_adm on enrollments;
create policy e_ins on enrollments for insert to authenticated with check(user_id=auth.uid() and exists(select 1 from courses where id=course_id and coalesce(price,0)=0));
create policy e_adm on enrollments for insert to authenticated with check(my_role()='admin');

-- Lancement du cours : seuls les élèves inscrits (donc ayant payé) reçoivent la notification et le lien
create or replace function start_live(cid uuid, link text) returns void language plpgsql security definer set search_path=public as $$
begin
  if not can_edit(cid) then raise exception 'Non autorisé'; end if;
  update courses set live=true where id=cid;
  update sessions set ended_at=now() where course_id=cid and ended_at is null;
  insert into sessions(course_id,link) values(cid,nullif(link,''));
  insert into notifications(user_id,course_id,msg)
    select e.user_id, cid, 'LIVE|'||c.title from enrollments e join courses c on c.id=cid where e.course_id=cid;
end $$;
-- MISE À JOUR v4 : niveaux à l'inscription, alertes niveau bas, vue des élèves, devises
-- À exécuter une fois dans Supabase > SQL Editor (après update-v3.sql)
alter table profiles add column if not exists level text not null default 'A1';
alter table courses drop constraint if exists cur_ok;
alter table courses add constraint cur_ok check (currency in ('eur','usd','zar','aed','sar'));

-- Un compte créé via le formulaire public est TOUJOURS élève (sauf le tout premier = admin).
-- Les professeurs sont créés uniquement par l'administrateur (fonction create-user).
create or replace function handle_new_user() returns trigger language plpgsql security definer set search_path=public as $$
declare lv text; nm text; r text;
begin
  lv:=coalesce(nullif(new.raw_user_meta_data->>'level',''),'A1');
  if lv not in('A1','A2','B1','B2','C1') then lv:='A1'; end if;
  nm:=coalesce(new.raw_user_meta_data->>'name',split_part(new.email,'@',1));
  r:=case when not exists(select 1 from profiles) then 'admin' else 'eleve' end;
  insert into profiles(id,name,role,level) values(new.id,nm,r,lv);
  -- élève de niveau bas : information envoyée aux professeurs et à l'admin
  if r='eleve' and lv in('A1','A2') then
    insert into notifications(user_id,msg) select id,'LOW|'||replace(nm,'|',' ')||'|'||lv from profiles where role in('admin','prof') and id<>new.id;
  end if;
  return new;
end $$;

-- Inscription à un cours d'un niveau supérieur au sien : alerte au professeur du cours et à l'admin
create or replace function notify_gap() returns trigger language plpgsql security definer set search_path=public as $$
declare s profiles; c courses; lv text[]:=array['A1','A2','B1','B2','C1'];
begin
  select * into s from profiles where id=new.user_id; select * into c from courses where id=new.course_id;
  if array_position(lv,s.level)<array_position(lv,c.level) then
    insert into notifications(user_id,course_id,msg)
      select p.id,c.id,'GAP|'||replace(s.name,'|',' ')||'|'||replace(c.title,'|',' ')||'|'||s.level||'|'||c.level
      from profiles p where p.role='admin' or p.id=c.teacher;
  end if;
  return new;
end $$;
drop trigger if exists enroll_gap on enrollments;
create trigger enroll_gap after insert on enrollments for each row execute function notify_gap();

-- Les professeurs et l'admin voient tous les élèves ; un élève ne voit que lui-même et l'équipe pédagogique
drop policy if exists p_sel on profiles;
create policy p_sel on profiles for select to authenticated using(id=auth.uid() or role in('admin','prof') or my_role() in('admin','prof'));
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
