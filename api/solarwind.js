export default async function handler(req, res) {
  try {
    // RTSW – solar wind (speed, density)
    const windRes = await fetch(
      "https://services.swpc.noaa.gov/json/rtsw/rtsw_wind_1m.json",
      { cache: "no-store" }
    );
    const wind = await windRes.json();

    // RTSW – magnetické pole (Bt, Bz)
    const magRes = await fetch(
      "https://services.swpc.noaa.gov/json/rtsw/rtsw_mag_1m.json",
      { cache: "no-store" }
    );
    const mag = await magRes.json();

    // vezmeme poslední ACTIVE záznam
    const w = wind.find(item => item.status === "active");
    const m = mag.find(item => item.status === "active");

    if (!w || !m) {
      return res.status(503).json({ error: "NOAA data not active" });
    }

    res.status(200).json({
      speed: Number(w.speed),
      density: Number(w.density),
      bt: Number(m.bt),
      bz: Number(m.bz),
      timestamp: m.time_tag,
      source: "NOAA RTSW"
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to load NOAA RTSW data" });
  }
}
``
