#!/bin/bash

# Supabase 函数部署脚本
# 用于解决CORS问题和重新部署Edge Functions

echo "🚀 开始部署Supabase Edge Functions..."

# 检查是否安装了Supabase CLI
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI 未安装"
    echo "请先安装: npm install -g supabase"
    exit 1
fi

# 检查是否已登录
if ! supabase projects list &> /dev/null; then
    echo "🔐 请先登录Supabase:"
    supabase login
fi

# 部署函数
echo "📦 部署send-email函数..."
supabase functions deploy send-email --project-ref qxyqydsiavnjmdvnfgcn

if [ $? -eq 0 ]; then
    echo "✅ send-email函数部署成功!"
    
    # 设置环境变量（如果需要）
    echo "🔧 设置环境变量..."
    # supabase secrets set RESEND_API_KEY=your_resend_api_key --project-ref qxyqydsiavnjmdvnfgcn
    
    echo "🎉 部署完成!"
    echo ""
    echo "函数URL: https://qxyqydsiavnjmdvnfgcn.supabase.co/functions/v1/send-email"
    echo ""
    echo "测试命令:"
    echo "curl -X POST 'https://qxyqydsiavnjmdvnfgcn.supabase.co/functions/v1/send-email' \\"
    echo "  -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF4eXF5ZHNpYXZuam1kdm5mZ2NuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQwMDUyNjksImV4cCI6MjA2OTU4MTI2OX0.bDigwFOPoiXCHGLfTpZ7VXNMAlHEpGCE5iHB8FPI4ZY' \\"
    echo "  -H 'Content-Type: application/json' \\"
    echo "  -d '{\"to\":[\"test@example.com\"],\"subject\":\"测试\",\"html\":\"<p>测试邮件</p>\"}'"
    
else
    echo "❌ 函数部署失败"
    exit 1
fi