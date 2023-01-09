import { back_end } from "../clients/is-rest-client";

export function getIsRestClient(token: string) {
  return new back_end.Client("https://localhost:5111", {
    fetch(url, init) {
      return fetch(url, {
        ...init,
        headers: {
          ...init?.headers,
          Authorization: `Bearer ${token}`,
        },
      });
    },
  });
}
