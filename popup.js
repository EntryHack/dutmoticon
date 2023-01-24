import manifest from "./manifest.json" assert { type: "json" };

// 배포 시엔 false로 변경
const isDev = false;
const emoticonsHost = isDev ? "http://localhost:3000" : "https://dutmoticon.tica.fun";

document.addEventListener("DOMContentLoaded", async () => {
  document.querySelector(".footer .info .version").textContent = manifest.version;

  const emoticons = await (await fetch(`${emoticonsHost}/api/emoticons?all=true`)).json();
  const ids = (await chrome.storage.sync.get(["emoticons"])).emoticons ?? [];
  const emoticonList = document.querySelector(".emoticon-list");

  const render = () => {
    emoticonList.innerHTML = "";
    if (ids.length === 0)
      return (emoticonList.innerHTML = '<span class="no-emoticon">설치된 이모티콘이 없어요.</span>');
    ids.forEach((id) => {
      const emoticon = emoticons.find((emoticon) => emoticon.id === id);
      const item = document.createElement("li");
      const icon = document.createElement("img");
      const title = document.createElement("div");
      const remove = document.createElement("button");

      item.className = "item";
      icon.className = "icon";
      title.className = "title";
      remove.className = "remove";

      icon.src = `https://playentry.org/uploads/${emoticon.image.filename.slice(0, 2)}/${emoticon.image.filename.slice(
        2,
        4
      )}/${emoticon.image.filename}.${emoticon.image.imageType}`;
      title.textContent = emoticon.title;
      remove.textContent = "제거";

      remove.onclick = async () => {
        if (confirm(`"${emoticon.title}" 이모티콘을 삭제하시겠어요?`)) {
          const index = ids.indexOf(id);
          if (index === -1) return alert("존재하지 않는 이모티콘이에요.");

          ids.splice(index, 1);
          chrome.storage.sync.set({ emoticons: ids });
          render();
        }
      };

      item.appendChild(icon);
      item.appendChild(title);
      item.appendChild(remove);

      emoticonList.appendChild(item);
    });
  };

  render();
});
