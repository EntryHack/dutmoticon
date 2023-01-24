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
let isEntryStory = false;

const profileScript = document.createElement("script");
const entrystoryScript = document.createElement("script");

profileScript.id = "dutmoticon-profile-script";
profileScript.src = chrome.runtime.getURL("profile.js");
entrystoryScript.id = "dutmoticon-entrystory-script";
entrystoryScript.src = chrome.runtime.getURL("entrystory.js");

const setDutmoticonProfile = () => document.head.appendChild(profileScript.cloneNode());
const unsetDutmoticonProfile = () => document.getElementById("dutmoticon-profile-script")?.remove();

const setEntrystory = () => document.head.appendChild(entrystoryScript.cloneNode());
const unsetEntrystory = () => document.getElementById("dutmoticon-entrystory-script")?.remove();

chrome.runtime.onMessage.addListener((req) => {
  if (req === "DUTMOTICON_PROFILE") {
    if (isDutmoticonProfile) return;
    isDutmoticonProfile = true;
    setDutmoticonProfile();
  } else if (req === "ENTRYSTORY" || req === "OTHER_PAGE") {
    if (!isDutmoticonProfile) return;
    isDutmoticonProfile = false;
    unsetDutmoticonProfile();
  }
});
chrome.runtime.onMessage.addListener((req) => {
  if (req === "ENTRYSTORY") {
    if (isEntryStory) return;
    isEntryStory = true;
    setEntrystory();
  } else if (req === "DUTMOTICON_PROFILE" || req === "OTHER_PAGE") {
    if (!isEntryStory) return;
    isEntryStory = false;
    unsetEntrystory();
  }
});

if (window.location.href.startsWith("https://playentry.org/profile/63c8b22fa5b63f00370433bf")) {
  isDutmoticonProfile = true;
  setDutmoticonProfile();
} else if (window.location.href.startsWith("https://playentry.org/community/entrystory/")) {
  isEntryStory = true;
  setEntrystory();
}
