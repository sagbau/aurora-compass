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
        const t = new Date(e.time_tag).getTime();
        return t > now && t < now + 24 * 60 * 60 * 1000;
      });
      if (next24h.length) {
        kpForecast24h = Math.max(...next24h.map(e => Number(e.kp)));
      }
    } catch {}

    // ===============================
    // Preferuj DSCOVR
    // ===============================
    const wind =
      windData.find(d => d.source === "DSCOVR" && d.proton_speed != null) ||
      windData.find(d => d.proton_speed != null);

    const mag =
      magData.find(d => d.source === "DSCOVR" && d.bz_gsm != null) ||
      magData.find(d => d.bz_gsm != null);

    if (!wind || !mag) {
      return res.status(503).json({ error: "Solar wind unavailable" });
    }

    // ===============================
    // ETA
    // ===============================
    const DISTANCE_KM = 1500000;
    const etaSeconds = DISTANCE_KM / wind.proton_speed;

    res.status(200).json({
      bz: Number(mag.bz_gsm),
      bt: Number(mag.bt),
      speed: Number(wind.proton_speed),
      density: Number(wind.proton_density),

      kpNow,
      kpForecast24h,

      etaMinutes: Math.round(etaSeconds / 60),
      arrivalTime: new Date(Date.now() + etaSeconds * 1000).toISOString(),

      timestamp: mag.time_tag,
      source: mag.source
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to load data" });
  }
}
``
