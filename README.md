# eguidRouter
Simple, flexible and fast 'nodeJS' routing function（一个非常简单、灵活、快速的nodeJS路由功能实现）
### Configuration instructions(配置及使用)
`//路由`  
`var eguid = require("./eguidRouter");`  
//service  
    `var getNowTime = function(req, res, pathName) {`  
    `res.writeHead(200, { 'Content-Type': 'application/json;charset=utf-8' });`  
    `res.write("{'retSt': 200,'retMsg': '请求成功','retData':' 当前时间：" + new Date().toLocaleString() + "'}");`  
    `res.end();`  
    `};`  
  
`//添加动态路由，/getNowTime请求会自动调用上面定义的getNowTime方法`  
`eguid.add("/getNowTime", service.getNowTime);`  

`//设置静态请求的别名，设置首页 `   
`eguid.index('/', '/index.html');`  

`//设置原始页面别名打开，/helloWolrd请求打开的是index.html页面`  
`eguid.index('/index', '/index.html');`  

`eguid.index('/helloWorld', '/index.html');`  

`//监听8081端口`  
`eguid.start(8081);`
