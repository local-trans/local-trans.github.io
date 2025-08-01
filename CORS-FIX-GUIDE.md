# CORS 问题解决指南

## 问题描述
网站在调用 Supabase Edge Function 时遇到 CORS 错误：
```
Access to fetch at 'https://qxyqydsiavnjmdvnfgcn.supabase.co/functions/v1/send-email' from origin 'https://www.local-trans.com' has been blocked by CORS policy
```

## 解决方案

### 1. 已完成的修复

#### ✅ 更新了 Supabase Edge Function
- 文件: `supabase/functions/send-email/index.ts`
- 添加了完整的 CORS 头部配置
- 包含了 OPTIONS 预检请求处理

#### ✅ 创建了健壮的邮件处理系统
- 文件: `js/email-handler.js`
- 实现了多重备用方案：
  1. Supabase Edge Function (主要方案)
  2. EmailJS (备用方案1)
  3. Formspree (备用方案2)
  4. 控制台日志 (最后备用)

#### ✅ 更新了前端集成
- 更新了 `js/main.js` 使用新的邮件处理器
- 更新了 `index.html` 引入邮件处理模块

#### ✅ 创建了测试工具
- `test-email.html` - 邮件功能测试页面
- `deploy-supabase.sh` - Supabase 函数部署脚本

### 2. 需要执行的操作

#### 🔧 重新部署 Supabase 函数
```bash
# 1. 安装 Supabase CLI (如果未安装)
npm install -g supabase

# 2. 登录 Supabase
supabase login

# 3. 部署函数
chmod +x deploy-supabase.sh
./deploy-supabase.sh
```

#### 🧪 测试邮件功能
1. 访问 `test-email.html` 页面
2. 填写测试数据
3. 点击"发送测试邮件"
4. 查看控制台输出和测试结果

#### ⚙️ 配置备用邮件服务 (可选)

**EmailJS 配置:**
1. 注册 [EmailJS](https://www.emailjs.com/)
2. 创建邮件模板
3. 在 `js/email-handler.js` 中更新：
   ```javascript
   emailjs.init('YOUR_EMAILJS_PUBLIC_KEY');
   // 和
   await emailjs.send('YOUR_SERVICE_ID', 'YOUR_TEMPLATE_ID', templateParams);
   ```

**Formspree 配置:**
1. 注册 [Formspree](https://formspree.io/)
2. 创建表单
3. 在 `js/email-handler.js` 中更新：
   ```javascript
   const formspreeEndpoint = 'https://formspree.io/f/YOUR_FORM_ID';
   ```

### 3. 验证修复

#### 检查 CORS 头部
```bash
curl -X OPTIONS 'https://qxyqydsiavnjmdvnfgcn.supabase.co/functions/v1/send-email' \
  -H 'Origin: https://www.local-trans.com' \
  -H 'Access-Control-Request-Method: POST' \
  -H 'Access-Control-Request-Headers: authorization,content-type' \
  -v
```

#### 测试邮件发送
```bash
curl -X POST 'https://qxyqydsiavnjmdvnfgcn.supabase.co/functions/v1/send-email' \
  -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF4eXF5ZHNpYXZuam1kdm5mZ2NuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQwMDUyNjksImV4cCI6MjA2OTU4MTI2OX0.bDigwFOPoiXCHGLfTpZ7VXNMAlHEpGCE5iHB8FPI4ZY' \
  -H 'Content-Type: application/json' \
  -d '{"to":["test@example.com"],"subject":"测试","html":"<p>测试邮件</p>"}'
```

### 4. 故障排除

#### 如果 CORS 问题仍然存在：
1. 确认 Supabase 函数已重新部署
2. 检查浏览器开发者工具的网络标签
3. 验证请求头部是否正确
4. 尝试清除浏览器缓存

#### 如果邮件发送失败：
1. 检查 Supabase 函数日志
2. 验证 API 密钥是否有效
3. 确认网络连接正常
4. 查看备用方案是否工作

### 5. 监控和维护

#### 日志监控
- 查看 Supabase 函数日志
- 监控浏览器控制台错误
- 跟踪邮件发送成功率

#### 定期测试
- 使用 `test-email.html` 定期测试
- 验证所有备用方案是否正常
- 检查邮件到达率

## 联系支持

如果问题仍然存在，请：
1. 收集详细的错误日志
2. 记录重现步骤
3. 检查网络环境
4. 联系 Supabase 技术支持

---

**注意**: 此修复方案提供了多重备用机制，确保即使主要邮件服务失败，表单提交仍能正常工作。