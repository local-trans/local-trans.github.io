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
                    mobile: formData.mobile,
                    message: formData.message,
                    created_at: new Date().toISOString()
                }]);
            
            if (error) {
                throw error;
            }
            
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
                    email: formData.email,
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
            name: $('#contactName').val().trim(),
            email: $('#contactEmail').val().trim(),
            mobile: $('#contactMobile').val().trim(),
            message: $('#message').val().trim()
        };
        
        submitContactForm(formData);
        trackEvent('contact_form_submit');
    });
    
    // 翻译员申请表单提交处理
    $('#translatorForm').submit(function(e) {
        e.preventDefault();
        
        const formData = {
            name: $('#translatorName').val().trim(),
            mobile: $('#translatorMobile').val().trim(),
            comments: $('#translatorComments').val().trim()
        };
        
        submitTranslatorApplication(formData);
        trackEvent('translator_application_submit');
    });
    
    // 反馈表单提交处理
    $('#feedbackForm').submit(function(e) {
        e.preventDefault();
        
        const formData = {
            name: $('#feedbackName').val().trim(),
            email: $('#feedbackEmail').val().trim(),
            message: $('#feedbackMessage').val().trim()
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