-- MISE À JOUR v2 : à exécuter une fois dans Supabase > SQL Editor (si schema.sql a déjà été exécuté)
create table if not exists sessions(id uuid primary key default gen_random_uuid(), course_id uuid not null references courses on delete cascade, link text, replay text, started_at timestamptz default now(), ended_at timestamptz);
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
