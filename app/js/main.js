require({
    baseUrl: 'js',
    // three.js should have UMD support soon, but it currently does not
    shim: { 'vendor/three': { exports: 'THREE' } , 'vendor/jquery-1.9.1': { exports: '$' }}
}, [
    'vendor/jquery-1.9.1',
    'vendor/three'
], function($ , THREE) {

var _config = {
        wWidth : window.innerWidth,       //场景宽/高
        wHeight : window.innerHeight,
        defaultX : 0,             
        defaultY : 250,
        defaultZ : 638
    }    
var scene, camera, renderer;
var geometry, material, mesh;

//Module类用于管理组件
function Module(name){
    this.name= name;
    this.config= $.extend({}, _config);      //每个主模块维护一个独立的坐标系(x,y,z)
    this.subModules= {};
    this.Modules.push(this.name);
}
Module.prototype.Modules = [];
Module.prototype.registerModule = function(name, obj){
    if( typeof name !== 'string' && typeof obj !== 'object' ) return 
    if( this.subModules[name] ) return console.log('subModule has been');
    if( ! obj.config && obj.config && obj.animate) return console.log('Parameter error');
    var extObj = obj.config;
    extObj.init = obj.init;
    extObj.init.animate = obj.animate;
    this.subModules[name]= extObj;

    console.log(_config, extObj, this);
    //extObj.init();
    console.log(this.Modules, this.subModules);
    this.subModules[name].init();    //执行初始化

}

//初始化
init();



function init() {

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
        long: 1103,
        width: 50,
        height: 0,
        x: _config.defaultX,
        y: _config.defaultY,
        z: _config.defaultZ
    },
    init: function(){
        console.log(this, this.long)
        geometry = new THREE.BoxGeometry( this.long, this.width, this.height );                                   //尺寸设置
        material = new THREE.MeshBasicMaterial( { color: 0xff0000, wireframe: true } );      //贴图设置  
        navContainer = new THREE.Mesh( geometry, material );                                 //生成导航外围容器
        scene.add( navContainer );                                                           //将导航容器添加到场景
        navContainer.position.set(this.x, this.y, this.z);                                              //设置导航坐标
    },
    animate: function(){
        /*this.z -= 1;
        this.x -= 1; */
        //console.log(this);
        navContainer.rotation.x += 0.03;
        navContainer.rotation.y += 0.05;

       // navContainer.position.set(this.x, this.y, this.z);
    }
})


function animate() {

    requestAnimationFrame( animate );

    mesh.rotation.x += 0.01;
    mesh.rotation.y += 0.02;
    //mainPage.animate();
    for( M in mainPage.subModules){
        mainPage.subModules[M].init.animate()
        //console.log(mainPage.subModules[M].init.animate());
    }
    //console.log(_config.nav.z)
    renderer.render( scene, camera );
}

animate();

});
