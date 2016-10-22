//查询首页中 我的昵称、头像、好友总数、日记总数、说说总数
--select u.uname,u.upic,u.ubackground,count(distinct(n.nid)) as ncount,
--(select count(distinct(f.fid)) from userinfo as u,
--friendinfo as f where u.uid=f.uid and u.uid=1 and f.status=1) as fcount,
--count(distinct(t.tid)) as tcount from userinfo as u,noteinfo as n,
--friendinfo as f,talkinfo as t where u.uid=n.uid and u.uid=f.uid and u.uid=t.uid and u.uid=1;//不适用于数据库没有数据的时候
select u.uid,u.uname,u.upic,
(select count(t.tid) from userinfo u,talkinfo t where u.uid=t.uid and u.uid=10) as tcount,
(select count(distinct(f.fid)) from userinfo u,friendinfo f where u.uid=f.uid and u.uid=10) as fcount,
(select count(n.nid) from userinfo u,noteinfo n where u.uid=n.uid and u.uid=10) as ncount
 from userinfo u where u.uid=10;
//其中u.uid是我的账号，f.status是好友状态(状态为0即还不是我的好友，状态为1才是我的好友)

//查询首页我和好友发的所有说说，按时间倒序排列
select * from talkinfo t,friendinfo f,userinfo u where t.uid in (1,(select f.fid from friendinfo f where f.uid=1)) and t.uid=u.uid and u.uid=f.uid ORDER BY ttime DESC;
//首先把三个表关联起来
//(select f.fid from friendinfo f where f.uid=1)这一串是用来查询我的所有好友的id
//t.uid in (1,(select f.fid from friendinfo f where f.uid=1))中的第一个1是我的id，f.uid=1是好友表的我的id
//所以t.uid in (1,(select f.fid from friendinfo f where f.uid=1))是用来查询我和所有好友的说说数据
完整版(只查询我所需要的数据)：select DISTINCT(u.uid),u.upic,u.uname,u.usex,t.* from talkinfo t,friendinfo f,userinfo u where t.uid in (1,(select f.fid from friendinfo f where f.uid=1)) and t.uid=u.uid and u.uid=f.uid and f.status=1 ORDER BY ttime DESC;

//有bug
select u.uid,u.uname,t.tid,t.ttime,t.tdata,d.uid,d.disctime,d.discdata,a.uid,a.anstime,a.ansdata from userinfo u,talkinfo t,discussinfo d,answerinfo a where u.uid=t.uid and t.tid=d.tid and d.discid=a.discid;
