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
    const xToken = JSON.parse(document.getElementById("__NEXT_DATA__").textContent).props.initialState.common.user
      .xToken;
    return xToken;
  } catch (_) {
    return false;
  }
})();

// 글/댓글 수정 요청 (Promise)
window.repairing = undefined;
// HTTP 요청 응답 전 지연 여부
window.delayLoading = false;

// fetch 패치
window.fetch = async (input, config) => {
  try {
    if (!config) config = {};
    if (!config.headers) config.headers = { "if-none-match": null };
    if (config.headers["if-none-match"]) config.headers["if-none-match"] = null;
    // 요청의 body가 올바른 JSON 형식이면 Object로 변환
    const body = isJSON(config.body) ? JSON.parse(config.body) : undefined;

    // body의 variables 저장
    let variables = undefined;
    // discuss/comment
    let type = undefined;

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
        config = { headers: { "if-none-match": null } };
      } else if (
        // 글/댓글에 Dutmoticon 커스텀 스티커가 첨부된 경우
        (body.query.trim().startsWith("mutation CREATE_ENTRYSTORY") ||
          body.query.trim().startsWith("mutation CREATE_COMMENT")) &&
        body.variables &&
        body.variables.sticker &&
        body.variables.sticker.startsWith("dutmoticon_")
      ) {
        // 엔트리 API의 스티커 ID 체크를 피하기 위해 따로 저장
        variables = {
          content: body.variables.content,
          sticker: body.variables.sticker,
          stickerItem: body.variables.stickerItem,
        };
        // content가 empty string인 경우를 위해 공백 문자로 대체
        body.variables.content = "\u200b";
        // 엔트리 API의 스티커 ID 체크를 피하기 위해 커스텀 스티커 제거
        delete body.variables.sticker;
        delete body.variables.stickerItem;

        if (body.query.trim().startsWith("mutation CREATE_ENTRYSTORY")) type = "discuss";
        else if (body.query.trim().startsWith("mutation CREATE_COMMENT")) type = "comment";

        config.body = JSON.stringify(body);
      } else if (
        // 스티커 수정사항이 적용되는 동안 지연
        window.delayLoading &&
        (body.query.trim().startsWith("query SELECT_ENTRYSTORY") ||
          body.query.trim().startsWith("query SELECT_COMMENT"))
      ) {
        window.delayLoading = false;
        // 수정 요청 끝날 때까지 대기
        await window.repairing;
        // 1초 지연
        await new Promise((res) => setTimeout(() => res(undefined), 1000));
      }
    }

    // console.log(input, config);

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

    if (variables && type) {
      const csrfToken = document.querySelector("meta[name=csrf-token]").content;
      const data = await response.clone().json();

      window.repairing = originalFetch("/graphql", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "csrf-token": csrfToken,
          "x-token": xToken,
        },
        body: JSON.stringify({
          query:
            type === "discuss"
              ? `mutation REPAIR_ENTRYSTORY(
            $id: ID
            $content: String
            $image: String
            $sticker: ID
            $stickerItem: ID
          ) {
            repairEntryStory(
              id: $id
              content: $content
              image: $image
              sticker: $sticker
              stickerItem: $stickerItem
            ) {
              id
              title
              content
              seContent
              created
              commentsLength
              likesLength
              visit
              category
              prefix
              groupNotice
              user {
                id
                nickname
                username
                profileImage {
                  id
                  name
                  label {
                    ko
                    en
                    ja
                    vn
                  }
                  filename
                  imageType
                  dimension {
                    width
                    height
                  }
                  trimmed {
                    filename
                    width
                    height
                  }
                }
                status {
                  following
                  follower
                }
                description
                role
              }
              images {
                filename
                imageUrl
              }
              sticker {
                id
                name
                label {
                  ko
                  en
                  ja
                  vn
                }
                filename
                imageType
                dimension {
                  width
                  height
                }
                trimmed {
                  filename
                  width
                  height
                }
              }
              progress
              thumbnail
              reply
              bestComment {
                id
                user {
                  id
                  nickname
                  username
                  profileImage {
                    id
                    name
                    label {
                      ko
                      en
                      ja
                      vn
                    }
                    filename
                    imageType
                    dimension {
                      width
                      height
                    }
                    trimmed {
                      filename
                      width
                      height
                    }
                  }
                  status {
                    following
                    follower
                  }
                  description
                  role
                }
                content
                created
                removed
                blamed
                commentsLength
                likesLength
                isLike
                hide
                image {
                  id
                  name
                  label {
                    ko
                    en
                    ja
                    vn
                  }
                  filename
                  imageType
                  dimension {
                    width
                    height
                  }
                  trimmed {
                    filename
                    width
                    height
                  }
                }
                sticker {
                  id
                  name
                  label {
                    ko
                    en
                    ja
                    vn
                  }
                  filename
                  imageType
                  dimension {
                    width
                    height
                  }
                  trimmed {
                    filename
                    width
                    height
                  }
                }
              }
              blamed
            }
          }`
              : type === "comment"
              ? `mutation REPAIR_COMMENT(
                $id: ID
                $content: String
                $image: String
                $sticker: ID
                $stickerItem: ID
              ) {
                repairComment(
                  id: $id
                  content: $content
                  image: $image
                  sticker: $sticker
                  stickerItem: $stickerItem
                ) {
                  id
                  user {
                    id
                    nickname
                    username
                    profileImage {
                      id
                      name
                      label {
                        ko
                        en
                        ja
                        vn
                      }
                      filename
                      imageType
                      dimension {
                        width
                        height
                      }
                      trimmed {
                        filename
                        width
                        height
                      }
                    }
                    status {
                      following
                      follower
                    }
                    description
                    role
                  }
                  content
                  created
                  removed
                  blamed
                  commentsLength
                  likesLength
                  isLike
                  hide
                  image {
                    id
                    name
                    label {
                      ko
                      en
                      ja
                      vn
                    }
                    filename
                    imageType
                    dimension {
                      width
                      height
                    }
                    trimmed {
                      filename
                      width
                      height
                    }
                  }
                  sticker {
                    id
                    name
                    label {
                      ko
                      en
                      ja
                      vn
                    }
                    filename
                    imageType
                    dimension {
                      width
                      height
                    }
                    trimmed {
                      filename
                      width
                      height
                    }
                  }
                }
              }`
              : "",
          variables: {
            id:
              type === "discuss"
                ? data.data.createEntryStory.discuss.id
                : type === "comment"
                ? data.data.createComment.comment.id
                : undefined,
            content:
              type === "discuss"
                ? data.data.createEntryStory.discuss.content
                : type === "comment"
                ? data.data.createComment.comment.content
                : undefined,
            ...variables,
          },
        }),
      });

      window.delayLoading = true;
      variables = undefined;
      type = undefined;
    }

    response.json = json;
    return response;
  } catch (err) {
    console.error(err);
    throw err;
  }
};
