var dictionary = {
    'E':12.02,
    'T':9.10,
    'A':8.12,
    'O':7.68,
    'I':7.31,
    'N':6.95,
    'S':6.28,
    'R':6.02,
    'H':5.92,
    'D':4.32,
    'L':3.98,
    'U':2.88,
    'C':2.71,
    'M':2.61,
    'F':2.30,
    'Y':2.11,
    'W':2.09,
    'G':2.03,
    'P':1.82,
    'B':1.49,
    'V':1.11,
    'K':0.69,
    'X':0.17,
    'Q':0.11,
    'J':0.10,
    'Z':0.07
}
var choices = [];
var numGuesses = 0;
autofill();
chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
    choices = message;
});
function autofill(){
    var next = choices[0];
    var score = 0;
    for (var i = 0; i < choices.length; i++){
        var mycount = 0;
        for (var j = 0; j < 5; j++){
            mycount += dictionary[choices[i].substring(j,j+1).toUpperCase()];
        }
        if (mycount > score){
            next = choices[i];
            score = mycount;
        }
    }
    if (numGuesses == 0){
        next = "crane";
    }
    else{
        
    }
    console.log(choices);
    console.log(next);
    document.querySelectorAll("[data-key='" + next.substring(0,1) + "']")[0].click();
    document.querySelectorAll("[data-key='" + next.substring(1,2) + "']")[0].click();
    document.querySelectorAll("[data-key='" + next.substring(2,3) + "']")[0].click();
    document.querySelectorAll("[data-key='" + next.substring(3,4) + "']")[0].click();
    document.querySelectorAll("[data-key='" + next.substring(4,5) + "']")[0].click();
    document.querySelectorAll("[data-key='↵']")[0].click();
    numGuesses++;
    setTimeout(guess, 4000);
}
function guess(){
    if (numGuesses == 6 || choices.length == 1){
        return;
    }
    for (var i = 0; i < 5; i++){
        var row = document.getElementsByClassName("Row-module_row__pwpBq")[(numGuesses-1)];
        var iter = row.childNodes[i].firstChild;
        if (iter.getAttribute("data-state") == "absent"){
            for (var j = 0; j < choices.length; j++){
                if (choices[j].indexOf(iter.innerText.toLowerCase()) != -1){
                    choices.splice(j,1);
                    j--;
                }
            }
        }
        else if (iter.getAttribute("data-state") == "present"){
            for (var j = 0; j < choices.length; j++){
                if (choices[j].indexOf(iter.innerText.toLowerCase()) == -1 || choices[j].substring(i,i+1) == iter.innerText.toLowerCase()){
                    choices.splice(j,1);
                    j--;
                }
            }
        }
        else if (iter.getAttribute("data-state") == "correct"){
            for (var j = 0; j < choices.length; j++){
                if (choices[j].substring(i,i+1) != iter.innerText.toLowerCase()){
                    choices.splice(j,1);
                    j--;
                }
            }
        }
    }
    autofill();
}