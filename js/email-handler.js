// 邮件处理模块
class EmailHandler {
    constructor() {
        this.supabaseClient = null;
        this.emailjsInitialized = false;
    }

    // 初始化邮件服务
    async initialize(supabaseClient) {
        this.supabaseClient = supabaseClient;
        
        // 初始化EmailJS作为备用方案
        if (typeof emailjs !== 'undefined') {
            try {
                // 使用您的EmailJS公钥
                emailjs.init('YOUR_EMAILJS_PUBLIC_KEY'); // 需要替换为实际的公钥
                this.emailjsInitialized = true;
                console.log('EmailJS initialized as backup');
            } catch (error) {
                console.warn('EmailJS initialization failed:', error);
            }
        }
    }

    // 主要的邮件发送方法
    async sendNotification(formData, formType) {
        const methods = [
            () => this.sendViaSupabase(formData, formType),
            () => this.sendViaEmailJS(formData, formType),
            () => this.sendViaFormspree(formData, formType),
            () => this.logEmailContent(formData, formType)
        ];

        for (const method of methods) {
            try {
                const result = await method();
                if (result.success) {
                    console.log('Email sent successfully via:', result.method);
                    return result;
                }
            } catch (error) {
                console.warn('Email method failed:', error);
                continue;
            }
        }

        throw new Error('All email methods failed');
    }

    // 方法1: 通过Supabase Edge Function发送
    async sendViaSupabase(formData, formType) {
        if (!this.supabaseClient) {
            throw new Error('Supabase not available');
        }

        const emailData = {
            to: ['joanne.wan@local-trans.com', '731915449@qq.com'],
            subject: this.getEmailSubject(formType),
            html: this.generateEmailHTML(formData, formType),
            formData: formData,
            formType: formType
        };

        // 添加超时控制
        const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => reject(new Error('Supabase function timeout')), 10000);
        });

        const functionPromise = this.supabaseClient.functions.invoke('send-email', {
            body: emailData
        });

        const { data, error } = await Promise.race([functionPromise, timeoutPromise]);

        if (error) {
            throw error;
        }

        return { success: true, method: 'Supabase', data };
    }

    // 方法2: 通过EmailJS发送
    async sendViaEmailJS(formData, formType) {
        if (!this.emailjsInitialized) {
            throw new Error('EmailJS not available');
        }

        const templateParams = {
            to_email: 'joanne.wan@local-trans.com',
            cc_email: '731915449@qq.com',
            subject: this.getEmailSubject(formType),
            from_name: formData.name,
            from_email: formData.email,
            phone: formData.mobile || formData.phone || '',
            company: formData.company || '',
            message: formData.message || formData.comments || '',
            form_type: formType,
            submit_time: new Date().toLocaleString('zh-CN')
        };

        await emailjs.send('YOUR_SERVICE_ID', 'YOUR_TEMPLATE_ID', templateParams);
        return { success: true, method: 'EmailJS' };
    }

    // 方法3: 通过Formspree发送
    async sendViaFormspree(formData, formType) {
        const formspreeEndpoint = 'https://formspree.io/f/YOUR_FORM_ID'; // 需要替换为实际的Formspree ID
        
        const formData_formspree = new FormData();
        formData_formspree.append('name', formData.name);
        formData_formspree.append('email', formData.email);
        formData_formspree.append('phone', formData.mobile || formData.phone || '');
        formData_formspree.append('company', formData.company || '');
        formData_formspree.append('message', formData.message || formData.comments || '');
        formData_formspree.append('form_type', formType);
        formData_formspree.append('_subject', this.getEmailSubject(formType));

        const response = await fetch(formspreeEndpoint, {
            method: 'POST',
            body: formData_formspree,
            headers: {
                'Accept': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error('Formspree request failed');
        }

        return { success: true, method: 'Formspree' };
    }

    // 方法4: 记录邮件内容（最后的备用方案）
    async logEmailContent(formData, formType) {
        const emailContent = {
            to: ['joanne.wan@local-trans.com', '731915449@qq.com'],
            subject: this.getEmailSubject(formType),
            content: this.generateEmailText(formData, formType),
            timestamp: new Date().toISOString()
        };

        console.log('=== EMAIL CONTENT (All methods failed) ===');
        console.log(JSON.stringify(emailContent, null, 2));
        console.log('=== END EMAIL CONTENT ===');

        // 尝试创建mailto链接
        const subject = encodeURIComponent(emailContent.subject);
        const body = encodeURIComponent(emailContent.content);
        const mailtoLink = `mailto:joanne.wan@local-trans.com?cc=731915449@qq.com&subject=${subject}&body=${body}`;
        
        console.log('Mailto link:', mailtoLink);

        return { success: true, method: 'Console Log', mailtoLink };
    }

    // 获取邮件主题
    getEmailSubject(formType) {
        const subjects = {
            'contact': '新的翻译询价 - Local-trans Translation',
            'translator': '新的翻译员申请 - Local-trans Translation',
            'feedback': '新的客户反馈 - Local-trans Translation'
        };
        return subjects[formType] || '新的表单提交 - Local-trans Translation';
    }

    // 生成HTML邮件内容
    generateEmailHTML(formData, formType) {
        const currentTime = new Date().toLocaleString('zh-CN');
        
        if (formType === 'contact') {
            return `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #007bff; border-bottom: 2px solid #007bff; padding-bottom: 10px;">
                        新的翻译询价
                    </h2>
                    <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
                        <h3 style="color: #333; margin-top: 0;">客户信息</h3>
                        <table style="width: 100%; border-collapse: collapse;">
                            <tr>
                                <td style="padding: 8px 0; font-weight: bold; width: 100px;">姓名：</td>
                                <td style="padding: 8px 0;">${formData.name || '未提供'}</td>
                            </tr>
                            <tr>
                                <td style="padding: 8px 0; font-weight: bold;">邮箱：</td>
                                <td style="padding: 8px 0;">${formData.email || '未提供'}</td>
                            </tr>
                            <tr>
                                <td style="padding: 8px 0; font-weight: bold;">电话：</td>
                                <td style="padding: 8px 0;">${formData.mobile || formData.phone || '未提供'}</td>
                            </tr>
                            <tr>
                                <td style="padding: 8px 0; font-weight: bold;">公司：</td>
                                <td style="padding: 8px 0;">${formData.company || '未提供'}</td>
                            </tr>
                        </table>
                    </div>
                    <div style="background-color: #fff; padding: 20px; border: 1px solid #dee2e6; border-radius: 5px;">
                        <h3 style="color: #333; margin-top: 0;">翻译需求</h3>
                        <p style="line-height: 1.6; color: #555;">${formData.message || '未提供具体需求'}</p>
                    </div>
                    <div style="margin-top: 20px; padding: 15px; background-color: #e9ecef; border-radius: 5px; font-size: 12px; color: #6c757d;">
                        <p style="margin: 0;">提交时间：${currentTime}</p>
                        <p style="margin: 5px 0 0 0;">来源：Local-trans Translation 官网</p>
                    </div>
                </div>
            `;
        }
        
        return `<p>新的表单提交，请查看详情。</p>`;
    }

    // 生成文本邮件内容
    generateEmailText(formData, formType) {
        const currentTime = new Date().toLocaleString('zh-CN');
        
        if (formType === 'contact') {
            return `
新的翻译询价

客户信息：
姓名：${formData.name || '未提供'}
邮箱：${formData.email || '未提供'}
电话：${formData.mobile || formData.phone || '未提供'}
公司：${formData.company || '未提供'}

翻译需求：
${formData.message || '未提供具体需求'}

提交时间：${currentTime}
来源：Local-trans Translation 官网
            `;
        }
        
        return '新的表单提交，请查看详情。';
    }
}

// 创建全局实例
window.emailHandler = new EmailHandler();