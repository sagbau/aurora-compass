export default async function handler(req, res) {
  try {
    const plasmaRes = await fetch(
      "https://services.swpc.noaa.gov/products/solar-wind/plasma-1-day.json"
    );
    const plasma = await plasmaRes.json();

    const magRes = await fetch(
      "https://services.swpc.noaa.gov/products/solar-wind/mag-1-day.json"
    );
    const mag = await magRes.json();

    // najdi POSLEDNÍ VALIDNÍ plasma vzorek
    const plasmaData = plasma.slice(1).reverse().find(row =>
      row[1] && row[2]
    );

    // najdi POSLEDNÍ VALIDNÍ magnetometer vzorek
    const magData = mag.slice(1).reverse().find(row =>
      row[5] && row[6]
    );

    if (!plasmaData || !magData) {
      return res.status(503).json({ error: "NOAA data incomplete" });
    }

    res.status(200).json({
      speed: Number(plasmaData[2]),
      density: Number(plasmaData[1]),
      bt: Number(magData[5]),
      bz: Number(magData[6]),
      source: "NOAA DSCOVR",
      timestamp: magData[0]
    });

  } catch (err) {
    res.status(500).json({ error: "Failed to load NOAA data" });
  }
}
