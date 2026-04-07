export default async function handler(req, res) {
  try {
    const response = await fetch(
      "https://services.swpc.noaa.gov/products/solar-wind/plasma-1-day.json"
    );
    const data = await response.json();

    // poslední řádek = nejaktuálnější data
    const last = data[data.length - 1];

    res.status(200).json({
      bz: Number(last[6]),
      speed: Number(last[2]),
      density: Number(last[1]),
      source: "NOAA DSCOVR",
      timestamp: last[0],
    });
  } catch (error) {
    res.status(500).json({ error: "NOAA data unavailable" });
  }
}
