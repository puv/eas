seenAlerts = [];
Alerts = [];
map = null;

function formatElapsedTime(ms) {
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

function GetInfo(id) {
    console.log(id);
    const alert = Alerts.find((a) => a.id == id);
    const { mag, place, time, url, type, title, latitude, longitude } = alert;
    const timeAgo = formatElapsedTime(new Date() - time);

    if (map) {
        map.setView([latitude, longitude], 7);
    }

    document.getElementById("info").innerHTML = `
        <div class="alert-title">${title}</div>
        <div class="alert-mag">Magnitude: ${mag}</div>
        <div class="alert-place">Place: ${place}</div>
        <div class="alert-time">Time: ${timeAgo} ago</div>
        <a href="${url}" target="_blank">More Info</a>
      `;
}

async function fetchAlerts(newOnly = false) {
    const response = await fetch(`/api/alerts?new=${newOnly}`);
    const data = await response.json();

    if (data.length === 0) return;

    // Add elements to the page with an animation
    let container = document.getElementById("alerts");

    if (!newOnly) {
        let loading = document.getElementById("left").querySelector(".loading");

        loading.style.display = "none";
        container.style.display = "grid";
    }

    data.reverse();
    Alerts = [...Alerts, ...data]
    for (value of data) {
        if (seenAlerts.includes(value.id)) continue;
        seenAlerts.push(value.id);
        let alert = document.createElement("div");
        alert.classList.add("alert", "animated", "bounceInUp");
        alert.style.background = value.background;
        alert.setAttribute("onclick", `GetInfo("${value.id}")`);
        let info = document.createElement("div");
        info.classList.add("info");
        let time = document.createElement("div");
        time.classList.add("time");
        time.dataset.time = value.time;
        time.innerText = formatElapsedTime(new Date() - value.time);
        let mag = document.createElement("div");
        mag.classList.add("mag");
        mag.innerText = value.mag;
        mag.style.color = value.color;
        let title = document.createElement("div");
        title.classList.add("title");
        title.innerText = value.place;

        info.appendChild(time);
        info.appendChild(mag);
        info.appendChild(title);

        alert.appendChild(info);

        container.insertBefore(alert, container.firstChild);

        AddMarker(value);
    };
}

function AddMarker(value) {
    let marker = L.marker([value.latitude, value.longitude], {
        icon: L.divIcon({
            html: `<div onclick="GetInfo('${value.id}')" style="background-color: ${value.color}; border-radius: 50%; width: 1.5em; height: 1.5em; margin-top: -4px; margin-left: -4px; border: 1px solid black">`
        })
    }).addTo(map);
    marker.bindPopup(`<b>${value.title}</b><br><a href="${value.url}" target="_blank">More Info</a>`);
}

// on page ready plain js
document.addEventListener("DOMContentLoaded", function () {
    map = L.map('map').setView([0, 0], 1);

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 10,
        minZoom: 1,
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map);

    fetchAlerts(false);
    setInterval(async () => {
        const timeAgoElements = document.querySelectorAll(".time");
        for (e of timeAgoElements) {
            const timeAgo = formatElapsedTime(new Date() - e.dataset.time);
            e.innerText = timeAgo;
        }

        fetchAlerts(true);
    }, 5000);
});