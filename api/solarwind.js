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
// KP index (planetary, 1m)
// ===============================
let kp = null;
try {
  const kpRes = await fetch(
    "https://services.swpc.noaa.gov/json/planetary_k_index_1m.json",
    { cache: "no-store" }
  );
  const kpData = await kpRes.json();

  // vezmi poslední platný kp_index
  for (let i = kpData.length - 1; i >= 0; i--) {
    if (
      kpData[i].kp_index !== undefined &&
      kpData[i].kp_index !== null
    ) {
      kp = Number(kpData[i].kp_index);
      break;
    }
  }
} catch {
  kp = null; // KP NIKDY nesmí shodit endpoint
}

    // ===============================
    // Preferuj DSCOVR, fallback ACE
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

    res.status(200).json({
      bz: Number(mag.bz_gsm),
      bt: Number(mag.bt),
      speed: Number(wind.proton_speed),
      density: Number(wind.proton_density),
      kp: kp,                     // ✅ bude číslo nebo null
      timestamp: mag.time_tag,
      source: mag.source
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to load data" });
  }
}
``
