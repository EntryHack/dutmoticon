const injectScript = document.createElement("script");
injectScript.src = chrome.runtime.getURL("injected.js");

document.body.appendChild(injectScript);

chrome.storage.sync.get(["emoticons"]).then(({ emoticons }) => {
  const emoticonData = document.createElement("emoticon-data");
  emoticonData.textContent = btoa(unescape(encodeURIComponent(JSON.stringify(emoticons))));
  emoticonData.style.display = "none";

  document.body.appendChild(emoticonData);
});
