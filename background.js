
console.log("擴充功能後台已啟動");

// 監聽訊息
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log("收到訊息：", message);

    if (message.action === "fetchImages") {
        fetchImages(message.query, sender.tab.id);
    }
});

async function fetchImages(query, tabId) {
    console.log("開始搜尋圖片：", query);

    try {
        
        let images = [];

        
        let githubApiUrl = "https://api.github.com/repos/frank0988/mygoimage/contents/";
        let githubResponse = await fetch(githubApiUrl);
        let githubData = await githubResponse.json();

        // 過濾出圖片文件（只選擇 .jpg / .png / .jpeg）
        let githubImages = githubData
            .filter(file => file.type === "file" && file.name.match(/\.(jpg|png|jpeg)$/i))
            .map(file => ({ url: file.download_url, alt: file.name }));

        
        images = githubImages; 

        
        let response = await fetch("https://mygoapi.miyago9267.com/mygo/all_img");
        let data = await response.json();
        images = images.concat(data.urls || []);

        let keywordDictionary = {
            
        };

        // 6. 先檢查字典
        for (let keyword in keywordDictionary) {
            if (query.includes(keyword)) {
                console.log("使用字典匹配:", keywordDictionary[keyword]);
                chrome.tabs.sendMessage(tabId, {
                    action: "showImage",
                    imageUrl: keywordDictionary[keyword]
                });
                return;
            }
        }

        // 7. 使用相似度計算來找最佳匹配圖片
        /*
        function similarity(s1, s2) {
            let matches = 0;
            for (let char of s1) {
                if (s2.includes(char)) matches++;
            }
            return matches / Math.max(s1.length, s2.length);
        }*/
        function similarity(s1, s2) {
                let set1 = new Set(s1);
                let set2 = new Set(s2);
                
                let intersection = new Set([...set1].filter(char => set2.has(char)));
                let union = new Set([...set1, ...set2]);
                
                return intersection.size / union.size;
            }
            

        let bestMatch = images.reduce((best, img) => {
            let sim = similarity(query, img.alt);
            return sim > best.similarity ? { url: img.url, similarity: sim } : best;
        }, { url: images.length > 0 ? images[0].url : "", similarity: 0 });

        // 8. 發送推薦圖片
        if (bestMatch.url) {
            console.log("推薦圖片:", bestMatch.url);
            chrome.tabs.sendMessage(tabId, {
                action: "showImage",
                imageUrl: bestMatch.url
            });
        } else {
            console.log("沒有找到匹配的圖片");
        }

    } catch (error) {
        console.error("取得圖片失敗:", error);
    }
}

