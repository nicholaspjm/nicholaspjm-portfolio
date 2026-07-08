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
  return `https://www.youtube.com/embed/${id}?${q.toString()}`;
}
