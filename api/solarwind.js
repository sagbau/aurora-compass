export default async function handler(req, res) {
  try {
    // ===== RTSW WIND (speed + density)
    const windRes = await fetch(
      "https://services.swpc.noaa.gov/json/rtsw/rtsw_wind_1m.json",
      { cache: "no-store" }
    );
    const windData = await windRes.json();

    // ===== RTSW MAG (Bt + Bz)
    const magRes = await fetch(
      "https://services.swpc.noaa.gov/json/rtsw/rtsw_mag_1m.json",
      { cache: "no-store" }
    );
    const magData = await magRes.json();

    // ===== KP INDEX
    const kpRes = await fetch(
      "https://services.swpc.noaa.gov/json/noaa-planetary-k-index.json",
      { cache: "no-store" }
    );
    const kpData = await kpRes.json();

    // ===== najdi poslední AKTIVNÍ hodnoty
    const wind = windData.find(item => item.active === true);
    const mag = magData.find(item => item.active === true);
    const kp = kpData[kpData.length - 1]?.Kp;

    if (!wind || !mag || kp === undefined) {
      return res.status(503).json({ error: "NOAA data not available" });
    }

    res.status(200).json({
      bz: Number(mag.bz_gsm),
      bt: Number(mag.bt),
      speed: Number(wind.proton_speed),
      density: Number(wind.proton_density),
      kp: Number(kp),
      timestamp: mag.time_tag,
      source: mag.source
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to load NOAA data" });
  }
}
``
