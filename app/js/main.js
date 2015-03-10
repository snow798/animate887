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
        'vendor/OBJLoader': {
        　　　　　　deps: ['vendor/three'],
        　　　　　　exports: 'THREE.OBJLoader'
        　　　　}
     }
}, [
    'vendor/jquery-1.9.1',
    'vendor/three',
    'vendor/ColladaLoader',
    'vendor/OBJLoader'
], function($ , THREE, ColladaLoader, OBJLoader) {

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
        isAnimate : true,
        long: 1103,
        width: 50,
        height: 20,
        x: _config.defaultX,
        y: _config.defaultY,
        z: _config.defaultZ
    },
    init: function(){
        console.log(this, this.long)
        var geometry = new THREE.BoxGeometry( this.long, this.width, this.height );                                   //尺寸设置
        var material = new THREE.MeshBasicMaterial( { color: 0xff0000, wireframe: true } );      //贴图设置  
        this.navContainer = new THREE.Mesh( geometry, material );                                 //生成导航外围容器
        scene.add( this.navContainer );                                                           //将导航容器添加到场景
        this.navContainer.position.set(this.x, this.y, this.z);                                              //设置导航坐标
        var self = this;
        var loader = new THREE.JSONLoader(true);  
        /*loader.load("/js/mode/ss.obj", function ( geometry ) {  
        self.obj = new THREE.Mesh(geometry, material);  
        //geometry.scale.x = geometry.scale.y = 100;
        //obj.position.set(0,1,990);  
        self.obj.position.set(0, 0, 990);
        self.obj.rotation.x = 45;
        console.log(self.obj);
        scene.add(self.obj);  
          
       }

       );*/

        /*var  loader = new  THREE.ColladaLoader(); 
            loader.load( '/js/mode/nav.json', function( result ){ 
              scene.add( result ); 
            });*/
         var oLoader = new THREE.OBJLoader();
          oLoader.load('/js/mode/ss.obj', function(object, materials) {

            console.log(object, materials);
            scene.add(object);
        })

    },
    animate: function(){
        /*this.z -= 1;
        this.x -= 1; 
        
        this.navContainer.rotation.x += 0.03;
        this.navContainer.rotation.y += 0.05;*/
        this.navContainer.rotation.x += 0.03;
        //console.log(this.obj);

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
