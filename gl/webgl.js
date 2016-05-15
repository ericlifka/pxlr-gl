SM.DefineModule('pxlr/gl/webgl', function (require) {
  var Frame = require('pxlr/gl/frame');
  var DomHelpers = require('pxlr/gl/dom-helpers');

  function createCanvas() {

  }

  return SM.DefineClass([ DomHelpers, {
    constructor: function (options) {
      options = options || {};

      this.width = options.width || this.width;
      this.height = options.height || this.height;
      this.pixelSize = maximumPixelSize(this.width, this.height);

      this.container = options.container || document.body;
      this.canvas = this.createCanvasElement(this);
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
