import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { to, subject, html, formData, formType } = await req.json()

    // 确保 to 是数组格式
    const recipients = Array.isArray(to) ? to : [to]
    
    console.log('Email notification request:', {
      to: recipients,
      subject,
      formData,
      formType
    })

    // 如果有 RESEND_API_KEY 环境变量，可以使用 Resend 发送邮件
    const resendApiKey = Deno.env.get('RESEND_API_KEY')
    
    if (resendApiKey) {
      // 使用 Resend API 发送邮件到多个收件人
      const resendResponse = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${resendApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'Local-trans Translation <noreply@local-trans.com>',
          to: recipients,
          subject: subject,
          html: html,
        }),
      })

      if (!resendResponse.ok) {
        throw new Error(`Resend API error: ${resendResponse.statusText}`)
      }

      const resendData = await resendResponse.json()
      console.log('Email sent successfully via Resend to:', recipients, resendData)
    } else {
      console.log('No email service configured, email content logged only')
      console.log('Would send email to:', recipients)
      console.log('Subject:', subject)
      console.log('Content:', html)
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Email notification processed successfully for ${recipients.length} recipients`,
        recipients: recipients
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )

  } catch (error) {
    console.error('Error in send-email function:', error)
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      },
    )
  }
})