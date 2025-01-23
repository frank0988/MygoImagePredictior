chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "showImage") {
        let imgContainer = document.getElementById("image-container");
        imgContainer.innerHTML = `<img src="${message.imageUrl}" style="width: 100px;">`;
    }
});
