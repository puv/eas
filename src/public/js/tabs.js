document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll(".sorter").forEach(sort => {
        sort.addEventListener("click", () => {
            document.querySelectorAll(".sorter").forEach(sort => {
                sort.classList.remove("active");
            });
            sort.classList.add("active");

            const container = document.getElementById("list");

            if (sort.classList.contains("byTime")) {
                elements = SortDivs(container, byTime);
            } else if (sort.classList.contains("byMagnitude")) {
                elements = SortDivs(container, byMagnitude);
            }

            container.innerHTML = "";

            elements.forEach(function (element) {
                container.appendChild(element);
            });
        });
    });
});

function SortDivs(container, sorting) {
    const elements = Array.from(container.children);
    elements.sort(function (a, b) {
        return sorting(a, b);
    });

    return elements;
}

function byTime(b, a) {
    return a.dataset.time - b.dataset.time;
}

function byMagnitude(b, a) {
    return a.dataset.mag - b.dataset.mag;
}