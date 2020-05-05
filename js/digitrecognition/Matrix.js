var Matrix = (function () {

    function evaluate(v) {
       return (typeof (v) == "function") ? v() : v
    }
    
    function to1D(m){
        let s = sizeOf(m);
        var f = []
        for (let i = 0; i < s.h; i++) {
            for (let j = 0; j < s.w; j++) {
                f.push(m[i][j])
            }
        }

        return f;
    }

    function from1D(arr, h, w){
        var result = create(h,w)
        for (let i = 0; i < h; i++) {
            for (let j = 0; j < w; j++) {
                result[i][j] = arr[i*w+j]
            } 
        }
        return result
    }

    function convolve(matrix, kernel) {
        let sm = sizeOf(matrix)
        let sk = sizeOf(kernel)

        let o_i_max = o_j_max = sm.w - sk.w + 1

        let res = create(o_i_max, o_i_max, null)

        for (let o_i = 0; o_i < o_i_max; o_i++) {
            for (let o_j = 0; o_j < o_j_max; o_j++) {
                let sum = 0
                for (let i = 0; i < sk.h; i++) {
                    for (let j = 0; j < sk.w; j++) {
                        sum += kernel[i][j] * matrix[o_i+i][o_j+j]
                    }
                }

                for (let i = 0; i < sk.h; i++) {
                    for (let j = 0; j < sk.w; j++) {
                        res[o_i][o_j] = sum
                    }
                }
            }
        }

        return res

    }

    function fill(matrix, v) {
        const h = matrix.length;
        const w = matrix[0].length;
        for (let i = 0; i < h; i++) {
            for (let j = 0; j < w; j++) {
                matrix[i][j] = evaluate(v);
            }
        }
    }

    function sizeOf(matrix) {
        return {
            h: matrix.length,
            w: matrix[0].length
        }
    }

    function create(h, w, v) {
        const m = [];
        for (let i = 0; i < h; i++) {
            let r = new Array(w)
            m.push(r)
            for (let j = 0; j < w; j++) {

                m[i][j] = evaluate(v)
            }
        }
        return m
    }

    function print(m) {
        let s = sizeOf(m);
        console.log(`size=(${s.h},${s.w})`)
        let rowStrings = [];
        for (let i = 0; i < s.h; i++) {
            rowStrings.push("[" + m[i].join("\t, ") + "]")
        }

        let string = rowStrings.join("\n")
        console.log(string)
    }

    function sum(a, b) {
        if (a == null) { return b }
        if (b == null) { return a }

        let sa = sizeOf(a)
        let sb = sizeOf(a)

        if (sa.w != sb.w || sa.h != sb.h) {
            throw "size do not match"
        }

        var m = create(sa.h, sa.w)

        for (let i = 0; i < sa.h; i++) {
            for (let j = 0; j < sa.w; j++) {
                m[i][j] = a[i][j] + b[i][j];
            }
        }

        return m;

    }

    return {
        print: print,
        sum: sum,
        create: create,
        sizeOf: sizeOf,
        convolve: convolve,
        from1D: from1D,
        to1D: to1D
    }
})()