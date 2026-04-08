export default async function handler(req, res) {
  try {
    // ===============================
    // RTSW – wind
    // ===============================
    const windRes = await fetch(
      "https://services.swpc.noaa.gov/json/rtsw/rtsw_wind_1m.json",
      { cache: "no-store" }
    );
    const windData = await windRes.json();

    // ===============================
    // RTSW – magnetic field
    // ===============================
    const magRes = await fetch(
      "https://services.swpc.noaa.gov/json/rtsw/rtsw_mag_1m.json",
      { cache: "no-store" }
    );
    const magData = await magRes.json();

    // ===============================
    // KP NOW
    // ===============================
    let kpNow = null;
    try {
      const kpRes = await fetch(
        "https://services.swpc.noaa.gov/json/planetary_k_index_1m.json",
        { cache: "no-store" }
      );
      const kpData = await kpRes.json();
      for (let i = kpData.length - 1; i >= 0; i--) {
        if (kpData[i].kp_index != null) {
          kpNow = Number(kpData[i].kp_index);
          break;
        }
      }
    } catch {}

    // ===============================
    // KP FORECAST (24 h max)
    // ===============================
    let kpForecast24h = null;
    try {
      const kpFRes = await fetch(
        "https://services.swpc.noaa.gov/products/noaa-planetary-k-index-forecast.json",
        { cache: "no-store" }
      );
      const kpFData = await kpFRes.json();
      const now = Date.now();
      const next24h = kpFData.filter(e => {
        if (!e.time_tag || e.kp == null) return false;
