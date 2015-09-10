function TrackViewer(options) {
    //options:
    //  canvasHolder - string - selector for element which will contain
    //   the track viewer.
    var canvasHolderSelector = options.canvasHolder;
    var camera, scene, renderer;
    var geometry, material, mesh;
    var mouse = new THREE.Vector2();
    var W;
    var H, $w,
    frame = 0;

    this.Camera = function () {
        return camera;
    }
    var isCenteringTrack = false;
    var trackToCenter = null;

    this.AddToScene = function(object) {
      scene.add(object);
    }
    this.Tracks = [];

    function onMouseMove( event ) {

    	// calculate mouse position in normalized device coordinates
    	// (-1 to +1) for both components

    	mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
    	mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
      camera.rotation.y = mouse.x/2
    }
    function setup() {
        W = window.innerWidth;
        H = 500;
        $w = $(window);
        renderer = new THREE.WebGLRenderer({});
        renderer.setSize(W, H);
        renderer.setClearColor(0x000000);
        $canvasHolder = $(canvasHolderSelector);
        $canvasHolder.append(renderer.domElement);
        camera = new THREE.PerspectiveCamera(50, W / H, 1, 10000);
        camera.position.z = 200;
        scene = new THREE.Scene();
        renderer.domElement.addEventListener( 'mousemove', onMouseMove, false );
        renderer.domElement.addEventListener( 'mouseleave', function() {
        var tween = new TWEEN.Tween(camera.rotation).to({
          y: 0,
          x:0,
          z:0
        }).start();
        }, false );
    }

    function draw(time) {
        requestAnimationFrame(draw);
        // update code goes here
        TWEEN.update(time);
        renderer.render(scene, camera);
    }

    $(function() {
      setup();
      draw();
    })

    function isMobile() {
        return navigator.userAgent.match(/Mobi/);
    }
}
TrackViewer.prototype.AddTrack = function(trackData) {
    THREE.ImageUtils.crossOrigin = '';
    var id = trackData.id;
    if (this.FindTrack(id)) return;
    var texture = THREE.ImageUtils.loadTexture(trackData.img);
    var material = new THREE.MeshBasicMaterial({
      map:texture
    });
    var plane = new THREE.Mesh(new THREE.PlaneGeometry(200,200), material );
    if (this.Tracks.length >0) {
      var previousTrack = this.Tracks[this.Tracks.length-1];
      plane.position.x =previousTrack.art.position.x+200;
    }
    this.Tracks.push(new Track({art:plane,id:id}));
    this.AddToScene(plane);
  // this.AddToScene(imageObj);
}
TrackViewer.prototype.CenterTrack = function(trackId) {
  var track = this.FindTrack(trackId);
  if (track) {
    var tween = new TWEEN.Tween(this.Camera().position).to({
      x:track.art.position.x,
      y:this.Camera().position.y,
      z:this.Camera().position.z
    });
    tween.start();
  }
}
TrackViewer.prototype.FindTrack = function(trackId) {
  for (var i =0; i <this.Tracks.length;i++) {
    var track = this.Tracks[i];
    if (track.id == trackId) {
      return track;
    }
  }
  return null;
}
