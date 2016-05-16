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
    },

    maximumPixelSize: function (width, height) {
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
  };
});
