/** YouTube's privacy-enhanced host: same player, but it sets no tracking
 *  cookies until someone actually interacts with the video. */
const YT_EMBED = "https://www.youtube-nocookie.com/embed/";

/** Rewrite a youtube.com embed URL onto the privacy-enhanced host. */
export function ytNoCookie(url: string) {
  return url.replace(/^https:\/\/(www\.)?youtube\.com\/embed\//, YT_EMBED);
}

/** Muted, autoplaying, looping, chromeless YouTube embed URL. */
export function ytEmbed(id: string, start?: number) {
  const q = new URLSearchParams({
    autoplay: "1",
    mute: "1",
    controls: "0",
    loop: "1",
    playlist: id,
    playsinline: "1",
    modestbranding: "1",
    rel: "0",
  });
  if (start) q.set("start", String(start));
  return `${YT_EMBED}${id}?${q.toString()}`;
}
