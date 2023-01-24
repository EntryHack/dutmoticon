new Promise((res) => {
  const interval = setInterval(() => {
    const usernameEl = Array.from(document.getElementsByTagName("em")).find(
      (el) => el.textContent.trim() === "(dutmoticon)"
    );
    if (!usernameEl) return;
    clearInterval(interval);
    res(usernameEl);
  }, 10);
}).then(async (usernameEl) => {
  /** @type HTMLElement */
  const nicknameEl = usernameEl.parentElement;
  nicknameEl.textContent = "Dutmoticon";

  const descriptionEl = nicknameEl.nextElementSibling.nextElementSibling;
  descriptionEl.textContent = descriptionEl.textContent.replace("https://dutmoticon.tica.fun", "").trim();

  const followBtn = descriptionEl.nextElementSibling.firstChild;
  followBtn.style.transform = "scale(1.3)";
  followBtn.style.top = "20px";

  descriptionEl.nextElementSibling.nextElementSibling.remove();

  const profileEl = nicknameEl.parentElement.parentElement;
  const profileWrapperEl = profileEl.parentElement;
  const tabEl = profileWrapperEl.nextElementSibling;
  const projectEl = tabEl.nextElementSibling;

  tabEl.remove();
  projectEl.remove();

  const containerEl = document.createElement("div");
  containerEl.style.width = "100%";
  containerEl.style.marginTop = "3rem";
  containerEl.style.display = "flex";
  containerEl.style.flexDirection = "column";
  containerEl.style.backgroundColor = "#f2f2f2";
  containerEl.style.padding = "3rem 0";
  containerEl.style.boxSizing = "border-box";
  containerEl.style.boxShadow = "rgb(0 0 0 / 6%) 0px 1px 0px 0px";

  const emoticonList = document.createElement("div");
  emoticonList.classList.add("emoticon-list");
  emoticonList.classList.add(profileEl.classList[0]);
  emoticonList.style.display = "flex";
  emoticonList.style.flexDirection = "column";
  emoticonList.style.rowGap = "0.7rem";

  const render = async () => {
    emoticonList.innerHTML = "";
    if ((await items).length === 0)
      return (emoticonList.innerHTML =
        '<span style="font-size: 1.1rem; font-weight: 600; padding: 0.7rem 0; text-align: center;">설치된 이모티콘이 없어요.</span>');
    (await items).forEach((emoticon) => {
      const item = document.createElement("a");
      const icon = document.createElement("img");
      const title = document.createElement("div");

      item.href = `https://dutmoticon.tica.fun/emoticon/${emoticon.id}`;
      item.target = "_blank";

      item.style.display = "flex";
      item.style.height = "5rem";
      item.style.alignItems = "center";
      item.style.boxShadow = "rgb(0 0 0 / 6%) 0px 1px 0px 0px";
      item.style.color = "black";
      item.style.backgroundColor = "white";
      item.style.transform = "translateY(0)";
      item.style.transition = "transform 0.1s ease-out 0s";
      item.style.borderRadius = "1rem";
      item.style.padding = "0.7rem";
      item.style.boxSizing = "border-box";

      item.addEventListener("mouseover", () => (item.style.transform = "translateY(-4px)"));
      item.addEventListener("mouseout", () => (item.style.transform = "translateY(0)"));

      icon.style.height = "100%";
      icon.style.marginRight = "0.5rem";

      title.style.fontWeight = 600;
      title.style.fontSize = "1.4rem";

      icon.src = `https://playentry.org/uploads/${emoticon.image.filename.slice(0, 2)}/${emoticon.image.filename.slice(
        2,
        4
      )}/${emoticon.image.filename}.${emoticon.image.imageType}`;
      title.textContent = emoticon.title;

      item.appendChild(icon);
      item.appendChild(title);

      emoticonList.appendChild(item);
    });
  };

  await render();

  const storeButton = document.createElement("a");
  storeButton.href = "https://dutmoticon.tica.fun";
  storeButton.target = "_blank";
  storeButton.textContent = "Dutmoticon 스토어";
  storeButton.style.backgroundColor = "#126fff";
  storeButton.style.color = "white";
  storeButton.style.fontSize = "1.125rem";
  storeButton.style.lineHeight = "1rem";
  storeButton.style.display = "inline-block";
  storeButton.style.height = "max-content";
  storeButton.style.width = "max-content";
  storeButton.style.margin = "2rem auto 0 auto";
  storeButton.style.padding = "0.75rem 1.5rem";
  storeButton.style.fontWeight = "600";
  storeButton.style.textDecoration = "none";
  storeButton.style.borderRadius = "0.5rem";
  storeButton.style.boxShadow =
    "0 0 #0000, 0 0 #0000, 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)";

  containerEl.appendChild(emoticonList);
  containerEl.appendChild(storeButton);
  profileWrapperEl.parentElement.appendChild(containerEl);
});
