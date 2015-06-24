
//通过识别bower.json文件动态添加bower_component目录内需要编译的资源
require('./build/bower_boost.js');

fis.set('statics','/statics');//static目录

//FIS modjs模块化方案，您也可以选择amd/commonjs等
fis.hook('module', {
    mode: 'mod'
});

/*************************目录规范*****************************/
fis.match("**/*",{
    release: '${statics}/$&'
})
//modules下面都是模块化资源
.match(/^\/modules\/(.*)\.(js)$/i,{
    isMod: true,
    id: '$1', //id支持简写，去掉modules和.js后缀中间的部分
    release: '${statics}/$&'
})
//page下面的页面发布时去掉page文件夹
.match(/^\/page\/(.*)$/i, {
    useCache: false,
    release: '$1'
})
//一级同名组件，可以引用短路径，比如modules/jquery/juqery.js
//直接引用为var $ = require('jquery');
.match(/^\/modules\/([^\/]+)\/\1\.(js)$/i,{
    id: '$1'
})
//less的mixin文件无需发布
.match(/^(.*)mixin\.less$/i,{
    release: false
})
//前端模板,当做类js文件处理，可以识别__inline, __uri等资源定位标识
.match("**/*.tmpl",{
    isJsLike: true,
    release : false
})
//页面模板不用编译缓存
.match(/.*\.(html|jsp|tpl|vm|htm|asp|aspx|php)$/,{
    useCache: false
})



/****************异构语言编译*****************/
//less的编译
//npm install [-g] fis-parser-less
fis.match('**/*.less', {
    rExt: '.css', // from .scss to .css
    parser: fis.plugin('less', {
        //fis-parser-less option
    })
});



//打包与css sprite基础配置
fis.match('::packager', {
    // npm install [-g] fis3-postpackager-loader
    // 分析 __RESOURCE_MAP__ 结构，来解决资源加载问题
    postpackager: fis.plugin('loader', {
        resourceType: 'mod',
        useInlineMap: true // 资源映射表内嵌
    }),
    packager: fis.plugin('map'),
    spriter: fis.plugin('csssprites', {
        layout: 'matrix',
        margin: '15'
    })  
})



/**********************生产环境下CSS、JS压缩合并*****************/
//使用方法 fis3 release prod
fis.media('prod')
    .match('**.js', {
        preprocessor : fis.plugin('annotate'),
        optimizer: fis.plugin('uglify-js')
    })
    .match('**.css', {
        optimizer: fis.plugin('clean-css')
    });

//打包配置，由于文件分散，避免多次写fis.match
var packConf = {
    '/pkg/vendor.js': [
        '/lib/mod.js',
        '/bower_components/angular/angular.js',
        '/bower_components/angular-bootstrap/ui-bootstrap-tpls.js',
        '/bower_components/angular-cookies/angular-cookies.js',
        '/bower_components/ui-router/release/angular-ui-router.js'
    ],
    '/pkg/vendor.css': [
        '/bower_components/bootstrap/dist/css/bootstrap.css',
        '/bower_components/font-awesome/css/font-awesome.css',
        '/bower_components/rdash-ui/dist/css/rdash.css'
    ]
};

fis.util.map(packConf,function(pkg,conf){
    fis.util.map(conf,function(index,file){
        fis.media('prod')
            .match(file,{
                packTo: pkg
            })
    })    
})