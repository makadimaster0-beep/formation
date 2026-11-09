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
