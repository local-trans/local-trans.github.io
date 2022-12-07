const debugMode = true;
var globalInfo = {};
//首页产品展示的选项卡
$(function () {
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

    // 通过IP获取国家码  http://ip-api.com/json   、  http://geolocation-db.com/json/
    // {"status":"success","country":"Hong Kong","countryCode":"HK","region":"HCW","regionName":"Central and Western District","city":"Hong Kong","zip":"","lat":22.3193,"lon":114.1693,"timezone":"Asia/Hong_Kong","isp":"xTom Hong Kong Limited","org":"Xtom HKG","as":"AS9312 xTom","query":"103.192.225.78"}
    $.ajax({
        url: "http://ip-api.com/json", success: function (result) {
            globalInfo.countryCode = result.countryCode;
            globalInfo.ip = result.query;
            globalInfo.country = result.country;
            globalInfo.region = result.region;
            globalInfo.city = result.city;
            globalInfo.lat = result.lat;
            globalInfo.lon = result.lon;
        }
    });
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

