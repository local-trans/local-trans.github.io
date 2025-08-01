$(document).ready(function() {
    // 初始化多语言
    initializeLanguage();
    
    // 联系表单提交处理
    $('#contactForm').submit(function(e) {
        e.preventDefault();
        
        // 验证表单
        if (!validateContactForm()) {
            return;
        }
        
        const formData = {
            name: $('#name').val().trim(),
            email: $('#email').val().trim(),
            phone: $('#phone').val().trim(),
            company: $('#company').val().trim(),
            message: $('#message').val().trim(),
            language: getCurrentLanguage()
        };
        
        submitContactForm(formData);
    });
    
    // 翻译员申请表单提交处理
    $('#translatorForm').submit(function(e) {
        e.preventDefault();
        
        // 验证表单
        if (!validateTranslatorForm()) {
            return;
        }
        
        const formData = {
            name: $('#translatorName').val().trim(),
            mobile: $('#translatorMobile').val().trim(),
            comments: $('#translatorComments').val().trim()
        };
        
        submitTranslatorApplication(formData);
    });
    
    // 反馈表单提交处理
    $('#feedbackForm').submit(function(e) {
        e.preventDefault();
        
        // 验证表单
        if (!validateFeedbackForm()) {
            return;
        }
        
        const formData = {
            name: $('#feedbackName').val().trim(),
            mobile: $('#feedbackMobile').val().trim(),
            email: $('#feedbackEmail').val().trim(),
            suggestion: $('#feedbackSuggestion').val().trim()
        };
        
        submitFeedback(formData);
    });
});

// 多语言初始化
function initializeLanguage() {
    const savedLanguage = localStorage.getItem('language') || 'zh';
    loadLanguage(savedLanguage);
    updateLanguageDisplay(savedLanguage);
}

// 加载语言
function loadLanguage(language) {
    $.i18n.properties({
        name: 'strings',
        path: 'i18n/',
        mode: 'map',
        language: language,
        callback: function () {
            // 更新所有带有 data-locale 属性的元素
            $('[data-locale]').each(function () {
                var key = $(this).data('locale');
                if ($.i18n.prop(key)) {
                    $(this).text($.i18n.prop(key));
                }
            });
            
            // 更新placeholder
            $('[data-placeholder-zh], [data-placeholder-en]').each(function() {
                const placeholderKey = language === 'zh' ? 'data-placeholder-zh' : 'data-placeholder-en';
                const placeholder = $(this).attr(placeholderKey);
                if (placeholder) {
                    $(this).attr('placeholder', placeholder);
                }
            });
        }
    });
}

// 切换语言
function switchLanguage(language) {
    localStorage.setItem('language', language);
    loadLanguage(language);
    updateLanguageDisplay(language);
}

// 更新语言显示
function updateLanguageDisplay(language) {
    const langText = language === 'zh' ? '中文' : 'English';
    $('#currentLang').text(langText);
}

// 获取当前语言
function getCurrentLanguage() {
    return localStorage.getItem('language') || 'zh';
}

// 验证联系表单
function validateContactForm() {
    let isValid = true;
    
    // 验证姓名
    const name = $('#name').val().trim();
    if (!name) {
        showValidationError('#name', $.i18n.prop('validation_required_field') || '此字段为必填项');
        isValid = false;
    } else {
        clearValidationError('#name');
    }
    
    // 验证邮箱
    const email = $('#email').val().trim();
    if (!email) {
        showValidationError('#email', $.i18n.prop('validation_required_field') || '此字段为必填项');
        isValid = false;
    } else if (!isValidEmail(email)) {
        showValidationError('#email', $.i18n.prop('validation_invalid_email') || '请输入有效的邮箱地址');
        isValid = false;
    } else {
        clearValidationError('#email');
    }
    
    // 验证翻译需求
    const message = $('#message').val().trim();
    if (!message) {
        showValidationError('#message', $.i18n.prop('validation_fill_required') || '请填写翻译需求');
        isValid = false;
    } else {
        clearValidationError('#message');
    }
    
    return isValid;
}

// 验证翻译员申请表单
function validateTranslatorForm() {
    let isValid = true;
    
    // 验证姓名
    const name = $('#translatorName').val().trim();
    if (!name) {
        showValidationError('#translatorName', $.i18n.prop('validation_required_field') || '此字段为必填项');
        isValid = false;
    } else {
        clearValidationError('#translatorName');
    }
    
    // 验证手机号
    const mobile = $('#translatorMobile').val().trim();
    if (!mobile) {
        showValidationError('#translatorMobile', $.i18n.prop('validation_required_field') || '此字段为必填项');
        isValid = false;
    } else {
        clearValidationError('#translatorMobile');
    }
    
    return isValid;
}

// 验证反馈表单
function validateFeedbackForm() {
    let isValid = true;
    
    // 验证姓名
    const name = $('#feedbackName').val().trim();
    if (!name) {
        showValidationError('#feedbackName', $.i18n.prop('validation_required_field') || '此字段为必填项');
        isValid = false;
    } else {
        clearValidationError('#feedbackName');
    }
    
    // 验证建议
    const suggestion = $('#feedbackSuggestion').val().trim();
    if (!suggestion) {
        showValidationError('#feedbackSuggestion', $.i18n.prop('validation_required_field') || '此字段为必填项');
        isValid = false;
    } else {
        clearValidationError('#feedbackSuggestion');
    }
    
    return isValid;
}

// 显示验证错误
function showValidationError(selector, message) {
    const input = $(selector);
    const validationMessage = input.siblings('.validation-message');
    
    input.addClass('error').removeClass('success');
    validationMessage.text(message).addClass('error').removeClass('success');
}

// 清除验证错误
function clearValidationError(selector) {
    const input = $(selector);
    const validationMessage = input.siblings('.validation-message');
    
    input.removeClass('error').addClass('success');
    validationMessage.text('').removeClass('error').addClass('success');
}

// 验证邮箱格式
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// 提交联系表单到Supabase
function submitContactForm(formData) {
    if (!window.supabaseClient) {
        showAlert($.i18n.prop('supabase_not_initialized') || 'Supabase客户端未初始化', 'error');
        return;
    }
    
    const submitButton = $('#contactForm button[type="submit"]');
    const originalText = submitButton.text();
    
    // 显示加载状态
    submitButton.prop('disabled', true)
                 .addClass('loading')
                 .text($.i18n.prop('submitting') || '提交中...');
    
    // 提交到Supabase
    window.supabaseClient
        .from('contact_inquiries')
        .insert([formData])
        .then(response => {
            if (response.error) {
                console.error('提交失败:', response.error);
                showAlert($.i18n.prop('submit_error') || '提交失败，请稍后重试或直接联系我们：joanne.wan@local-trans.com', 'error');
            } else {
                console.log('提交成功:', response.data);
                showAlert($.i18n.prop('submit_success') || '提交成功！我们会尽快与您联系。', 'success');
                $('#contactForm')[0].reset();
                clearAllValidationErrors('#contactForm');
            }
        })
        .catch(error => {
            console.error('提交失败:', error);
            showAlert($.i18n.prop('network_error') || '网络错误，请检查网络连接后重试，或直接联系我们：joanne.wan@local-trans.com', 'error');
        })
        .finally(() => {
            // 恢复按钮状态
            submitButton.prop('disabled', false)
                         .removeClass('loading')
                         .text(originalText);
        });
}

// 提交翻译员申请到Supabase
function submitTranslatorApplication(formData) {
    if (!window.supabaseClient) {
        showAlert($.i18n.prop('supabase_not_initialized') || 'Supabase客户端未初始化', 'error');
        return;
    }
    
    const submitButton = $('#translatorForm button[type="submit"]');
    const originalText = submitButton.text();
    
    // 显示加载状态
    submitButton.prop('disabled', true)
                 .addClass('loading')
                 .text($.i18n.prop('submitting') || '提交中...');
    
    // 提交到Supabase
    window.supabaseClient
        .from('translator_applications')
        .insert([formData])
        .then(response => {
            if (response.error) {
                console.error('提交失败:', response.error);
                showAlert($.i18n.prop('submit_error') || '提交失败，请稍后重试或直接联系我们：joanne.wan@local-trans.com', 'error');
            } else {
                console.log('提交成功:', response.data);
                showAlert($.i18n.prop('submit_success') || '提交成功！我们会尽快与您联系。', 'success');
                $('#translatorForm')[0].reset();
                clearAllValidationErrors('#translatorForm');
            }
        })
        .catch(error => {
            console.error('提交失败:', error);
            showAlert($.i18n.prop('network_error') || '网络错误，请检查网络连接后重试，或直接联系我们：joanne.wan@local-trans.com', 'error');
        })
        .finally(() => {
            // 恢复按钮状态
            submitButton.prop('disabled', false)
                         .removeClass('loading')
                         .text(originalText);
        });
}

// 提交反馈到Supabase
function submitFeedback(formData) {
    if (!window.supabaseClient) {
        showAlert($.i18n.prop('supabase_not_initialized') || 'Supabase客户端未初始化', 'error');
        return;
    }
    
    const submitButton = $('#feedbackForm button[type="submit"]');
    const originalText = submitButton.text();
    
    // 显示加载状态
    submitButton.prop('disabled', true)
                 .addClass('loading')
                 .text($.i18n.prop('submitting') || '提交中...');
    
    // 提交到Supabase
    window.supabaseClient
        .from('feedback')
        .insert([formData])
        .then(response => {
            if (response.error) {
                console.error('提交失败:', response.error);
                showAlert($.i18n.prop('submit_error') || '提交失败，请稍后重试或直接联系我们：joanne.wan@local-trans.com', 'error');
            } else {
                console.log('提交成功:', response.data);
                showAlert($.i18n.prop('submit_success') || '提交成功！我们会尽快与您联系。', 'success');
                $('#feedbackForm')[0].reset();
                clearAllValidationErrors('#feedbackForm');
            }
        })
        .catch(error => {
            console.error('提交失败:', error);
            showAlert($.i18n.prop('network_error') || '网络错误，请检查网络连接后重试，或直接联系我们：joanne.wan@local-trans.com', 'error');
        })
        .finally(() => {
            // 恢复按钮状态
            submitButton.prop('disabled', false)
                         .removeClass('loading')
                         .text(originalText);
        });
}

// 清除所有验证错误
function clearAllValidationErrors(formSelector) {
    $(formSelector + ' .form-control').removeClass('error success');
    $(formSelector + ' .validation-message').text('').removeClass('error success');
}

// 显示提示信息
function showAlert(message, type = 'info') {
    // 移除现有的提示框
    $('.custom-alert').remove();
    
    // 创建新的提示框
    const alertClass = type === 'success' ? 'alert-success' : 
                      type === 'error' ? 'alert-danger' : 'alert-info';
    
    const alertHtml = `
        <div class="custom-alert alert ${alertClass} alert-dismissible fade show" role="alert" style="position: fixed; top: 20px; right: 20px; z-index: 9999; max-width: 400px;">
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        </div>
    `;
    
    $('body').append(alertHtml);
    
    // 自动隐藏提示框
    setTimeout(() => {
        $('.custom-alert').fadeOut(500, function() {
            $(this).remove();
        });
    }, 5000);
}

// 统计事件跟踪
function trackEvent(category, action, label) {
    try {
        // 51LA统计
        if (typeof LA !== 'undefined' && LA.track) {
            LA.track(action, {
                category: category,
                label: label
            });
        }
        
        // Google Analytics (如果有)
        if (typeof gtag !== 'undefined') {
            gtag('event', action, {
                event_category: category,
                event_label: label
            });
        }
    } catch (error) {
        console.warn('统计跟踪失败:', error);
    }
}

// 全局变量和函数导出
window.switchLanguage = switchLanguage;
window.trackEvent = trackEvent;