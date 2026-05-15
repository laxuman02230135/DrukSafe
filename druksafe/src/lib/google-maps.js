const GOOGLE_MAPS_EMBED_BASE_URL = "https://maps.google.com/maps";

export function buildGoogleMapsEmbedUrl({
  query = "Bhutan",
  zoom = 7,
} = {}) {
  const params = new URLSearchParams({
    q: query,
    z: String(zoom),
    output: "embed",
  });

  return `${GOOGLE_MAPS_EMBED_BASE_URL}?${params.toString()}`;
}
