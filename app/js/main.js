require({
    baseUrl: 'js',
    // three.js should have UMD support soon, but it currently does not
    shim: {
        'vendor/three': { exports: 'THREE' } ,
        'vendor/jquery-1.9.1': { exports: '$' },
        'vendor/ColladaLoader': {
　　　　　　deps: ['vendor/three'],
　　　　　　exports: 'THREE.ColladaLoader'
　　　　},
'vendor/DDSLoader': {
　　　　　　deps: ['vendor/three'],
        　　　　　　exports: 'THREE.DDSLoader'
        　　　　},
//MTL 3D打印模型加载器
'vendor/MTLLoader': {
　　　　　　deps: ['vendor/three'],
        　　　　　　exports: 'THREE.MTLLoader'
        　　　　},
//OBJ模型文件加载器
'vendor/OBJMTLLoader': {
　　　　　　deps: ['vendor/three','vendor/DDSLoader', 'vendor/MTLLoader'],
        　　　　　　exports: 'THREE.OBJMTLLoader'
        　　　　},
//字体转换器
'vendor/helvetiker_regular.typeface': {
　　　　　　deps: ['vendor/three','vendor/DDSLoader', 'vendor/MTLLoader'],
        　　　　　　exports: 'THREE.helvetiker'
        　　　　}
}
}, [
    'vendor/jquery-1.9.1',
    'vendor/three',
    'vendor/DDSLoader',
    'vendor/ColladaLoader',
    'vendor/MTLLoader',
    'vendor/OBJMTLLoader',
    'vendor/helvetiker_regular.typeface'
], function($ , THREE, DDSLoader, ColladaLoader, MTLLoader, OBJMTLLoader, typeface) {

    var _config = {
        wWidth : window.innerWidth,       //场景宽/高
        wHeight : window.innerHeight,
        defaultX : 0,
        defaultY : 0,
        defaultZ : 0,
        isAnimate : true
    }
    var scene, camera, renderer;
    var geometry, material, mesh;

//Module类用于管理组件
    function Module(name){
        this.name= name;
        this.config= $.extend({}, _config);      //每个主模块维护一个独立的坐标系(x,y,z)
        this.subModules= {};                     //子模块，拥有独立的逻辑渲染单元
        this.Modules.push(this.name);
    }
    Module.prototype.Modules = [];
    Module.prototype.manager = {};
    Module.prototype.registerModule = function(name, obj){
        if( typeof name !== 'string' && typeof obj !== 'object' ) return
        if( this.subModules[name] ) return console.log('subModule has been');
        if( ! obj.config && obj.config && obj.animate) return console.log('Parameter error');
        // root 是指当前模块的根配置
        var extObj = obj.config;
        extObj._init = obj.init;
        extObj._animate = obj.animate;
        for( var i in extObj){
            if( i.indexOf('ele_') > -1){
                extObj[i]= extObj[i]();
            }
        }
        this.subModules[name]= extObj;
        console.log(_config, extObj, this);
        //extObj.init();
        console.log(this.Modules, this.subModules);
        this.subModules[name]._init();    //执行初始化

    };

//初始化
    init();

    function init() {
        //默认消息管理
        this.manager = new THREE.LoadingManager();
        this.manager.onProgress = function ( item, loaded, total ) {
            console.log( item, loaded, total );
        };
        scene = new THREE.Scene();
        camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 1, 10000 );
        camera.position.z = 639;
        //camera.position.y = 300;
        geometry = new THREE.BoxGeometry( 200, 200, 200 );
        material = new THREE.MeshBasicMaterial( { color: 0xff0000, wireframe: true } );
        mesh = new THREE.Mesh( geometry, material );
        scene.add( mesh );
        renderer = new THREE.WebGLRenderer();
        renderer.setSize( window.innerWidth, window.innerHeight );
        document.body.appendChild( renderer.domElement );

    }


    var mainPage= new Module('mainPage');
    mainPage.registerModule('nav', {
        config:{
            isAnimate : false,
            long: 1000,
            width: 20,
            height: 50,
            x: _config.defaultX,
            y: _config.defaultY+(_config.wHeight/2)-30 ,
            z: _config.defaultZ,
            ele_navlist: function(){
                return {
                long : 150,
                width : 20,
                height : 20,
                list : {
                    '首页': { 'href': 'http://www.baidu.com' },
                    '列表1': { 'href': 'http://www.baidu.com' },
                    '列表2': { 'href': 'http://www.baidu.com' },
                    '列表3': { 'href': 'http://www.baidu.com' }
                },
                x: this.x+(-200),
                y: this.y-30 ,
                z: this.z+10
                }
            }
        },
        init: function(){
            var root = this;
            console.log(this, this.long)
            var lavaTexture = THREE.ImageUtils.loadTexture( 'images/nav.png' );
            var lavaMaterial = new THREE.MeshBasicMaterial( { map: lavaTexture } );
            var geometry = new THREE.BoxGeometry( root.long, root.height, root.width );               //尺寸设置
            var material = new THREE.MeshBasicMaterial( { color: 0xff0000, wireframe: true } );       //贴图设置
            root.navContainer = new THREE.Mesh( geometry, lavaMaterial );                             //生成导航外围容器
            scene.add( root.navContainer );                                                           //将导航容器添加到场景
            root.navContainer.position.set(root.x, root.y, root.z);                                   //设置导航坐标
            //初始化导航列表
            for(var ltem in root.ele_navlist.list){
                console.log(ltem);
                loadNavList(ltem);
            }

            function loadNavList(string, textType){
                //默认使用 canvas 2d渲染文字，three.js 3D字体目前不支持中文
                var type= textType || '2d';
                if( type.indexOf('2d') > -1){
                    var canvas1 = document.createElement('canvas');
                    var context1 = canvas1.getContext('2d');
                    context1.font = "Bold 16px Arial";
                    context1.fillStyle = "rgba(81,203,254,0.95)";
                    context1.fillText( string, 0, 50);
                    var texture1 = new THREE.Texture(canvas1)
                    texture1.needsUpdate = true;
                    var material1 = new THREE.MeshBasicMaterial( {map: texture1, side:THREE.DoubleSide } );
                    material1.transparent = true;
                    var mesh1 = new THREE.Mesh(
                        new THREE.PlaneGeometry(canvas1.width, canvas1.height),
                        material1
                    );
                    var nowX= root.ele_navlist.x;
                    mesh1.position.set(nowX,root.ele_navlist.y,root.ele_navlist.z);
                    root.ele_navlist.x += 150;
                    scene.add( mesh1 );
                    console.log(mesh1);
                }else{
                var material = new THREE.MeshPhongMaterial({
                     color: 0xdddddd
                    });
                    var textGeom = new THREE.TextGeometry( string, {
                        font: 'helvetiker' 
                    });
                    var textMesh = new THREE.Mesh( textGeom, material );
                    scene.add( textMesh );
                }
            }

            /*var texture = new THREE.Texture();
             var loader = new THREE.ImageLoader( root.manager );
             loader.load( 'js/mode/ok/Translucent_Glass_Gold.jpg', function ( image ) {
             texture.image = image;
             texture.needsUpdate = true;
             } );*/
            // model
            /*var loader = new THREE.OBJMTLLoader( root.manager );
             loader.load( 'js/mode/ok.obj', function ( object ) {
             object.traverse( function ( child ) {
             console.log(child,texture);
             if ( child instanceof THREE.Mesh ) {
             child.material.map = texture;
             }
             } );
             object.position.y = - 80;
             object.position.z = 780;
             scene.add( object );
             });*/
            var loader = new THREE.OBJMTLLoader();
            loader.load('js/mode/oo.obj', 'js/mode/oo.mtl',function ( object ) {

                //object.position.y = - 80;
                object.position.z = 0;
                scene.add( object );
                window.ss= object;

            });

            var directionalLight = new THREE.DirectionalLight( 0xffeedd );
            directionalLight.position.set( 0, 100, 100 );
            scene.add( directionalLight );

        },
        animate: function(){
            /*this.z -= 1;
             this.x -= 1;

             this.navContainer.rotation.x += 0.03;
             this.navContainer.rotation.y += 0.05;*/
            this.navContainer.rotation.x += 0.03;
            //console.log(this.obj);
            ss.rotation.y += 0.01
            ss.rotation.x += 0.01
            /*this.obj.rotation.x = 0.03;
             this.obj.rotation.y += 0.01;*/

            //this.navContainer.position.set(this.x, this.y, this.z);
        }
    })
window.onmousedown = function (ev){
   camera.position.x = ev.clientX; 
   camera.position.y = ev.clientY; 
  _config.defaultX = ev.screenX; 
  _config.defaultY = ev.screenY; 
}

    function animate() {
        requestAnimationFrame( animate );
        mesh.rotation.x += 0.01;
        mesh.rotation.y += 0.02;
        //mainPage.animate();
        for( M in mainPage.subModules){
            if(mainPage.subModules[M].isAnimate){
                mainPage.subModules[M]._animate();
            }
        }
        //console.log(_config.nav.z)
        renderer.render( scene, camera );
    }



    if(_config.isAnimate){
        animate();
    }

});
