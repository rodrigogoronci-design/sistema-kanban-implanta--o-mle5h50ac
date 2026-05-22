import 'jsr:@supabase/functions-js/edge-runtime.d.ts';

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

  try {
    const { to, subject, body, attachmentUrl, attachmentName } = await req.json();

    console.log(`[send-rat-email] To: ${to}, Subject: ${subject}`);
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

    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  } catch (error: any) {
    console.error('[send-rat-email] Error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }
});
