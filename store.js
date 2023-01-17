const onPageChanged = async () => {
  const button = await new Promise((res) => {
    const interval = setInterval(() => {
      const button = document.getElementById("add-emoticon");
      if (button) {
        clearInterval(interval);
        res(button);
      }
    }, 10);
  });

  const emoticon = JSON.parse(decodeURIComponent(escape(atob(button.dataset.emoticon))));
  const emoticons = (await chrome.storage.local.get(["emoticons"])).emoticons ?? [];

  if (emoticons.find((e) => e.id === emoticon.id)) {
    button.disabled = true;
    button.textContent = "Dutmoticon에 추가됨";
  } else button.disabled = false;

  button.addEventListener("click", async () => {
    if (emoticons.find((e) => e.id === emoticon.id)) return alert("이미 추가된 이모티콘이에요.");
    if (!confirm(`"${emoticon.title}" 이모티콘을 추가하시겠어요?`)) return;
    emoticons.push(emoticon);
    await chrome.storage.local.set({ emoticons });

    button.disabled = true;
    button.textContent = "Dutmoticon에 추가됨";

    alert(`"${emoticon.title}" 이모티콘이 추가되었어요.`);
  });
};

chrome.runtime.onMessage.addListener((req) => {
  if (req === "STORE_DETAILS") onPageChanged();
});

onPageChanged();
