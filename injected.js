const { fetch: originalFetch } = window;

const items = JSON.parse(decodeURIComponent(escape(atob(document.querySelector("emoticon-data").textContent))));

const isJSON = (text) => {
  try {
    if (!text) return false;
    JSON.parse(text);
    return true;
  } catch (_) {
    return false;
  }
};

window.xToken = (() => {
  try {
    const xToken = JSON.parse(document.getElementById("__NEXT_DATA__").textContent).props.initialState.common.user
      .xToken;
    return xToken;
  } catch (_) {
    return false;
  }
})();

window.repairing = undefined;
window.delayLoading = false;

window.fetch = async (...args) => {
  try {
    let [resource, config] = args;
    if (!config) config = {};
    const isBodyJSON = isJSON(config.body);
    const body = isBodyJSON ? JSON.parse(config.body) : undefined;

    let dutmoticon = undefined;
    let type = undefined;

    if (isBodyJSON) {
      if (window.response && resource === "https://playentry.org/graphql" && config.method === "POST") {
        if (body.query.trim().startsWith("query SELECT_STICKERS")) {
          const response = window.response.clone();
          response.json = () => ({
            data: { stickers: { list: items.map((item) => ({ id: item.id, image: item.image, title: item.title })) } },
          });
          return response;
        } else if (body.query.trim().startsWith("query SELECT_STICKER") && body.variables && body.variables.id) {
          const response = window.response.clone();
          response.json = () => ({ data: { sticker: items.find((item) => item.id === body.variables.id) } });
          return response;
        }
      }

      if (
        (body.query.trim().startsWith("mutation CREATE_ENTRYSTORY") ||
          body.query.trim().startsWith("mutation CREATE_COMMENT")) &&
        body.variables &&
        body.variables.sticker &&
        body.variables.sticker.startsWith("dutmoticon_")
      ) {
        dutmoticon = {
          content: body.variables.content,
          sticker: body.variables.sticker,
          stickerItem: body.variables.stickerItem,
        };
        body.variables.content = "\u200b";
        delete body.variables.sticker;
        delete body.variables.stickerItem;

        if (body.query.trim().startsWith("mutation CREATE_ENTRYSTORY")) type = "discuss";
        else if (body.query.trim().startsWith("mutation CREATE_COMMENT")) type = "comment";

        config.body = JSON.stringify(body);
      } else if (
        window.delayLoading &&
        (body.query.trim().startsWith("query SELECT_ENTRYSTORY") ||
          body.query.trim().startsWith("query SELECT_COMMENT"))
      ) {
        window.delayLoading = false;
        await window.repairing;
        await new Promise((res) => setTimeout(() => res(undefined), 1000));
      }
    }

    const response = await originalFetch(resource, config);

    if (resource.startsWith("/_next/data/")) {
      const data = await response.clone().json();

      window.xToken = data.initialState.common.user?.xToken ?? false;
    }

    if (resource === "https://playentry.org/graphql" && config.method === "POST" && response.ok)
      window.response = response;

    const json = () =>
      response
        .clone()
        .json()
        .then(async (data) => {
          if (isBodyJSON) {
            if (resource === "https://playentry.org/graphql" && config.method === "POST") {
              if (body.query.trim().startsWith("query SELECT_STICKERS")) {
                return {
                  data: {
                    stickers: { list: items.map((item) => ({ id: item.id, image: item.image, title: item.title })) },
                  },
                };
              } else if (body.query.trim().startsWith("query SELECT_STICKER") && body.variables && body.variables.id) {
                return { data: { sticker: items.find((item) => item.id === body.variables.id) } };
              }
            }
          }
          return data;
        });

    if (dutmoticon && type) {
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
            ...dutmoticon,
          },
        }),
      });

      window.delayLoading = true;
      dutmoticon = undefined;
      type = undefined;
    }

    response.json = json;
    return response;
  } catch (err) {
    throw err;
  }
};
