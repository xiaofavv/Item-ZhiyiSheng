/**
 * Created by Minexieyu on 2016/9/30.
 */
$(function(){
    var timer;
    $("#setPic").hover(function(){
        clearInterval(timer);
        $("#setPicList").stop(true).slideDown("fast");
    },function(){
        clearInterval(timer);
        timer=setInterval(hideList,100);
        //定时器待定
    });
    $("#setPicList").hover(function(){
        clearInterval(timer);
    },function(){
        hideList();
    });
    showPagePerson();
    getTalkPersonData();
});
function hideList(){
    $("#setPicList").stop(true).slideUp("fast");
}

function showPagePerson(){
    $.get("/xyshowPagePerson",null,function(data){
        if(data.code==0){
            alert("非常抱歉，获取数据失败，请刷新页面...");
            return;
        }
        var nc=data.uname || data.uid;
        var upic=data.upic || "/images/zanwu.jpg";
        var ubackground={
            background:function(){
                return (data.ubackground || "url('/images/lalala.jpg')")+" no-repeat";
            },
            backgroundSize:"cover"
        }


        $("#nc").html(nc);
        $("#birthday").html(data.birthday);
        $("#address").html(data.uaddress);
        $("#ubackground").css(ubackground);
        $("#PersonPic").attr("src",".."+upic);
    },'json');
}

function getTalkPersonData(){
    //获取用户和好友的说说数据
    $.get("/xygetAllTalkData",null,function(data){
        console.info(data);
        if(data.code==0){
            alert("非常抱歉，获取数据失败，请刷新重试...");
            return;
        }
        console.info(data.length);
        for(var i=0;i<data.length;i++){
            //console.info(data[i]);
            var pic=data[i].upic || "/images/myInfoPic.png";
            var personName=data[i].fremarks || data[i].uname;
            var time=data[i].ttime;
            var tdata=data[i].tdata;
            var tpic=data[i].tpic || "";
            var tpics;
            var img="";
            if(tpic.indexOf(",")>0){//如果有多个图片
                tpics=tpic.split(",");
                //if(tpics.length>4){
                //    tpics=tpics.slice(0,4);
                //}
                for(var j=0;j<tpics.length;j++){
                    img+='<img src="..'+tpics[j]+'" alt="图片" style="padding-bottom:10px;"/>';
                }
            }else if(tpic!=""){//如果只有一张图片
                img+='<img src="..'+tpic+'" alt="图片" style="padding-bottom:10px;"/>';
            }else{//没有图片
                //img+="";
            }
            var str='<li class="tab-pane active dynamic"><div class="talk_user">';
            str+=' <div class="talk_1"> <img src="..'+pic+'" width="50" height="50" class="talk_img" />';
            str+=' <strong>'+personName+'</strong> ';
            str+='<p>'+time+'</p> </div> <div class="talk_2"><span class="trangle"></span> ';
            str+='<div class="showDynamic"><p> '+tdata+'</p>'+img+'</div> </div> </div></li>"';
            $("#personData").append($(str));
        }
    });
}
