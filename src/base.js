export var erieSampleBaseUrl;
if (window) window.erieSampleBaseUrl = 'audio_sample/';
else erieSampleBaseUrl = 'audio_sample/';

export function setSampleBaseUrl(url) {
  if (window) window.erieSampleBaseUrl = url;
  erieSampleBaseUrl = url;
}