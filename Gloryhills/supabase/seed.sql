-- Safe draft only. No bank details, people, contact information or payment links.
insert into public.content(kind,slug,title,description,status) values('announcements','editor-training-example','Training example — do not publish','Replace this draft with church-approved content.','draft') on conflict(kind,slug) do nothing;
-- Confirmed by church owner on 2026-09-15. Service schedule confirmed for headquarters only.
insert into public.content(kind,slug,title,description,status,published_at,data) values
('settings','church-information','Church information','Confirmed locations and podcast','published',now(),'{"address":"3rd Floor, Tejumola House, Plot 24 Ogunnusi Road (beside CLAM), Ojodu Berger, Lagos","headquarters":"3rd Floor, Tejumola House, Plot 24 Ogunnusi Road (beside CLAM), Ojodu Berger, Lagos","isheri":"4 Ogun River Road, Isheri Magodo, Lagos","spotify":"https://open.spotify.com/show/4OYlLXQq8Heh6fAkixCdVA"}')
on conflict(kind,slug) do nothing;

insert into public.content(kind,slug,title,description,status,published_at,data) values
('service_times','headquarters-sunday','Sunday worship','8:00 AM–1:00 PM · Ojodu Berger headquarters · WAT','published',now(),'{"location":"headquarters","day":"Sunday","start":"08:00","end":"13:00","timezone":"Africa/Lagos"}'),
('service_times','headquarters-wednesday','Wednesday gathering','6:00 PM–8:30 PM · Ojodu Berger headquarters · WAT','published',now(),'{"location":"headquarters","day":"Wednesday","start":"18:00","end":"20:30","timezone":"Africa/Lagos"}')
on conflict(kind,slug) do nothing;
