document.getElementById("go").onclick = function () {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        var activeTabId = tabs[0].id;
        chrome.scripting.executeScript({
            target: { tabId: activeTabId },
            files: ["scripts/inject.js"],
        });
    });
};
