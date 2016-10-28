const http = require('http');
const url = require('url');
const path = require('path');
const fs = require('fs');
const cluster = require('cluster');
//路由表
var reqList = {};
reqList['GET'] = {};
reqList['POST'] = {};
reqList['PUT'] = {};
reqList['DELETE'] = {};
//进程列表
var workers = {};

//解析请求地址
var getPathName = function(reqUrl) {
    var urlParse = getUrlParse(reqUrl);
    return urlParse.pathname;
};
//获取url解析
var getUrlParse = function(reqUrl) {
    return url.parse(reqUrl);
};
/**过滤器  param(req:请求,res:响应,reqCont:响应服务,pathName:请求名, methodName:请求方法名),dispatcher:继续执行下一步*/
var filter = function(req, res, pathName, methodName) {
    console.log("正在经过过滤器");
    //默认的过滤器不添加任何逻辑直接进行请求分发
    routeDispatcher(req, res, pathName, methodName);
    console.log("过滤器结束");
};

//是否是一个方法
var isFunc = function(a) {
    return a ? typeof a === 'function' : false;
};
/**静态资源处理 param(req:请求,res:响应,pathName:路径) */
var resStatic = function(req, res, pathName) {
    fs.readFile(pathName.substr(1), function(err, data) {
        err ? endErrorReq(res, 501) : endStaticReq(res, pathName, data);
        res.end();
    });
};
//响应静态资源
var endStaticReq = function(res, pathName, data) {
    var suffix = path.extname(pathName);
    res.writeHead(200, { 'Content-Type': suffix === ".css" ? 'text/css' : 'text/html;' + 'charset=utf-8' });
    res.write(data);
};
//结束错误请求
var endErrorReq = function(res, err) {
    res.writeHead(err);
    res.end();
};
/**路由分发 param(req, res, pathName, methodName)*/
var routeDispatcher = function(req, res, pathName, methodName) {
    console.log("进入请求分发器");
    let reqCont = reqList[methodName][pathName];
    isFunc(reqCont) ? reqCont(req, res, pathName) : resStatic(req, res, pathName);
    console.log("处理" + methodName + "请求:" + pathName);
};

/** 路由处理 param(req, res)*/
var routeHandler = function(req, res) {
    console.log("进入请求预处理器");
    let pathName = getPathName(req.url);
    let methodName = req.method;
    isFunc(filter) ? filter(req, res, pathName, methodName) : routeDispatcher(req, res, pathName, methodName); //路由分发
    console.log("退出请求预处理器");
};

/** 
 * 添加动态路由解析  
 * param(reqUrl:请求地址,service:function(request:请求,response:响应,pathName:请求名))
 */
var addDynamicRoute = function(methodName, reqUrl, service) {
    console.log("添加" + methodName + "请求服务：" + reqUrl);
    reqList[methodName.toUpperCase()][reqUrl] = service;
};
/**  开启服务器并监听端口  param(port:端口号,num:开启进程数量)*/
var startServer = function(port, num) {
    if (num) {
        startClusterSever(port, num);
    } else {
        //创建服务器  
        http.createServer(function(req, res) {
            routeHandler(req, res);
        }).listen(port); //注意这里的端口改成了变量
        //开启后在控制台显示该服务正在运行  
        console.log('Server running at http://127.0.0.1:' + port);
    }
};
/** 设置静态页面请求别名 param(newUrl:新的请求路径, oldUrl:原始路径) */
var setIndex = function(newUrl, oldUrl) {
    addDynamicRoute('GET', newUrl, function(req, res) {
        resStatic(req, res, oldUrl);
    });
};
/**自定义静态页面处理方式 staticHandlerService=function(req,res,pathName)*/
var setresStaticFunc = function(staticHandlerService) {
    resStatic = staticHandlerService;
};

//开启集群服务
var startClusterSever = function(port, numCPUs) {
    if (cluster.isMaster) {
        cluster.on('death', function(worker) {
            // 当一个工作进程结束时，重启工作进程
            delete workers[worker.pid];
            worker = cluster.fork();
            workers[worker.pid] = worker;
        });
        // 初始开启与CPU 数量相同的工作进程
        for (var i = 0; i < numCPUs; i++) {
            const work = cluster.fork();
            console.log(work.process.pid);
            workers[i] = work;
        }
        cluster.on('exit', (worker, code, signal) => {
            console.log(`worker ${worker.process.pid} died`);
        });
    } else {
        console.log(cluster.worker.id);
        http.createServer((req, res) => {
            console.log("子进程:" + cluster.worker.id + "正在处理请求...");
            routeHandler(req, res);
        }).listen(port);
    }
    // 当主进程被终止时，关闭所有工作进程
    process.on('SIGTERM', function() {
        console.log("主进程终止");
        for (var pid in workers) {
            process.kill(pid);
        }
        process.exit(0);
    });
}
exports.route = routeHandler;
exports.add = addDynamicRoute;
exports.get = function(reqUrl, service) {
    addDynamicRoute('GET', reqUrl, service);
};
exports.post = function(reqUrl, service) {
    addDynamicRoute('POST', reqUrl, service);
};;
exports.put = function(reqUrl, service) {
    addDynamicRoute('PUT', reqUrl, service);
};;
exports.delete = function(reqUrl, service) {
    addDynamicRoute('DELETE', reqUrl, service);
};;
exports.start = startServer;
exports.index = setIndex;
exports.modStatic = setresStaticFunc;
/**设置过滤器(param(function(req,res,pathName,methodName)) */
exports.setFilter = function(service) {
    filter = service;
};
/**离开过滤器继续执行请求处理 */
exports.continue = routeDispatcher;
/**
 * eguid快速灵活的路由
 * 功能实现：
 * 1、自动静态路由解析
 * 2、支持手动设置静态路由别名
 * 3、支持创建新的静态路由实现（方便加载模板）
 * 4、动态路由解析
 * 5、自动错误响应
 * 6、使用原生API，无第三方框架
 * 7、支持cluster单机集群
 * 8、支持get/post/put/delete四种请求定义
 */