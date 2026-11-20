const CACHE = "alea-tiles-v1";
const BASE = "https://wmts.geo.admin.ch/1.0.0/ch.swisstopo.pixelkarte-farbe/default/current/3857";

// zoom -> nombre de tuiles de chaque côté du point (≈ 1,5 km autour du point au zoom 16)
const RINGS: Array<[number, number]> = [
  [13, 1],
  [14, 2],
  [15, 3],
  [16, 4],
  [17, 5],
];

function tileUrls(lat: number, lng: number): string[] {
  const urls: string[] = [];
  const latRad = (lat * Math.PI) / 180;
  for (const [zoom, ring] of RINGS) {
    const n = 2 ** zoom;
    const cx = Math.floor(((lng + 180) / 360) * n);
    const cy = Math.floor(((1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2) * n);
    for (let x = cx - ring; x <= cx + ring; x += 1) {
      for (let y = cy - ring; y <= cy + ring; y += 1) {
        urls.push(`${BASE}/${zoom}/${x}/${y}.jpeg`);
      }
    }
  }
  return urls;
}

/** Télécharge les tuiles swisstopo autour du point pour les garder hors ligne. Renvoie le nombre de tuiles échouées. */
export async function saveAreaOffline(
  lat: number,
  lng: number,
  onProgress: (done: number, total: number) => void,
): Promise<number> {
  if (typeof caches === "undefined") throw new Error("cache");
  const cache = await caches.open(CACHE);
  const urls = tileUrls(lat, lng);
  let done = 0;
  let failed = 0;
  let next = 0;
  onProgress(0, urls.length);
  async function worker() {
    while (next < urls.length) {
      const url = urls[next];
      next += 1;
      try {
        if (!(await cache.match(url))) {
          const response = await fetch(url, { mode: "cors" });
          if (response.ok) await cache.put(url, response);
          else failed += 1;
        }
      } catch {
        failed += 1;
      }
      done += 1;
      onProgress(done, urls.length);
    }
  }
  await Promise.all(Array.from({ length: 6 }, worker));
  return failed;
}
