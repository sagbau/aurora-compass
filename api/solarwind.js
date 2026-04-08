export default async function handler(req, res) {
  try {
    // ===============================
    // RTSW – solar wind (speed, density)
    // ===============================
    const windRes = await fetch(
      "https://services.swpc.noaa.gov/json/rtsw/rtsw_wind_1m.json",
      { cache: "no-store" }
    );
    const windData = await windRes.json();

    // ===============================
    // RTSW – magnetické pole (Bt, Bz)
    // ===============================
    const magRes = await fetch(
      "https://services.swpc.noaa.gov/json/rtsw/rtsw_mag_1m.json",
      { cache: "no-store" }
    );
    const magData = await magRes.json();

    // ===============================
    // KP index (není kritický)
    // ===============================
    let kp = null;
    try {
      const kpRes = await fetch(
        "https://services.swpc.noaa.gov/json/noaa-planetary-k-index.json",
        { cache: "no-store" }
      );
      const kpData = await kpRes.json();
      kp = kpData[kpData.length - 1]?.Kp ?? null;
    } catch (e) {
      kp = null; // KP NIKDY NESMÍ SHODIT ENDPOINT
    }

    // ====================================================
    // Vyber dat – preferuj DSCOVR, fallback ACE
    // ====================================================
    const wind =
      windData.find(d => d.source === "DSCOVR" && d.proton_speed != null) ||
      windData.find(d => d.proton_speed != null);

    const mag =
      magData.find(d => d.source === "DSCOVR" && d.bz_gsm != null) ||
      magData.find(d => d.bz_gsm != null);

    // Pokud nejsou aspoň základní solar wind + IMF data
    if (!wind || !mag) {
      return res.status(503).json({
        error: "Solar wind data unavailable"
      });
    }

    // ===============================
    // Finální odpověď
    // ===============================
    res.status(200).json({
      bz: Number(mag.bz_gsm),
      bt: Number(mag.bt),
      speed: Number(wind.proton_speed),
      density: Number(wind.proton_density),
      kp: kp !== null ? Number(kp) : null,
      timestamp: mag.time_tag,
      source: mag.source // DSCOVR pokud je, jinak ACE
    });

  } catch (err) {
    console.error("Solarwind API error:", err);
    res.status(500).json({ error: "Failed to load solar wind data" });
  }
}
``
