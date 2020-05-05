function getJSONwithProgress(url, options) {

    var d = $.Deferred()

    var xhrWithProgress = function () {
        var xhr = new window.XMLHttpRequest()

        xhr.addEventListener("progress", function (evt) {
            var url = evt.currentTarget.responseURL

            var hasGzip = evt.currentTarget.getAllResponseHeaders().indexOf("content-encoding") > -1 && evt.currentTarget.getResponseHeader("Content-Encoding") == "gzip"
            var len = parseInt(evt.currentTarget.getResponseHeader("Content-Length"))

            if(options && options.infer_decompressed_size && hasGzip){
                len = len * 2.389
            }

            d.notify(url, evt.loaded, len)

        }, false)

        return xhr
    }

    $.getJSON({ url: url, xhr: xhrWithProgress }).then(function (result) {
        d.resolve(result)
    }).catch(function (err) {
        d.reject(err)
    })

    return d.promise();
}

var multiFileProgress = function(){

    var progress = {
    }

    var _handler = function(){}

    var update = function(url, loaded, total){

        if (progress.hasOwnProperty(url)){
            progress[url].loaded = loaded
        }
        else{
            progress[url] = {
                loaded: loaded,
                total: total
            }
        }

        _handler()
    }

    var onUpdate = function(handler){
        _handler = handler
        return this;
    }
    var get = function(){

        var loaded = 0
        var total = 0

        for (const url in progress) {
            if (progress.hasOwnProperty(url)) {
                const p = progress[url];
                loaded += p.loaded
                total += p.total
            }
        }

        return total > 0 ? loaded/total : 0
    }

    return {
        update: update,
        get: get,
        onUpdate: onUpdate
    }
}

//-----

var ImageHelper = function () {

    function pixelateup(matrix, scale) {

        var s = Matrix.sizeOf(matrix)

        var result = Matrix.create(s.h*scale,s.w*scale)

        for (let i = 0; i < s.h; i++) {
            for (let j = 0; j < s.w; j++) {

                for(let k = i*scale; k < (i+1)*scale; k++){
                    for(let l = j*scale; l < (j+1)*scale; l++){
                        result[k][l] = matrix[i][j]
                    }
                }
            } 
        }

        return result
    }

    function pixelatedown(matrix, scale){
        var s = Matrix.sizeOf(matrix)
        var result = Matrix.create(s.h/scale,s.w/scale)

        for (let i = 0; i < s.h/scale; i++) {
            for (let j = 0; j < s.w/scale; j++) {

                var sum = 0

                for(let k = i*scale; k < (i+1)*scale; k++){
                    for(let l = j*scale; l < (j+1)*scale; l++){
                       sum += matrix[k][l]
                    }
                }

                result[i][j] = sum / (scale*scale)

            } 
        }

        return result

    }

    function toMatrix(canvas){
        var imageData = getImageData(canvas)
        return convertImageDataToActivationMatrix(imageData)
    }

    function convertMatrixToImageData(matrix) {

        var size = Matrix.sizeOf(matrix)
        var w = size.w
        var h = size.h
        
        var pixels = new Uint8ClampedArray(w * h * 4);

        for (let i = 0; i < h; i++) {
            for (let j = 0; j < w; j++) {
                var index = i * w + j;
                var offset = 4 * index;
                var pixelValue = convertActivationToPixel(matrix[i][j]);
                pixels[offset] = pixelValue;
                pixels[offset + 1] = pixelValue;
                pixels[offset + 2] = pixelValue;
                pixels[offset + 3] = 255;
            }
        }

        return new ImageData(pixels, w, h);
    }

    var updateCanvasFromMatrix = function (canvas, matrix) {
        canvas.getContext("2d").putImageData(convertMatrixToImageData(matrix), 0, 0);
    }

    function convertActivationToPixel(a) {
        return 255 - (a * 255);
    }

    function convertPixelToActivation(r, g, b) {
        return (255 - (r + g + b) / 3) / 255;
    }

    //converts RGB valued imageData to 2D matrix activation values
    //values are decimals between 0 and 1 (0:white,1:black)
    function convertImageDataToActivationMatrix(imageData) {

        var result = []
        var w = imageData.width
        var h = imageData.height
        var data = imageData.data

        for (var i = 0; i < h; i++) {
            result[i] = []
            for (var j = 0; j < w; j++) {
                var offset = 4 * (i * w + j);
                var r = data[offset]
                var g = data[offset + 1]
                var b = data[offset + 2]
                var activationValue = convertPixelToActivation(r, g, b)
                result[i][j] = activationValue
            }
        }

        return result
    }

    function getBoundaryRectangle(a) {

        var h = a.length;
        var w = a[0].length;
        var minX = w, minY = h, maxX = -1, maxY = -1;

        for (var i = 0; i < h; i++) {
            for (var j = 0; j < w; j++) {
                var v = a[i][j];
                if (v > 0.04) {
                    if (i < minY) { minY = i; }
                    if (i > maxY) { maxY = i; }
                    if (j < minX) { minX = j; }
                    if (j > maxX) { maxX = j; }
                }
            }
        }

        return {
            topleft: {
                x: minX,
                y: minY
            },
            width: maxX - minX + 1,
            height: maxY - minY + 1
        };
    }

    function calculateCenterOfMass(canvas) {
        var imageData = getImageData(canvas);
        var a = convertImageDataToActivationMatrix(imageData);

        var sumV = sumRow = sumCol = 0;
        for (var row = 1; row <= a.length; row++) {
            for (var col = 1; col <= a[0].length; col++) {
                var v = a[row - 1][col - 1];
                sumV += v;
                sumRow += row * v;
                sumCol += col * v;
            }
        }

        return { x: sumCol / sumV, y: sumRow / sumV };
    }

    function clear(canvas) {
        var context = canvas.getContext("2d")
        context.fillStyle = "white"
        context.fillRect(0, 0, canvas.width, canvas.height)
    }

    function getImageData(canvas) {
        var context = canvas.getContext("2d")
        return context.getImageData(0, 0, canvas.width, canvas.height)
    }

    function copy(srcCanvas, srcRect, dstCanvas, destRect, isSmooth) {

        var dstContext = dstCanvas.getContext("2d")
        dstContext.imageSmoothingEnabled = isSmooth ? true : false;

        dstContext.drawImage(srcCanvas,
            srcRect.topleft.x,
            srcRect.topleft.y,
            srcRect.width,
            srcRect.height,

            destRect.topleft.x,
            destRect.topleft.y,
            destRect.width,
            destRect.height);
    }

    function translate(canvas, dx, dy) {
        var shadowCanvas = document.createElement("canvas");
        shadowCanvas.width = canvas.width;
        shadowCanvas.height = canvas.height;
        var shadowContext = shadowCanvas.getContext("2d");

        shadowContext.translate(dx, dy);
        clear(shadowCanvas);
        shadowContext.drawImage(canvas, 0, 0);

        clear(canvas);
        var context = canvas.getContext("2d");
        context.drawImage(shadowCanvas, 0, 0);
        delete shadowCanvas;
    }

    return {
        toMatrix: toMatrix,
        getBoundaryRectangle: getBoundaryRectangle,
        calculateCenterOfMass: calculateCenterOfMass,
        translate: translate,
        clear: clear,
        copy: copy,
        pixelateup: pixelateup,
        pixelatedown: pixelatedown,
        updateCanvasFromMatrix: updateCanvasFromMatrix
    }
}()

//----

var BindMouseEvents = function (canvas) {

    var model = {
        shouldDraw: false,
        lastTouch: { x: -1, y: -1 }
    };

    $canvas = $(canvas)

    var context = canvas.getContext("2d")

    function getMouseCoordinates(e) {
        var offset = $(e.target).offset()
        var c = { x: e.pageX - offset.left, y: e.pageY - offset.top }
        return c
    }

    function draw(e) {

        //get mouse events (x,y) coordinates
        var c = getMouseCoordinates(e)

        //draw line between (model.lastTouch) and c(x,y)
        context.beginPath()
        context.moveTo(model.lastTouch.x, model.lastTouch.y)
        context.lineTo(c.x, c.y)
        context.closePath()
        context.stroke()

        //update last touch coordinates
        model.lastTouch = c
    }

    ImageHelper.clear(canvas)

    //set drawing parameters
    context.strokeStyle = "black"
    context.lineWidth = 20
    context.lineJoin = "round"
    context.lineCap = "round"

    //handle mouse events on canvas
    $canvas.mousedown(function (e) {

        //enable drawing on canvas
        model.shouldDraw = true

        //get mouse events (x,y) coordinates
        var c = getMouseCoordinates(e)

        //update model coordinates (last touched coordinates on canvas)
        model.lastTouch = c
    });

    $canvas.mousemove(function (e) {
        if (model.shouldDraw) {
            draw(e)
        }
    });

    $canvas.mouseup(function (e) {
        model.shouldDraw = false
    });

    $canvas.mouseleave(function (e) {
        model.shouldDraw = false
    });



}

var BindTouchEvents = function (canvas) {

    canvas.addEventListener("touchstart", function (e) {

        var touch = e.touches[0];
        var mouseEvent = new MouseEvent("mousedown", {
            clientX: touch.pageX,
            clientY: touch.pageY
        });
        canvas.dispatchEvent(mouseEvent);
    }, false);

    canvas.addEventListener("touchend", function (e) {
        var mouseEvent = new MouseEvent("mouseup", {});
        canvas.dispatchEvent(mouseEvent);
    }, false);

    canvas.addEventListener("touchmove", function (e) {
        var touch = e.touches[0];
        var mouseEvent = new MouseEvent("mousemove", {
            clientX: touch.pageX,
            clientY: touch.pageY
        });
        canvas.dispatchEvent(mouseEvent);
    }, false);

}

var PreventCanvasScroll = function (canvas) {

    function isCanvas(e) {
        return e.target === canvas
    }

    document.body.addEventListener("touchstart", function (e) {

        if (isCanvas(e)) {
            e.preventDefault();
        }
    }, { passive: false });

    document.body.addEventListener("touchend", function (e) {
        if (isCanvas(e)) {
            e.preventDefault();
        }
    }, { passive: false });

    document.body.addEventListener("touchmove", function (e) {
        if (isCanvas(e)) {
            e.preventDefault();
        }
    }, { passive: false });

}

//----

function preprocess(inputCanvas, preprocessCanvas, zoomCanvas, actualCanvas, options) {

    //Reset all other canvas
    ImageHelper.clear(preprocessCanvas)
    ImageHelper.clear(zoomCanvas)
    ImageHelper.clear(actualCanvas)

    //convert canvas to matrix representation
    var matrix = ImageHelper.toMatrix(inputCanvas) 
    
    //find boundary rectangle, we will cut this area from input canvas
    var boundaryRect = ImageHelper.getBoundaryRectangle(matrix)

    //calculate scale factor
    var scaleFactor = options.scalesize / ((boundaryRect.width > boundaryRect.height) ? boundaryRect.width : boundaryRect.height)

    //we will scale cut area and paste into this rectangle
    var destinationRectangle = {
        topleft: {
            x: 0,
            y: 0
        },
        width: boundaryRect.width * scaleFactor,
        height: boundaryRect.height * scaleFactor
    }

    //paste with scaling
    ImageHelper.copy(inputCanvas, boundaryRect, preprocessCanvas, destinationRectangle, options.smooth)

    //center scaled image by given method
    if (options.centerby == "boundingbox") {
        var center = {x: destinationRectangle.width / 2, y: destinationRectangle.height / 2}
        ImageHelper.translate(preprocessCanvas, preprocessCanvas.width / 2 - center.x, preprocessCanvas.height / 2 - center.y)
    }
    else if (options.centerby == "mass") {
        var center = ImageHelper.calculateCenterOfMass(preprocessCanvas)
        ImageHelper.translate(preprocessCanvas, preprocessCanvas.width / 2 - center.x, preprocessCanvas.height / 2 - center.y)
    }

    //rescale processed image to network input size: 28x28, with given downsizing method
    if (options.downsizing == "canvas") {
            
        var srcRect = {
            topleft: { x: 0, y: 0 },
            width: preprocessCanvas.width,
            height: preprocessCanvas.height
        }

        var dstRect = {
            topleft: { x: 0, y: 0 },
            width: actualCanvas.width,
            height: actualCanvas.height
        }

        ImageHelper.copy(preprocessCanvas, srcRect, actualCanvas, dstRect, options.smooth)
    }
    else { //binning 
        var ppMatrix = ImageHelper.toMatrix(preprocessCanvas)
        var pixelatedMatrix = ImageHelper.pixelatedown(ppMatrix, 10)
        ImageHelper.updateCanvasFromMatrix(actualCanvas, pixelatedMatrix)
    }

    //get actual network input
    var actualAsMatrix = ImageHelper.toMatrix(actualCanvas)
    var networkInput = Matrix.to1D(actualAsMatrix)

    //show 10x zoomed network input in 2-D
    var zoomedMatrix = ImageHelper.pixelateup(actualAsMatrix, 10)
    ImageHelper.updateCanvasFromMatrix(zoomCanvas, zoomedMatrix)

    return networkInput
}

function recognize(networkInput, regularNeuralNetwork, convolutionalNeuralNetwork) {

    var rnn_output = regularNeuralNetwork.predict(networkInput)
    var cnn_output = convolutionalNeuralNetwork.predict([Matrix.from1D(networkInput, 28, 28)])

    showPrediction(rnn_output.prediction, cnn_output.prediction);
}

function showPrediction(dnn, cnn) {
    $("#dnn").text(dnn)
    $("#cnn").text(cnn)
}

//----

$(document).ready(function () {

    var deepNeuralNetwork = new NeuralNetwork()
    var convolutionalNeuralNetwork = new NeuralNetwork()

    var inputCanvas = document.getElementById("input")
    var preprocessCanvas = document.getElementById("preprocess")
    var zoomCanvas = document.getElementById("zoom")
    var actualCanvas = document.getElementById("actual")

    BindMouseEvents(inputCanvas)
    BindTouchEvents(inputCanvas)
    PreventCanvasScroll(inputCanvas)

    $("#clear").click(function () {
        ImageHelper.clear(inputCanvas)
        ImageHelper.clear(preprocessCanvas)
        ImageHelper.clear(zoomCanvas)
        ImageHelper.clear(actualCanvas)
        $("#dnn").text("")
        $("#cnn").text("")
    })

    var progress = multiFileProgress().onUpdate(function(){
        var complete_percentage =  100*progress.get()
        console.log("progress %" + complete_percentage.toFixed(3))
        $("#progress").width(complete_percentage+"%")
    })

    var getDNN = getJSONwithProgress("/js/digitrecognition/dnnmodel.json", {infer_decompressed_size: true}).progress(function (url, loaded, total) { progress.update(url,loaded,total) })
    var getCNN = getJSONwithProgress("/js/digitrecognition/cnn-small.json", {infer_decompressed_size: true}).progress(function (url, loaded, total) { progress.update(url,loaded,total) })

    $.when(getDNN, getCNN).then(function (dnn, cnn) {

        $("#loading").remove()

        deepNeuralNetwork.load(dnn)
        convolutionalNeuralNetwork.load(cnn)

        $("#recognize").click(function () {
            var options = {}
            options.centerby = $("#centerby").val()
            options.scalesize = parseInt($("#scalesize").val())
            options.downsizing = $("#downsizing").val()
            options.smooth = $("#smooth").val() == "true"
            var networkInput = preprocess(inputCanvas, preprocessCanvas, zoomCanvas, actualCanvas, options)
            recognize(networkInput, deepNeuralNetwork, convolutionalNeuralNetwork)
        })

    })



})