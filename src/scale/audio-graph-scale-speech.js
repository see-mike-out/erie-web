import { format } from "d3";

export function makeSpeechChannelScale(channel, encoding, values, info) {
  // consider details
  // format?
  let scale, scaleProperties = {
    channel
  }
  if (encoding.format) {
    let formatFun = format(encoding.format);
    if (formatFun) {
      scale = (d) => formatFun(d);
    } else {
      scale = (d) => d;
    }
  } else {
    scale = (d) => d;
  }
  scale.properties = scaleProperties;
  return scale;
}