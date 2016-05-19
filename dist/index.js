(function () {
/* start:pxlr-gl */
SM.DefineModule('pxlr/gl', function () {
  return {
    name: "pxlr-gl",
    information: "Rendering pipeline for pxlr"
  }
});

SM.DefineModule('views/canvas-renderer', function (require) {
  return require('pxlr/gl/canvas');
});

SM.DefineModule('pxlr/gl/canvas', function (require) {
  var Frame = require('pxlr/gl/frame');
  var DomHelpers = require('pxlr/gl/dom-helpers');

  return SM.DefineClass([ DomHelpers, {
    width: 80,
    height: 50,
    pixelSize: 1,
    nextFrame: 0,

    constructor: function (options) {
      this.canvasSetup(options || { });

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
  }]);
});

SM.DefineModule('pxlr/gl/dom-helpers', function () {
  return {
    canvasSetup: function (options) {
      this.container = options.container || document.body;
      this.width = options.width || this.width;
      this.height = options.height || this.height;

      this.calculateMaximumPixelSize();
      this.createCanvasElement();
    },

    createCanvasElement: function () {
      this.canvas = document.createElement('canvas');

      this.canvas.width = this.fullWidth;
      this.canvas.height = this.fullHeight;
      this.canvas.classList.add('pxlr-canvas');

      this.container.appendChild(this.canvas);
    },

    calculateMaximumPixelSize: function () {
      var maxWidth = window.innerWidth;
      var maxHeight = window.innerHeight;
      var width = this.width;
      var height = this.height;
      var pixelSize = 1;

      while (true) {
        if (width * pixelSize > maxWidth || height * pixelSize > maxHeight) {
          pixelSize--;
          break;
        }

        pixelSize++;
      }

      if (pixelSize <= 0) {
        pixelSize = 1;
      }

      this.pixelSize = pixelSize;
      this.fullWidth = width * pixelSize;
      this.fullHeight = height * pixelSize;
    }
  };
});

SM.DefineModule('pxlr/gl/frame', function (require) {
  var CellGrid = require('pxlr/core/cell-grid');

  return SM.DefineClass([CellGrid, {
    constructor: function (dimensions) {
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
  }]);
});

SM.DefineModule('pxlr/gl/webgl', function (require) {
  var Frame = require('pxlr/gl/frame');
  var DomHelpers = require('pxlr/gl/dom-helpers');

  function createCanvas() {

  }

  return SM.DefineClass([ DomHelpers, {
    width: 80,
    height: 50,
    pixelSize: 1,

    constructor: function (options) {
      this.canvasSetup(options || { });
    },

    newRenderFrame: function () {

    },
    renderFrame: function () {

    },
    setFillColor: function (fillColor) {

    }
  }]);
});
/* end:pxlr-gl */
}());
