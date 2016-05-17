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
      options = options || {};
      this.container = options.container || document.body;
      this.width = options.width || this.width;
      this.height = options.height || this.height;

      this.calculateMaximumPixelSize();
      this.createCanvasElement();
    },

    newRenderFrame: function () {

    },
    renderFrame: function () {

    },
    setFillColor: function (fillColor) {

    }
  }]);
});
