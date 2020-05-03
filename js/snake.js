Array.prototype.insert = function (index, item) {
    this.splice(index, 0, item);
};

Array.prototype.indexOfObj = function (object) {
    return this.findIndex(x => x.is_equal(object))
};

Array.prototype.is_equal = function (object) {
    return JSON.stringify(this) == JSON.stringify(object)
}

Predictor = function (chromosome) {

    var w = chromosome.slice(0, 18)
    var b = chromosome.slice(18)

    var predict = function (inputs) {

        var output = []
        for (var i = 0; i < 3; i++) {

            var sum = 0
            for (var j = 0; j < 6; j++) {
                sum += inputs[j] * w[3 * j + i]
            }

            sum += b[i]

            output.push(sum)
        }

        return output.indexOf(Math.max(...output));
    }

    return {
        predict: predict
    }

}

StaticPredictor = function () {

    //moves: ['N', 'L', 'R']
    var move_index = 0

    return {

        set: function (move) {
            move_index = move
        },
        predict: function () {
            return move_index
        }
    }
}

SnakeGame = function (board_size, predictor) {

    var randint = function (low, high) {
        return Math.floor(Math.random() * (high - low + 1)) + low
    }

    var get_coordinates = function () {
        c = []
        for (let i = 0; i < board_size; i++) {
            for (let j = 0; j < board_size; j++) {
                c.push([i, j])
            }
        }
        return c
    }

    var coordinates = get_coordinates()

    var unit_directions = [
        [0, -1], //N
        [1, 0], //E
        [0, 1], //S
        [-1, 0]  //W
    ]

    var game_state = {
        finished: false,
        body: [],
        head_direction: null, // 0:N, 1:E, 2:S, 3:W 
        apple: null,
        cnt_noapple: 0,
        get_head: function () {
            return this.body[this.body.length - 1]
        },
        set_random_apple: function () {
            var free_coordinates = []
            for (let i = 0; i < coordinates.length; i++) {
                var c = coordinates[i];
                if (this.body.indexOfObj(c) === -1) {
                    free_coordinates.push(c)
                }
            }
            this.apple = free_coordinates[randint(0, free_coordinates.length - 1)]
        },
        init_head: function () {
            var x = randint(0, board_size - 1)
            var y = randint(0, board_size - 1)
            this.body.push([x, y])
            this.head_direction = randint(0, 3) // 0:N, 1:E, 2:S, 3:W 
        },
        scan_direction: function (direction, position) {
            var proximities = [1, 1 / 2, 1 / 3, 1 / 4, 1 / 5, 1 / 6, 1 / 7, 1 / 8, 1 / 9, 1 / 10]
            var unit = unit_directions[direction]
            var a = 0
            var o = 0
            for (var i = 1; i <= board_size; i++) {
                var new_head = [unit[0] * i + position[0], unit[1] * i + position[1]]
                if (this.is_inside(new_head) === false || this.is_body(new_head)) {
                    a = 0
                    o = proximities[i - 1]
                    break;
                }
                else if (new_head.is_equal(this.apple)) {
                    a = proximities[i - 1]
                    o = 0
                    break;
                }
            }

            return [a, o]
        },
        get_sensory: function () {
            var f_dir = this.head_direction
            var l_dir = (this.head_direction - 1 + 4) % 4
            var r_dir = (this.head_direction + 1 + 4) % 4

            var head = this.get_head()

            var f = this.scan_direction(f_dir, head)
            var l = this.scan_direction(l_dir, head)
            var r = this.scan_direction(r_dir, head)

            return [f[0], f[1], l[0], l[1], r[0], r[1]]
        },
        get_score: function () {
            return this.body.length
        },
        turn_head: function (move) {
            if (move == 'L') {
                this.head_direction = (this.head_direction - 1 + 4) % 4
            }
            else if (move == 'R') {
                this.head_direction = (this.head_direction + 1 + 4) % 4
            }
            return unit_directions[this.head_direction]
        },
        is_inside: function (position) {
            var x = position[0]
            var y = position[1]
            if (x < 0 || y < 0 || x >= board_size || y >= board_size) {
                return false
            }
            return true
        },
        is_body: function (position) {
            return this.body.indexOfObj(position) > -1
        },
        is_finished: function () {
            return this.finished
        },
        move: function (m) {

            if (this.is_finished()) { return true }

            var unit_dir = this.turn_head(m)
            var head = this.get_head()
            new_head = [unit_dir[0] + head[0], unit_dir[1] + head[1]]

            if (this.is_inside(new_head) === false) {
                this.finished = true
                return true
            }

            if (new_head.is_equal(this.apple)) {
                this.cnt_noapple = 0
                this.body.push(new_head)
                if (this.body.length === board_size * board_size) { return true }
                this.set_random_apple()
                return false
            }

            if (this.is_body(new_head) == false) {
                this.body.push(new_head)
                this.body.shift()
                this.cnt_noapple++
                if (this.cnt_noapple >= 100) { return true }
                return false
            }

            this.finished = true
            return true
        }
    }

    game_state.init_head()
    game_state.set_random_apple()

    var play_next = function () {
        var moves = ['N', 'L', 'R']
        var sensory_inputs = game_state.get_sensory()
        var move_index = predictor.predict(sensory_inputs)
        return game_state.move(moves[move_index])
    }

    var get_state = function () {
        return {
            body: game_state.body.slice(),
            head_direction: game_state.head_direction,
            apple: game_state.apple.slice()
        }
    }

    var get_sensory = function () {
        return game_state.get_sensory()
    }
    var is_finished = function () {
        return game_state.is_finished()
    }


    return {
        play_next: play_next,
        get_state: get_state,
        get_sensory: get_sensory,
        is_finished: is_finished

    }

}

Paint = function (game, canvas) {

    var clear = function () {
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    var draw_snake_eyes = function () {

        var head = state.body[state.body.length - 1]
        x = head[0]
        y = head[1]

        ctx.fillStyle = 'yellow';

        var x0 = x * (BLOCK_SIZE + 1) + 1
        var y0 = y * (BLOCK_SIZE + 1) + 1

        var x1, y1, x2, y2, x3, y3

        if (state.head_direction == 0) { //// 0:N, 1:E, 2:S, 3:W 
            x1 = x0 + BLOCK_SIZE / 2
            y1 = y0
            x2 = x1 - 5
            y2 = y1 + 5 * Math.sqrt(3)
            x3 = x1 + 5
            y3 = y1 + 5 * Math.sqrt(3)
        }
        else if (state.head_direction == 1) { //// 0:N, 1:E, 2:S, 3:W 
            x1 = x0 + BLOCK_SIZE
            y1 = y0 + BLOCK_SIZE / 2
            x2 = x1 - 5 * Math.sqrt(3)
            y2 = y1 - 5
            x3 = x1 - 5 * Math.sqrt(3)
            y3 = y1 + 5
        }
        else if (state.head_direction == 2) { //// 0:N, 1:E, 2:S, 3:W 
            x1 = x0 + BLOCK_SIZE / 2
            y1 = y0 + BLOCK_SIZE
            x2 = x1 - 5
            y2 = y1 - 5 * Math.sqrt(3)
            x3 = x1 + 5
            y3 = y1 - 5 * Math.sqrt(3)
        }
        else if (state.head_direction == 3) { //// 0:N, 1:E, 2:S, 3:W 
            x1 = x0
            y1 = y0 + BLOCK_SIZE / 2
            x2 = x1 + 5 * Math.sqrt(3)
            y2 = y1 - 5
            x3 = x1 + 5 * Math.sqrt(3)
            y3 = y1 + 5
        }


        ctx.beginPath();
        ctx.moveTo(x1, y1)
        ctx.lineTo(x2, y2)
        ctx.lineTo(x3, y3)
        ctx.stroke()
        ctx.fill()

    }

    var draw_grid = function () {
        ctx.lineWidth = 1
        ctx.fillStyle = 'black';
        for (var i = 0; i <= 10; i++) {
            ctx.beginPath();
            ctx.moveTo(i * (BLOCK_SIZE + 1) + .5, 0);
            ctx.lineTo(i * (BLOCK_SIZE + 1) + .5, (BLOCK_SIZE + 1) * 10 + 1);
            ctx.stroke();

            ctx.beginPath();
            ctx.moveTo(0, i * (BLOCK_SIZE + 1) + .5);
            ctx.lineTo((BLOCK_SIZE + 1) * 10 + 1, i * (BLOCK_SIZE + 1) + .5);
            ctx.stroke();
        }
    }

    var draw_apple = function () {
        var ax = state.apple[0]
        var ay = state.apple[1]
        ctx.fillStyle = 'red'
        ctx.fillRect(ax * (BLOCK_SIZE + 1) + 1, ay * (BLOCK_SIZE + 1) + 1, BLOCK_SIZE, BLOCK_SIZE)
    }

    var draw_body = function () {
        ctx.fillStyle = 'green';
        for (var i = 0; i < state.body.length; i++) {
            var p = state.body[i]
            var x = p[0]
            var y = p[1]
            ctx.fillRect(x * (BLOCK_SIZE + 1) + 1, y * (BLOCK_SIZE + 1) + 1, BLOCK_SIZE, BLOCK_SIZE);
        }

        if (state.body.length > 1) {
            ctx.fillStyle = 'blue';

            var tail = state.body[0]
            var x = tail[0]
            var y = tail[1]
            ctx.fillRect(x * (BLOCK_SIZE + 1) + 1, y * (BLOCK_SIZE + 1) + 1, BLOCK_SIZE, BLOCK_SIZE);
        }
    }

    const ctx = canvas.getContext('2d');
    const BLOCK_SIZE = 40

    if (game == null) {
        clear()
        draw_grid()
        return
    }

    var state = game.get_state()


    clear()
    draw_grid()
    draw_apple()
    draw_body()
    draw_snake_eyes()
}

var TOP_SNAKES = [
    [1.8177137679915099, 1.6101855475823443, -1.4133727776019058, 0.658451074007002, 3.6293651467872383, 0.4303281022620421, -3.3271799521018863, 1.7338468459857035, 3.36068616066031, -0.2571439280677257, -1.9135009325328731, 1.3313929291533397, -3.497086368984524, -3.574302676860957, 1.6050553954985123, 3.407809660448427, 3.313939584629263, -0.2936008861883934, 0.555692478166787, -0.9489965848528661, 0.7131642391659216],
    [2.138504947283697, 1.8726905172077404, 0.07750234947297274, 0.9805739402243306, 2.9799360194015474, 1.1046663657602123, -4.37148003454068, 0.9615614663918454, 3.5507254762301272, -0.23152403546730138, -0.6323372416969137, 1.3038687186602416, -3.64170117973249, -2.544260700087145, 0.842792565598241, 2.144713485540379, 2.1899579405855856, -2.363029644945811, 1.0279740889369782, -0.24549065634704303, 1.0790280041035576],
    [2.135171781969735, 2.106869758627697, -0.6771460960374195, 0.7146276606024958, 3.7098603575886075, 1.391486133274412, -2.5546998885212586, 1.4531622664839348, 3.2689225401390836, -1.1450410280156085, -1.6336983418887057, 1.206319705017016, -1.5110193282115603, -2.5257747225360294, 0.8718840825761263, 1.218446200012211, 1.7662562150499204, -1.6648466627057734, 1.8037752998450176, -0.24941247749827988, 0.9693932284405958],
    [1.9083163991174978, 2.448279740636698, -0.9788554619150687, 1.3714486732055478, 3.10505005473822, 1.3732264925282869, -3.152522223163267, 1.012918881650808, 3.0751282368868056, -0.5444755665944065, -0.8143850005525223, 1.1323595650096132, -2.0351279236853603, -3.2554442288869705, 0.554903870465218, 1.9001893989518777, 2.7011736360977823, -1.477957852199904, 0.9600914285299005, -0.7046058329295546, 0.11862523798184443],
    [1.3744155687577093, 2.0462299917683344, -0.9488359858995054, 1.2086226562587656, 3.3179176724032438, 1.659561722970201, -2.696543441724737, 1.848929059639381, 2.300122311856168, -0.2816244638907146, -1.2262762153217812, 0.8997238532031478, -2.410374097205437, -2.908680868990328, 0.5153309619966752, 2.2559327571658803, 2.3596986896006085, -2.0130575403721016, 0.5725919179701903, -0.9756914447671714, 0.4732316833938106],
    [2.242687247373847, 2.245666180058865, -0.3180195102297332, 0.6798118654878282, 3.43849247619616, 1.5497932782448531, -3.9349913431752848, 0.9410860891986912, 3.155029337554166, 0.24371447566127624, -0.6816327644963979, 1.2136888499157235, -3.2770358962505655, -2.727376854690121, 0.9063720102448348, 2.3745619387760515, 2.3994805252164113, -2.3249314464621396, 1.3015282307141036, -0.4564438146801455, 0.8833535898667821],
    [1.7233482043748265, 1.9642487892518647, -1.091215806884296, 0.6238288775305421, 3.6573369578718937, 0.9834848791084538, -3.3168508507575014, 1.1409412658490066, 3.5337356642329074, -0.09910302363233969, -1.7180296360232648, 0.9160281559924877, -2.9181962336533394, -3.3796527965642484, 1.2665632481628586, 2.517735191001346, 2.7237512152078276, -1.2446321984927358, 0.6741409148726484, -1.1636644030556433, 0.5688085073910538],
    [1.5743463499254782, 1.4808253828962032, -0.8332968949178907, 1.1184090741445059, 3.917749184863224, 0.5680590488573013, -2.8819026238355216, 1.3601709865588645, 3.2452398173277475, -0.2767101077061307, -2.1743498221361865, 0.7168081828670286, -2.6320863386420017, -3.182790475553876, 1.1800113942907813, 2.7067274464515867, 2.6332523109017676, -0.8335702645413615, 0.4726257785078499, -0.8455387512909577, 0.6055371129459093],
    [2.0596674722294526, 1.5865978427081333, -1.162957343767992, 1.0243163804578246, 3.6717478259715857, 1.162554449850893, -3.6368729689327974, 1.2100261100049543, 3.4287815542449236, -0.24859270907836473, -1.4878654574474335, 1.140795285563518, -3.0066464241097117, -3.5342984583671972, 1.4608851875901943, 2.9878537534066885, 3.1541396579588175, -0.9697975367859705, 0.7819707556208456, -1.0906378832115315, 0.8905010596912544],
    [1.5547372562396917, 2.28228469543857, -0.769907679123465, 1.118473218580962, 3.5289841836325624, 1.8688314961662718, -2.9059427065611487, 1.4233369819733048, 2.7698070651712365, -0.45997415010295506, -1.1335286670820284, 0.7243044181069194, -2.2243048654913644, -2.916372871991361, 0.8964148348538206, 2.2397624914381598, 2.4358753346814352, -1.5946737145012477, 0.7559029558719724, -0.9095805237569797, 0.1237168305528965]
]


init_ai_play = function () {
    var loop = null
    var game = null
    var canvas = document.getElementById('playboard');

    var show_score = function () {
        if (game) {
            var score = game.get_state().body.length
            $("#snakesize").text(score)
        }
    }

    var end_loop = function () {
        if (loop != null) {
            clearInterval(loop)
            loop = null
        }
    }

    var init_loop = function (timeout_ms) {

        loop = setInterval(function () {

            Paint(game, canvas)
            show_score()
            var isFinished = game.play_next()

            if (isFinished) {
                end_loop()
                Paint(game, canvas)
                show_score()
            }

        }, timeout_ms)
    }

    var update_loop = function (timeout_ms) {
        end_loop()
        if (game != null) {
            init_loop(timeout_ms)
        }
    }

    Paint(null, canvas) //draw grid

    $("#btnPlay").click(function () {

        end_loop()

        var snake_index = parseInt($("#snake").val())
        var chromosome = TOP_SNAKES[snake_index]
        var timeout_ms = parseInt($("#timeout").val())

        game = SnakeGame(10, Predictor(chromosome))
        init_loop(timeout_ms)
    })

    $("#timeout").change(function () {
        var timeout_ms = parseInt($(this).val())
        update_loop(timeout_ms)
    });
}

init_snake_vision_play = function () {
    var replay_canvas = document.getElementById('replay');

    var show_user_score = function () {
        var score = user_game.get_state().body.length
        $("#usersnakesize").text(score)
    }

    var update_vision = function () {
        var sensory_inputs = user_game.get_sensory()
        show_user_score()

        var fa = sensory_inputs[0]
        var fo = sensory_inputs[1]
        var la = sensory_inputs[2]
        var lo = sensory_inputs[3]
        var ra = sensory_inputs[4]
        var ro = sensory_inputs[5]

        $(".command[data-value='0']").text(Math.max(fa, fo).toFixed(2))
        $(".command[data-value='1']").text(Math.max(la, lo).toFixed(2))
        $(".command[data-value='2']").text(Math.max(ra, ro).toFixed(2))

        $(".command").removeClass("apple")

        if (fa > 0) {
            $(".command[data-value='0']").addClass("apple")
        }
        else if (la > 0) {
            $(".command[data-value='1']").addClass("apple")
        }
        else if (ra > 0) {
            $(".command[data-value='2']").addClass("apple")
        }
    }

    var set_game_over = function (state) {
        if (state) {
            $("#gameover").text(" - Game Over")
            $("#replay_container").show()
        }
        else {
            $("#replay_container").hide()
            $("#gameover").text("")
        }
    }

    var save_game_state = function () {
        var state = user_game.get_state()
        user_history.push(state)
    }

    var reset_replay_loop = function () {
        
        if (replay_loop != null) {
            clearInterval(replay_loop)
            replay_loop = null
        }
    }

    var replay = function (timeout_ms) {

        reset_replay_loop()

        var i = 0

        replay_loop = setInterval(function () {

            if (i >= user_history.length) {
                reset_replay_loop()
                return
            }

            var game_wrapper = function (index) {
                return {
                    get_state: function () {
                        return user_history[index]
                    }
                }
            }

            Paint(game_wrapper(i++), replay_canvas)

        }, timeout_ms)
    }

    var replay_loop = null
    var predictor = StaticPredictor()
    var user_game = null
    var user_history = null

    $("#btnReset").click(function () {
        set_game_over(false)
        reset_replay_loop()
        user_game = SnakeGame(10, predictor)
        user_history = []
        save_game_state()
        update_vision()
        
    })

    $(".command").click(function () {

        if (user_game.is_finished()) {
            replay(50); return;
        }

        var move = parseInt($(this).attr("data-value"))
        predictor.set(move)
        var isFinished = user_game.play_next()

        save_game_state()
        update_vision()

        if (isFinished) {
            set_game_over(true)
            replay(100)
        }


    })

    $("#btnReset").click()
}

$(document).ready(function () {

    //ai play
    init_ai_play();

    //user snake vision play
    init_snake_vision_play()

})