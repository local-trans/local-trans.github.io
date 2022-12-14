const debugMode = true;
var globalInfo = {};

// 支持多语言
function loadProperties(lang) {
    $('.slt_i18n').val(lang);
    $.i18n.properties({
        name: 'strings',  //资源文件名称 ， 命名格式： 文件名_国家代号.properties
        path: 'i18n/',    //资源文件路径，注意这里路径是你属性文件的所在文件夹,可以自定义。
        mode: 'map',     //用 Map 的方式使用资源文件中的值
        language: lang,  //这就是国家代号 name+language刚好组成属性文件名：strings+zh -> strings_zh.properties
        callback: function () {
            $("[data-locale]").each(function () {
                $(this).html($.i18n.prop($(this).data("locale")));
            });
        }
    });
}

//首页产品展示的选项卡
$(function () {
    // 切换语言
    $('.slt_i18n').change(function (e) {
        loadProperties($(this).val());
        $.cookie('i18n_locale', $(this).val());
    });

    $('a[data-toggle="tab"]').on('shown.bs.tab.', function (e) {
        //获取已激活标签名称
        var activeTab = $(e.target).text();
        //获取上一个激活标签
        var previousTab = $(e.relatedTarget).text();
        $(".active-tab span").html(activeTab);
        $(".previous-tab span").html(previousTab);
    });

    /*---------返回顶部----------*/
    $(".btn_top").hide();
    $(".btn_top").on("click", function () {
        $('html, body').animate({scrollTop: 0}, 300);
        return false;
    })
    $(window).bind('scroll resize', function () {
        if ($(window).scrollTop() <= 300) {
            $(".btn_top").hide();
        } else {
            $(".btn_top").show();
        }
    })
    /*---------返回顶部 end----------*/

    // 语言
    // #1 从cookie获取语言，为空则通过接口获取
    const cLocale = $.cookie('i18n_locale');
    if (cLocale === undefined) {
        // 通过IP获取国家码  http://ip-api.com/json (不支持https)  、  http://geolocation-db.com/json/
        // {"status":"success","country":"Hong Kong","countryCode":"HK","region":"HCW","regionName":"Central and Western District","city":"Hong Kong","zip":"","lat":22.3193,"lon":114.1693,"timezone":"Asia/Hong_Kong","isp":"xTom Hong Kong Limited","org":"Xtom HKG","as":"AS9312 xTom","query":"103.192.225.78"}
        $.ajax({
            url: "https://geolocation-db.com/json/", success: function (res) {
                const result = JSON.parse(res);
                globalInfo.countryCode = result.country_code;
                globalInfo.ip = result.IPv4;
                globalInfo.country = result.country_name;
                globalInfo.region = result.state;
                globalInfo.city = result.city;
                globalInfo.lat = result.latitude;
                globalInfo.lon = result.longitude;

                loadProperties(globalInfo.countryCode === 'CN' ? 'zh' : 'en');
            }
        });
    } else {
        loadProperties(cLocale);
    }
});
//客服
var flag = 1;
$('#rightArrow').click(function () {
    if (flag == 1) {
        $("#floatDivBoxs").animate({right: '-175px'}, 300);
        $(this).animate({right: '-5px'}, 300);
        $(this).css('background-position', '-50px 0');
        flag = 0;
    } else {
        $("#floatDivBoxs").animate({right: '0'}, 300);
        $(this).animate({right: '170px'}, 300);
        $(this).css('background-position', '0px 0');
        flag = 1;
    }
});
//首页产品详情页img遮罩
$(".products #myTabContent div a").hover(
    function () {
        $(this).find("img").stop().animate({"opacity": "1"}, 700)
    }, function () {
        $(this).find("img").stop().animate({"opacity": "0.5"}, 700)
    }
);
$(".join img").hover(
    function () {
        $(this).stop().animate({"opacity": "1"}, 700)
    }, function () {
        $(this).stop().animate({"opacity": "0.5"}, 700)
    }
);
//回到顶部
$(window).scroll(function () {//
    if ($(window).scrollTop() > 100) {//当高度小于100
        $("#back-to-top").fadeIn(1000);
    } else {
        $("#back-to-top").fadeOut(1000);
    }
});
$("#back-to-top").click(function () {
    $("body").animate({"scrollTop": "0"}, 1500)
});
//.Js-products-li.产品介绍收放

//
//$(".Js-prod-a1").bind("click",function(){
//    if($(".Js-prod-ul1").hasClass("sss")){
//        $(".Js-prod-ul1").removeClass("sss").css("display","block")
//    }else{
//        $(".Js-prod-ul1").addClass("sss").css("display","none")
//    }
//});
//
//$(".Js-prod-a2").bind("click",function(){
//    if($(".Js-prod-ul2").hasClass("sss")){
//        $(".Js-prod-ul2").removeClass("sss").css("display","block")
//    }else{
//        $(".Js-prod-ul2").addClass("sss").css("display","none")
//    }
//});
//
//$(".Js-prod-a3").bind("click",function(){
//    if($(".Js-prod-ul3").hasClass("sss")){
//        $(".Js-prod-ul3").removeClass("sss").css("display","block")
//    }else{
//        $(".Js-prod-ul3").addClass("sss").css("display","none")
//    }
//});
//

//筛选
$(".btn-default").click(function () {//按下事件.筛选.搜索功能
    var cont = $(".text1").val();
    $(".col-md-4").hide().filter(":contains(" + cont + ")").show();//缩减:缩减其余的show
});

function trackEvent(eventName, params) {
    if (!debugMode) {
        LA.track(eventName, params);
    }
}

