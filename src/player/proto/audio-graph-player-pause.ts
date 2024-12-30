import { ConfigInterface } from "../../types";

export function playPause(ms: number, config?: ConfigInterface) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  })
}
