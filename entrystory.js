new Promise((res) => {
  const interval = setInterval(() => {
    const profileList = Array.from(
      document.querySelectorAll(".nextInner ul li div:first-child a[class][href]:has(.blind)")
    );
    if (profileList.length <= 0) return;
    clearInterval(interval);
    res(profileList);
  }, 10);
}).then(async (profileList) => {
  const focus = () => {
    /** @type HTMLElement[] */
    const dutmoticonProfileList = profileList
      .filter((profile) => profile.href.includes("/profile/63c8b22fa5b63f00370433bf"))
      .map((profile) => profile.parentElement);

    dutmoticonProfileList.forEach((el) => {
      el.style.backgroundColor = "rgb(18 111 255 / 0.1)";
      el.style.borderRadius = "20px";
      el.style.outline = "2px solid rgb(18, 111, 255)";
    });
  };

  document
    .querySelector(".nextInner ul")
    .parentElement.parentElement.nextElementSibling.addEventListener("click", () => {
      const interval = setInterval(() => {
        const newProfileList = Array.from(
          document.querySelectorAll(".nextInner ul li div:first-child a[class][href]:has(.blind)")
        );
        if (newProfileList.length === profileList.length) return;
        clearInterval(interval);
        profileList = newProfileList;
        focus();
      }, 10);
    });

  focus();
});
