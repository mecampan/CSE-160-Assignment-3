// ColoredPoint.js (c) 2012 matsuda
// Vertex shader program
var VSHADER_SOURCE = `
  precision mediump float;
  attribute vec4 a_Position;
  attribute vec2 a_UV;
  varying vec2 v_UV;
  uniform mat4 u_ModelMatrix;
  uniform mat4 u_GlobalRotateMatrix;
  uniform mat4 u_ViewMatrix;
  uniform mat4 u_ProjectionMatrix;
  void main() {
    gl_Position =  u_ProjectionMatrix * u_ViewMatrix * u_GlobalRotateMatrix * u_ModelMatrix * a_Position;
    v_UV = a_UV;
  }`

// Fragment shader program
var FSHADER_SOURCE =`
  precision mediump float;
  varying vec2 v_UV;
  uniform vec4 u_FragColor;
  uniform sampler2D u_Sampler;
  uniform sampler2D u_WoodTexture;
  uniform int u_whichTexture;
  void main() {
    if (u_whichTexture == -2) {
      gl_FragColor = u_FragColor;                 // Use color
    }
    else if (u_whichTexture == -1) {
      gl_FragColor = vec4(v_UV, 1.0, 1.0);        // Use UV debug color  
    }
    else if (u_whichTexture == 0) {
      gl_FragColor = texture2D(u_Sampler, v_UV);  // Use texture0
    }
    else if (u_whichTexture == 1) {
      gl_FragColor = texture2D(u_WoodTexture, v_UV);  // Use wood / ship texture
    }
    else {
      gl_FragColor = vec4(1.0, 0.2, 0.1, 1.0);    // Error, put Redish tint
    }
  }`

// Global Variables
let canvas;
let gl;
let a_Position;
let a_UV;
let u_FragColor;
let u_Size;
let u_ModelMatrix;
let u_ProjectionMatrix;
let u_ViewMatrix;
let u_GlobalRotateMatrix;
let u_Sampler;
let u_WoodTexture;
let u_whichTexture;

function setupWebGL() {
  // Retrieve <canvas> element
  canvas = document.getElementById('webgl');

  // Get the rendering context for WebGL
  //gl = getWebGLContext(canvas);
  gl = canvas.getContext("webgl", {preserveDrawingBuffer: true});
  if (!gl) {
    console.log('Failed to get the rendering context for WebGL');
    return;
  }

  // Enable rendering objects in front of others
  gl.enable(gl.DEPTH_TEST);
}

function connectVariablesToGLSL() {
  // Initialize shaders
  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    console.log('Failed to intialize shaders.');
    return;
  }

  // // Get the storage location of a_Position
  a_Position = gl.getAttribLocation(gl.program, 'a_Position');
  if (a_Position < 0) {
    console.log('Failed to get the storage location of a_Position');
    return;
  }

  // // Get the storage location of a_UV
  a_UV = gl.getAttribLocation(gl.program, 'a_UV');
  if (a_UV < 0) {
    console.log('Failed to get the storage location of a_UV');
    return;
  }  

  // Get the storage location of u_FragColor
  u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
  if (!u_FragColor) {
    console.log('Failed to get the storage location of u_FragColor');
    return;
  }  

  // Get the storage location of u_ModelMatrix
  u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
  if(!u_ModelMatrix) {
    console.log('Failed to get the storage location of u_ModelMatrix');
    return;
  }

  // Get the storage location of u_GlobalRotateMatrix
  u_GlobalRotateMatrix = gl.getUniformLocation(gl.program, 'u_GlobalRotateMatrix');
  if(!u_GlobalRotateMatrix) {
    console.log('Failed to get the storage location of u_GlobalRotateMatrix');
    return;
  }

  // Get the storage location of u_ViewMatrix
  u_ViewMatrix = gl.getUniformLocation(gl.program, 'u_ViewMatrix');
  if(!u_ViewMatrix) {
    console.log('Failed to get the storage location of u_ViewMatrix');
    return;
  }

  // Get the storage location of u_ProjectionMatrix
  u_ProjectionMatrix = gl.getUniformLocation(gl.program, 'u_ProjectionMatrix');
  if(!u_ProjectionMatrix) {
    console.log('Failed to get the storage location of u_ProjectionMatrix');
    return;
  }

  // Get the storage location of the u_Sampler
  u_Sampler = gl.getUniformLocation(gl.program, 'u_Sampler');
  if(!u_Sampler) {
    console.log(`Failed to get the storage location of u_sampler`);
    return;
  }

  // Get the storage location of the u_WoodTexture
  u_WoodTexture = gl.getUniformLocation(gl.program, 'u_WoodTexture');
  if(!u_WoodTexture) {
    console.log(`Failed to get the storage location of u_WoodTexture`);
    return;
  }

  // Get the storage location of the u_whichTexture
  u_whichTexture = gl.getUniformLocation(gl.program, 'u_whichTexture');
  if(!u_whichTexture) {
    console.log(`Failed to get the storage location of u_whichTexture`);
    return;
  }  

  // Set an intial value for this matrix to identity
  var identityM = new Matrix4();
  gl.uniformMatrix4fv(u_ModelMatrix, false, identityM.elements);
}

// Globals related to HTML UI elements
let g_globalAngle = 0;
let g_globaltiltAngle = 0;
let g_globalZoom = 0.5;

let g_faceAnimation = false;
let g_bodyAnimationOn = false;

let g_headAnimation = 0;
let g_bodyAnimation = 0;
let g_armSwipeAnimation = 0;
var g_eyeBlink = 1;

let g_upperArmAngle = 0;
let g_lowerArmAngle = 0;

let angleSlider, tiltSlider, zoomSlider, upperArmSlider, lowerArmSlider;

let musicPlaying = false;
let musicPlayer = new Audio('hes_a_pirate.ogg');
if(musicPlayer === null) {
  console.log('Failed to get the music file.');
}
musicPlayer.volume = 0.4

function addActionsforHtmlUI() {
  angleSlider = document.getElementById('angleSlider');
  angleSlider.addEventListener('mousemove',  function() { g_globalAngle = this.value; renderAllShapes(); });
  tiltSlider = document.getElementById('tiltSlider');
  tiltSlider.addEventListener('mousemove',  function() { g_globaltiltAngle = this.value; renderAllShapes(); });
  zoomSlider = document.getElementById('zoomSlider');
  zoomSlider.addEventListener('mousemove',  function() { g_globalZoom = this.value / 100; renderAllShapes(); });

  document.getElementById('resetCamera').onclick = function() { 
    angleSlider.value = 0; 
    tiltSlider.value = 0; 
    zoomSlider.value = 50; 

    g_globalAngle = 0;
    g_globaltiltAngle = 0;
    g_globalZoom = 0.5;

    renderAllShapes(); 
  };

  upperArmSlider = document.getElementById('upperArmSlider');
  upperArmSlider.addEventListener('mousemove',  function() { g_upperArmAngle = this.value; renderAllShapes(); });
  upperArmSlider.addEventListener('mouseup',  function() { g_upperArmAngle = this.value; renderAllShapes(); });

  lowerArmSlider = document.getElementById('lowerArmSlider');
  lowerArmSlider.addEventListener('mousemove',  function() { g_lowerArmAngle = this.value; renderAllShapes(); });
  lowerArmSlider.addEventListener('mouseup',  function() { g_lowerArmAngle = this.value; renderAllShapes(); });

  document.getElementById('faceAnimationButtonOn').onclick = function() { g_faceAnimation = true; };
  document.getElementById('faceAnimationButtonOff').onclick = function() { g_faceAnimation = false; };

  document.getElementById('bodyAnimationButtonOn').onclick = function() { g_bodyAnimationOn = true; };
  document.getElementById('bodyAnimationButtonOff').onclick = function() { g_bodyAnimationOn = false; };

  document.getElementById('pirateMusicButton').onclick = function() {
    if (musicPlaying) {
      musicPlayer.pause();
    } 
    else {
      musicPlayer.play();
    }
    musicPlaying = !musicPlaying;
  };
}

let startingMouseX = 0;
let startingMouseY = 0;
let dragging = false;

function setupMouseCamera() {
  canvas.onmousedown = function(ev) {
    startingMouseX = ev.clientX;
    startingMouseY = ev.clientY;
    dragging = true;
  }

  canvas.onmousemove = function(ev) {
    if (dragging) {
      // For mouse movement not including camera class
      /*
      let deltaX = ev.clientX - startingMouseX;
      let deltaY = ev.clientY - startingMouseY;
  
      let turnSpeed = 0.4; // Adjust sensitivity
      angleSlider.value = Math.max(-180, Math.min(180, Number(angleSlider.value) - deltaX * turnSpeed));
      g_globalAngle = angleSlider.value;  

      tiltSlider.value = Math.max(-180, Math.min(180, Number(tiltSlider.value) - deltaY * turnSpeed));
      g_globaltiltAngle = tiltSlider.value;  

      startingMouseX = ev.clientX;
      startingMouseY = ev.clientY;
      */

      // For mouse movement including camera class
      let deltaX = ev.clientX - startingMouseX;
      let deltaY = ev.clientY - startingMouseY;
  
      let turnSpeed = 0.4; // Adjust sensitivity
      angleSlider.value = Math.max(-180, Math.min(180, Number(angleSlider.value) - deltaX * turnSpeed));
      g_globalAngle = angleSlider.value;  

      tiltSlider.value = Math.max(-180, Math.min(180, Number(tiltSlider.value) - deltaY * turnSpeed));
      g_globaltiltAngle = tiltSlider.value;  

      startingMouseX = ev.clientX;
      startingMouseY = ev.clientY;
    }
  }
  
  window.onmouseup = function() {
    dragging = false;
  }
}

function initTextures(img, connected, num) {
  var image = new Image(); // Create an image object
  if(!image) {
    console.log(`Failed to create the image object`);
    return false;
  }

  // Register the event handler to be called on loading an image
  image.onload = function(){ sendTextureToTEXTURE0(image, connected, num); };
  // Tell the browser to load an image
  image.src = img;

  // Add more textures later
  return true;
}

function initTextures(img, connected, num) {
  var image = new Image();
  if (!image) {
    console.log(`Failed to create the image object`);
    return false;
  }

  image.onload = function () {
    sendTextureToTEXTURE0(image, connected, num);
  };
  image.src = img;

  return true;
}

function sendTextureToTEXTURE0(image, connected, num) {
  var texture = gl.createTexture();
  if (!texture) {
    console.log(`Failed to create the texture object`);
    return false;
  }

  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1); // Flip Y-axis
  gl.activeTexture(gl.TEXTURE0 + num); // Activate the correct texture unit
  gl.bindTexture(gl.TEXTURE_2D, texture);

  // Set texture parameters
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

  // Load the image into the texture
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);

  // Link the texture unit to the corresponding uniform sampler
  gl.uniform1i(connected, num);

  console.log(`Finished loading texture into unit ${num}`);
}


let camera;
function main() {

  setupWebGL();
  connectVariablesToGLSL();
  addActionsforHtmlUI();
  setupMouseCamera();

  initTextures('sky.jpg', u_Sampler, 0);
  initTextures('woodBlock.jpg', u_WoodTexture, 1);

  // Specify the color for clearing <canvas>
  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  //gl.clear(gl.COLOR_BUFFER_BIT);

  camera = new Camera();
  document.onkeydown = keydown;

  requestAnimationFrame(tick);
}

var g_startTime = performance.now() / 1000.0;
var g_seconds = performance.now()/1000.0-g_startTime;

// Called by browser repeatedly whenever its time
function tick() {
  // Print some debug information so we know we are running
  g_seconds = performance.now()/1000.0 - g_startTime;
  //console.log(g_seconds);

  updateAnimationAngles();
  
  // Draw everything
  renderAllShapes();

  // Tell the browser to update again when it has time
  requestAnimationFrame(tick);
}

function updateAnimationAngles() {

  if(g_bodyAnimationOn){
    g_bodyAnimation = 15*Math.sin(g_seconds);    
    g_armSwipeAnimation = 45*Math.sin(g_seconds);    
    g_headAnimation = 5*Math.sin(g_seconds);

    g_upperArmAnimation = 15*Math.sin(g_seconds);
    g_lowerArmAnimation = 30*Math.sin(g_seconds);

    // Update sliders to match animation
    upperArmSlider.value = (g_upperArmAnimation + 15) / 30 * 100;
    lowerArmSlider.value = (g_lowerArmAnimation + 30) / 60 * 100;
  }
  else
  {
    // Set up the maximum angles to match the slider value of 0 to 100
    g_upperArmAnimation = -15 + upperArmSlider.value / 100 * 30;
    g_lowerArmAnimation = -30 + lowerArmSlider.value / 100 * 60;
  }
}

function keydown(ev) {

  if(ev.code == 'KeyW'){
    camera.moveForward();
  }
  else if(ev.code == 'KeyA'){
    camera.moveLeft();
  }
  else if(ev.code == 'KeyS'){
    camera.moveBackward();
  }
  else if(ev.code == 'KeyD'){
    camera.moveRight();
  }
  else if(ev.code == 'KeyZ'){
    camera.panLeft();
  }
  else if(ev.code == 'KeyX'){
    camera.panRight();
  }
}
/*
var g_map=[
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
];
*/
var g_map=[
  [[1, 0], [1, 0], [1, 0], [1, 0], [1, 0], [1, 0], [1, 0], [1, 0], [1, 0], [1, 0]],
  [[1, 0], 0, 0, 0, 0, 0, 0, 0, 0, [1, 0]],
  [[1, 0], [0], [0], [0], [0], [0], [0], [0], [0], [1, 0]],
  [[1, 0], [0], [0], [0], [1, 0], [0], [0], [0], [0], [1, 0]],
  [[1, 0], [0], [0], [1, 0], [1, 1], [1, 0], [0], [0], [0], [1, 0]],
  [[1, 0], [0], [0], [0], [1, 0], [0], [0], [0], [0], [1, 0]],
  [[1, 0], [0], [0], [0], [0], [0], [0], [0], [0], [1, 0]],
  [[1, 0], [0], [0], [0], [0], [0], [0], [0], [0], [1, 0]],
  [[1, 0], [0], [0], [0], [0], [0], [0], [0], [0], [1, 0]],
  [[1, 0], [1, 0], [1, 0], [1, 0], [1, 0], [1, 0], [1, 0], [1, 0], [1, 0], [1, 0]]
];

function drawMap( position, map ) {
  var body = new Cube();
  for(x = 0; x < map.length; x++ )
  {
    for(y = 0; y < map[x].length; y++) {
      if(map[x][y][0] == 1 || map[x][y] !== 0)
      {
        var height = map[x][y][1];
        var body = new Cube();
        body.color = [1.0, 1.0, 1.0, 1.0];
        body.matrix.scale( 0.6, 0.6, 0.6);
        body.matrix.translate( position[0] + x - 4, position[1] + height - 1.7, position[2] + y - 4);
        body.render();
      }
    }
  }
}

var boat_map = [
  [ 0, [
    [0, 0, 0, 0, 0, 0, 0, 0, 0 ],
    [0, 0, 0, 0, 1, 0, 0, 0, 0 ],
    [0, 0, 1, 1, 1, 1, 1, 0, 0 ],
    [0, 1, 1, 1, 1, 1, 1, 1, 0 ],
    [1, 1, 1, 1, 1, 1, 1, 1, 1 ],
    [1, 1, 1, 1, 1, 1, 1, 1, 1 ],
    [1, 1, 1, 1, 1, 1, 1, 1, 1 ],
    [1, 1, 1, 1, 1, 1, 1, 1, 1 ],
    [1, 1, 1, 1, 1, 1, 1, 1, 1 ],
    [1, 1, 1, 1, 1, 1, 1, 1, 1 ],
    [1, 1, 1, 1, 1, 1, 1, 1, 1 ],
    [0, 1, 1, 1, 1, 1, 1, 1, 0 ],
    [0, 0, 1, 1, 1, 1, 1, 0, 0 ],
    [0, 0, 0, 0, 1, 0, 0, 0, 0 ],
    [0, 0, 0, 0, 0, 0, 0, 0, 0 ]
    ]
  ],
  [ 1, [
    [0, 0, 0, 0, 0, 0, 0, 0, 0 ],
    [0, 0, 0, 1, 1, 1, 0, 0, 0 ],
    [0, 0, 1, 1, 1, 1, 1, 0, 0 ],
    [0, 1, 1, 1, 1, 1, 1, 1, 0 ],
    [1, 1, 1, 1, 1, 1, 1, 1, 1 ],
    [1, 1, 1, 1, 1, 1, 1, 1, 1 ],
    [1, 1, 1, 1, 1, 1, 1, 1, 1 ],
    [1, 1, 1, 1, 1, 1, 1, 1, 1 ],
    [1, 1, 1, 1, 1, 1, 1, 1, 1 ],
    [1, 1, 1, 1, 1, 1, 1, 1, 1 ],
    [1, 1, 1, 1, 1, 1, 1, 1, 1 ],
    [0, 1, 1, 1, 1, 1, 1, 1, 0 ],
    [0, 0, 1, 1, 1, 1, 1, 0, 0 ],
    [0, 0, 0, 1, 1, 1, 0, 0, 0 ],
    [0, 0, 0, 0, 0, 0, 0, 0, 0 ]
    ]
  ],
  [ 2, [
    [0, 0, 0, 0, 1, 0, 0, 0, 0 ],
    [0, 0, 0, 1, 1, 1, 0, 0, 0 ],
    [0, 0, 1, 1, 1, 1, 1, 0, 0 ],
    [0, 1, 1, 1, 1, 1, 1, 1, 0 ],
    [1, 1, 1, 1, 1, 1, 1, 1, 1 ],
    [1, 1, 1, 1, 1, 1, 1, 1, 1 ],
    [1, 1, 1, 1, 1, 1, 1, 1, 1 ],
    [1, 1, 1, 1, 1, 1, 1, 1, 1 ],
    [1, 1, 1, 1, 1, 1, 1, 1, 1 ],
    [1, 1, 1, 1, 1, 1, 1, 1, 1 ],
    [1, 1, 1, 1, 1, 1, 1, 1, 1 ],
    [0, 1, 1, 1, 1, 1, 1, 1, 0 ],
    [0, 0, 1, 1, 1, 1, 1, 0, 0 ],
    [0, 0, 0, 1, 1, 1, 0, 0, 0 ],
    [0, 0, 0, 0, 1, 0, 0, 0, 0 ]
    ]
  ],
  [ 3, [
    [0, 0, 0, 0, 1, 0, 0, 0, 0 ],
    [0, 0, 0, 1, 0, 1, 0, 0, 0 ],
    [0, 0, 1, 0, 0, 0, 1, 0, 0 ],
    [0, 1, 0, 0, 0, 0, 0, 1, 0 ],
    [1, 0, 0, 0, 0, 0, 0, 0, 1 ],
    [1, 0, 0, 0, 0, 0, 0, 0, 1 ],
    [1, 0, 0, 0, 0, 0, 0, 0, 1 ],
    [1, 0, 0, 0, 0, 0, 0, 0, 1 ],
    [1, 0, 0, 0, 0, 0, 0, 0, 1 ],
    [1, 0, 0, 0, 0, 0, 0, 0, 1 ],
    [1, 0, 0, 0, 0, 0, 0, 0, 1 ],
    [0, 1, 0, 0, 0, 0, 0, 1, 0 ],
    [0, 0, 1, 0, 0, 0, 1, 0, 0 ],
    [0, 0, 0, 1, 0, 1, 0, 0, 0 ],
    [0, 0, 0, 0, 1, 0, 0, 0, 0 ]
    ]
  ]
]

function drawBoat(position, map) {
  var body = new Cube();

  // Loop through the heights of the map
  for (let x = 0; x < map.length; x++) {
    let height = map[x][0]; // Height is now the first value
    let boxArray = map[x][1]; // The 2D array is now the second value

    // Loop through rows of the 2D box array
    for (let y = 0; y < boxArray.length; y++) {
      // Loop through columns of the row
      for (let z = 0; z < boxArray[y].length; z++) {
        if (boxArray[y][z] == 1) { // Check if a box should be drawn
          var body = new Cube();
          body.color = [1.0, 1.0, 1.0, 1.0];
          body.textureNum = 1;
          body.matrix.scale(0.6, 0.6, 0.6);
          body.matrix.translate(
            position[0] + z - 4, // Use z for horizontal positioning
            position[1] + height - 1.7, // Use height from map
            position[2] + y - 4 // Use y for depth positioning
          );
          body.render();
        }
      }
    }
  }
}

function drawWater() {
  var body = new Cube();
  for(x = 0; x < 50; x++ )
  {
    for(y = 0; y < 50; y++) {
        body.color = [0.0, 0.6, 0.9, 1.0];
        body.matrix.scale( 0.6, 0.6, 0.6);
        body.matrix.translate( x - 4, - 1.7, - 4);
        body.render();
      }
    }
}


function renderAllShapes(ev) {
  var startTime = performance.now();
  camera.updateView();

  // Pass the matrix to u_ModelMatrix attributes
  var globalRotMat = new Matrix4().rotate(g_globalAngle, 0, 1, 0).scale(g_globalZoom, g_globalZoom, g_globalZoom).translate(0.0, 0.0, 0.5);
  globalRotMat.rotate(g_globaltiltAngle, 1, 0, 0);
  gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, globalRotMat.elements);

  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  gl.clear(gl.COLOR_BUFFER_BIT);

  //drawWater();
  // Draw the floor
  var floor = new Cube();
  floor.color = [ 0.0, 0.6, 0.9, 1.0 ];
  floor.textureNum = -2;
  floor.matrix.scale(100, 1, 100);
  floor.matrix.translate(-0.5, Math.sin(g_seconds) / 4 - 1.8, 0.5);
  floor.render();

  // Draw the sky box
  var skyBox = new Cube();
  skyBox.textureNum = 0;
  skyBox.matrix.scale(1000, 1000, 1000);
  skyBox.matrix.translate(-0.5, -0.5, 0.5);
  skyBox.render();

  drawBoat([0, 0, -10], boat_map);

  var duration = performance.now() - startTime;
  sendToTextHTML(`ms: ${Math.floor(duration)} fps: ${Math.floor(10000/duration)}`, "numdot");
}

function sendToTextHTML(text, htmlID) {
  var htmlElm = document.getElementById(htmlID);
  if(!htmlElm) {
    console.log(`Failed to get ${htmlID} from html.`);
    return;
  }

  htmlElm.innerHTML = text;
}
