
/*Parse File*/
document.getElementById('inputfile').addEventListener('change', function() {
    document.getElementById('output').textContent = "";
    document.getElementById("errors").innerText = "Checking for Errors...";
    document.getElementById("errors").style.color = "#000";
    document.getElementById("errors").style.margin = "0px 0px 20px";
    document.getElementById("errors").style.textAlign = "center";
    document.getElementById("errors").style.fontSize = "18px";
    var fr=new FileReader();
    fr.onload=function(){
        validate(document.getElementById('output').textContent=fr.result);
    }
    fr.readAsText(this.files[0])

});

/*Validation Function*/
var arr = [];
function validate(allText){
    var errors = [];
    while (allText.indexOf(",") != -1){
        var newElem = allText.substring(0, allText.indexOf(","));
        if ( newElem != "crane"){
            arr.push(newElem);
        }
        allText = allText.substring(allText.indexOf(",")+1);
    }
    arr.push(allText);
    console.log(arr);
    if (document.getElementById("inputfile").value.indexOf("csv") == -1){
        errors.push("File is not a CSV");
    }

    /*Display Validation Message*/
    if (document.getElementById("errors-title") != null){
        document.getElementById("errors-title").remove();
    }
    if (errors.length==0){
        document.getElementById("errors").innerText = "No Errors Found (" + arr.length + "     values)";
        document.getElementById("errors").style.color = "#32a846";
        document.getElementById("go").removeAttribute("disabled");
    }
    else{
        document.getElementById("go").setAttribute("disabled", true);
        var errorMessageDiv = document.getElementById("errors")
        errorMessageDiv.innerHTML = `
        <center><h2 id="errors-title"></h2></center>
        <ol id="errors-list"></ol>
        `;
        document.getElementById("errors-title").innerText = errors.length + " File Error(s) Found";
        document.getElementById("errors-title").style.color = "red";
        document.getElementById("errors-title").style.fontSize = "18px";
        for (var i = 0; i < errors.length; i++){
            var errorMessage = document.createElement("li");
            errorMessage.innerText = errors[i];
            errorMessage.style.color = "red";
            document.getElementById("errors-list").appendChild(errorMessage);
        }
    }
}
document.getElementById("go").onclick = function(){
    if (document.getElementById("errors").innerText.indexOf("No Errors" != -1)){
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            var activeTab = tabs[0];
            var activeTabId = activeTab.id;
            chrome.scripting.executeScript(
                {
                  target: {tabId: activeTabId},
                  files: ['inject.js']
                },
                () => {
                    chrome.runtime.lastError;
                    chrome.tabs.sendMessage(activeTabId, arr);
                });
        });
    }
}