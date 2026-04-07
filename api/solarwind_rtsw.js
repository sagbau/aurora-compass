export default async function handler(req, res) {
  try {
    const wind = await fetch(
      "https://services.swpc.noaa.gov/json/rtsw/rtsw_wind_1m.json",
      { cache: "no-store" }
    ).then(r => r.json());

    const mag = await fetch(
      "https://services.swpc.noaa.gov/json/rtsw/rtsw_mag_1m.json",
      { cache: "no-store" }
    ).then(r => r.json());

    const w = wind.find(x => x.status === "active");
    const m = mag.find(x => x.status === "active");

    res.status(200).json({
      speed: w?.speed ?? null,
      density: w?.density ?? null,
      bt: m?.bt ?? null,
      bz: m?.bz ?? null,
      timestamp: m?.time_tag ?? null,
      source: "NOAA RTSW"
    });
  } catch (e) {
    res.status(500).json({ error: "RTSW fetch failed" });
  }
}
