const injectScript = document.createElement("script");
injectScript.src = chrome.runtime.getURL("injected.js");

document.body.appendChild(injectScript);

chrome.storage.sync.get(["emoticons"]).then(({ emoticons }) => {
  const emoticonData = document.createElement("emoticon-data");
  emoticonData.textContent = btoa(unescape(encodeURIComponent(JSON.stringify(emoticons))));
  emoticonData.style.display = "none";

  document.body.appendChild(emoticonData);
});

let isDutmoticonProfile = false;

const profileScript = document.createElement("script");

profileScript.id = "dutmoticon-profile-script";
profileScript.src = chrome.runtime.getURL("profile.js");

const setDutmoticonProfile = () => document.head.appendChild(profileScript.cloneNode());
const unsetDutmoticonProfile = () => document.getElementById("dutmoticon-profile-script")?.remove();

chrome.runtime.onMessage.addListener((req) => {
  if (req === "DUTMOTICON_PROFILE") {
    if (isDutmoticonProfile) return;
    isDutmoticonProfile = true;
    setDutmoticonProfile();
  } else if (req === "NOT_DUTMOTICON_PROFILE") {
    if (!isDutmoticonProfile) return;
    isDutmoticonProfile = false;
    unsetDutmoticonProfile();
  }
});

if (window.location.href.startsWith("https://playentry.org/profile/63c8b22fa5b63f00370433bf")) {
  isDutmoticonProfile = true;
  setDutmoticonProfile();
}
