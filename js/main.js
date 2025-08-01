const debugMode = true;
var globalInfo = {};

// Supabase 配置
const supabaseUrl = 'https://qxyqydsiavnjmdvnfgcn.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF4eXF5ZHNpYXZuam1kdm5mZ2NuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQwMDUyNjksImV4cCI6MjA2OTU4MTI2OX0.bDigwFOPoiXCHGLfTpZ7VXNMAlHEpGCE5iHB8FPI4ZY';
const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

// 支持多语言
function loadProperties(lang) {
    $('.slt_i18n').val(lang);
    $.i18n.properties({
        name: 'strings',
        path: 'i18n/',
        mode: 'map',
        language: lang,
        callback: function () {
            $("[data-locale]").each(function () {
                $(this).html($.i18n.prop($(this).data("locale")));
            });
            $("[data-locale-value]").each(function () {
                $(this).attr('value', $.i18n.prop($(this).data("locale-value")));
            });
        }
    });
}

// 页面加载完成后执行
$(document).ready(function () {
    // 初始化语言
    var lang = getUrlParam('lang') || $.cookie('lang') || 'zh';
    loadProperties(lang);
    
    // 语言切换事件
    $('.slt_i18n').change(function () {
        var selectedLang = $(this).val();
        $.cookie('lang', selectedLang, { expires: 365, path: '/' });
        loadProperties(selectedLang);
        
        // 更新URL参数
        var url = new URL(window.location);
        url.searchParams.set('lang', selectedLang);
        window.history.replaceState({}, '', url);
    });

    // 联系表单提交处理
    $('#contact-form').submit(function(e) {
        e.preventDefault();
        
        var formData = {
            name: $('#contact-name').val(),
            email: $('#contact-email').val(),
            phone: $('#contact-phone').val(),
            company: $('#contact-company').val(),
            message: $('#contact-message').val(),
            created_at: new Date().toISOString(),
            language: $('.slt_i18n').val()
        };

        // 表单验证
        if (!formData.name || !formData.email || !formData.message) {
            alert('请填写必填字段');
            return;
        }

        // 提交到Supabase
        submitContactForm(formData);
    });

    // 回到顶部按钮
    $('.btn_top').click(function() {
        $('html, body').animate({scrollTop: 0}, 800);
    });

    // 滚动时显示/隐藏回到顶部按钮
    $(window).scroll(function() {
        if ($(this).scrollTop() > 300) {
            $('.btn_top').fadeIn();
        } else {
            $('.btn_top').fadeOut();
        }
    });
});

// 提交联系表单到Supabase
async function submitContactForm(formData) {
    try {
        // 显示加载状态
        var submitBtn = $('#contact-form button[type="submit"]');
        var originalText = submitBtn.html();
        submitBtn.html('<i class="fa fa-spinner fa-spin"></i> 提交中...').prop('disabled', true);

        const { data, error } = await supabase
            .from('contact_inquiries')
            .insert([formData]);

        if (error) {
            console.error('提交失败:', error);
            alert('提交失败，请稍后重试或直接联系我们');
        } else {
            alert('提交成功！我们会尽快与您联系。');
            $('#contact-form')[0].reset();
            
            // 跟踪转化事件
            if (typeof trackEvent === 'function') {
                trackEvent('contact_form_submit', {
                    language: formData.language,
                    has_phone: !!formData.phone,
                    has_company: !!formData.company
                });
            }
        }
    } catch (err) {
        console.error('网络错误:', err);
        alert('网络错误，请检查网络连接后重试');
    } finally {
        // 恢复按钮状态
        var submitBtn = $('#contact-form button[type="submit"]');
        submitBtn.html(originalText).prop('disabled', false);
    }
}

// 获取URL参数
function getUrlParam(name) {
    var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
    var r = window.location.search.substr(1).match(reg);
    if (r != null) return unescape(r[2]);
    return null;
}

// 初始化统计分析
function initAnalytics() {
    // 页面浏览统计
    if (typeof clicky !== 'undefined') {
        clicky.init(101463889);
    }
    
    // 自定义事件跟踪
    window.trackEvent = function(eventName, properties) {
        // Clicky 事件跟踪
        if (typeof clicky !== 'undefined' && clicky.goal) {
            clicky.goal(eventName, properties);
        }
        
        // 控制台日志（开发环境）
        if (debugMode) {
            console.log('Event tracked:', eventName, properties);
        }
    };

    // 跟踪页面加载
    trackEvent('page_view', {
        page: window.location.pathname,
        language: $('.slt_i18n').val() || 'zh',
        referrer: document.referrer
    });
}

// 工具函数
var utils = {
    // 防抖函数
    debounce: function(func, wait) {
        var timeout;
        return function executedFunction() {
            var context = this;
            var args = arguments;
            var later = function() {
                timeout = null;
                func.apply(context, args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    // 节流函数
    throttle: function(func, limit) {
        var inThrottle;
        return function() {
            var args = arguments;
            var context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(function() { inThrottle = false; }, limit);
            }
        };
    },

    // 格式化日期
    formatDate: function(date) {
        var d = new Date(date);
        var year = d.getFullYear();
        var month = ('0' + (d.getMonth() + 1)).slice(-2);
        var day = ('0' + d.getDate()).slice(-2);
        return year + '-' + month + '-' + day;
    },

    // 验证邮箱格式
    validateEmail: function(email) {
        var re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    },

    // 验证手机号格式
    validatePhone: function(phone) {
        var re = /^1[3-9]\d{9}$/;
        return re.test(phone);
    }
};

// 错误处理
window.onerror = function(msg, url, lineNo, columnNo, error) {
    console.error('JavaScript错误:', {
        message: msg,
        source: url,
        line: lineNo,
        column: columnNo,
        error: error
    });
    
    // 跟踪错误事件
    if (typeof trackEvent === 'function') {
        trackEvent('javascript_error', {
            message: msg,
            source: url,
            line: lineNo,
            column: columnNo
        });
    }
    
    return false;
};

// 页面卸载前的清理工作
$(window).on('beforeunload', function() {
    // 清理定时器、事件监听器等
    if (window.performanceTimer) {
        clearInterval(window.performanceTimer);
    }
});

// 导出全局函数供其他脚本使用
window.LocalTrans = {
    loadProperties: loadProperties,
    submitContactForm: submitContactForm,
    trackEvent: window.trackEvent,
    utils: utils,
    supabase: supabase
};