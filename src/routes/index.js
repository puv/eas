const router = require("express").Router();
require("moment-duration-format")
const axios = require("axios")
const moment = require('moment')

let Alerts = [];
let newAlerts = [];
const USGS_URL = `https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&starttime=${moment().format('YYYY-MM-DD')}`;

setInterval(async () => {
  const { data } = await axios.get(USGS_URL);
  const { features } = data;

  _Alerts = features.map((feature) => {
    let id = feature.id;
    let { mag, place, time, url, type, title } = feature.properties;
    let { coordinates } = feature.geometry;
    let [longitude, latitude] = coordinates;

    mag = parseFloat(mag.toFixed(1));
    color = "lightgreen";
    background = "black"

    if (type === "earthquake") {
      type = "🌎";
      if (mag <= 2) {
        color = "rgb(0, 255, 65)";
      } else if (mag <= 4) {
        color = "rgb(170, 255, 170)";
      } else if (mag <= 6) {
        color = "rgb(255, 255, 0)";
      } else if (mag <= 7) {
        color = "rgb(255, 170, 0)";
      } else if (mag <= 8) {
        color = "rgb(255, 85, 0)";
      } else {
        color = "rgb(0, 0, 0)";
        background = "red";
      }
    }

    return {
      type,
      mag,
      color,
      background,
      title,
      place: place || "Unknown Location",
      time,
      url,
      longitude,
      latitude,
      id
    };
  });

  newAlerts = _Alerts.sort((a, b) => b.time - a.time).slice(0, 100).filter((alert) => {
    return Alerts.length > 0 && !Alerts.some((a) => a.id == alert.id);
  });
  Alerts = _Alerts.sort((a, b) => b.time - a.time).slice(0, 100);
  console.log("Old Alerts: ", Alerts.length);
  console.log("New Alerts: ", newAlerts.length);
}, 1000 * 10);

router.get("/api/alerts", async (req, res) => {
  console.log(req.query)
  if (req.query.new === "true")
    res.json(newAlerts);
  else res.json(Alerts);
});

router.get("/", async (req, res) => {
  res.render("index", {
    Alerts: Alerts,
  });
})

module.exports = router;