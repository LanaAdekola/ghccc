-- Apply before the policy migration (enum addition must commit first).
alter type public.admin_role add value if not exists 'marketing_admin';
