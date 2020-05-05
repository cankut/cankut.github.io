var Activations = (function () {

    function relu(x) {
        var l = x.length;
        var result = new Array(l);
        for (var i = 0; i < l; i++) {
            result[i] = Math.max(0, x[i]);
        }
        return result;
    }

    function sigmoid(x) {
        var l = x.length;
        var result = new Array(l);
        for (var i = 0; i < l; i++) {
            result[i] = 1 / (1 + Math.pow(Math.E, -x[i]));
        }
        return result;
    };

    function softmax(x) {

        var max = Math.max(...x);
        for (let i = 0; i < x.length; i++) {
            x[i] = x[i] - max;
        }

        var l = x.length;
        var result = new Array(l);
        var sum = 0;
        for (var i = 0; i < l; i++) {
            result[i] = Math.pow(Math.E, x[i]);
            sum += result[i];
        }
        for (var i = 0; i < l; i++) {
            result[i] = result[i] / sum;
        }
        return result;
    }

    return {
        relu: relu,
        sigmoid: sigmoid,
        softmax: softmax
    };
}());
