importScripts('jsQR.js');   

onmessage = function(e) {

    var imageData = e.data;

    var code = jsQR(imageData.data, imageData.width, imageData.height, {
        inversionAttempts: "dontInvert",
      });
    postMessage(code);
    
  }
  