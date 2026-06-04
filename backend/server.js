const express = require("express");
const cors = require("cors");
const axios = require("axios");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

// Test route
app.get("/", (req, res) => {
  res.send("Smart Route Planner Backend Running 🚀");
});

// Weather route for multiple cities
app.get("/weather", async (req, res) => {
  const { cities } = req.query; // comma-separated
  if (!cities) return res.status(400).json({ error: "Cities required" });

  const cityArray = cities.split(",");
  let result = {};
  let recommendedVehicles = [];

  for (let city of cityArray) {
    try {
      const apiKey = process.env.OPENWEATHER_KEY;
      const weatherRes = await axios.get(
        `https://api.openweathermap.org/data/2.5/weather?q=${city.trim()}&units=metric&appid=${apiKey}`
      );

      const { temp, humidity } = weatherRes.data.main;
      const weather = weatherRes.data.weather[0].main;

      // Vehicle suggestion logic
      let suggestedVehicle = "Car"; 
      if (weather.toLowerCase().includes("rain") || weather.toLowerCase().includes("snow")) {
        suggestedVehicle = "Car";
      } else if (weather.toLowerCase().includes("clear")) {
        suggestedVehicle = "Bike";
      } else if (weather.toLowerCase().includes("clouds")) {
        suggestedVehicle = "Bike or Car";
      }

      recommendedVehicles.push(suggestedVehicle);
      result[city] = { temp, humidity, weather, suggestedVehicle };
    } catch (err) {
      result[city] = { error: "Unable to fetch" };
    }
  }

  // Determine safest vehicle overall
  let bestVehicleOverall = "Car"; // default
  if (recommendedVehicles.includes("Car")) bestVehicleOverall = "Car";
  else if (recommendedVehicles.includes("Bike")) bestVehicleOverall = "Bike";
  else bestVehicleOverall = recommendedVehicles[0];

  res.json({ ...result, bestVehicleOverall });
});

const PORT = 5050;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));