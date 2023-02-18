const { toMilliseconds, getCurrentDate, getIntensity } = require("./Utils.js");

function _XML(tag, data) {
    const lines = data.split("\n");
    return lines.map(alert => {
        const parts = alert.split("|");
        if (parts.length < 11) return null;
        if (alert.includes("#") || alert.includes("EventID")) return null;

        return {
            id: parts[0],
            tag: tag,
            properties: {
                magnitude: parseFloat(parts[10]).toFixed(1),
                location: (parts[parts.length - 1].trim() === "earthquake" ? parts[parts.length - 2] : parts[parts.length - 1]) || "Unknown Location",
                time: parts[1],
                title: null,
                url: "",
                depth: parseFloat(parts[4]),
                intensity: null,
            },
            coordinates: {
                latitude: parseFloat(parts[2]),
                longitude: parseFloat(parts[3]),
            }
        };
    }).filter(alert => alert !== null);
}

function _JSON(tag, data) {
    return data.map((alert) => {
        const { id, properties: { publicId, publicID, mag, magnitude, place, locality, time, title, url, depth, long, lat, flynn_region } } = alert;
        const coordinates = alert.geometry ? alert.geometry.coordinates : [];

        return {
            id: id || publicId || publicID,
            tag: tag,
            properties: {
                magnitude: parseFloat(mag || magnitude).toFixed(1),
                location: place || locality || flynn_region || "Unknown Location",
                time: toMilliseconds(time),
                title: title || null,
                url: url || "",
                depth: depth || coordinates[2] || null,
                intensity: null,
            },
            coordinates: {
                longitude: parseFloat(coordinates[0] || coordinates.longitude || long || null),
                latitude: parseFloat(coordinates[1] || coordinates.latitude || lat || null),
            },
        };
    })
}

function _OBJ(tag, data) {
    return Object.keys(data).map(key => {


        return {
            id: key,
            tag: tag,
            properties: {
                magnitude: parseFloat(data[key].magnitude).toFixed(1),
                location: data[key].location || "Unknown Location",
                time: toMilliseconds(data[key].time || 0),
                title: null,
                url: "",
                depth: data[key].depth,
                intensity: data[key].shindo || null,
            },
            coordinates: {
                longitude: parseFloat(data[key].longitude),
                latitude: parseFloat(data[key].latitude),
            }
        }
    });
}

function _SINGLE(tag, data) {
    return [data].map((alert) => {
        const { EventID, origin_time, report_time, OriginTime, AnnouncedTime, Latitude, Longitude, latitude, longitude, region_name, Magunitude,
            magunitude, depth, calcintensity, Depth, MaxIntensity, HypoCenter,
            Title, Hypocenter } = alert;

        return {
            id: EventID || origin_time,
            tag: tag,
            properties: {
                magnitude: parseFloat(Magunitude || magunitude).toFixed(1),
                location: HypoCenter || Hypocenter || region_name || "Unknown Location",
                time: toMilliseconds(OriginTime || AnnouncedTime || origin_time || report_time || EventID || 0),
                title: Title || null,
                url: "",
                depth: Depth || depth || null,
                intensity: MaxIntensity || calcintensity || null,
            },
            coordinates: {
                longitude: parseFloat(Longitude || longitude || null),
                latitude: parseFloat(Latitude || latitude || null),
            },
        };
    });
}

module.exports = { _XML, _JSON, _OBJ, _SINGLE };