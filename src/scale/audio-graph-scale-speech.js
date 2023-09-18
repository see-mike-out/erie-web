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
      scale = (d) => nullToNull(d);
    }
  } else {
    scale = (d) => nullToNull(d);
  }
  scale.properties = scaleProperties;
  return scale;
}

function nullToNull(d) {
  if (d === null || d === undefined) return 'null';
  else return d;
}