const fetch = require("node-fetch");

const apiKey = process.env.OPENWEATHER_API_KEY;

const getWeather = async (req, res) => {
  const { lat, lon } = req.query;

  if (!lat || !lon) {
    return res.status(400).send({ error: "Latitud y longitud son requeridas" });
  }

  try {
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&lang=es&appid=${apiKey}`
    );

    if (!response.ok) {
      throw new Error("Error al obtener los datos del clima");
    }

    const weatherData = await response.json();
    res.status(200).json(weatherData);
  } catch (error) {
    console.error("Error fetching weather data:", error);
    res.status(500).send({ error: "Error al obtener los datos del clima" });
  }
};

const getForecast = async (req, res) => {
  const { lat, lon } = req.query;

  if (!lat || !lon) {
    return res.status(400).send({ error: "Latitud y longitud son requeridas" });
  }

  try {
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&lang=es&appid=${apiKey}`
    );

    if (!response.ok) {
      throw new Error("Error al obtener los datos del pronóstico");
    }

    const forecastData = await response.json();
    res.status(200).json(forecastData);
  } catch (error) {
    console.error("Error fetching the forecast data:", error);
    res.status(500).send({ error: "Error al obtener los datos del pronóstico" });
  }
};

module.exports = { getWeather, getForecast };
