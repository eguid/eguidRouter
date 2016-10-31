//这是nodejs后端入口程序
//该入口用于定义路由选择器对应的service服务，以JS数组对象进行定义
var eguid=require("./route/eguid-0.3.js");
eguid.add('GET','/',function(req,res,pathName){
res.end('hello world!');
});
eguid.get('/index',function(req,res,pathName){
res.end('hello index world!');
});
eguid.post('/hello1',function(req,res,pathName){
res.end('hello 1 world!');
});
eguid.delete('/hello2',function(req,res,pathName){
res.end('hello 2 world!');
});
eguid.put('/hello4',function(req,res,pathName){
res.end('hello 4 world!');
});
eguid.index('/world','/index.html');
eguid.start(8081,1);
