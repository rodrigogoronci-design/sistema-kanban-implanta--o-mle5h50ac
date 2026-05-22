CREATE TABLE IF NOT EXISTS public.rat_email_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id UUID REFERENCES public.tasks(id) ON DELETE CASCADE,
    sent_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    recipient_email TEXT NOT NULL,
    status TEXT NOT NULL,
    error_message TEXT,
    pdf_url TEXT
);

CREATE INDEX IF NOT EXISTS idx_rat_email_logs_task_id ON public.rat_email_logs(task_id);

ALTER TABLE public.rat_email_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "authenticated_select_rat_logs" ON public.rat_email_logs;
CREATE POLICY "authenticated_select_rat_logs" ON public.rat_email_logs
    FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "authenticated_insert_rat_logs" ON public.rat_email_logs;
CREATE POLICY "authenticated_insert_rat_logs" ON public.rat_email_logs
    FOR INSERT TO authenticated WITH CHECK (true);
