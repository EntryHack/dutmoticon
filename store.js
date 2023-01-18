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

  const { id, title } = button.dataset;
  const emoticons = (await chrome.storage.sync.get(["emoticons"])).emoticons ?? [];

  if (emoticons.includes(id)) {
    button.disabled = true;
    button.textContent = "Dutmoticon에 추가됨";
  } else button.disabled = false;

  button.addEventListener("click", async () => {
    if (emoticons.includes(id)) return alert("이미 추가된 이모티콘이에요.");
    if (!confirm(`"${title}" 이모티콘을 추가하시겠어요?`)) return;
    emoticons.push(id);
    await chrome.storage.sync.set({ emoticons });

    button.disabled = true;
    button.textContent = "Dutmoticon에 추가됨";

    alert(`"${title}" 이모티콘이 추가되었어요.`);
  });
};

chrome.runtime.onMessage.addListener((req) => {
  if (req === "STORE_DETAILS") onPageChanged();
});

onPageChanged();
