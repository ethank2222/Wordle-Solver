let frequency = {
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

// Calculates the score of a word using the frequency map above
function calculateScore(word) {
    let score;
    for (let j = 0; j < 5; j++) {
        score += frequency[word[j].toUpperCase()];
        for (let k = j; k < 5; k++) {
            if (word[j].toUpperCase() == word[k].toUpperCase()) {
                score -= 5;
            }
        }
    }
    return score;
}

let container = document.createElement("div");
container.style.width = "300px";
container.style.height = "200px";
container.style.scrollY = "scroll";
container.style.position = "fixed";
container.style.backgroundColor = "#d2d2d2";
document.body.appendChild(container);
for (let i = 0; i < 5; i++) {
    let paragraph = document.createElement("p");
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
    let numGuesses = 0;
    let letters = [];

    function autofill() {
        let next = choices[0];
        if (numGuesses == 0) {
            // First guess is always "salet"
            next = "salet";
        } else {
            // Get word with the best score
            let score = 0;
            for (let choice of choices) {
                let mycount = calculateScore(choice);
                if (mycount > score) {
                    next = choice;
                    score = mycount;
                }
            }
        }

        // Enter the word
        for (let i = 0; i < 5; i++) {
            document.querySelectorAll("[data-key='" + next[i] + "']")[0].click();
        }
        document.querySelectorAll("[data-key='↵']")[0].click();

        numGuesses++;
        if (numGuesses < 6) setTimeout(guess, 4000);
    }

    // Reduce number of possible answers given the result of the previous guess
    function guess() {
        if (choices.length == 1) return;
        for (let i = 0; i < 5; i++) {
            let row = document.getElementsByClassName("Row-module_row__pwpBq")[numGuesses - 1];
            let currentLetter = row.childNodes[i].firstChild;
            if (currentLetter.getAttribute("data-state") == "absent") {
                // This letter is NOT in the answer
                let absentLetter = currentLetter.innerText.toLowerCase();

                // Count how many times this letter is not included
                let count = 0;
                for (let j = 0; j < 5; j++) {
                    const otherLetter = row.childNodes[j].firstChild.innerText.toLowerCase();
                    if (otherLetter === absentLetter) {
                        count++;
                    }
                }
                for (let letter of letters) {
                    if (letter === absentLetter) {
                        count--;
                    }
                }

                // Filter out choices that contain the absent letter
                // !NOTE: If a guess contained the same letter twice, but the answer only has the letter once.
                // !If the letter is present, the second instance is absent
                // !If the letter is correct, all other instances are absent (even the first one)
                choices = choices.filter((choice) => {
                    let choice_count = 0;
                    for (let letter of choice) {
                        if (letter === absentLetter) {
                            choice_count++;
                        }
                    }
                    return choice_count < count && choice[i] !== absentLetter;
                });
                letters.push(currentLetter.innerText.toLowerCase());
            } else if (currentLetter.getAttribute("data-state") == "present") {
                // This letter is in the answer, but in another spot
                const presentLetter = currentLetter.innerText.toLowerCase();

                // Filter out choices that contain the present letter in the wrong spot
                choices = choices.filter((choice) => choice.includes(presentLetter) && choice[i] !== presentLetter);
            } else if (currentLetter.getAttribute("data-state") == "correct") {
                // This letter is in the answer, and is in the right spot
                const correctLetter = currentLetter.innerText.toLowerCase();

                // Filter out choice that don't contain this letter in the same spot
                choices = choices.filter((choice) => choice[i] === correctLetter);
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
