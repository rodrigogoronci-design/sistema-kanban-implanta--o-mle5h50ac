import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { createClient } from 'jsr:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

function arrayBufferToBase64(buffer: ArrayBuffer) {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );

  let taskId: string | null = null;
  let recipient = '';
  let pdfUrl = '';

  try {
    const { to, subject, body, attachmentUrl, attachmentName, taskId: reqTaskId } = await req.json();

    taskId = reqTaskId || null;
    recipient = to;
    pdfUrl = attachmentUrl;

    if (!taskId && attachmentUrl) {
      // fallback: attempt to extract UUID from URL if not explicitly provided
      const uuidRegex = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i;
      const match = attachmentUrl.match(uuidRegex);
      if (match) {
        taskId = match[0];
      }
    }

    console.log(`[send-rat-email] To: ${to}, Subject: ${subject}, TaskID: ${taskId}`);
    console.log(`[send-rat-email] Attachment URL: ${attachmentUrl}`);

    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
    
    if (RESEND_API_KEY) {
      const fileRes = await fetch(attachmentUrl);
      const fileBuffer = await fileRes.arrayBuffer();
      const base64Content = arrayBufferToBase64(fileBuffer);

      const emailData = {
        from: 'Service Logic <no-reply@servicelogic.com.br>',
        to: to.split(',').map((e: string) => e.trim()).filter(Boolean),
        subject,
        html: body.replace(/\n/g, '<br>'),
        attachments: [
          {
            filename: attachmentName,
            content: base64Content,
          }
        ]
      };

      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${RESEND_API_KEY}`,
        },
        body: JSON.stringify(emailData),
      });
      
      const data = await res.json();
      if (!res.ok) {
        console.error('Resend Error:', data);
        throw new Error(data.message || 'Error sending email via Resend');
      }
    } else {
      console.log('[send-rat-email] RESEND_API_KEY not found. Simulating email send success.');
    }

    if (taskId) {
      await supabase.from('rat_email_logs').insert({
        task_id: taskId,
        recipient_email: recipient,
        status: 'success',
        pdf_url: pdfUrl
      });
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  } catch (error: any) {
    console.error('[send-rat-email] Error:', error);
    
    if (taskId) {
      await supabase.from('rat_email_logs').insert({
        task_id: taskId,
        recipient_email: recipient || 'unknown',
        status: 'error',
        error_message: error.message,
        pdf_url: pdfUrl
      });
    }

    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }
});
