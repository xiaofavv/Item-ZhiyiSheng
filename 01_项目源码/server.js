/**
 * Created by Administrator on 16-9-30.
 */
var nodemailer=require("nodemailer");
var express=require("express");
var session=require("express-session");
var bodyparser=require("body-parser");
var app=express();
var mysql=require("mysql");
var fs=require("fs");//操作文件的
var multer=require('multer');//文件上传模块

var app=express();//创建一个应用程序

app.use(bodyparser.urlencoded({extend:false}));//配置和使用body-parser中间件

//配置和使用session中间件
app.use(session({
    secret:'keyboard cat',// 私密 session id的标识
    resave:true,//每次请求是否重新设置session cookie，意思是浏览页面，过晚了59秒，如果在再新一次页面，过期时间重新计算
    saveUninitialized:true,//session cookie 默认值为connect.sid
    cookie:{secure:false,maxAge:1000*60*20}//maxAge:意思是过期时间为20分钟 最大失效时间  secure:用于https
    //secure为true是时，cookie在http中无效 在https中才有效
}));

//配置数据库连接池
var pool=mysql.createPool({
    host:"127.0.0.1",
    post:3306,
    database:"zys",
    user:"root",
    password:"aaaa",
    multipleStatements:true
});

var fileUploadPath="/page/pic";//存入服务器的路径
var fileUploadPathData="/pic";//存入数据库中路径，主要除掉static中的路径
var upload=multer({dest:"."+fileUploadPath});//上传文件的目录设置//配置文件上传的中间件

//上传多张反馈意见图片，每张以，分隔
app.post("/zyuploadFile",upload.array("file"),function(req,res){
    //console.info(req.files);
    if(req.files==undefined){//说明用户没有选择图片
        res.send();
    }else {
        for (var i = 0; i < req.files.length; i++) {
            var fileName="";
            var filePath="";
            var file;
            if(req.files!=undefined) {
                for (var i in req.files) {
                    file = req.files[i];
                    fileName = new Date().getTime() + "_" + file.originalname;
                    fs.renameSync(file.path, __dirname + fileUploadPath + "/" + fileName);
                    if (filePath != "") {
                        filePath += ",";
                    }
                    filePath += fileUploadPathData + "/" + fileName;
                }
            }
        }
    }
    pool.getConnection(function(err,conn) {
        res.header("Content-Type", "application/json");
        if (err) {
            res.send("0");//数据库连接失败
        } else {
            conn.query("insert into suggestions values(0,?,?,?,?)",
                [req.session.currentLoginUser.uid, req.body.sugCon,filePath, req.body.sugType], function (err, result) {
                    conn.release();
                    if (err) {
                        console.info(err);
                        res.send("1");//插入失败
                    } else {
                        res.send("意见已经上传，我们会及时为您处理，请稍候...");//插入成功
                    }
                });
        }
    });
});

var transporter=nodemailer.createTransport({//邮件传输
    host:"smtp.qq.com", //qq smtp服务器地址
    secureConnection:false, //是否使用安全连接，对https协议的
    port:465, //qq邮件服务所占用的端口
    auth:{
        user:"1137211995@qq.com",//开启SMTP的邮箱，有用发送邮件
        pass:"xifynvwbujdkigia"//授权码
    }
});

app.post("/getlma",function(req,res){ //调用指定的邮箱给用户发送邮件
    var code="";
    while(code.length<5){
        code+=Math.floor(Math.random()*10);
    }
    var mailOption={
        from:"1137211995@qq.com",
        to:req.body.eml,//收件人
        subject:"吱一声注册校验码",//纯文本
        html:"<h1>终于等到你，欢迎注册吱一声，您本次的注册验证码为："+code+"</h1>"
    };

    transporter.sendMail(mailOption,function(error,info){
        if(error){
            res.send("1");//邮件发送失败
        }else{
            req.session.yanzhengma=code;
            res.send("0");//邮件发送成功
            console.info("Message send: "+code);
        }
    })
})

//用户注册
app.post("/adduser",function(req,res){
    var reg1=/^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+((\.[a-zA-Z0-9_-]{2,3}){1,2})$/g;//邮箱验证
    var reg2=/^(?![\d]+$)(?![a-zA-Z]+$)(?![^\da-zA-Z]+$).{6,20}$/;//密码
    var reg3=/[\u4e00-\u9fa5]{2,6}$/;//名字
    if(!reg1.test(req.body.eml)){
        res.send("1");//说明邮箱错误
    }else if(req.body.emla != req.session.yanzhengma){
        res.send("2");//验证码错误
    }else if(!reg2.test(req.body.pwd)){
        res.send("3");//说明密码错误
    }else if(!reg3.test(req.body.name)){
        res.send("4");//说明姓名有误
    } else if(req.body.term!='yes'){
        res.send("5");//说明没有同意条款
    } else {
        pool.getConnection(function (err, connection) {
            if (err) {
                res.send("6");//说明数据库连接失败
            } else {
                //console.info(req.body.term);
                if (req.body.emla == req.session.yanzhengma) {
                    connection.query("insert into userInfo(uname,usex,upwd,uemail,uaddress,uoffice,umoney,birthday) values(?,?,?,?,?,?,?,?)",
                        [req.body.name, req.body.sex, req.body.pwd, req.body.eml, req.body.house,
                            req.body.nowdo, 20, req.body.ymd], function (err, result) {
                            connection.release();//释放连接给连接池
                            if (err) {
                                res.send("8" + err);//说明添加数据失败
                            } else {
                                res.send("7");//注册成功
                            }
                        });
                }
            }
        });
    }
})

//检查用户名是否注册
app.get("/checkemail",function(req,res){//检查用户名是否可用
    if(req.query.uemail==""){
        res.send("0");
    }else{
        pool.getConnection(function(err,conn){
            if(err){
                res.send("1");
            }else{
                //参数占位符用1个？ 非参数占位符用两个??
                conn.query("select * from ?? where ??=?",[req.query.tabname,req.query.colName,req.query.uemail],function(err,result){
                    if(err){
                        logger.info(err.message.toString());
                        res.send("2");
                    }else{
                        if(result.length>0){//说明找到了数据
                            res.send("3");
                        }else{
                            res.send("4");
                        }
                    }
                })
            }
        })
    }
});

//退出登录
app.post("/exit",function(req,res){
    req.session.currentLoginUser.uid=null;
    res.send("0");
})

app.post("/addZypic",upload.array("zymyPic"),function(req,res){//处理所有上传的图片的请求
    if(req.body.pgroup==""||req.body.premarks==""){
        res.send("0");
        console.info(req.body);
    }else{
        pool.getConnection(function(err,conn){
            if(err){
                res.send("2");//数据库连接失败
            }else{
                var fileName="";
                var filePath="";
                var file;
                if(req.files!=undefined){
                    for(var i in req.files){
                        file=req.files[i];
                        fileName=new Date().getTime()+"_"+file.originalname;
                        fs.renameSync(file.path,__dirname+fileUploadPath+"/"+fileName);
                        if(filePath!=""){
                            filePath+=",";
                        }
                        filePath+=fileUploadPathData+"/"+fileName;//1.jpg,2.jpg
                    }
                }
                //console.info(filePath);
                //console.info(req.files);
                conn.query("insert into photoinfo values(0,?,?,?,?,?)",
                    [req.session.currentLoginUser.uid,req.body.premarks,req.body.pgroup,"1",filePath],function(err,result){
                        conn.release();
                        if(err){
                            console.info(err);
                            res.send("3");
                        }else{
                            res.send("1");
                        }
                    });
            }
        });
    }
});

app.get("/getAllZymypic",function(req,res){//获取所有用户图片信息
    pool.getConnection(function(err,conn){
        res.header("Content-Type","application/json");
        if(err){
            res.send('{"err":"0"}');
        }else{
            conn.query("select * from photoinfo where photoinfo.uid=?",[req.session.currentLoginUser.uid],function(err,result){
                conn.release();
                if(err){
                    res.send('{"err":"0"}');
                }else{
                    res.send(result);
                }
            });
        }
    });
});

//查询好友
app.post("/zysearchf",function(req,res){
    if(req.body.uid==undefined){
        res.send("1");
    }else{
        pool.getConnection(function(err,conn){
            if(err){
                res.send("2");
            }else{
                conn.query("select * from userinfo where uid=?",[req.body.uid],function(err,result){
                    if(err){
                        res.send("4");
                    }else{
                        res.send(result[0]);
                    }
                })
            }
        })
    }
});

//添加好友
app.post("/zyaddfrd",function(req,res){
    pool.getConnection(function(err,conn){
        conn.query("select * from userinfo where uid=?",[req.body.uid],function(err,result){
            if(err){
                res.send("1");
            }else{
                res.send(result[0]);
            }
        })
    })
});

//app.post("/zyshowallfid",function(req,res){
//    pool.getConnection(function(err,conn){
//        conn.query("select userinfo.*,friendinfo.fid from userinfo,friendinfo where ??=friendinfo.fid",[req.session.currentLoginUser.uid],function(err,result){
//            if(err){
//                res.send("1");
//            }else{
//                res.send(result[0]);
//                console.info(result[0]);
//            }
//        })
//    })
//})

///////////////////////////////////////////////////////////////
app.get("/",function(req,res){//监听"127.0.0.1:8888/"这个路径，指定显示的是login.html页面
    res.sendFile(__dirname+req.url+"/page/login.html");//必须使用绝对路径
});

//监听所有类型的请求，注意此时要将静态中间件放到这个的后面，否则当我们访问静态资源时，不会被这个监听拦截
app.all("/back/*",function(req,res,next){
    if(req.session.currentLoginUser==undefined){//如果用户没有登录
        res.send("<script>location.href='/login.html';</script>");//返回登录界面
    }else{//说明已经登录
        next();//将请求往下传递给对应的处理方法
    }
});

//处理登录的请求
app.post("/xyuserLogin",function(req,res){
    if(req.body.uname==""){
        res.send("1");//用户名为空
    }else if(req.body.pwd==""){
        res.send("2");//密码为空
    }else{
        pool.getConnection(function(err,conn){
            if(err){
                res.send("3");//获取数据库连接池失败
            } else{//查询登录邮箱和密码是否正确
                conn.query("select uid,uemail,upwd from userinfo where uemail=? and upwd=?",[req.body.uname,req.body.pwd],function(err,result){
                    conn.release();//释放连接给连接池
                    if(err){
                        res.send("4");//数据库查询失败
                    }else{
                        if(result.length>0){//说明用户登录成功，则需要将当前用户信息存到session中
                            req.session.currentLoginUser=result[0];//保存此时用户的数据，便于之后的登录验证
                            //console.info(req.session.currentLoginUser);
                            res.send("6");
                        }else{//说明没查询到数据
                            res.send("5");
                        }
                    }
                });
            }
        });
    }
});
//处理判断用户是否已经登录的请求
app.get("/xyuserIsLogin",function(req,res){//如果服务器端session还有值，就表示登录还没过期
    if(req.session.currentLoginUser==undefined){//此时登录已过期 即处于用户未登录的状态
        res.send("0");
    }else{//用户已经登录
        res.send("z"+req.session.currentLoginUser.uid);//将登录的用户名传过去
    }
});

//处理首页获取用户所有信息的请求
app.get("/xygetAllUserInfo",function(req,res){
    pool.getConnection(function(err,conn){
        res.header("Content-Type","application/json");//说明以json形式传去数据
        if(err){
            res.send('{"code":"0"}');
        }else{
            var sql="select u.uid,u.uname,u.upic,";
            sql+="(select count(t.tid) from userinfo u,talkinfo t where u.uid=t.uid and u.uid=?) as tcount,";
            sql+="(select count(distinct(f.fid)) from userinfo u,friendinfo f where u.uid=f.uid and u.uid=?) as fcount,";
            sql+="(select count(n.nid) from userinfo u,noteinfo n where u.uid=n.uid and u.uid=?) as ncount";
            sql+=" from userinfo u where u.uid=?";
            var uid=req.session.currentLoginUser.uid;
            conn.query(sql,[uid,uid,uid,uid],function(err,result){
                conn.release();
                if(err){
                    res.send('{"code":"0"}');
                    console.info(err);
                }else{
                    if(result.length>0){
                        res.send(result[0]);
                    }else{
                        res.send("0");
                    }
                }
            });
        }
    });
});

//处理获取用户和好友说说记录的请求
app.get("/xygetAllTalkData",function(req,res){
    pool.getConnection(function(err,conn){
        res.header("Content-Type","application/json");
        if(err){
            res.send('{"code":"0"}');
        }else{
            var sql="select DISTINCT(u.uid),u.upic,u.uname,u.usex,";
            sql+="t.* from talkinfo t,friendinfo f,userinfo u where t.uid in (?,(select f.fid from friendinfo f where f.uid=?)) ";
            sql+="and t.uid=u.uid and u.uid=f.uid and f.status=1 ORDER BY ttime DESC";
            var queryid=req.session.currentLoginUser.uid;
            conn.query(sql,[queryid,queryid],function(err,result){
                conn.release();
                if(err){
                    res.send('{"code":"0"}');
                }else{
                    //res.send('{"code":"1"}');
                    res.send(result);
                }
            });
        }
    });
});

//处理个人主页显示的请求
app.get("/xyshowPagePerson",function(req,res){
    pool.getConnection(function(err,conn){
        res.header("Content-Type","application/json");//说明以json形式传去数据
        if(err){
            res.send('{"code":"0"}');
        }else{
            conn.query("select uid,uname,birthday,uaddress,upic,ubackground from userinfo where uid=?",[req.session.currentLoginUser.uid],function(err,result){
                conn.release();
                if(err){
                    res.send('{"code":"0"}');
                    console.info(err);
                }else{
                    res.send(result[0]);
                }
            });
        }

    });
});

//处理获取基本资料的请求
app.get("/xygetPersonMsg",function(req,res){
    pool.getConnection(function(err,conn){
        res.header("Content-Type","application/json");//说明以json形式传去数据
        if(err){
            console.info('{"code":"0"}');
        }else{
            conn.query("select uid,upic,uname,usex,birthday,ublood,umerry,uoffice from userinfo where uid=?",[req.session.currentLoginUser.uid],function(err,result){
                conn.release();
                if(err){
                    res.send('{"code":"0"}');
                }else{
                    res.send(result[0]);
                }
            });
        }
    });
});

//处理修改基本资料的请求
app.post("/xychangejiben",function(req,res){
    pool.getConnection(function(err,conn){
        if(err){
            res.send("0");
        }else{
            conn.query("update userinfo set uname=?,usex=?,birthday=?,ublood=?,uoffice=?,umerry=? where uid=?",[req.body.uname,req.body.usex,req.body.birthday,req.body.ublood,req.body.uoffice,req.body.umerry,req.body.uid],function(err,result){
                conn.release();
                if(err){
                    res.send("0");
                }else{
                    res.send("1");
                }
            });
        }
    });
});

//处理获取用户的现有吱币的请求
app.get("/xygetMyZiBi",function(req,res){
    pool.getConnection(function(err,conn){
        res.header("Content-Type","application/json");
        conn.query("select umoney from userinfo where uid=?",[req.session.currentLoginUser.uid],function(err,result){
            conn.release();
            if(err){
                res.send('{"code":"0"}');
            }else{
                res.send(result[0]);
            }
        });
    });
});

//处理显示个人资料的请求
app.get("/xyGeRenInfo",function(req,res){
    pool.getConnection(function(err,conn){
        res.header("Content-Type","application/json");
        if(err){
            res.send('{"code":"0"}');
        }else{
            conn.query("select uhobby,utel,uemail,uaddress from userinfo where uid=?",[req.session.currentLoginUser.uid],function(err,result){
                conn.release();
                if(err){
                    res.send('{"code":"0"}');
                }else{
                    res.send(result[0]);
                }
            });
        }
    });
});

//处理修改个人资料的请求
app.post("/xychangegeren",function(req,res){
    pool.getConnection(function(err,conn){
        if(err){
            res.send("0");
        }else{
            conn.query("select uemail from userinfo where uid=?",[req.session.currentLoginUser.uid],function(err,result){
                if(err){
                    res.send("0");
                }else{
                    if(result.length>0 && result[0].uemail==req.body.uemail){
                        conn.query("update userinfo set uhobby=?,utel=?,uaddress=? where uid=?",[req.body.uhobby,req.body.utel,req.body.uaddress,req.session.currentLoginUser.uid],function(err,result){
                            conn.release();
                            if(err){
                                res.send("0");//设置失败
                            }else{
                                res.send("2");//设置成功
                            }
                        });
                    }else{
                        res.send("1");//说明邮箱不是登录的邮箱
                    }
                }
            });
        }
    });
});

//处理重置密码的请求
app.post("/xysetMiMa",function(req,res){
    pool.getConnection(function(err,conn){
        if(err){
            res.send("0");
        }else{
            conn.query("select upwd from userinfo where uid=?",[req.session.currentLoginUser.uid],function(err,result){
                if(err){
                    res.send("0");
                }else{
                    if(result.length>0 && result[0].upwd==req.body.oldPwd){
                        conn.query("update userinfo set upwd=? where uid=?",[req.body.newPwd,req.session.currentLoginUser.uid],function(err,result){
                            conn.release();
                            if(err){
                                res.send("0");//设置新密码失败
                            }else{
                                res.send("2");//设置成功
                            }
                        });
                    }else{
                        res.send("1");//说明密码输入错误
                    }
                }
            });
        }
    });
});

//处理发说说的请求
app.post("/xySendTalk",upload.array("pic"),function(req,res){
    if(req.body.tdata==""){
        res.send('{"code":"0"}');//没有传 说说数据
    }else{
        pool.getConnection(function(err,conn){
            if(err){
                res.send('{"code":"1"}');//获取数据库连接池失败
            }else{
                pool.getConnection(function(err,conn){
                    if(err){
                        res.send('{"code":"2"}');//数据库连接失败
                        console.info(err);
                    }else{
                        var fileName="";
                        var filePath="";
                        var file;
                        if(req.files!=undefined){
                            for(var i in req.files){
                                file=req.files[i];
                                fileName=new Date().getTime()+"_"+file.originalname;
                                fs.renameSync(file.path,__dirname+fileUploadPath+"/"+fileName);
                                if(filePath!=""){//如果有多个文件
                                    filePath+=",";
                                }
                                filePath+=fileUploadPathData+"/"+fileName;
                            }
                        }
                        conn.query("insert into talkinfo values(0,DEFAULT,?,?,0,?,0)",[req.body.tdata,filePath,req.session.currentLoginUser.uid],function(err,result){
                            conn.release();
                            if(err){
                                res.send('{"code":"0"}');//存入数据库失败
                                console.info(err);
                            }else{
                                //res.send(result);
                                res.send('{"code":"1"}');//存入数据库成功
                            }
                        });
                    }
                });
            }
        });
    }
});

//////////////////////////////////////////////////////////////////////
//app.get("/xfFriend",function(req,res){
//    pool.getConnection(function(err,conn){
//        res.header("Content-Type","application/json");
//        if(err){
//            res.send("{'code':'0'}");
//        }else{
//            conn.query("select * from userinfo",function(err,result){
//                conn.release();
//                if(err){
//                    res.send("{'code':'0'}");
//                }else{
//                    res.send(result[0]);
//                }
//            });
//        }
//    });
//});
//////////////////////////////////////////////////////////////////////

//使用静态中间件
app.use(express.static("page"));//默认到page文件夹下查找静态资源，所有的请求路径从page文件夹开始算

app.listen(8888,function(err){
    if(err){
        console.info(err);
    }else{
        console.info("服务器开启成功。。。");
    }
})