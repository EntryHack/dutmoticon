chrome.runtime.onInstalled.addListener(async (details) => {
  if (details.reason == "install") {
    const ids = (await chrome.storage.sync.get(["emoticons"])).emoticons ?? [];
    if (ids.length === 0) {
      await chrome.storage.sync.set({ emoticons: ["6049a7d7cea5c400506e9bee", "63a15d244a098f0076fbcf6f"] });
      chrome.tabs.create({ url: "https://dutmoticon.tica.fun" });
    }
  }
});

chrome.tabs.onUpdated.addListener((tabId, info) => {
  if (
    !info.url?.startsWith("http://localhost:3000/emoticon/") &&
    !info.url?.startsWith("https://dutmoticon.tica.fun/emoticon/")
  )
    return;
  chrome.tabs.sendMessage(tabId, "STORE_DETAILS");
});
