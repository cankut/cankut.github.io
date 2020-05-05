var NeuralNetwork = function () {

    var _layers = []
    //private - layer calculations

    function Dense(inputs, layer) {

        var weights = layer.weights
        var biases = layer.biases
        var fn = Activations[layer.activation]

        let outputs = new Array(weights[0].length).fill(0);

        for (let i = 0; i < outputs.length; i++) {
            for (let j = 0; j < inputs.length; j++) {
                outputs[i] += inputs[j] * weights[j][i]
            }
            outputs[i] += biases[i]
        }

        if (fn) {
            outputs = fn(outputs)
        }

        return outputs
    }

    function Conv2D(inputs, layer) {

        var kernels = layer.kernels
        var biases = layer.biases
        var fn = Activations[layer.activation]

        if (biases.length != kernels[0].length) {
            throw "size mismatch"
        }

        var outputs = []

        for (let f = 0; f < kernels[0].length; f++) {
            var sum = null
            for (let i = 0; i < inputs.length; i++) {
                var cnv = Matrix.convolve(inputs[i], kernels[i][f])
                sum = Matrix.sum(sum, cnv);
            }
            var s = Matrix.sizeOf(sum);
            sum = Matrix.sum(sum, Matrix.create(s.h, s.w, biases[f]))

            if (fn) {
                for (let o = 0; o < sum.length; o++) {
                    sum[o] = fn(sum[o])
                }
            }

            outputs.push(sum)
        }

        return outputs;
    }

    function MaxPool2D(inputs, layer) {

        var poolSize = {
            w: layer.w,
            h: layer.h
        }

        var outputs = []
        for (let i = 0; i < inputs.length; i++) {
            const input = inputs[i]
            outputs.push(_MaxPool2D(input, poolSize))
        }
        return outputs
    }

    function _MaxPool2D(matrix, poolSize) {

        let sm = Matrix.sizeOf(matrix)

        let o_i_max = o_j_max = sm.w - poolSize.w + 1

        let res = Matrix.create(sm.h / poolSize.h, sm.w / poolSize.w, null)

        for (let o_i = 0; o_i < o_i_max; o_i += poolSize.h) {
            for (let o_j = 0; o_j < o_j_max; o_j += poolSize.w) {
                let max = matrix[o_i][o_j]
                for (let i = 0; i < poolSize.h; i++) {
                    for (let j = 0; j < poolSize.w; j++) {
                        var val = matrix[o_i + i][o_j + j]
                        if (val > max) { max = val }
                    }
                }

                res[o_i / poolSize.w][o_j / poolSize.w] = max

            }
        }

        return res


    }

    function Flatten(inputs) {
        var f = []
        for (let j = 0; j < inputs[0].length; j++) {
            for (let k = 0; k < inputs[0].length; k++) {
                for (let l = 0; l < inputs.length; l++) {
                    f.push(inputs[l][j][k])
                }
            }
        }
        return f
    }

    function _Flatten(matrix) {
        let s = Matrix.sizeOf(matrix);
        var f = []
        for (let i = 0; i < s.h; i++) {
            for (let j = 0; j < s.w; j++) {
                f.push(matrix[i][j])
            }
        }

        return f;
    }

    var _funcs = {
        "Conv2D": Conv2D,
        "MaxPool2D": MaxPool2D,
        "Flatten": Flatten,
        "Dense": Dense
    }

    //public

    var load = function (layers) {
        _layers = layers
    }

    //expects 1xNxN input
    var predict = function (input) {
        var originalInput = input
        var output
        for (let i = 0; i < _layers.length; i++) {
            var layer = _layers[i];
            output = _funcs[layer.type](input, layer)
            input = output
        }

        var prediction = output.indexOf(Math.max(...output));
        return {
            output: output,
            prediction: prediction
        };
    }

    return {
        load: load,
        predict: predict
    }
}

