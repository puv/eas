function toMilliseconds(timestamp) {

    let milliseconds;

    if (typeof timestamp === "string") {
        milliseconds = new Date(timestamp).getTime();
    } else {
        milliseconds = timestamp;
    }

    return milliseconds;
}

function getCurrentDate() {
    const date = new Date();

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}T00:00:00`;
}

function getIntensity(magnitude) {
    return {
        i: getIntensityNumber(magnitude),
        color: getIntensityColor(getIntensityNumber(magnitude)),
    }
}

getIntensityNumber = (mag) => {
    if (mag <= 0.4) return "0";
    else if (mag <= 1.4) return "1";
    else if (mag <= 2.4) return "2";
    else if (mag <= 3.4) return "3";
    else if (mag <= 4.4) return "4";
    else if (mag <= 4.9) return "5-";
    else if (mag <= 5.4) return "5+";
    else if (mag <= 5.9) return "6-";
    else if (mag <= 6.4) return "6+";
    else return "7";
}


getIntensityColor = (intensity) => {
    switch (intensity) {
        case "0":
            return "rgb(150, 200, 200)";
        case "1":
            return "rgb(100, 120, 120)";
        case "2":
            return "rgb(30, 100, 230)";
        case "3":
            return "rgb(50, 180, 100)";
        case "4":
            return "rgb(190, 150, 0)";
        case "5-":
            return "rgb(230, 130, 40)";
        case "5+":
            return "rgb(200, 100, 10)";
        case "6-":
            return "rgb(230, 130, 0)";
        case "6+":
            return "rgb(160, 0, 0)";
        case "7":
            return "rgb(100, 150, 0)";
        default:
            return "rgb(120, 140, 140)";
    }
}

function getMagnitudeColor(num) {
    r0 = 255;
    g0 = 255;
    b0 = 255;
    r10 = 255;
    g10 = 0;
    b10 = 0;

    r = r0 - (r0 - r10) * num / 10;
    g = g0 - (g0 - g10) * num / 10;
    b = b0 - (b0 - b10) * num / 10;

    if (num < 0) {
        return "white";
    }
    if (num > 9) {
        return "black";
    }
    let color = `rgb(${r}, ${g}, ${b})`;
    return color;
}

function Patcher(array) {
    return array.map(item => {
        if (item.properties.time >= new Date(new Date().getTime() - 7 * 24 * 60 * 60 * 1000) && item.properties.time <= new Date().getTime()) {
            return {
                id: item.id,
                tag: item.tag,
                properties: {
                    magnitude: {
                        no: item.properties.magnitude,
                        color: getMagnitudeColor(item.properties.magnitude),
                    },
                    location: item.properties.location,
                    time: item.properties.time,
                    title: item.properties.title,
                    url: item.properties.url,
                    depth: item.properties.depth,
                    intensity: {
                        no: item.properties.intensity || getIntensityNumber(item.properties.magnitude),
                        color: getIntensityColor(item.properties.intensity || getIntensityNumber(item.properties.magnitude)),
                    },
                },
                coordinates: {
                    longitude: item.coordinates.longitude,
                    latitude: item.coordinates.latitude,
                },
            }
        } else return {}
    })
}



module.exports = { toMilliseconds, getCurrentDate, getIntensity, getMagnitudeColor, Patcher };