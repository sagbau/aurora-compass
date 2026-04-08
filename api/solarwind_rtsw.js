export default async function handler(req, res) {
  try {
    // Solar wind (speed + density)
    const windRes = await fetch(
      "https://services.swpc.noaa.gov/json/rtsw/rtsw_wind_1m.json",
      { cache: "no-store" }
    );
    const windData = await windRes.json();

    // Magnetické pole (Bt, Bz)
    const magRes = await fetch(
      "https://services.swpc.noaa.gov/json/rtsw/rtsw_mag_1m.json",
      { cache: "no-store" }
    );
    const magData = await magRes.json();

    // poslední AKTIVNÍ záznam
    const wind = windData.find(item => item.active === true);
    const mag = magData.find(item => item.active === true);

    if (!wind || !mag) {
      return res.status(503).json({ error: "NOAA data not active" });
    }

    res.status(200).json({
      speed: Number(wind.proton_speed),
      density: Number(wind.proton_density),
      bt: Number(mag.bt),
      bz: Number(mag.bz_gsm),
      timestamp: mag.time_tag,
      source: mag.source
    });

  } catch (err) {
    res.status(500).json({ error: "Failed to load NOAA RTSW data" });
  }
}
``
