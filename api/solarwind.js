export default async function handler(req, res) {
  try {
    const windRes = await fetch(
      "https://services.swpc.noaa.gov/json/rtsw/rtsw_wind_1m.json"
    );
    const wind = await windRes.json();

    const magRes = await fetch(
      "https://services.swpc.noaa.gov/json/rtsw/rtsw_mag_1m.json"
    );
    const mag = await magRes.json();

    const lastWind = wind.find(d => d.status === "active");
    const lastMag = mag.find(d => d.status === "active");

    if (!lastWind || !lastMag) {
      return res.status(503).json({ error: "NOAA data not active" });
    }

    res.status(200).json({
      speed: Number(lastWind.speed),
      density: Number(lastWind.density),
      bt: Number(lastMag.bt),
      bz: Number(lastMag.bz),
      timestamp: lastMag.time_tag,
      source: "NOAA RTSW (ACE / DSCOVR)"
    });

  } catch (err) {
    res.status(500).json({ error: "Failed to load NOAA RTSW data" });
  }
}
