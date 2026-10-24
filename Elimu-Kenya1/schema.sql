-- Run in Supabase > SQL Editor.
create table if not exists applications(
 id uuid primary key default gen_random_uuid(), ref text unique not null,
 inst_type text, institution text, year text, course text, helb text, band int not null,
 amount int not null, fee int not null, student text, birth_year int, phone text, email text,
 county text, subcounty text, town text, location text, sublocation text,
 guardian text, relationship text, condition text, story text,
 status text not null default 'pending_payment', created_at timestamptz default now());
create table if not exists payments(
 id uuid primary key default gen_random_uuid(), ref text not null references applications(ref),
 method text default 'send_money', mpesa_code text not null unique, phone text,
 status text not null default 'pending', created_at timestamptz default now());
alter table applications enable row level security; alter table payments enable row level security; -- no policies: browser cannot read/write tables directly

create or replace function submit_application(p jsonb) returns json language plpgsql security definer set search_path=public as $$
declare b int:=(p->>'band')::int; amt int; f int; r text:='EK-'||upper(substr(md5(random()::text||clock_timestamp()::text),1,8));
begin
 if b not between 1 and 5 then raise exception 'invalid band'; end if;
 amt:=case b when 1 then 20000 when 2 then 16250 when 3 then 12500 when 4 then 8750 else 5000 end;
 f:=case b when 1 then 300 when 2 then 250 when 3 then 200 when 4 then 150 else 100 end;
 insert into applications(ref,inst_type,institution,year,course,helb,band,amount,fee,student,birth_year,phone,email,county,subcounty,town,location,sublocation,guardian,relationship,condition,story)
 values(r,left(p->>'instType',40),left(p->>'institution',150),left(p->>'year',20),left(p->>'course',120),left(p->>'helb',30),b,amt,f,left(p->>'student',120),nullif(p->>'birthYear','')::int,left(p->>'phone',25),left(p->>'email',120),left(p->>'county',40),left(p->>'subcounty',120),left(p->>'town',120),left(p->>'location',120),left(p->>'sublocation',120),left(p->>'guardian',120),left(p->>'relationship',20),left(p->>'condition',80),left(p->>'story',600));
 return json_build_object('ref',r,'amount',amt,'fee',f);
end $$;

alter table payments add column if not exists message text;
create or replace function submit_payment(p_ref text,p_code text,p_phone text) returns void language plpgsql security definer set search_path=public as $$
declare m text:=upper(btrim(coalesce(p_code,''))); c text;
begin
 -- the page sends the whole M-Pesa SMS; the transaction code is its first 10-character word
 c:=substring(m from '^([A-Z0-9]{10})(\s|$)');
 if c is null then c:=substring(m from '(?:^|\s)((?=[A-Z0-9]*[A-Z])(?=[A-Z0-9]*[0-9])[A-Z0-9]{10})(?=\s|$)'); end if;
 if c is null then raise exception 'invalid code'; end if;
 if not exists(select 1 from applications where ref=p_ref) then raise exception 'unknown reference'; end if;
 insert into payments(ref,mpesa_code,message,phone) values(p_ref,c,left(p_code,1000),left(p_phone,25));
 update applications set status='payment_submitted' where ref=p_ref and status='pending_payment';
end $$;

create or replace function application_status(p_ref text) returns text language sql security definer set search_path=public as $$
 select status from applications where ref=p_ref $$;

revoke all on function submit_application,submit_payment,application_status from public;
grant execute on function submit_application(jsonb),submit_payment(text,text,text),application_status(text) to anon;
-- To verify a payment: Table Editor > applications > set status = 'verified' (and payments.status = 'verified').
