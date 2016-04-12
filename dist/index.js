(function () {
/* start:pxlr-gl */
DefineModule('pxlr/gl', function () {
  return {
    name: "pxlr-gl",
    information: "Rendering pipeline for pxlr"
  }
});

DefineModule('views/canvas-renderer', function (require) {
  return require('pxlr/gl//canvas');
});

DefineModule('pxlr/gl/canvas', function (require) {
  var Frame = require('pxlr/gl/frame');

  function maximumPixelSize(width, height) {
    var maxWidth = window.innerWidth;
    var maxHeight = window.innerHeight;
    var pixelSize = 1;
    while (true) {
      if (width * pixelSize > maxWidth ||
        height * pixelSize > maxHeight) {

        pixelSize--;
        break;
      }

      pixelSize++;
    }

    if (pixelSize <= 0) {
      pixelSize = 1;
    }

    return pixelSize;
  }

  function createCanvasEl(dimensions) {
    dimensions.fullWidth = dimensions.width * dimensions.pixelSize;
    dimensions.fullHeight = dimensions.height * dimensions.pixelSize;

    var el = document.createElement('canvas');
    el.width = dimensions.fullWidth;
    el.height = dimensions.fullHeight;
    el.classList.add('pixel-engine-canvas');

    return el;
  }

  return DefineClass({
    width: 80,
    height: 50,
    pixelSize: 1,
    nextFrame: 0,

    constructor: function Renderer(options) {
      options = options || {};

      this.width = options.width || this.width;
      this.height = options.height || this.height;
      this.pixelSize = maximumPixelSize(this.width, this.height);

      this.container = options.container || document.body;
      this.canvas = createCanvasEl(this);
      this.container.appendChild(this.canvas);

      this.canvasDrawContext = this.canvas.getContext("2d", { alpha: false });
      this.frames = [
        new Frame(this),
        new Frame(this)
      ];
    },

    newRenderFrame: function () {
      return this.frames[ this.nextFrame ];
    },
    renderFrame: function () {
      var frame = this.frames[ this.nextFrame ];
      var pixelSize = this.pixelSize;
      var ctx = this.canvasDrawContext;
      var fillColor = frame.fillColor;

      ctx.fillStyle = fillColor;
      ctx.fillRect(0, 0, this.fullWidth, this.fullHeight);

      frame.iterateCells(function (cell, x, y) {
        if (cell.color !== fillColor) {
          ctx.beginPath();
          ctx.rect(cell.render_x, cell.render_y, pixelSize, pixelSize);
          ctx.fillStyle = cell.color;
          ctx.fill();
          ctx.closePath();
        }
      });

      this.nextFrame = +!this.nextFrame; // switch the frames
    },
    setFillColor: function (fillColor) {
      this.frames.forEach(function (frame) {
        frame.setFillColor(fillColor);
      });
    }
  });
});

DefineModule('pxlr/gl/frame', function (require) {
  var CellGrid = require('pxlr/core/cell-grid');

  return DefineClass(CellGrid, {
    constructor: function Frame(dimensions) {
      this.width = dimensions.width;
      this.height = dimensions.height;
      this.cells = [];

      for (var x = 0; x < this.width; x++) {
        this.cells[ x ] = [];

        for (var y = 0; y < this.height; y++) {
          this.cells[ x ][ y ] = {
            x: x,
            y: y,
            render_x: x * dimensions.pixelSize,
            render_y: y * dimensions.pixelSize,
            color: "#000000",
            index: -1
          };
        }
      }
    },
    clear: function () {
      var color = this.fillColor;
      if (color) {
        this.iterateCells(function (cell) {
          cell.color = color;
          cell.index = -1;
        });
      }
    },
    setFillColor: function (fillColor) {
      this.fillColor = fillColor;
    }
  });
});

DefineModule('pxlr/gl/webgl', function (require) {
  var Frame = require('pxlr/gl/frame');

  function maximumPixelSize(width, height) {
    var maxWidth = window.innerWidth;
    var maxHeight = window.innerHeight;
    var pixelSize = 1;
    while (true) {
      if (width * pixelSize > maxWidth ||
        height * pixelSize > maxHeight) {

        pixelSize--;
        break;
      }

      pixelSize++;
    }

    if (pixelSize <= 0) {
      pixelSize = 1;
    }

    return pixelSize;
  }

  function createCanvasEl(dimensions) {
    dimensions.fullWidth = dimensions.width * dimensions.pixelSize;
    dimensions.fullHeight = dimensions.height * dimensions.pixelSize;

    var el = document.createElement('canvas');
    el.width = dimensions.fullWidth;
    el.height = dimensions.fullHeight;
    el.classList.add('pixel-engine-canvas');

    return el;
  }

  var horizAspect = 480.0/640.0;

  function loadIdentity() {
    mvMatrix = Matrix.I(4);
  }

  function multMatrix(m) {
    mvMatrix = mvMatrix.x(m);
  }

  function mvTranslate(v) {
    multMatrix(Matrix.Translation($V([v[0], v[1], v[2]])).ensure4x4());
  }

  function setMatrixUniforms() {
    var pUniform = gl.getUniformLocation(shaderProgram, "uPMatrix");
    gl.uniformMatrix4fv(pUniform, false, new Float32Array(perspectiveMatrix.flatten()));

    var mvUniform = gl.getUniformLocation(shaderProgram, "uMVMatrix");
    gl.uniformMatrix4fv(mvUniform, false, new Float32Array(mvMatrix.flatten()));
  }

  function drawScene(gl) {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    perspectiveMatrix = makePerspective(45, 640.0/480.0, 0.1, 100.0);

    loadIdentity();
    mvTranslate([-0.0, 0.0, -6.0]);

    gl.bindBuffer(gl.ARRAY_BUFFER, squareVerticesBuffer);
    gl.vertexAttribPointer(vertexPositionAttribute, 3, gl.FLOAT, false, 0, 0);
    setMatrixUniforms();
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  }

  function initBuffers(gl) {
    squareVerticesBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, squareVerticesBuffer);

    var vertices = [
      1.0,  1.0,  0.0,
      -1.0, 1.0,  0.0,
      1.0,  -1.0, 0.0,
      -1.0, -1.0, 0.0
    ];

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
  }

  function getShader(gl, id) {
    var shaderScript, theSource, currentChild, shader;

    shaderScript = document.getElementById(id);

    if (!shaderScript) {
      return null;
    }

    theSource = "";
    currentChild = shaderScript.firstChild;

    while (currentChild) {
      if (currentChild.nodeType == currentChild.TEXT_NODE) {
        theSource += currentChild.textContent;
      }

      currentChild = currentChild.nextSibling;
    }

    if (shaderScript.type == "x-shader/x-fragment") {
      shader = gl.createShader(gl.FRAGMENT_SHADER);
    } else if (shaderScript.type == "x-shader/x-vertex") {
      shader = gl.createShader(gl.VERTEX_SHADER);
    } else {
      // Unknown shader type
      return null;
    }

    gl.shaderSource(shader, theSource);

    // Compile the shader program
    gl.compileShader(shader);

    // See if it compiled successfully
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      alert("An error occurred compiling the shaders: " + gl.getShaderInfoLog(shader));
      return null;
    }

    return shader;
  }

  function initShaders(gl) {
    var fragmentShader = getShader(gl, "shader-fs");
    var vertexShader = getShader(gl, "shader-vs");

    // Create the shader program

    shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);

    // If creating the shader program failed, alert

    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
      alert("Unable to initialize the shader program.");
    }

    gl.useProgram(shaderProgram);

    vertexPositionAttribute = gl.getAttribLocation(shaderProgram, "aVertexPosition");
    gl.enableVertexAttribArray(vertexPositionAttribute);
  }

  return DefineClass({
    width: 80,
    height: 50,
    pixelSize: 1,
    nextFrame: 0,

    constructor: function Renderer(options) {
      options = options || {};

      this.width = options.width || this.width;
      this.height = options.height || this.height;
      this.pixelSize = maximumPixelSize(this.width, this.height);

      this.container = options.container || document.body;
      this.canvas = createCanvasEl(this);
      this.container.appendChild(this.canvas);

      this.canvasDrawContext = this.canvas.getContext("webgl");
      this.canvasDrawContext.clearColor(0.0, 0.0, 0.0, 1.0);
      this.canvasDrawContext.enable(this.canvasDrawContext.DEPTH_TEST);
      this.canvasDrawContext.depthFunc(this.canvasDrawContext.LEQUAL);
      this.canvasDrawContext.clear(this.canvasDrawContext.COLOR_BUFFER_BIT | this.canvasDrawContext.DEPTH_BUFFER_BIT);

      this.frames = [
        new Frame(this),
        new Frame(this)
      ];
    },

    newRenderFrame: function () {
      return this.frames[ this.nextFrame ];
    },
    renderFrame: function () {
      //var frame = this.frames[ this.nextFrame ];
      //var pixelSize = this.pixelSize;
      //var ctx = this.canvasDrawContext;
      //var fillColor = frame.fillColor;
      //
      //ctx.fillStyle = fillColor;
      //ctx.fillRect(0, 0, this.fullWidth, this.fullHeight);
      //
      //frame.iterateCells(function (cell, x, y) {
      //    if (cell.color !== fillColor) {
      //        ctx.beginPath();
      //        ctx.rect(cell.render_x, cell.render_y, pixelSize, pixelSize);
      //        ctx.fillStyle = cell.color;
      //        ctx.fill();
      //        ctx.closePath();
      //    }
      //});
      //
      //this.nextFrame = +!this.nextFrame; // switch the frames
    },
    setFillColor: function (fillColor) {
      this.frames.forEach(function (frame) {
        frame.setFillColor(fillColor);
      });
    }
  });
});
/* end:pxlr-gl */
}());
