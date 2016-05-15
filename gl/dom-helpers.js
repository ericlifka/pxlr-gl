SM.DefineModule('pxlr/gl/dom-helpers', function () {
  return {
    createCanvasElement: function (dimensions) {
      dimensions.fullWidth = dimensions.width * dimensions.pixelSize;
      dimensions.fullHeight = dimensions.height * dimensions.pixelSize;

      var el = document.createElement('canvas');
      el.width = dimensions.fullWidth;
      el.height = dimensions.fullHeight;
      el.classList.add('pixel-engine-canvas');

      return el;
    }
  };
});
