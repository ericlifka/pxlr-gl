SM.DefineModule('pxlr/gl/webgl', function (require) {
  var Frame = require('pxlr/gl/frame');

  function createCanvas() {

  }

  return SM.DefineClass([{
    constructor: function Renderer(options) {
      options = options || {};

      this.width = options.width || this.width;
      this.height = options.height || this.height;
      this.pixelSize = maximumPixelSize(this.width, this.height);

      this.container = options.container || document.body;
      this.canvas = createCanvas(this);
      this.container.appendChild(this.canvas);

    },

    newRenderFrame: function () {

    },
    renderFrame: function () {

    },
    setFillColor: function (fillColor) {

    }
  }]);
});
