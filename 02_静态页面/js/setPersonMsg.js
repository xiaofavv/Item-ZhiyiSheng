// JavaScript Document
$(function(){
	//设置每个input文本框(text、password)
	var inpTxt={
		"border":"1px solid #999",
		"text-indent":".5em",
		"height":"2em",
		"margin-right":"5px"
	}
	$("input[type=text]").not(".form-control").css(inpTxt)
		.on("focus",function(){
			$(this).css("border","1px solid #06f");	
		})
		.on("blur",function(){
			$(this).css("border","1px solid #999");	
		});
	$("input[type=password]").css(inpTxt)
		.on("focus",function(){
			$(this).css("border","1px solid #06f");
		})
		.on("blur",function(){
			$(this).css("border","1px solid #999");
		});
	var nichen=$(".smallPic span").html();
	$("#nichen").html(nichen);
	
	//匹配文本框正则
	//电话号码
	var telreg=/^(13[0-9]|15[0|1|3|6|7|8|9]|18[8|9])\d{8}$/;
	piPei("tel",telreg);
	
	//邮箱
	var emailReg=/\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*/;
	piPei("Email",emailReg);

	//账户设置界面显示出来
	showPage("setInfo","settingMsg");
	
	//我的照片界面显示出来
	showPage("myPic","settingP");
	
	//我的日记页面显示出来
	showPage("myDate","settingD");
	
	//我的记录页面显示出来
	showPage("myTalk","settingT");
	
	//我的好友界面显示出来
	showPage("myFriend","settingF");
	
	//我的礼物页面显示出来
	showPage("myGift","settingG");

	//调用函数显示年月日
	yearmonth();

	//锚记，跳转到响应的位置，如在个人主页点击照片跳转到修改信息的我的照片
	var maoji=(location.hash).substring(1);
	if(maoji=="mypic"){
		changeRightPage("myPic","settingP");
	}else if(maoji=="note"){
		changeRightPage("myDate","settingD");
	}else if(maoji=="talk"){
		changeRightPage("myTalk","settingT");
	}else if(maoji=="friend"){
		changeRightPage("myFriend","settingF");
	}else if(maoji=="gift"){
		changeRightPage("myGift","settingG");
	}else{
		showPersonMsg();
	}
	
});



//匹配正则的函数
function piPei(objId,reg){
	$("#"+objId).on("blur",function(){
		if(reg.test($(this).val())){
			$(this).siblings().eq(2).attr("style","display:none;");
			$(this).siblings().eq(1).attr("style","display:inline;color:green;");
		}else{
			$(this).siblings().eq(2).attr("style","display:inline;color:red;");
			$(this).siblings().eq(1).attr("style","display:none");
		}
	});
}

////切换 我的账户 里面的信息
function setJiBen(thisObj,showObjId){
	var objOptions={
		"color":"#000",
		"cursor":"default"
	}
	var otherOptions={
		"color":"#06f",
		"cursor":"pointer"
	}
	$(thisObj).parent().children().css(otherOptions);
	$(thisObj).css(objOptions);
	$("#mineMsg form").attr("style","display:none");
	$("#"+showObjId).attr("style","display:block");
	if(showObjId=="jiBen"){
		showPersonMsg();
	}else if(showObjId=="geRen"){
		showGeRenPage();
	}
}

//充值的设置
$("#cz").on("click",function(){
	$("#czMoney").slideDown("fast");
	$("#makeSure").click(function(){
		console.log($(".czMoney input[name=zmoney]:checked").length);
		if($(".czMoney input[name=zmoney]:checked").length==1){
			if(confirm("确认充值？")){
				var czBi=parseInt( $("input[name=zmoney]:checked").val() );
				var cZiBi=parseInt( $("#currentZiBi").html() )+czBi;
				$("#currentZiBi").html(cZiBi);
			}
		}else{
			$("#tishiDiv").attr("style","display:block");
		}
	});	
	$(".czMoney input[name=zmoney]").change(function(){
		$("#tishiDiv").attr("style","display:none");
	});
});

function showPage(clickId,pageId){
	$("#"+clickId).click(function(){
		$(this).parent().children().attr("style","color:#85a4ce")
			.children("i").attr("style","color:#85a4ce");
		$(this).css("color","#0000FF")
			.children("i").css("color","#0000FF");
		$("#contentLeft").siblings().attr("style","display:none");
		$("#"+pageId).attr("style","display:block");
	});
}

//显示个人基本信息
function showPersonMsg(){
	$("#baocunjiben").html("");
	$.get("/xygetPersonMsg",null,function(data){
		if(data.code==0){
			alert("非常抱歉，获取个人信息失败，请刷新重试...");
			return;
		}
		//console.info(data);
		var zhanghao=data.uid;
		var uname=data.uname;
		var usex=data.usex;
		var year=data.birthday.substring(0,4);
		var month=data.birthday.substring(5,7);
		var date=data.birthday.substring(8);
		var ublood=data.ublood;
		var uoffice=data.uoffice;
		var umerry=data.umerry;
		var upic=data.upic || "/images/zanwu.jpg";
		//console.info(year+" "+month+" "+date);
		$(".smallPic img").attr("src",".."+upic);
		$("#uname").html(uname);
		$("#zhanghao").html(zhanghao);
		$("#nichen").val(uname);
		$("#usex option[value="+usex+"]").eq(0).attr("selected","selected");
		$("select[name=year] option[value="+year+"]").attr("selected","selected");
		$("select[name=month] option[value="+month+"]").attr("selected","selected");
		$("select[name=day] option[value="+date+"]").attr("selected","selected");
		$("select option[value="+ublood+"]").attr("selected","selected");
		$("select option[value="+uoffice+"]").attr("selected","selected");
		$("select option[value="+umerry+"]").attr("selected","selected");
	});
}
//保存修改过的个人基本资料
function baocunP(){
	$("#baocunjiben").html("");
	var uid= $.trim($("#zhanghao").html());
	var uname= $.trim($("#nichen").val());
	var usex=$.trim($("#usex option:checked").val());
	var year= $.trim($("select[name=year] option:selected").val());
	var month=$.trim($("select[name=month] option:selected").val());
	var day=$.trim($("select[name=day] option:selected").val());
	var birthday=year+"/"+month+"/"+day;
	var ublood= $.trim($("#ublood option:selected").val());
	var uoffice= $.trim($("#uoffice option:selected").val());
	var umerry= $.trim($("#umerry option:selected").val());

	$.post("/xychangejiben",{uid:uid,uname:uname,usex:usex,birthday:birthday,ublood:ublood,uoffice:uoffice,umerry:umerry},function(data){
		if(data==1){
			$("#baocunjiben").html("修改成功...").css("color","green");
		}else{
			$("#baocunjiben").html("修改失败，请重试...").css("color","red");
		}
	},"text");
}
//显示吱币页的数据
function changezibiPage(){
	$.get("/xygetMyZiBi",null,function(data){
		if(data.code==0){
			$("#ziBiTishi").html("获取数据失败，请重试...").css("color","red");
			return;
		}
		var money=data.umoney;
		$("#currentZiBi").html(money);
	});
}
//显示个人资料页的数据
function showGeRenPage(){
	$("#baocunTishi").html("");/*修改*/
	$.get("/xyGeRenInfo",null,function(data){
		if(data.code==0){
			alert("非常抱歉，获取数据失败，请重新加载...");
			return;
		}
		$("#hobby").val(data.uhobby);
		$("#tel").val(data.utel);
		$("#Email").val(data.uemail);
		$("#address").val(data.uaddress);

	});
}
//保存个人资料页的数据
function baocunGeren(){
	$("#baocunTishi").html("");
	var uhobby= $.trim($("#hobby").val());
	var utel= $.trim($("#tel").val());
	var uemail=$.trim($("#Email").val());
	var uaddress= $.trim($("#address").val());

	$.post("/xychangegeren",{uhobby:uhobby,utel:utel,uemail:uemail,uaddress:uaddress},function(data){
		if(data==0){
			$("#baocunTishi").html("保存失败，请重试...").css("color","red");
		}else if(data==1){
			$("#baocunTishi").html("输入的邮箱与注册邮箱不相符，请重试...").css("color","red");
		}else if(data==2){
			$("#baocunTishi").html("保存成功！").css("color","green");
		}
	},"text");
}
//提交修改密码的请求
function showSetMiMaPage(){
	$("#errTishi").html("");
	var oldPwd=$("#oldName").val();
	var newPwd=$("#currentName").val();
	var reNewPwd=$("#reCurrName").val();
	console.info(oldPwd+" "+newPwd+" "+reNewPwd);
	if(oldPwd==""){
		$("#errTishi").html("旧密码不能为空...").css("color","red");
		return;
	}else if(newPwd==""){
		$("#errTishi").html("新密码不能为空...").css("color","red");
		return;
	}else if(reNewPwd==""){
		$("#errTishi").html("确认新密码不能为空...").css("color","red");
		return;
	}else if(newPwd!=reNewPwd){
		$("#errTishi").html("两次输入的新密码输入不一致，请重新输入...").css("color","red");
		return;
	}
	$.post("/xysetMiMa",{oldPwd:oldPwd,newPwd:newPwd},function(data){
		if(data==0){
			$("#errTishi").html("保存失败，请重试...").css("color","red");
		}else if(data==1){
			$("#errTishi").html("原密码输入错误，请重试...").css("color","red");
		}else if(data==2){
			$("#errTishi").html("修改成功！").css("color","green");
		}
	},'text');
}

//点击跳转到显示我的照片
function changeRightPage(objid,showid){
	$("#"+objid).parent().children().attr("style","color:#85a4ce")
		.children("i").attr("style","color:#85a4ce");
	$("#"+objid).css("color","#0000FF")
		.children("i").css("color","#0000FF");
	$("#contentLeft").siblings().attr("style","display:none");
	$("#"+showid).attr("style","display:block");

}

//上传照片，弹出隐藏层
function ShowDiv(show_div,bg_div){
	document.getElementById(show_div).style.display='block';
	document.getElementById(bg_div).style.display='block' ;
	var bgdiv = document.getElementById(bg_div);
	bgdiv.style.width = document.body.scrollWidth;
	bgdiv.style.height = $(document).height();
	$("#"+bg_div).height($(document).height());
	$(".navbar").hide();
};
//上传照片，关闭弹出层
function CloseDiv(show_div,bg_div)
{
	document.getElementById(show_div).style.display='none';
	document.getElementById(bg_div).style.display='none';
	$(".navbar").show();
};

//添加图片
function addZypic(){
	var pgroup= $.trim($("#pgroup").val());
	var premarks= $.trim($("#premarks").val());
	console.info(pgroup);
	//发异步请求到服务器
	$.ajaxFileUpload({
		url:'/addZypic',
		secureuri:false,//SSL用于http协议
		fileElementId:"zymyPic",//要上传的文本框的id
		data:{pgroup:pgroup,premarks:premarks},
		dataType:"json",
		success:function(data,status){
			data= $.trim(data);
			if(data=="1"){
				$(".pgroup").val("");
				$(".premarks").val("");
				$("#zypic").val("");
				$("#showpic").html();
				alert("图片上传成功...");
			}else{
				alert("图片上传失败...");
			}
		},
		error:function(data,status,e){
			alert(e);
		}
	});
}
//显示所有的用户图片
$.get("/getAllZymypic", null, function (data) {
	var str;
	var pic;
	var pics;
	var picStr = "";
	console.info(data);
	$.each(data, function (index, item) {
		picStr = "";
		console.info(item.ppath);
		pic = item.ppath;
		if (pic.indexOf(",")) {
			pics = pic.split(",");
			for (var i = 0; i < pics.length; i++) {
				picStr += "<img class='zyimg' src='../.." + pics[i] + "'width='100px' height='100px'/>";
			}
		} else if (pic != "") {
			picStr += "<img class='zyimg' src='../.." + pic + "'width='100px' heigth='100px' />";
		} else {
			//没有图片
		}
		str =  picStr ;
		$("#showZymypic").append($(str));
	});
}, "json")

//查询好友
function zysearch(){
	var frd= $("#fZH").val();//输入的好友id
	$("#zyfriend").html("");
	$.post("/zysearchf",{uid:frd},function(data){
		$("#zyfriend").append("<tr><td>账号：</td><td>"+data.uid+"</td></tr><tr><td>昵称：</td></td><td>"+data.uname+"</td></tr><tr><td>邮箱：</td><td>"+data.uemail+"</td></tr><tr><td>性别：</td><td>"+data.usex+"</td></tr><tr><td>地址：</td><td>"+data.uaddress+"</td></tr><tr><td>出生日期：</td><td>"+data.birthday+"</td></tr><tr colspan='2'><td></td></tr>");
	},"json");
}
function addfrd(){
	alert("添加好友成功");
	var frd= $("#fZH").val();
	console.info(frd);//输入的好友id
	$.post("/zyaddfrd",{uid:frd},function(data){
		$("#allmyfrd").append("<tr><td>账号：</td><td>"+data.uid+"</td></tr><tr><td>昵称：</td></td><td>"+data.uname+"</td></tr><tr><td>邮箱：</td><td>"+data.uemail+"</td></tr><tr><td>性别：</td><td>"+data.usex+"</td></tr><tr><td>地址：</td><td>"+data.uaddress+"</td></tr><tr><td>出生日期：</td><td>"+data.birthday+"</td></tr>");
	},"json");

}
//        $.post("/zyshowallfid",null,function(data){
//
//        },"json");