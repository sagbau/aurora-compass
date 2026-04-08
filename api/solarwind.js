export default async function handler(req, res) {
  try {
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

    const kpRes = await fetch(
      "https://services.swpc.noaa.gov/json/noaa-planetary-k-index.json",
      { cache: "no-store" }
    );
    const kpData = await kpRes.json();

    // ✅ preferuj DSCOVR, fallback ACE
    const wind =
      windData.find(d => d.source === "DSCOVR" && d.proton_speed != null) ||
      windData.find(d => d.proton_speed != null);

    const mag =
      magData.find(d => d.source === "DSCOVR" && d.bz_gsm != null) ||
      magData.find(d => d.bz_gsm != null);

    const kp = kpData[kpData.length - 1]?.Kp;

    if (!wind || !mag) {
      return res.status(500).json({ error: "No usable NOAA data" });
    }

    res.status(200).json({
      bz: Number(mag.bz_gsm),
      bt: Number(mag.bt),
      speed: Number(wind.proton_speed),
      density: Number(wind.proton_density),
      kp: Number(kp),
      timestamp: mag.time_tag,
      source: mag.source   // ✅ DSCOVR pokud je, jinak ACE
    });

  } catch (err) {
    res.status(500).json({ error: "Failed to load NOAA data" });
  }
}
``
