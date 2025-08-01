import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')

serve(async (req) => {
  // 处理CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
      },
    })
  }

  try {
    const { to, subject, html, formData, formType } = await req.json()

    // 如果有Resend API Key，使用Resend发送邮件
    if (RESEND_API_KEY) {
      const emailResponse = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'Local-trans Translation <noreply@local-trans.com>',
          to: [to],
          subject: subject,
          html: html,
          reply_to: formData.email || 'noreply@local-trans.com',
        }),
      })

      if (emailResponse.ok) {
        const result = await emailResponse.json()
        return new Response(
          JSON.stringify({ success: true, messageId: result.id }),
          {
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*',
            },
          }
        )
      } else {
        const error = await emailResponse.text()
        console.error('Resend API error:', error)
        throw new Error(`Resend API error: ${error}`)
      }
    } else {
      // 如果没有配置邮件服务，记录到控制台
      console.log('邮件通知 (未配置邮件服务):')
      console.log('收件人:', to)
      console.log('主题:', subject)
      console.log('表单数据:', formData)
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Email logged to console (no email service configured)',
          data: { to, subject, formData }
        }),
        {
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        }
      )
    }

  } catch (error) {
    console.error('Edge Function error:', error)
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message,
        message: 'Failed to send email notification'
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    )
  }
})