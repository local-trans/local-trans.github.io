// 现代化动画和交互效果

$(document).ready(function() {
    // 导航栏滚动效果
    $(window).scroll(function() {
        if ($(this).scrollTop() > 50) {
            $('.navbar').addClass('scrolled');
        } else {
            $('.navbar').removeClass('scrolled');
        }
    });

    // 滚动时显示动画
    function animateOnScroll() {
        $('.fade-in-up').each(function() {
            var elementTop = $(this).offset().top;
            var elementBottom = elementTop + $(this).outerHeight();
            var viewportTop = $(window).scrollTop();
            var viewportBottom = viewportTop + $(window).height();

            if (elementBottom > viewportTop && elementTop < viewportBottom) {
                $(this).addClass('animated');
            }
        });
    }

    // 初始化滚动动画
    $(window).scroll(animateOnScroll);
    animateOnScroll(); // 页面加载时执行一次

    // 平滑滚动到锚点
    $('a[href^="#"]').on('click', function(event) {
        var target = $(this.getAttribute('href'));
        if (target.length) {
            event.preventDefault();
            $('html, body').stop().animate({
                scrollTop: target.offset().top - 70
            }, 1000);
        }
    });

    // 服务卡片悬停效果
    $('.service-card').hover(
        function() {
            $(this).find('h4').css('color', '#0056b3');
        },
        function() {
            $(this).find('h4').css('color', '#007bff');
        }
    );

    // 产品标签页切换动画
    $('.products .nav-tabs a').on('shown.bs.tab', function(e) {
        var target = $(e.target).attr('href');
        $(target).addClass('fade-in-up');
        setTimeout(function() {
            $(target).removeClass('fade-in-up');
        }, 600);
    });

    // 图片懒加载
    function lazyLoadImages() {
        $('img[data-src]').each(function() {
            var img = $(this);
            var imgTop = img.offset().top;
            var imgBottom = imgTop + img.outerHeight();
            var viewportTop = $(window).scrollTop();
            var viewportBottom = viewportTop + $(window).height();

            if (imgBottom > viewportTop && imgTop < viewportBottom) {
                img.attr('src', img.attr('data-src'));
                img.removeAttr('data-src');
            }
        });
    }

    $(window).scroll(lazyLoadImages);
    lazyLoadImages();

    // 表单验证增强
    $('#contact-form input, #contact-form textarea').on('blur', function() {
        var field = $(this);
        var value = field.val().trim();
        
        if (field.prop('required') && !value) {
            field.addClass('error');
            field.next('.error-message').remove();
            field.after('<div class="error-message" style="color: #dc3545; font-size: 12px; margin-top: 5px;">此字段为必填项</div>');
        } else {
            field.removeClass('error');
            field.next('.error-message').remove();
        }

        // 邮箱格式验证
        if (field.attr('type') === 'email' && value) {
            var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(value)) {
                field.addClass('error');
                field.next('.error-message').remove();
                field.after('<div class="error-message" style="color: #dc3545; font-size: 12px; margin-top: 5px;">请输入有效的邮箱地址</div>');
            }
        }
    });

    // 移动端菜单优化
    $('.navbar-toggle').click(function() {
        setTimeout(function() {
            if ($('.navbar-collapse').hasClass('in')) {
                $('body').addClass('menu-open');
            } else {
                $('body').removeClass('menu-open');
            }
        }, 100);
    });

    // 点击菜单项后关闭移动端菜单
    $('.navbar-nav a').click(function() {
        if ($(window).width() < 768) {
            $('.navbar-collapse').collapse('hide');
            $('body').removeClass('menu-open');
        }
    });

    // 页面加载进度条
    function showLoadingProgress() {
        var progress = 0;
        var interval = setInterval(function() {
            progress += Math.random() * 30;
            if (progress >= 100) {
                progress = 100;
                clearInterval(interval);
                setTimeout(function() {
                    $('#loading-bar').fadeOut();
                }, 200);
            }
            $('#loading-progress').css('width', progress + '%');
        }, 100);
    }

    // 如果页面有加载条，启动进度动画
    if ($('#loading-bar').length) {
        showLoadingProgress();
    }

    // 统计代码优化
    function trackUserBehavior() {
        // 跟踪页面停留时间
        var startTime = Date.now();
        
        $(window).on('beforeunload', function() {
            var timeSpent = Date.now() - startTime;
            if (typeof trackEvent === 'function') {
                trackEvent('page_time_spent', {
                    duration: timeSpent,
                    page: window.location.pathname
                });
            }
        });

        // 跟踪滚动深度
        var maxScroll = 0;
        $(window).scroll(function() {
            var scrollPercent = Math.round(($(window).scrollTop() / ($(document).height() - $(window).height())) * 100);
            if (scrollPercent > maxScroll) {
                maxScroll = scrollPercent;
                
                // 每25%记录一次
                if (maxScroll % 25 === 0 && typeof trackEvent === 'function') {
                    trackEvent('scroll_depth', {
                        depth: maxScroll,
                        page: window.location.pathname
                    });
                }
            }
        });

        // 跟踪点击事件
        $('a, button').click(function() {
            var element = $(this);
            var text = element.text().trim() || element.attr('alt') || element.attr('title') || 'unknown';
            
            if (typeof trackEvent === 'function') {
                trackEvent('click', {
                    element: element.prop('tagName').toLowerCase(),
                    text: text,
                    href: element.attr('href') || '',
                    page: window.location.pathname
                });
            }
        });
    }

    // 启动用户行为跟踪
    trackUserBehavior();

    // 性能监控
    function monitorPerformance() {
        // 监控页面加载时间
        $(window).on('load', function() {
            setTimeout(function() {
                if (window.performance && window.performance.timing) {
                    var timing = window.performance.timing;
                    var loadTime = timing.loadEventEnd - timing.navigationStart;
                    
                    console.log('页面加载时间:', loadTime + 'ms');
                    
                    if (typeof trackEvent === 'function') {
                        trackEvent('performance', {
                            load_time: loadTime,
                            dom_ready: timing.domContentLoadedEventEnd - timing.navigationStart,
                            page: window.location.pathname
                        });
                    }
                }
            }, 1000);
        });

        // 监控资源加载错误
        $(window).on('error', function(e) {
            console.error('资源加载错误:', e.originalEvent.filename, e.originalEvent.message);
            
            if (typeof trackEvent === 'function') {
                trackEvent('error', {
                    type: 'resource_error',
                    filename: e.originalEvent.filename,
                    message: e.originalEvent.message,
                    page: window.location.pathname
                });
            }
        });
    }

    // 启动性能监控
    monitorPerformance();
});

// CSS 动画类
const animationCSS = `
<style>
.animated {
    animation-duration: 0.6s;
    animation-fill-mode: both;
}

.fade-in-up.animated {
    animation-name: fadeInUp;
}

@keyframes fadeInUp {
    from {
        opacity: 0;
        transform: translate3d(0, 40px, 0);
    }
    to {
        opacity: 1;
        transform: translate3d(0, 0, 0);
    }
}

.error {
    border-color: #dc3545 !important;
    box-shadow: 0 0 0 0.2rem rgba(220, 53, 69, 0.25) !important;
}

body.menu-open {
    overflow: hidden;
}

#loading-bar {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 3px;
    background: rgba(0, 123, 255, 0.1);
    z-index: 9999;
}

#loading-progress {
    height: 100%;
    background: linear-gradient(90deg, #007bff, #0056b3);
    width: 0%;
    transition: width 0.3s ease;
}
</style>
`;

// 将动画CSS添加到页面
$('head').append(animationCSS);