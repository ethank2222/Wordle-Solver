var dictionary = {
    E: 12.02,
    T: 9.1,
    A: 8.12,
    O: 7.68,
    I: 7.31,
    N: 6.95,
    S: 6.28,
    R: 6.02,
    H: 5.92,
    D: 4.32,
    L: 3.98,
    U: 2.88,
    C: 2.71,
    M: 2.61,
    F: 2.3,
    Y: 2.11,
    W: 2.09,
    G: 2.03,
    P: 1.82,
    B: 1.49,
    V: 1.11,
    K: 0.69,
    X: 0.17,
    Q: 0.11,
    J: 0.1,
    Z: 0.07,
};

var container = document.createElement("div");
container.style.width = "300px";
container.style.height = "200px";
container.style.scrollY = "scroll";
container.style.position = "fixed";
container.style.backgroundColor = "#d2d2d2";
document.body.appendChild(container);
for (var i = 0; i < 5; i++) {
    var paragraph = document.createElement("p");
    paragraph.style.margin = "20px";
    paragraph.className = "more-info";
    paragraph.innerText = i + 1 + ") ";
    container.appendChild(paragraph);
}

async function loadJSON(fileName) {
    return fetch(chrome.runtime.getURL(fileName)).then((resp) => resp.json());
}

// Get list of possible answers from data/wordle.json
loadJSON("data/wordle.json").then((choices) => {
    var numGuesses = 0;
    var letters = [];

    function autofill() {
        var next = choices[0];
        var score = 0;
        for (var i = 0; i < choices.length; i++) {
            var mycount = 0;
            for (var j = 0; j < 5; j++) {
                mycount += dictionary[choices[i].substring(j, j + 1).toUpperCase()];
                for (k = j; k < 5; k++) {
                    if (choices[i].substring(j, j + 1).toLowerCase() == choices[i].substring(k, k + 1).toLowerCase()) {
                        mycount -= 5;
                    }
                }
            }
            if (mycount > score) {
                next = choices[i];
                score = mycount;
            }
        }
        if (numGuesses == 0) {
            next = "salet";
        }
        document.querySelectorAll("[data-key='" + next.substring(0, 1) + "']")[0].click();
        document.querySelectorAll("[data-key='" + next.substring(1, 2) + "']")[0].click();
        document.querySelectorAll("[data-key='" + next.substring(2, 3) + "']")[0].click();
        document.querySelectorAll("[data-key='" + next.substring(3, 4) + "']")[0].click();
        document.querySelectorAll("[data-key='" + next.substring(4, 5) + "']")[0].click();
        document.querySelectorAll("[data-key='↵']")[0].click();
        numGuesses++;
        if (numGuesses < 6) setTimeout(guess, 4000);
    }

    function guess() {
        if (choices.length == 1) return;
        for (var i = 0; i < 5; i++) {
            var row = document.getElementsByClassName("Row-module_row__pwpBq")[numGuesses - 1];
            var iter = row.childNodes[i].firstChild;
            if (iter.getAttribute("data-state") == "absent") {
                var count = 0;
                for (var k = 0; k < 5; k++) {
                    if (iter.innerText.toLowerCase() == row.childNodes[k].firstChild.innerText.toLowerCase()) {
                        count++;
                    }
                }
                for (var k = 0; k < letters.length; k++) {
                    if (letters[k] == iter.innerText.toLowerCase()) {
                        count--;
                    }
                }
                for (var j = 0; j < choices.length; j++) {
                    var count2 = 0;
                    for (var k = 0; k < 5; k++) {
                        if (iter.innerText.toLowerCase() == choices[j].substring(k, k + 1)) {
                            count2++;
                        }
                    }
                    if (count2 >= count || choices[j].substring(i, i + 1) == iter.innerText.toLowerCase()) {
                        choices.splice(j, 1);
                        j--;
                    }
                }
                letters.push(iter.innerText.toLowerCase());
            } else if (iter.getAttribute("data-state") == "present") {
                for (var j = 0; j < choices.length; j++) {
                    if (
                        choices[j].indexOf(iter.innerText.toLowerCase()) == -1 ||
                        choices[j].substring(i, i + 1) == iter.innerText.toLowerCase()
                    ) {
                        choices.splice(j, 1);
                        j--;
                    }
                }
            } else if (iter.getAttribute("data-state") == "correct") {
                for (var j = 0; j < choices.length; j++) {
                    if (choices[j].substring(i, i + 1) != iter.innerText.toLowerCase()) {
                        choices.splice(j, 1);
                        j--;
                    }
                }
            }
        }
        document.getElementsByClassName("more-info")[numGuesses - 1].innerText =
            numGuesses + ") " + choices.length + " possibilities left, ";

        autofill();
    }

    autofill();
});

/*
1. Add word to array if not in word
2. If letter is not in word and is in array, count --
*/
