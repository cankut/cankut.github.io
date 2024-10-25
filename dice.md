---
layout: bootstrap
title: Dice Simulation in JS
description: Dice Simulator implementation with js/css/html
scripts: 
css:
  - /css/dice.css
---

<div class="container-xl d-flex flex-column" style="height: 100dvh;">
    <div class="row flex-grow-1 px-2 py-1">
        <div class="dicebox position-relative">
            <div class="diceval w-25 position-absolute top-50 start-50 translate-middle">
                <img class="diceimg" src="/images/dice/1-w.png" />
            </div>

  </div>
    </div>
    <div class="row px-2 py-1">
        <button type="button" id="btnRoll" class="btn btn-primary">ROLL</button>
    </div>
    <div id="stats" class="d-none">

  </div>

</div>

<script type="text/javascript">

    var stats = {
        "1": 0,
        "2": 0,
        "3": 0,
        "4": 0,
        "5": 0,
        "6": 0,
    }

    var updateStats = function () {
        document.getElementById("stats").innerHTML = JSON.stringify(stats, null, 2)
    }

    var diceImgEl = null
    var randomDice = function () {
        return Math.floor(6 * Math.random()) + 1
    }

    var animateDice = function () {

        var durations = [0, 10, 20, 40, 80, 120, 160, 220, 300, 380, 460, 560]

        for (var i = 0; i < durations.length; i++) {

            if (durations.length - 1 == i) {

                setTimeout(function () {
                    var rnd = randomDice()

                    stats["" + rnd] += 1


                    diceImgEl.src = `/images/dice/${rnd}-w.png`;

                    updateStats()

                }, durations[i])


            }
            else {
                setTimeout(function () {
                    var rnd = randomDice()
                    diceImgEl.src = `/images/dice/${rnd}-w.png`;
                }, durations[i])
            }

        }
    }

    const audio = new Audio('/sounds/dice.mp3');

    document.addEventListener('DOMContentLoaded', function () {

        diceImgEl = document.getElementsByClassName("diceimg")[0]
        var button = document.getElementById("btnRoll")

        audio.addEventListener("ended", function () {
            button.disabled = false
        });

        // Add a click event listener to the button
        button.addEventListener('click', function () {
            button.disabled = true
            audio.play()
            animateDice()
        });

        updateStats()

    });


</script>

