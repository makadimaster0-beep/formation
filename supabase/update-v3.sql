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
