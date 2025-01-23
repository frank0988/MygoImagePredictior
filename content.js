console.log("Messenger 文字推薦圖片擴充功能已啟動");

let lastText = "";

// 監聽輸入框變化
setInterval(() => {
    let inputBox = document.querySelector('[contenteditable="true"]');
    if (inputBox) {
        let text = inputBox.innerText.trim();
        if (text && text !== lastText) {
            lastText = text;
            console.log("偵測到新輸入:", text);

            // 傳送輸入的文字給 background script 進行圖片推薦
            chrome.runtime.sendMessage({ action: "fetchImages", query: text });
        }
    }
}, 1000);

// 接收推薦的圖片並顯示
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "showImage") {
        let imageUrl = message.imageUrl;
        showImagePopup(imageUrl);
    }
});

function showImagePopup(imageUrl) {
    let existingPopup = document.querySelector("#mygo-image-popup");
    if (existingPopup) {
        existingPopup.remove();
    }

    let popup = document.createElement("div");
    popup.id = "mygo-image-popup";
    popup.style.position = "fixed";
    popup.style.bottom = "10px";
    popup.style.right = "10px";
    popup.style.background = "white";
    popup.style.padding = "10px";
    popup.style.borderRadius = "8px";
    popup.style.boxShadow = "0 0 10px rgba(0,0,0,0.2)";
    popup.innerHTML = `
        <img src="${imageUrl}" style="width: 150px; height: auto; border-radius: 5px;">
        <button id="close-popup" style="margin-top: 5px;">關閉</button>
    `;
    
    document.body.appendChild(popup);
    
    document.getElementById("close-popup").addEventListener("click", () => {
        popup.remove();
    });
}
