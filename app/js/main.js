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
        'vendor/MTLLoader': {
        　　　　　　deps: ['vendor/three'],
        　　　　　　exports: 'THREE.MTLLoader'
        　　　　},
        'vendor/OBJMTLLoader': {
        　　　　　　deps: ['vendor/three','vendor/DDSLoader', 'vendor/MTLLoader'],
        　　　　　　exports: 'THREE.OBJMTLLoader'
        　　　　}
     }
}, [
    'vendor/jquery-1.9.1',
    'vendor/three',
    'vendor/DDSLoader',
    'vendor/ColladaLoader',
    'vendor/MTLLoader',
    'vendor/OBJMTLLoader'
], function($ , THREE, DDSLoader, ColladaLoader, MTLLoader, OBJMTLLoader) {

var _config = {
        wWidth : window.innerWidth,       //场景宽/高
        wHeight : window.innerHeight,
        defaultX : 0,             
        defaultY : 250,
        defaultZ : 638,
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
    var extObj = obj.config;
    extObj._init = obj.init;
    extObj._animate = obj.animate;
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
    camera.position.z = 1000;
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
        isAnimate : true,
        long: 1103,
        width: 50,
        height: 20,
        x: _config.defaultX,
        y: _config.defaultY,
        z: _config.defaultZ
    },
    init: function(){
        var root = this;
        console.log(this, this.long)
        var geometry = new THREE.BoxGeometry( this.long, this.width, this.height );               //尺寸设置
        var material = new THREE.MeshBasicMaterial( { color: 0xff0000, wireframe: true } );       //贴图设置  
        this.navContainer = new THREE.Mesh( geometry, material );                                 //生成导航外围容器
        scene.add( this.navContainer );                                                           //将导航容器添加到场景
        this.navContainer.position.set(this.x, this.y, this.z);                                   //设置导航坐标

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
                    object.position.z = 580;
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
