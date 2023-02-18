seenAlerts = [];
Alerts = [];
map = null;
_intensity = localStorage.getItem("intensity") === "true";


function formatTime(ms) {
    const oneMinute = 60 * 1000;
    const oneHour = oneMinute * 60;
    const oneDay = oneHour * 24;

    if (ms < oneMinute) {
        return `${Math.round(ms / 1000)}s`;
    } else if (ms < oneHour) {
        return `${Math.round(ms / oneMinute)}min`;
    } else if (ms < oneDay) {
        return `${Math.round(ms / oneHour)}h`;
    } else {
        return `${Math.round(ms / oneDay)}d`;
    }
}

function formatDate(ms) {
    const date = new Date(ms);
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');
    return `${year}/${month}/${day} ${hours}:${minutes}:${seconds}`;
}

function GetInfo(id) {
    const alert = Alerts.find((a) => a.id == id);
    console.log(alert);
    const { tag, properties: { magnitude, location, time, title, url, depth, intensity }, coordinates: { longitude, latitude } } = alert;

    if (map) {
        map.setView([latitude, longitude], 7);
    }

    document.getElementById("info").innerHTML = `
        <div class="alert-title">${title}</div>
        <div class="alert-magnitude">Magnitude: ${magnitude.no}</div>
        <div class="alert-location">Location: ${location}</div>
        <div class="alert-time">Time: ${formatDate(time)}</div>
        <div class="alert-depth">Depth: ${depth}km</div>
        <div class="alert-coords">Coordinates: ${latitude}, ${longitude}</div>
        <div class="alert-tag">API: ${tag}</div>
        <div class="alert-intensity">Intensity: ${intensity.no}</div>
        ${url.length > 0 ? `<a href="${url}" target="_blank">More Info</a>` : ""}
        <a href="${generateGoogleMapsLink(latitude, longitude)}" target="_blank">Open in Google Maps</a>
      `;
}

function generateGoogleMapsLink(lat, lng) {
    return `https://maps.google.com/?q=${lat},${lng}`;
}

async function fetchAlerts(amount, _new = true) {
    const response = await fetch(`/api/alerts?amount=${amount}`);
    if (response.status !== 200) return console.log("Error fetching alerts");
    let data = await response.json();

    if (data.length === 0) return;

    let container = document.getElementById("list");

    let loading = container.parentElement.querySelector(".loading");
    loading.style.display = "none";
    container.style.display = "grid";

    newAlerts = data.filter(a => !Alerts.some(b => b.id == a.id));
    Alerts = [...Alerts, ...newAlerts];
    FillAlerts(container, Alerts, _new);
}

function FillAlerts(container, data, _new) {
    for (const value of data) {
        const { id, properties: { time }, coordinates: { longitude, latitude } } = value;
        if (seenAlerts.includes(id) || !latitude || !longitude) continue;
        seenAlerts.push(id);
        const alert = createAlert(value, _new);

        const index = Array.from(container.children).findIndex(child => {
            return (time - child.dataset.time) > 0;
        });

        if (index === -1) {
            container.appendChild(alert);
        } else {
            container.insertBefore(alert, container.children[index]);
        }
        AddMarker(value);
    }
}

function createAlert(value, _new) {
    const { id, tag, properties: { magnitude, location, time, title, url, depth, intensity }, coordinates: { longitude, latitude } } = value;
    let div = document.createElement("div");
    div.setAttribute("onclick", `GetInfo('${id}')`);
    div.setAttribute("data-time", time);
    div.setAttribute("data-magnitude", magnitude.no);
    console.log(value)
    div.classList.add("alert");
    if (_new) div.classList.add("new");
    div.innerHTML = `
        <div class="alert__amplitude">
            <label>${_intensity ? "Intensity" : "Magnitude"}</label>
            <div class="alert__amplitude__value" style="background-color: ${_intensity ? intensity.color : magnitude.color}">${_intensity ? intensity.no : magnitude.no}</div>
        </div>
        <div class="alert__content">
            <div class="alert__location">${location}</div>
            <div class="alert__1">
                <div class="alert__time">${new Date(time).toLocaleString()}</div>
                <div class="alert__2">
                    <div class="alert__amplitude">${!_intensity ? `Int. ${intensity.no}` : `Mag. ${magnitude.no}`}</div>
                    <div class="alert__depth"> Depth: <span>${parseInt(depth)} km</span></div>
                </div>
            </div>
        </div>
    `;
    return div;
}

function AddMarker(value) {
    const { id, tag, properties: { magnitude, location, time, title, url, depth, intensity }, coordinates: { longitude, latitude } } = value;
    let marker = L.marker([latitude, longitude], {
        icon: L.divIcon({
            html: `<div onclick="GetInfo('${id}')" style="background-color: ${_intensity ? intensity.color : magnitude.color}; border-radius: 50%; width: 1.5em; height: 1.5em; margin-top: -4px; margin-left: -4px; border: 1px solid black">`
        }),
        zIndexOffset: parseInt(intensity.no)
    }).addTo(map);
    marker.bindPopup(generatePopup(value));
}

function generatePopup(value) {
    const { id, tag, properties: { magnitude, location, time, title, url, depth, intensity }, coordinates: { longitude, latitude } } = value;
    return `<b>${title}</b>
    <br>Magnitude: ${magnitude.no}
    <br>Time: ${formatDate(time)}
    <br>Location: (${latitude}, ${longitude})
    <br>Depth: ${depth}
    <br>API: ${tag}
    <br>Intensity: ${intensity.no}
    ${url.length > 0 ? `<br><a href="${url}" target="_blank">More Info</a>` : ""}
    <br><a href="${generateGoogleMapsLink(latitude, longitude)}" target="_blank">Open in Google Maps</a>`
}

function Switch(no) {
    switch (no) {
        case 0:
            localStorage.setItem("intensity", false);
            break;
        case 1:
            localStorage.setItem("intensity", true);
            break;
    }
    location.reload();
}
document.addEventListener("DOMContentLoaded", () => {
    map = L.map('map', { zoomControl: false }).setView([0, 80], 1);
    map.setMaxBounds(map.getBounds());


    L.tileLayer('https://tile.jawg.io/bc7554db-f336-44b0-98d5-8cb3ff61a317/{z}/{x}/{y}{r}.png?access-token={accessToken}', {
        attribution: '<a href="http://jawg.io" title="Tiles Courtesy of Jawg Maps" target="_blank">&copy; <b>Jawg</b>Maps</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        minZoom: 2,
        maxZoom: 7,
        accessToken: "zq0xp5qUrNhGwxRaxnfux9Ud6bYcOkyQlchf8BZmMNf9KfWEDcFbw44HUnhSxa0M"
    }).addTo(map);

    fetchAlerts(1000, false);

    document.getElementById("toggle").addEventListener("click", (toggle) => {
        let right = document.querySelector(".overlay .right");
        right.style.right = right.style.right === "0em" ? "-25em" : "0em";
    });

    setInterval(() => {
        // document.querySelectorAll(".time").forEach(e => {
        //     e.innerText = formatTime(new Date() - e.dataset.time);
        // });
        fetchAlerts(50);
    }, 5000);
});