chrome.tabs.onUpdated.addListener((tabId, info) => {
  if (
    !info.url?.startsWith("http://localhost:5173/emoticon/") &&
    !info.url?.startsWith("http://localhost:4173/emoticon/") &&
    !info.url?.startsWith("https://dutmoticon.tica.fun/emoticon/")
  )
    return;
  chrome.tabs.sendMessage(tabId, "STORE_DETAILS");
});
