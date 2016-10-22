create database zys character set utf8;//创建zys数据库

use zys;

//1、用户表信息
create table userInfo(
    uid int primary key auto_increment,//用户ID
    uname varchar(40) not null unique,//用户昵称
    usex varchar(4),//性别
    upwd varchar(20) not null,//用户密码
    uemail varchar(30) not null unique,//邮箱
    uaddress varchar(40),//地址
    utel varchar(15),//联系电话
    uoffice varchar(20),//职位
    ublood varchar(20),//血型
    umerry varchar(20),//婚姻状况
    uhobby varchar(40),//兴趣爱好
    umoney int not null,//吱币
    upic varchar(1000),//头像
    ubackground varchar(1000),//用户页面的背景
    status int,//账户状态
    birthday varchar(10)//出生日期
);
alter table userInfo auto_increment=1001;

//2、日记表信息
create table noteinfo(
    nid int primary key auto_increment,//日记id
    ntime timestamp not null default current_timestamp,//发表时间，添加时默认为当前时间
    ndata text not null,//发表的日记数据
    npic varchar(1000),//日记图片
    uid int//发表日记的用户id
);
alter table noteinfo auto_increment=1001;

//3、记录表信息
create table talkinfo(
    tid int primary key auto_increment,//记录id
    ttime timestamp not null default current_timestamp,//发表时间，添加时默认为当前时间
    tdata text not null,//发表的记录数据
    tpic varchar(1000),//记录图片
    tcount int,//浏览次数
    uid int,//发表记录的用户id
    greatcount int//点赞的数量
);
alter table talkinfo auto_increment=1001;

//4、评论表信息
create table discussInfo(
    discid int primary key auto_increment,//评论id
    disctime timestamp not null default current_timestamp,//评论的时间，添加时默认为当前时间
    discdata varchar(100),//评论的数据
    uid int,//评论了那条记录的用户id
    tid int,//评论的那条记录的记录id
    dstatus//是否查看了评论
);
alter table discussInfo auto_increment=1001;

//5、回复表信息
create table answerInfo(
    ansid int primary key auto_increment,//回复id
    anstime timestamp not null default current_timestamp,//回复的时间，添加时默认为当前时间
    ansdata varchar(100),//回复的数据
    uid int,//回复了那条评论的用户id
    discid int,//回复的那条评论的id
    astatus int//是否查看了回复
);
alter table answerInfo auto_increment=1001;

//6、好友表信息
create table friendInfo(
    frid int primary key auto_increment,//表的每条记录的id
    uid int not null,//用户id
    fid int,//好友的id
    fremarks varchar(100),//给好友的备注
    fgroup varchar(100),//好友所属的组别
    status int//好友状态
);
alter table friendInfo auto_increment=1001;

//7、用户的照片表信息
create table photoInfo(
    pid int primary key auto_increment,//照片id(路径)
    uid int not null,//用户id
    premarks varchar(100),//照片的备注
    pgroup varchar(100),//照片所属的组别
    pstatus int,//照片状态
    ppath varchar(1000)
);
alter table photoInfo auto_increment=1001;

//8、礼物类型信息
create table giftInfo(
    gid int primary key auto_increment,//礼物id
    gremarks varchar(100),//默认的礼物的留言
    gprice int not null,//礼物的价格
    gpic varchar(100)//礼物的图片
);
alter table giftInfo auto_increment=1001;

//9、交易表的信息
create table sendgift(
    sid int primary key auto_increment,//每条送礼记录的id
    uid int not null,//送礼物的用户id
    fid int not null,//收礼物的好友id
    gid int not null,//礼物类型的id
    sremarks varchar(100),//送礼物时的好友的留言
    sstatus int//交易状态，看礼物是否已读
);
alter table sendgift auto_increment=1001;

//10、意见反馈表
create table suggestions(
    sugid int primary key auto_increment,//每条反馈意见的id
    uid int not null,//发意见的用户id
    sugdata varchar(1000),//反馈的文字内容
    sugpic varchar(1000)//反馈的截图
);
alter table suggestions auto_increment=1001;
