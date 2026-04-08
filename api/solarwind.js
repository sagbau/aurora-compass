export default async function handler(req, res) {
  try {
    // ===============================
    // RTSW – solar wind (NOW)
    // ===============================
    const windRes = await fetch(
      "https://services.swpc.noaa.gov/json/rtsw/rtsw_wind_1m.json",
      { cache: "no-store" }
    );
    const windData = await windRes.json();

    const magRes = await fetch(
      "https://services.swpc.noaa.gov/json/rtsw/rtsw_mag_1m.json",
      { cache: "no-store" }
    );
    const magData = await magRes.json();

    // Preferuj DSCOVR
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
    // Kp NOW (1m nowcast)
    // ===============================
    let kpNow = null;
    try {
      const kpRes = await fetch(
        "https://services.swpc.noaa.gov/json/planetary_k_index_1m.json",
        { cache: "no-store" }
      );
      const kpData = await kpRes.json();
      const last = kpData.findLast(e => e.kp_index != null);
      if (last) kpNow = Number(last.kp_index);
    } catch {}

    // ===============================
    // Kp FORECAST – 2h / 24h / 72h
    // ===============================
    let kp2h = null;
    let kp24h = null;
    let kp72h = null;

    try {
      const kpFRes = await fetch(
        "https://services.swpc.noaa.gov/products/noaa-planetary-k-index-forecast.json",
        { cache: "no-store" }
      );
      const kpFData = await kpFRes.json();
      const now = Date.now();

      const inRange = (h) =>
        kpFData
          .filter(e => e.time_tag && e.kp != null)
          .filter(e => {
            const t = new Date(e.time_tag).getTime();
            return t > now && t <= now + h * 60 * 60 * 1000;
          })
          .map(e => Number(e.kp));

      const r2 = inRange(2);
      const r24 = inRange(24);
      const r72 = inRange(72);

      if (r2.length) kp2h = Math.max(...r2);
      if (r24.length) kp24h = Math.max(...r24);
      if (r72.length) kp72h = Math.max(...r72);
    } catch {}

    // ===============================
    // ETA (DSCOVR → Earth)
    // ===============================
    const DISTANCE_KM = 1500000;
    const etaSeconds = DISTANCE_KM / wind.proton_speed;

    res.status(200).json({
      // Solar wind (NOW)
      bz: Number(mag.bz_gsm),
      bt: Number(mag.bt),
      speed: Number(wind.proton_speed),
      density: Number(wind.proton_density),

      // Kp
      kpNow,
      kpForecast2h: kp2h,
      kpForecast24h: kp24h,
      kpForecast72h: kp72h,

      // Timing
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
