// fetch를 패치하기 전 원본 fetch 저장
const { fetch: originalFetch } = window;

// 배포 시엔 false로 변경
const isDev = false;
const emoticonsHost = isDev ? "http://localhost:3000" : "https://dutmoticon.tica.fun";

const addedItems = JSON.parse(decodeURIComponent(escape(atob(document.querySelector("emoticon-data").textContent))));
const itemsResponse = fetch(`${emoticonsHost}/api/emoticons?id=${addedItems.join()}`);
/** @type {Promise<{ id: string; title: string; authors: { id: string; name: string}[]; image: { id: string; filename: string; imageType: string }; date: number; default?: boolean; official?: boolean; recommended?: boolean }>} */
const items = itemsResponse.then((res) => res.clone().json());

// 문자열이 올바른 JSON 형식인지 확인
const isJSON = (text) => {
  try {
    // 문자열이 Falsy한 값이면 거짓
    if (!text) return false;
    JSON.parse(text);
    // JSON.parse에서 오류가 발생하지 않으면 참
    return true;
  } catch (_) {
    // JSON.parse에서 오류가 발생하면 거짓
    return false;
  }
};

// 엔트리 API 요청 시 사용되는 xToken
window.xToken = (() => {
  try {
    const xToken = __NEXT_DATA__.props.initialState.common.user.xToken;
    return xToken;
  } catch (_) {
    return false;
  }
})();

// fetch 패치
window.fetch = async (input, config) => {
  try {
    if (!config) config = {};
    // 요청의 body가 올바른 JSON 형식이면 Object로 변환
    const body = isJSON(config.body) ? JSON.parse(config.body) : undefined;

    if (body) {
      // 스티커 목록을 요청한 경우
      if (body.query.trim().startsWith("query SELECT_STICKERS")) {
        const response = (await itemsResponse).clone();
        response.json = async () => ({
          data: {
            stickers: {
              list: (await items).map((item) => ({ id: item.id, image: item.image, title: item.title })),
            },
          },
        });
        return response;
      } else if (
        body.query.trim().startsWith("query SELECT_STICKER") &&
        body.variables &&
        body.variables.id &&
        body.variables.id.startsWith("dutmoticon_")
      ) {
        input = `${emoticonsHost}/api/emoticon/${body.variables.id}`;
        config = {};
      } else if (
        // 글/댓글에 Dutmoticon 커스텀 스티커가 첨부된 경우
        (body.query.trim().startsWith("mutation CREATE_ENTRYSTORY") ||
          body.query.trim().startsWith("mutation CREATE_COMMENT")) &&
        body.variables &&
        body.variables.sticker &&
        body.variables.sticker.startsWith("dutmoticon_")
      ) {
        // 엔트리 API의 스티커 ID 체크를 피하기 위해 커스텀 스티커 세트 아이디 제거
        delete body.variables.sticker;

        config.body = JSON.stringify(body);
      }
    }

    // 요청 전송
    const response = await originalFetch(input, config);

    // 로그인 후 새로고침 전(#__NEXT_DATA__ 없을 때) xToken 저장
    if (input.startsWith("/_next/data/")) {
      const data = await response.clone().json();
      window.xToken = data.initialState.common.user?.xToken ?? false;
    }

    const json = () =>
      response
        .clone()
        .json()
        .then(async (data) => {
          if (body && input.startsWith(`${emoticonsHost}/api/emoticon/`))
            return { data: { sticker: { stickers: data } } };
          return data;
        });

    response.json = json;
    return response;
  } catch (err) {
    console.error(err);
    throw err;
  }
};
