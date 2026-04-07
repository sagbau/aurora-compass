export default async function handler(req, res) {
  try {
    // 1️⃣ Plasma data: speed + density
    const plasmaResponse = await fetch(
      "https://services.swpc.noaa.gov/products/solar-wind/plasma-1-day.json"
    );
    const plasmaData = await plasmaResponse.json();

    // 2️⃣ Magnetometer data: Bt + Bz
    const magResponse = await fetch(
      "https://services.swpc.noaa.gov/products/solar-wind/mag-1-day.json"
    );
    const magData = await magResponse.json();

    // poslední validní řádky
    const lastPlasma = plasmaData[plasmaData.length - 1];
    const lastMag = magData[magData.length - 1];

    res.status(200).json({
      speed: Number(lastPlasma[2]),
      density: Number(lastPlasma[1]),
      bt: Number(lastMag[5]),
      bz: Number(lastMag[6]),
      source: "NOAA DSCOVR",
      timestamp: lastMag[0]
    });
  } catch (error) {
    res.status(500).json({ error: "NOAA data unavailable" });
  }
}
