var eguid = require("./eguid");

eguid.add('get', "/getNowTime", function(req, res, pathName) {
    res.end("hello 1!");
});
//上面的等同于这个
eguid.get('/getNowTime', function(req, res, pathName) {
    res.end("hello 2!");
});
eguid.post('/getNowTime', function(req, res, pathName) {
    res.end("hello 3!");
});
eguid.put('/getNowTime', function(req, res, pathName) {
    res.end("hello 4!");
});
eguid.delete('/getNowTime', function(req, res, pathName) {
    res.end("hello 5!");
});
//请求过滤器
eguid.setFilter(function(req, res, pathName, methodName) {
    console.log("进入自定义过滤器1");
    //拦截请求
    if (pathName == '/') {
        res.end('hello world!');
        return;
    }
    //继续请求处理
    eguid.continue(req, res, pathName, methodName);
    console.log("退出自定义过滤器2");
});
//设置静态请求的别名，设置首页
eguid.index('/', '/index.html');
//设置原始页面别名打开，/helloWolrd请求打开的是index.html页面
eguid.index('/index', '/index.html');
//监听8081端口，多线程数量
eguid.start(8081);