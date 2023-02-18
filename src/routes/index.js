const router = require("express").Router();
require("moment-duration-format");
const moment = require('moment');
const { _XML, _JSON, _OBJ, _SINGLE } = require("../utils/Parsers.js");
const { toMilliseconds, getCurrentDate, Patcher } = require("../utils/Utils.js");
const axios = require("axios");

log = function (data) {
  if (typeof (data) == "object") data = JSON.stringify(data);
  console.log(`[${moment().format('YYYY-MM-DD HH:mm:ss')}] ${data}`)
}

router.get("/api/alerts", async (req, res) => {
  if (Alerts) res.json(Alerts.slice(0, req.query.amount ? req.query.amount : 100));
  else res.json([]);
});


router.get("/api/alerts/:id", async (req, res) => {
  if (Alerts) res.json(Alerts.find(o => o.id == req.params.id));
  else res.json([]);
});



router.get("/", async (req, res) => {
  res.render("index", {
    Alerts: Alerts || [],
  });
})

module.exports = router;


let Alerts = [];

const USGS = `https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&starttime=${moment().format('YYYY-MM-DD')}`;
const GEONET = `https://api.geonet.org.nz/quake?MMI=-1`
const INGV = `http://webservices.ingv.it/fdsnws/event/1/query?starttime=${getCurrentDate()}&format=text`
const EMSC = `http://www.seismicportal.eu/fdsnws/event/1/query?starttime=${moment().format('YYYY-MM-DD')}&format=json`
const IRIS = `http://service.iris.edu/fdsnws/event/1/query?starttime=${getCurrentDate()}&format=geocsv`
const CENC = `https://api.wolfx.jp/cenc_eqlist.json`
const SC = `https://api.wolfx.jp/sc_eew.json`
const JMA = `https://api.wolfx.jp/jma_eqlist.json`
const NIED = `https://api.wolfx.jp/nied_eew.json`
const JMA2 = `https://api.wolfx.jp/jma_eew.json`
// const BOSAI_URL = `https://www.j-shis.bosai.go.jp/map/api/pshm/Y2022/AVR/AAOMW/fltinfo.geojson?epsg=4301&lang=en`

setInterval(async () => {
  DATA = await Promise.all(
    [
      ["USGS", USGS, _JSON],
      ["GEONET", GEONET, _JSON],
      ["EMSC", EMSC, _JSON],
      ["INGV", INGV, _XML],
      ["IRIS", IRIS, _XML],
      ["CENC", CENC, _OBJ],
      ["SC", SC, _SINGLE],
      ["JMA", JMA, _SINGLE],
      ["NIED", NIED, _OBJ],
      ["JMA2", JMA2, _SINGLE]
    ].map(([name, source, type]) => getAndParseData(name, source, type).then(data => ({ name, data }))));

  await DATA.map(site => site.data.length ? [...site.data] : []).flat().forEach(alert => {
    if (Object.keys(alert).length > 0) {
      if (!Alerts.some(a => a.id == alert.id ||
        (
          a.tag != alert.tag &&
          a.coordinates.longitude.toFixed(2) == alert.coordinates.longitude.toFixed(2) &&
          a.coordinates.latitude.toFixed(2) == alert.coordinates.latitude.toFixed(2)
        )
      )) Alerts.push(alert)
    }
  });

  await Alerts.sort((a, b) =>
    b.time - a.time
  );

  log(`Total: ${Alerts.length}`)
}, 1000 * 10);

async function getAndParseData(tag, url, parser) {
  try {
    const res = await axios.get(url);
    if (!res.data) return [];
    if (res.status !== 200) return [];
    if ((res.data).toString().startsWith("<")) return [];
    return Patcher(parser(tag, res.data.features || res.data));
  } catch (e) {
    console.log(e.code)
    return []
  }
}