const { toMilliseconds, getCurrentDate, getIntensity, getMagnitudeColor } = require("./Utils.js");

function Gen(id = null, Alerts = null, intensity = false, _new = false) {
    if (id != null) {
        let alert = Alerts.find(a => a.id == id);
        return {
            time: alert.properties.time,
            code: genAlert(alert, intensity, _new)
        }
    } else if (Alerts != null) {
        return Alerts.map(alert => {
            return genAlert(alert, intensity, _new);
        }).join('');
    } else return '';
}

function genAlert(alert, intensity = false, _new = false) {
    return `
        <div onclick="GetInfo('${alert.id}')" data-time="${alert.properties.time}" data-magnitude="${alert.properties.magnitude.no}" data-id="${alert.id}" class="alert ${_new ? "new" : ""}">
            <div class="alert__amplitude">
                <label>${intensity ? "Intensity" : "Magnitude"}</label>
                <div class="alert__amplitude__value" style="background-color: ${intensity ? alert.properties.intensity.color : getMagnitudeColor(alert.properties.magnitude)}">${intensity ? alert.properties.intensity.i : alert.properties.magnitude}</div>
            </div>
            <div class="alert__content">
                <div class="alert__location">${alert.properties.location}</div>
                <div class="alert__1">
                    <div class="alert__time">${new Date(alert.properties.time).toLocaleString()}</div>
                    <div class="alert__2">
                        <div class="alert__amplitude">${!intensity ? `M ${alert.properties.magnitude}` : `I ${alert.properties.intensity.i}`}</div>
                        <div class="alert__depth"> Depth: <span>${alert.properties.depth} km</span></div>
                    </div>
                </div>
            </div>
        </div>
        `
}

function genPopup(id) {
    let alert = Alerts.find(a => a.id == id);
    return ``
}


module.exports = { genAlert, genPopup }