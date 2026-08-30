export function buildManifest(origin: string) {
  return {
    name: "Grill",
    short_name: "Grill",
    description: "Notes, AI, and focus.",
    start_url: "/app/notes",
    display: "standalone",
    background_color: "#fafafa",
    theme_color: "#171717",
    icons: [
      { src: `${origin}/icons/icon-192.png`, sizes: "192x192", type: "image/png" },
      { src: `${origin}/icons/icon-512.png`, sizes: "512x512", type: "image/png" },
    ],
  };
}
