const { _XML, _JSON, _OBJ, _SINGLE } = require("../utils/Parsers.js");
const { toMilliseconds, getCurrentDate, Patcher } = require("../utils/Utils.js");
require("moment-duration-format");
const axios = require("axios");
const moment = require('moment');

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

// setInterval(async () => {
//     DATA = [
//         {
//             data: await getAndParseData("USGS", USGS, _JSON),
//             name: "USGS",
//         }, {
//             data: await getAndParseData("GEONET", GEONET, _JSON),
//             name: "GEONET",
//         }, {
//             data: await getAndParseData("EMSC", EMSC, _JSON),
//             name: "EMSC",
//         }, {
//             data: await getAndParseData("INGV", INGV, _XML),
//             name: "INGV",
//         }, {
//             data: await getAndParseData("IRIS", IRIS, _XML),
//             name: "IRIS",
//         }, {
//             data: await getAndParseData("CENC", CENC, _OBJ),
//             name: "CENC",
//         }, {
//             data: await getAndParseData("SC", SC, _SINGLE),
//             name: "SC",
//         }, {
//             data: await getAndParseData("JMA", JMA, _SINGLE),
//             name: "JMA",
//         }, {
//             data: await getAndParseData("NIED", NIED, _OBJ),
//             name: "NIED",
//         }, {
//             data: await getAndParseData("JMA2", JMA2, _SINGLE),
//             name: "JMA2",
//         }
//     ]

//     Alerts = await DATA.map(site => site.data.length ? [...site.data] : []).flat().filter(async (obj, index, self) => {
//         return await self.findIndex(async o => o.coordinates.longitude.toFixed(3) === obj.coordinates.longitude.toFixed(3) && o.coordinates.latitude.toFixed(3) === obj.coordinates.latitude.toFixed(3) && o.tag != obj.tag) === index;
//     }).filter(o => o.properties.time > new Date(new Date().getTime() - 7 * 24 * 60 * 60 * 1000) && o.properties.time < new Date().getTime()).sort(async (a, b) => b.time - a.time);

//     console.log(`Total: ${Alerts.length}`)
// }, 1000 * 10);

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

module.exports = Alerts;