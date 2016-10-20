//路由
var eguid = require("./eguidRouter");

var getNowTime = function(req, res, pathName) {
    res.writeHead(200, { 'Content-Type': 'application/json;charset=utf-8' });
    res.end("hello World!");
};
//添加动态路由，/getNowTime请求会自动调用上面定义的getNowTime方法
eguid.add("/getNowTime", getNowTime);

//设置静态请求的别名，设置首页
eguid.index('/', '/index.html');
//设置原始页面别名打开，/helloWolrd请求打开的是index.html页面
eguid.index('/index', '/index.html');
//监听8081端口，多线程数量
eguid.start(8081, 8);