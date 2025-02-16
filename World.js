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
  uniform sampler2D u_WaterTexture;
  uniform sampler2D u_RockTexture;
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
      vec4 textureColor = texture2D(u_Sampler, v_UV);
      gl_FragColor = mix(textureColor, u_FragColor, 0.7); // Blend texture and color 50%    
    }
    else if (u_whichTexture == 2) {
      gl_FragColor = texture2D(u_WoodTexture, v_UV);  // Use wood / ship texture
    }
    else if (u_whichTexture == 3) {
      vec4 textureColor = texture2D(u_WoodTexture, v_UV);
      gl_FragColor = mix(textureColor, u_FragColor, 0.5); // Blend texture and color 50%
    }
    else if (u_whichTexture == 4) {
      gl_FragColor = texture2D(u_WaterTexture, v_UV);  // Use water texture
    }
    else if (u_whichTexture == 5) {
      vec4 textureColor = texture2D(u_WaterTexture, v_UV);
      gl_FragColor = mix(textureColor, u_FragColor, 0.5); // Blend texture and color 50%
    }
    else if (u_whichTexture == 6) {
      gl_FragColor = texture2D(u_RockTexture, v_UV);  // Use rock texture
    }
    else if (u_whichTexture == 7) {
      vec4 textureColor = texture2D(u_RockTexture, v_UV);
      gl_FragColor = mix(textureColor, u_FragColor, 0.5); // Blend texture and color 50%
    }
    else {
      gl_FragColor = vec4(1.0, 0.2, 0.1, 1.0);    // Error, put Redish tint
    }
  }`

// Global Variables
const COLOR = -2;
const DEBUG = -1;
const SKYTEXTURE = 0;
const SKYTEXTURECOLOR = 1;
const WOODTEXTURE = 2;
const WOODTEXTURECOLOR = 3;
const WATERTEXTURE = 4;
const WATERTEXTURECOLOR = 5;
const ROCKTEXTURE = 6;
const ROCKTEXTURECOLOR = 7;

//-----------------------
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
let u_RockTexture;
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

  // Get the storage location of the u_RockTexture
  u_RockTexture = gl.getUniformLocation(gl.program, 'u_RockTexture');
  if(!u_RockTexture) {
    console.log(`Failed to get the storage location of u_RockTexture`);
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
let dragging = false;
let lastMoveTime = 0; // Track last move time

function setupMouseCamera() {
  canvas.onmousedown = function (ev) {
    startingMouseX = ev.clientX;
    dragging = true;
  };

  canvas.onmousemove = function (ev) {
    if (dragging) {
      let now = performance.now();
      let timeDiff = now - lastMoveTime;

      let deltaX = ev.clientX - startingMouseX;
      let sensitivity = 0; // Set to 0 for instant response
      let angle = 5; // Adjust panning speed

      if (timeDiff > 100) { // Only move every 100ms (0.1s)
        if (deltaX > sensitivity) {
          camera.panRight(angle);
        } else if (deltaX < -sensitivity) {
          camera.panLeft(angle);
        }

        startingMouseX = ev.clientX; // Update position
        renderAllShapes();
        lastMoveTime = now; // Store last move time
      }
    }
  };

  window.onmouseup = function () {
    dragging = false;
  };
}

function keydown(ev) {
  if(ev.code == 'KeyQ'){
    camera.moveUp();
  }
  else if(ev.code == 'KeyE'){
    camera.moveDown();
  }

  else if(ev.code == 'KeyW'){
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

  initTextures('sky.jpg', u_Sampler, SKYTEXTURE);
  initTextures('woodBlock.jpg', u_WoodTexture, WOODTEXTURE);
  initTextures('Water.jpg', u_WoodTexture, WATERTEXTURE);
  initTextures('Rock.jpg', u_RockTexture, ROCKTEXTURE);

  // Specify the color for clearing <canvas>
  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  //gl.clear(gl.COLOR_BUFFER_BIT);

  camera = new Camera();
  document.onkeydown = keydown;
  createRain();

  // Draw the island mountains
  var mountain = new Pyramid();
  mountain.color = [0.25, 0.25, 0.25, 1.0];
  mountain.matrix.translate(0, 0, 0);
  mountain.matrix.scale(1, 5, 1);
  //drawMountains(mountainRange, new Matrix4(mountain.matrix))

  var startTree = new Cube();
  startTree.matrix.translate(-60, 0, -80);
  startTree.renderfaster();
  drawTrees(new Matrix4(startTree.matrix));

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

  updateRain();

  // Draw the sky box
  var skyBox = new Cube();
  skyBox.color = [ 0.0, 0.2, 0.2, 1.0 ];
  skyBox.textureNum = SKYTEXTURECOLOR;
  skyBox.matrix.scale(1000, 1000, 1000);
  skyBox.matrix.translate(-0.5, -0.5, 0.5);
  skyBox.renderfaster();

  // Draw the ocean
  var ocean = new Cube();
  ocean.color = [ 0.0, 0.3, 0.5, 1.0 ];
  ocean.matrix.scale(1000, 1, 1000);
  ocean.matrix.translate(-0.5, Math.sin(g_seconds) / 6 - 1.7, 0.5);
  ocean.matrix.rotate(15*Math.sin(g_seconds), 1, 1, 0);
  ocean.renderfaster();

  // Draw the island base
  var island = new Cube();
  island.color = [0.0, 0.25, 0.0, 1.0];
  island.matrix.translate(-150, -10, 50);
  island.matrix.scale(150, 10, 200);
  island.renderfaster();

  renderMountains();
  renderTrees();

  var landHo = new Cube();
  landHo.matrix.translate(2, 0, -18);
  drawMap(docks, new Matrix4(landHo.matrix));

  var boat1 = new Cube();
  boat1.matrix.translate(4, 0, -24);
  boat1.matrix.rotate(90, 0, 1, 0);
  drawMap(boat_map, new Matrix4(boat1.matrix));

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

// Map Data
// --------------------
var mountainRange = [
  [ 0, [
    [1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1],
    [1, 1, 1, 1, 0],
    [1, 1, 1, 1, 0],
    [1, 1, 1, 1, 0],
    [1, 1, 1, 1, 0],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1]
  ]
  ]
];

let mountainArray = [];
function renderMountains() {
  for(let i = 0; i < mountainArray.length; i++) 
  {
    mountainArray[i].renderfaster();
  }
}

function drawMountains(map, positionMatrix) 
{
  for (let x = 0; x < map.length; x++) 
  {
    let boxArray = map[x][1];

    for (let y = 0; y < boxArray.length; y++) 
    {
      for (let z = 0; z < boxArray[y].length; z++) 
      {
        if (boxArray[y][z] != 0) 
        { 
          var body = new Pyramid();
          body.color = [0.25, 0.25, 0.25, 1.0];
          body.textureNum = ROCKTEXTURE;

          // Apply position transformation before specific translations
          body.matrix = new Matrix4(positionMatrix);
          body.matrix.translate(
            z * 0.4,
            0,
            -y * 0.5
          );
          //body.matrix.rotate(randomIntFromInterval(0, 89), 0, 1, 0);
          mountainArray.push(body);
        }
      }
    }
  }
}

let tree_map = [
  [ 0, [
    [0, 0, 0],
    [0, 1, 0],
    [0, 0, 0],
    ]
  ],
  [ 1, [
    [0, 0, 0],
    [0, 1, 0],
    [0, 0, 0],
    ]
  ],
  [ 2, [
    [0, 0, 0],
    [0, 1, 0],
    [0, 0, 0],
    ]
  ],
  [ 3, [
    [0, 0, 0],
    [0, 1, 0],
    [0, 0, 0],
    ]
  ],
  [ 4, [
    [2, 2, 2],
    [2, 2, 2],
    [2, 2, 2],
    ]
  ],
  [ 5, [
    [0, 2, 0],
    [2, 0, 2],
    [0, 2, 0],
    ]
  ],
  [ 6, [
    [0, 0, 0],
    [0, 2, 0],
    [0, 0, 0],
    ]
  ]
];

let trees = [];
function renderTrees() {
  for(let i = 0; i < trees.length; i++) 
  {
    trees[i].renderfaster();
  }
}

function drawTrees(positionMatrix) {
  for (let x = 0; x < 12; x++) {
    for (let y = 0; y < 20; y++) {
      if (randomIntFromInterval(0, 4) === 1) {  // 25% chance to generate a tree
        
        let worldX = x * 5;  // Base world position for tree
        let worldZ = y * 5;
        let rotation = randomIntFromInterval(0, 89);

        for (let layerIndex = 0; layerIndex < tree_map.length; layerIndex++) { // Iterate over tree_map layers
          let height = tree_map[layerIndex][0];  // Height level of this layer
          let boxArray = tree_map[layerIndex][1];  // Structure of the layer
          for (let row = 0; row < boxArray.length; row++) {
            for (let col = 0; col < boxArray[row].length; col++) {
              if (boxArray[row][col] !== 0) {  // Only create a cube if it's not empty
                
                var body = new Cube();
                body.textureNum = WOODTEXTURECOLOR;
                body.color = [0.0, 0.0, 0.0, 1.0];  // Leaves

                // Differentiate between trunk and leaves
                if (boxArray[row][col] === 2) {
                  body.color = [0.0, 0.2, 0.0, 1.0];  // Leaves
                  body.textureNum = COLOR;
                }

                body.matrix = new Matrix4(positionMatrix);

                body.matrix.translate(
                  worldX + col - Math.floor(boxArray[row].length / 2), // Center X around trunk
                  height,  // Correct height for the tree
                  worldZ + row - Math.floor(boxArray.length / 2) // Center Z around trunk
                );
                body.matrix.rotate(rotation, 0, 1, 0);
                trees.push(body);
              }
            }
          }
        }
      }
    }
  }
}




var docks = [
  [ 0, [
    [2, 0, 2, 0, 2, 0, 2, 0, 2, 0, 2, 0, 2, 0, 2],
    [0],
    [0],
    [2, 0, 2, 0, 2, 0, 2, 0, 2, 0, 2, 0, 2, 0, 2]
    ]
  ], 
  [ 1, [
    [2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2],
    [2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2],
    [2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2],
    [2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2],
    ]
  ]  
]

//---------------------------------
var boat_map = [
  [ 0, [
    [0],
    [0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0],
    [0, 0, 0, 2, 2, 2, 2, 2, 0, 0, 0],
    [0, 0, 2, 2, 2, 2, 2, 2, 2, 0, 0],
    [0, 2, 2, 2, 2, 2, 2, 2, 2, 2, 0],
    [0, 2, 2, 2, 2, 2, 2, 2, 2, 2, 0],
    [0, 2, 2, 2, 2, 2, 2, 2, 2, 2, 0],
    [0, 2, 2, 2, 2, 2, 2, 2, 2, 2, 0],
    [0, 2, 2, 2, 2, 2, 2, 2, 2, 2, 0],
    [0, 2, 2, 2, 2, 2, 2, 2, 2, 2, 0],
    [0, 2, 2, 2, 2, 2, 2, 2, 2, 2, 0],
    [0, 0, 2, 2, 2, 2, 2, 2, 2, 0, 0],
    [0, 0, 0, 2, 2, 2, 2, 2, 0, 0, 0],
    [0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0],
    [0]
    ]
  ],
  [ 1, [
    [0],
    [0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0],
    [0, 0, 0, 1, 1, 1, 1, 1, 0, 0, 0],
    [0, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0],
    [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
    [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
    [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
    [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
    [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
    [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
    [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
    [0, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0],
    [0, 0, 0, 1, 1, 1, 1, 1, 0, 0, 0],
    [0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0],
    [0]
    ]
  ],
  [ 2, [
    [0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0],
    [0, 0, 0, 1, 1, 1, 1, 1, 0, 0, 0],
    [0, 0, 0, 1, 1, 1, 1, 1, 0, 0, 0],
    [0, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0],
    [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
    [0, 3, 1, 1, 1, 1, 1, 1, 1, 3, 0],
    [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
    [0, 3, 1, 1, 1, 1, 1, 1, 1, 3, 0],
    [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
    [0, 3, 1, 1, 1, 1, 1, 1, 1, 3, 0],
    [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
    [0, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0],
    [0, 0, 0, 1, 1, 1, 1, 1, 0, 0, 0],
    [0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0]
    ]
  ],
  [ 3, [
    [0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0],
    [0, 0, 0, 1, 1, 1, 1, 1, 0, 0, 0],
    [0, 0, 0, 1, 1, 1, 1, 1, 0, 0, 0],
    [0, 0, 1, 3, 1, 1, 1, 3, 1, 0, 0],
    [0, 1, 0, 0, 0, 2, 0, 0, 0, 1, 0],
    [0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0],
    [0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0],
    [0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0],
    [0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0],
    [0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0],
    [0, 1, 0, 0, 0, 2, 0, 0, 0, 1, 0],
    [0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0],
    [0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0],
    [0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0]
  ]
  ],
  [ 4, [
    [0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0],
    [0, 0, 0, 1, 1, 1, 1, 1, 0, 0, 0],
    [0, 0, 0, 1, 1, 1, 1, 1, 0, 0, 0],
    [0, 0, 1, 3, 1, 1, 1, 3, 1, 0, 0],
    [0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0],
    [0],
    [0],
    [0],
    [0],
    [0],
    [0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0],
    [0],
    [0],
    [0],
    [0]
    ]
  ],
  [ 5, [
    [0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0],
    [0, 0, 0, 1, 1, 1, 1, 1, 0, 0, 0],
    [0, 0, 0, 1, 1, 1, 1, 1, 0, 0, 0],
    [0, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0],
    [0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0],
    [0],
    [0],
    [0],
    [0],
    [0],
    [0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0],
    [0],
    [0],
    [0],
    [0]
    ]
  ],
  [ 6, [
    [0],
    [0],
    [0],
    [0],
    [0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0],
    [0],
    [0],
    [0],
    [0],
    [0],
    [0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0],
    [0],
    [0],
    [0],
    [0]
    ]
  ],
  [ 7, [
    [0],
    [0],
    [0],
    [0],
    [0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0],
    [0],
    [0],
    [0],
    [0],
    [0],
    [0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0],
    [0],
    [0],
    [0],
    [0]
    ]
  ],
  [ 8, [
    [0],
    [0],
    [0],
    [0],
    [0, 0, 0, 3, 3, 2, 3, 3, 0, 0, 0],
    [0],
    [0],
    [0],
    [0],
    [0],
    [0, 0, 0, 3, 3, 2, 3, 3, 0, 0, 0],
    [0],
    [0],
    [0],
    [0]
    ]
  ],
  [ 9, [
    [0],
    [0],
    [0],
    [0],
    [0, 0, 3, 3, 3, 2, 3, 3, 3, 0, 0],
    [0],
    [0],
    [0],
    [0],
    [0],
    [0, 0, 3, 3, 3, 2, 3, 3, 3, 0, 0],
    [0],
    [0],
    [0],
    [0]
    ]
  ],
  [ 10, [
    [0],
    [0],
    [0],
    [0],
    [0, 0, 3, 3, 3, 2, 3, 3, 3, 0, 0],
    [0],
    [0],
    [0],
    [0],
    [0],
    [0, 0, 3, 3, 3, 2, 3, 3, 3, 0, 0],
    [0],
    [0],
    [0],
    [0]
    ]
  ],
  [ 11, [
    [0],
    [0],
    [0],
    [0],
    [0, 0, 3, 3, 3, 2, 3, 3, 3, 0, 0],
    [0],
    [0],
    [0],
    [0],
    [0],
    [0, 0, 3, 3, 3, 2, 3, 3, 3, 0, 0],
    [0],
    [0],
    [0],
    [0]
    ]
  ],
  [ 12, [
    [0],
    [0],
    [0],
    [0],
    [0, 0, 0, 3, 3, 2, 3, 3, 0, 0, 0],
    [0],
    [0],
    [0],
    [0],
    [0],
    [0, 0, 0, 3, 3, 2, 3, 3, 0, 0, 0],
    [0],
    [0],
    [0],
    [0]
    ]
  ],
  [ 13, [
    [0],
    [0],
    [0],
    [0],
    [0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0],
    [0],
    [0],
    [0],
    [0],
    [0],
    [0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0],
    [0],
    [0],
    [0],
    [0]
    ]
  ]
]
function drawMap(map, positionMatrix) {
  for (let x = 0; x < map.length; x++) {
    let height = map[x][0];
    let boxArray = map[x][1];

    for (let y = 0; y < boxArray.length; y++) {
      for (let z = 0; z < boxArray[y].length; z++) {
        if (boxArray[y][z] != 0) { 
          var body = new Cube();
          body.textureNum = WOODTEXTURECOLOR;
          body.color = [0.1, 0.2, 0.1, 1.0];

          if (boxArray[y][z] == 2) {
            body.color = [0.0, 0.0, 0.0, 1.0];
          }

          if (boxArray[y][z] == 3) {
            body.textureNum = COLOR;
            body.color = [0.0, 0.0, 0.0, 1.0];
          }

          body.matrix = new Matrix4(positionMatrix);
          body.matrix.scale(0.6, 0.6, 0.6);
          body.matrix.translate(
            z - 4, // Adjust horizontal positioning
            height - 1.7, // Adjust height
            y - 4  // Adjust depth positioning
          );

          body.renderfaster();
        }
      }
    }
  }
}

function randomIntFromInterval(min, max) { // min and max included 
  return Math.floor(Math.random() * (max - min + 1) + min);
}

let raindrops = [];
function createRain() {
  for (let i = 0; i < 8000; i++) {
    let xPos = randomIntFromInterval(-2000, 2000);
    let zPos = -400 + randomIntFromInterval(-3000, 2000);
    let yPos = randomIntFromInterval(0, 300);

    var rainDrop = new Cube();
    rainDrop.color = [0.5, 0.5, 1.0, 1.0];
    rainDrop.matrix.scale(0.05, 0.5, 0.05);
    rainDrop.matrix.translate(0 + xPos, 300 - yPos, -50 + zPos);
    raindrops.push(rainDrop);

    rainDrop.height = 300;
    rainDrop.currHeight = 300 - yPos;
    rainDrop.low = -10;
    rainDrop.lastDropTime = 0;
    rainDrop.xPos = xPos;
    rainDrop.zPos = zPos;
  }
}

function updateRain() {
  for (let drop of raindrops) {
    // If it reaches the bottom, reset to the top
    if (drop.currHeight <= drop.low) {
      drop.currHeight = drop.height; // Reset height
      drop.matrix.setIdentity(); // Reset transformations
      drop.matrix.scale(0.05, 0.5, 0.05);
      drop.matrix.translate(0 + drop.xPos, drop.height, -50 + drop.zPos);
    }
    // Move down based on dropSpeed
    else { 
      drop.matrix.translate(0, -3, 0); // Move down
      drop.currHeight--; // Decrease height
      drop.lastDropTime = g_seconds; // Update last drop time
    }
    drop.renderfaster();
  }
}