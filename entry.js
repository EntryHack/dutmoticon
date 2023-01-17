const injectScript = document.createElement("script");
injectScript.src = chrome.runtime.getURL("injected.js");

document.body.appendChild(injectScript);

chrome.storage.local.get(["emoticons"]).then(({ emoticons }) => {
  const emoticonData = document.createElement("emoticon-data");
  emoticonData.textContent = btoa(unescape(encodeURIComponent(JSON.stringify(emoticons))));

  document.body.appendChild(emoticonData);
});
