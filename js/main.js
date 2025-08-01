// 全局变量
let currentLanguage = 'zh';
let supabaseClient = null;

// 初始化语言设置
function initializeLanguage() {
    // 从localStorage获取保存的语言设置，默认为中文
    currentLanguage = localStorage.getItem('language') || 'zh';
    loadLanguage(currentLanguage);
}

// 加载语言文件
function loadLanguage(language) {
    $.i18n.properties({
        name: 'strings',
        path: 'i18n/',
        mode: 'both',
        language: language,
        callback: function() {
            try {
                // 更新所有带有 data-locale 属性的元素
                $('[data-locale]').each(function() {
                    const key = $(this).attr('data-locale');
                    const translation = getTranslation(key, $(this).text());
                    $(this).text(translation);
                });
                
                // 更新表单占位符
                updatePlaceholders();
                
                // 更新语言选择器的值
                $('.slt_i18n').val(language);
                
                console.log('Language loaded successfully:', language);
            } catch (error) {
                console.error('Error in language callback:', error);
            }
        },
        error: function(xhr, status, error) {
            console.error('Failed to load language file:', error);
        }
    });
}

// 发送邮件通知函数
async function sendEmailNotification(formData, formType) {
    try {
        // 使用Supabase Edge Function发送邮件
        if (supabaseClient) {
            const emailData = {
                to: ['joanne.wan@local-trans.com', '731915449@qq.com'],
                subject: formType === 'contact' ? '新的翻译询价 - Local-trans Translation' : '新的申请 - Local-trans Translation',
                html: generateEmailContent(formData, formType),
                formData: formData,
                formType: formType
            };
            
            // 调用Supabase Edge Function发送邮件
            const { data, error } = await supabaseClient.functions.invoke('send-email', {
                body: emailData
            });
            
            if (error) {
                console.warn('Email function error:', error);
                // 如果Edge Function失败，尝试备用方案
                await sendEmailBackup(formData, formType);
            } else {
                console.log('Email notification sent successfully via Supabase');
            }
        } else {
            // 如果Supabase不可用，使用备用方案
            await sendEmailBackup(formData, formType);
        }
    } catch (error) {
        console.error('Failed to send email notification:', error);
        // 尝试备用方案
        await sendEmailBackup(formData, formType);
    }
}

// 备用邮件发送方案
async function sendEmailBackup(formData, formType) {
    try {
        // 创建邮件内容
        const subject = encodeURIComponent(formType === 'contact' ? '新的翻译询价 - Local-trans Translation' : '新的申请 - Local-trans Translation');
        const body = encodeURIComponent(generateEmailTextContent(formData, formType));
        
        // 使用mailto作为最后的备用方案（在控制台显示信息）
        const mailtoLink1 = `mailto:joanne.wan@local-trans.com?subject=${subject}&body=${body}`;
        const mailtoLink2 = `mailto:731915449@qq.com?subject=${subject}&body=${body}`;
        
        console.log('Email backup: mailto links generated');
        console.log('Email content:', {
            to: ['joanne.wan@local-trans.com', '731915449@qq.com'],
            subject: formType === 'contact' ? '新的翻译询价 - Local-trans Translation' : '新的申请 - Local-trans Translation',
            content: generateEmailTextContent(formData, formType)
        });
        
        // 在生产环境中，这里可以集成其他邮件服务如SendGrid, Mailgun等
        
    } catch (error) {
        console.error('Backup email method also failed:', error);
    }
}

// 生成邮件内容
function generateEmailContent(formData, formType) {
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
                            <td style="padding: 8px 0;">${formData.mobile || '未提供'}</td>
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

// 生成邮件文本内容
function generateEmailTextContent(formData, formType) {
    const currentTime = new Date().toLocaleString('zh-CN');
    
    if (formType === 'contact') {
        return `
新的翻译询价

客户信息：
姓名：${formData.name || '未提供'}
邮箱：${formData.email || '未提供'}
电话：${formData.mobile || '未提供'}
公司：${formData.company || '未提供'}

翻译需求：
${formData.message || '未提供具体需求'}

提交时间：${currentTime}
来源：Local-trans Translation 官网
        `;
    }
    
    return '新的表单提交，请查看详情。';
}

});
                
                // 更新表单占位符
                updatePlaceholders();
                
                // 更新语言选择器的值
                $('.slt_i18n').val(language);
                
                console.log('Language loaded successfully:', language);
            } catch (error) {
                console.error('Error in language callback:', error);
            }
        },
        error: function(xhr, status, error) {
            console.error('Failed to load language file:', error);
        }
    });
}

// 安全获取翻译文本的函数
function getTranslation(key, fallback) {
    try {
        const translation = $.i18n.prop(key);
        return translation && translation !== key ? translation : (fallback || key);
    } catch (error) {
        console.warn('Translation error for key:', key, error);
        return fallback || key;
    }
}

// 更新表单占位符
function updatePlaceholders() {
    const placeholderKey = currentLanguage === 'zh' ? 'data-placeholder-zh' : 'data-placeholder-en';
    $('[data-placeholder-zh], [data-placeholder-en]').each(function() {
        const placeholder = $(this).attr(placeholderKey);
        if (placeholder) {
            $(this).attr('placeholder', placeholder);
        }
    });
}

// 切换语言
function switchLanguage(lang) {
    currentLanguage = lang;
    localStorage.setItem('language', lang);
    loadLanguage(lang);
}

// 初始化Supabase
function initializeSupabase() {
    try {
        const supabaseUrl = 'https://qxyqydsiavnjmdvnfgcn.supabase.co';
        const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF4eXF5ZHNpYXZuam1kdm5mZ2NuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQwMDUyNjksImV4cCI6MjA2OTU4MTI2OX0.bDigwFOPoiXCHGLfTpZ7VXNMAlHEpGCE5iHB8FPI4ZY';
        
        if (typeof supabase !== 'undefined') {
            supabaseClient = supabase.createClient(supabaseUrl, supabaseKey);
            console.log('Supabase initialized successfully');
        } else {
            console.warn('Supabase library not loaded');
        }
    } catch (error) {
        console.error('Failed to initialize Supabase:', error);
    }
}

// 表单验证函数
function validateForm(formData, formType) {
    const errors = {};
    
    // 通用验证
    if (!formData.name || formData.name.length < 2) {
        errors.name = getTranslation('validation_name_required', '请输入有效的姓名');
    }
    
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        errors.email = getTranslation('validation_email_invalid', '请输入有效的邮箱地址');
    }
    
    if (formData.mobile && !/^[\d\s\-\+\(\)]{10,}$/.test(formData.mobile)) {
        errors.mobile = getTranslation('validation_mobile_invalid', '请输入有效的手机号码');
    }
    
    // 特定表单验证
    if (formType === 'contact') {
        if (!formData.email) {
            errors.email = getTranslation('validation_email_required', '请输入邮箱地址');
        }
        if (!formData.message || formData.message.length < 10) {
            errors.message = getTranslation('validation_message_required', '请输入至少10个字符的详细需求');
        }
    }
    
    return errors;
}

// 显示表单验证错误
function showFormErrors(errors) {
    // 清除之前的错误
    $('.validation-message').text('').hide();
    $('.form-control').removeClass('error');
    
    // 显示新的错误
    Object.keys(errors).forEach(field => {
        const input = $(`#${field}, [name="${field}"]`).first();
        const message = input.siblings('.validation-message');
        
        input.addClass('error');
        message.text(errors[field]).show();
    });
}

// 清除表单错误
function clearFormErrors() {
    $('.validation-message').text('').hide();
    $('.form-control').removeClass('error success');
}

// 显示提交状态
function showSubmitStatus(button, status, message) {
    const originalText = button.data('original-text') || button.text();
    button.data('original-text', originalText);
    
    button.removeClass('loading success error');
    
    switch (status) {
        case 'loading':
            button.addClass('loading').text(getTranslation('submitting', '提交中...'));
            button.prop('disabled', true);
            break;
        case 'success':
            button.addClass('success').text(message || getTranslation('submit_success', '提交成功'));
            setTimeout(() => {
                button.removeClass('success').text(originalText);
                button.prop('disabled', false);
            }, 3000);
            break;
        case 'error':
            button.addClass('error').text(message || getTranslation('submit_error', '提交失败'));
            setTimeout(() => {
                button.removeClass('error').text(originalText);
                button.prop('disabled', false);
            }, 3000);
            break;
    }
}

// 联系表单提交
async function submitContactForm(formData) {
    const submitButton = $('#contactForm button[type="submit"]');
    
    try {
        // 表单验证
        const errors = validateForm(formData, 'contact');
        if (Object.keys(errors).length > 0) {
            showFormErrors(errors);
            return;
        }
        
        clearFormErrors();
        showSubmitStatus(submitButton, 'loading');
        
        // 提交到Supabase
        if (supabaseClient) {
            const { data, error } = await supabaseClient
                .from('contact_inquiries')
                .insert([{
                    name: formData.name,
                    email: formData.email,
                    phone: formData.mobile,
                    message: formData.message,
                    company: formData.company || '',
                    language: currentLanguage
                }]);
            
            if (error) {
                throw error;
            }
            
            // 发送邮件通知
            await sendEmailNotification(formData, 'contact');
            
            showSubmitStatus(submitButton, 'success', getTranslation('contact_submit_success', '咨询提交成功，我们会尽快联系您！'));
            $('#contactForm')[0].reset();
        } else {
            throw new Error('Supabase not initialized');
        }
        
    } catch (error) {
        console.error('Contact form submission error:', error);
        showSubmitStatus(submitButton, 'error', getTranslation('contact_submit_error', '提交失败，请稍后重试'));
    }
}

// 翻译员申请表单提交
async function submitTranslatorApplication(formData) {
    const submitButton = $('#translatorForm button[type="submit"]');
    
    try {
        // 表单验证
        const errors = validateForm(formData, 'translator');
        if (Object.keys(errors).length > 0) {
            showFormErrors(errors);
            return;
        }
        
        clearFormErrors();
        showSubmitStatus(submitButton, 'loading');
        
        // 提交到Supabase
        if (supabaseClient) {
            const { data, error } = await supabaseClient
                .from('translator_applications')
                .insert([{
                    name: formData.name,
                    mobile: formData.mobile,
                    comments: formData.comments,
                    created_at: new Date().toISOString()
                }]);
            
            if (error) {
                throw error;
            }
            
            showSubmitStatus(submitButton, 'success', getTranslation('translator_submit_success', '申请提交成功，我们会尽快联系您！'));
            $('#translatorForm')[0].reset();
        } else {
            throw new Error('Supabase not initialized');
        }
        
    } catch (error) {
        console.error('Translator application submission error:', error);
        showSubmitStatus(submitButton, 'error', getTranslation('translator_submit_error', '提交失败，请稍后重试'));
    }
}

// 反馈表单提交
async function submitFeedback(formData) {
    const submitButton = $('#feedbackForm button[type="submit"]');
    
    try {
        // 表单验证
        const errors = validateForm(formData, 'feedback');
        if (Object.keys(errors).length > 0) {
            showFormErrors(errors);
            return;
        }
        
        clearFormErrors();
        showSubmitStatus(submitButton, 'loading');
        
        // 提交到Supabase
        if (supabaseClient) {
            const { data, error } = await supabaseClient
                .from('feedback')
                .insert([{
                    name: formData.name,
                    mobile: formData.mobile || '',
                    email: formData.email || '',
                    message: formData.message,
                    created_at: new Date().toISOString()
                }]);
            
            if (error) {
                throw error;
            }
            
            showSubmitStatus(submitButton, 'success', getTranslation('feedback_submit_success', '反馈提交成功，感谢您的建议！'));
            $('#feedbackForm')[0].reset();
        } else {
            throw new Error('Supabase not initialized');
        }
        
    } catch (error) {
        console.error('Feedback submission error:', error);
        showSubmitStatus(submitButton, 'error', getTranslation('feedback_submit_error', '提交失败，请稍后重试'));
    }
}

// 回到顶部功能
function initBackToTop() {
    const backToTopButton = $('.btn_top');
    
    // 监听滚动事件
    $(window).scroll(function() {
        if ($(this).scrollTop() > 300) {
            backToTopButton.fadeIn();
        } else {
            backToTopButton.fadeOut();
        }
    });
    
    // 点击回到顶部
    backToTopButton.click(function(e) {
        e.preventDefault();
        $('html, body').animate({
            scrollTop: 0
        }, 800);
    });
}

// 统计事件跟踪
function trackEvent(eventName, eventData = {}) {
    try {
        // 51LA统计
        if (typeof LA !== 'undefined' && LA.track) {
            LA.track(eventName, eventData);
        }
        
        console.log('Event tracked:', eventName, eventData);
    } catch (error) {
        console.warn('Event tracking failed:', error);
    }
}

// 文档就绪时初始化
$(document).ready(function() {
    // 初始化EmailJS
    if (typeof emailjs !== 'undefined') {
        emailjs.init('YOUR_PUBLIC_KEY'); // 需要替换为实际的EmailJS公钥
    }
    
    // 初始化语言
    initializeLanguage();
    
    // 初始化Supabase
    initializeSupabase();
    
    // 初始化回到顶部功能
    initBackToTop();
    
    // 语言切换选择框事件监听
    $('.slt_i18n').change(function() {
        const selectedLang = $(this).val();
        switchLanguage(selectedLang);
        trackEvent('language_switch', { language: selectedLang });
    });
    
    // 联系表单提交处理
    $('#contactForm').submit(function(e) {
        e.preventDefault();
        
        const formData = {
            name: $('#name').val() ? $('#name').val().trim() : '',
            email: $('#email').val() ? $('#email').val().trim() : '',
            mobile: $('#phone').val() ? $('#phone').val().trim() : '',
            company: $('#company').val() ? $('#company').val().trim() : '',
            message: $('#message').val() ? $('#message').val().trim() : ''
        };
        
        submitContactForm(formData);
        trackEvent('contact_form_submit');
    });
    
    // 翻译员申请表单提交处理
    $('#translatorForm').submit(function(e) {
        e.preventDefault();
        
        const formData = {
            name: $('#translatorName').val() ? $('#translatorName').val().trim() : '',
            mobile: $('#translatorMobile').val() ? $('#translatorMobile').val().trim() : '',
            comments: $('#translatorComments').val() ? $('#translatorComments').val().trim() : ''
        };
        
        submitTranslatorApplication(formData);
        trackEvent('translator_application_submit');
    });
    
    // 反馈表单提交处理
    $('#feedbackForm').submit(function(e) {
        e.preventDefault();
        
        const formData = {
            name: $('#feedbackName').val() ? $('#feedbackName').val().trim() : '',
            mobile: $('#feedbackMobile').val() ? $('#feedbackMobile').val().trim() : '',
            email: $('#feedbackEmail').val() ? $('#feedbackEmail').val().trim() : '',
            message: $('#feedbackSuggestion').val() ? $('#feedbackSuggestion').val().trim() : ''
        };
        
        submitFeedback(formData);
        trackEvent('feedback_submit');
    });
    
    // 表单输入时清除错误状态
    $('.form-control').on('input blur', function() {
        $(this).removeClass('error');
        $(this).siblings('.validation-message').hide();
    });
});

// 全局函数导出
window.switchLanguage = switchLanguage;
window.trackEvent = trackEvent;