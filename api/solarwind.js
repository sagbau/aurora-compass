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

    const lastPlasma = plasma[plasma.length - 1];
    const lastMag = mag[mag.length - 1];

    res.status(200).json({
      speed: Number(lastPlasma[2]),
      density: Number(lastPlasma[1]),
      bt: Number(lastMag[5]),
      bz: Number(lastMag[6]),
      source: "NOAA DSCOVR",
      timestamp: lastMag[0],
    });
  } catch (error) {
    res.status(500).json({ error: "NOAA data unavailable" });
  }
}
