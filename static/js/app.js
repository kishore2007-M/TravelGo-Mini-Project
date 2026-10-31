/* =========================================
   TRAVELGO - COMPLETE DESTINATIONS JAVASCRIPT
   Image path: ../static/images/
========================================= */

"use strict";

/* =========================================
   DESTINATION DATA - 37 DESTINATIONS
========================================= */

const destinations = [
    {
        id: 1,
        name: "Agra",
        category: "Heritage",
        image: "agra.jpeg",
        price: 8999,
        duration: "4h 30m",
        description: "Discover the magnificent Taj Mahal and Mughal history."
    },
    {
        id: 2,
        name: "Alappuzha",
        category: "Nature",
        image: "alappuzha.jpg",
        price: 9999,
        duration: "5h 00m",
        description: "Enjoy peaceful backwaters and beautiful houseboats."
    },
    {
        id: 3,
        name: "Amritsar",
        category: "Culture",
        image: "amritsar.jpeg",
        price: 11999,
        duration: "5h 40m",
        description: "Explore the Golden Temple and vibrant Punjabi culture."
    },
    {
        id: 4,
        name: "Bangalore",
        category: "City",
        image: "bangalore.jpg",
        price: 7499,
        duration: "4h 10m",
        description: "Experience gardens, cafés and a lively city atmosphere."
    },
    {
        id: 5,
        name: "Chennai",
        category: "City",
        image: "chennai.jpg",
        price: 6999,
        duration: "4h 00m",
        description: "Explore Marina Beach, museums and coastal culture."
    },
    {
        id: 6,
        name: "Coimbatore",
        category: "Nature",
        image: "coimbatore.jpg",
        price: 7999,
        duration: "4h 20m",
        description: "Discover a gateway to mountains and green landscapes."
    },
    {
        id: 7,
        name: "Goa",
        category: "Beach",
        image: "goa.webp",
        price: 9499,
        duration: "4h 30m",
        description: "Relax beside beaches and explore Portuguese heritage."
    },
    {
        id: 8,
        name: "Gujarat",
        category: "Culture",
        image: "gujarat.jpeg",
        price: 10999,
        duration: "5h 20m",
        description: "Experience traditional crafts, temples and local culture."
    },
    {
        id: 9,
        name: "Guwahati",
        category: "Nature",
        image: "guwahati.jpeg",
        price: 12999,
        duration: "5h 50m",
        description: "Explore Assam's natural beauty and river landscapes."
    },
    {
        id: 10,
        name: "Hyderabad",
        category: "City",
        image: "hyderabad.jpeg",
        price: 8499,
        duration: "4h 30m",
        description: "Discover historic landmarks and delicious local cuisine."
    },
    {
        id: 11,
        name: "Jaipur",
        category: "Heritage",
        image: "jaipur.jpeg",
        price: 10999,
        duration: "5h 10m",
        description: "Visit royal palaces, forts and colourful markets."
    },
    {
        id: 12,
        name: "Kanyakumari",
        category: "Coastal",
        image: "kanyakumari.jpg",
        price: 8999,
        duration: "4h 40m",
        description: "Enjoy dramatic coastal views and beautiful sunrises."
    },
    {
        id: 13,
        name: "Karnataka",
        category: "Nature",
        image: "karnataka.jpeg",
        price: 7999,
        duration: "4h 20m",
        description: "Explore diverse landscapes, forests and historic sites."
    },
    {
        id: 14,
        name: "Kashmir",
        category: "Mountain",
        image: "kashmir.jpeg",
        price: 14999,
        duration: "6h 00m",
        description: "Discover stunning mountain scenery and peaceful valleys."
    },
    {
        id: 15,
        name: "Kochi",
        category: "Coastal",
        image: "kochi.jpeg",
        price: 8999,
        duration: "4h 30m",
        description: "Explore historic streets, waterfronts and local food."
    },
    {
        id: 16,
        name: "Kodaikanal",
        category: "Mountain",
        image: "kodaikanal.jpg",
        price: 7999,
        duration: "4h 20m",
        description: "Enjoy misty hills, lakes and forest walks."
    },
    {
        id: 17,
        name: "Kolkata",
        category: "City",
        image: "kolkata.jpeg",
        price: 11999,
        duration: "5h 30m",
        description: "Experience art, colonial architecture and Bengali culture."
    },
    {
        id: 18,
        name: "Ladakh",
        category: "Mountain",
        image: "ladakh.jpeg",
        price: 18999,
        duration: "6h 00m",
        description: "Discover high-altitude landscapes and mountain passes."
    },
    {
        id: 19,
        name: "Lakshadweep",
        category: "Beach",
        image: "lakshadweep.jpeg",
        price: 16999,
        duration: "5h 30m",
        description: "Explore turquoise waters and tropical island scenery."
    },
    {
        id: 20,
        name: "Madurai",
        category: "Heritage",
        image: "madurai.jpg",
        price: 7999,
        duration: "4h 20m",
        description: "Discover ancient temples and Tamil cultural traditions."
    },
    {
        id: 21,
        name: "Manali",
        category: "Mountain",
        image: "manali.jpeg",
        price: 13999,
        duration: "5h 40m",
        description: "Enjoy mountain views, valleys and scenic landscapes."
    },
    {
        id: 22,
        name: "Mumbai",
        category: "City",
        image: "mumbai.jpeg",
        price: 9999,
        duration: "4h 50m",
        description: "Explore India's energetic financial and entertainment hub."
    },
    {
        id: 23,
        name: "Munnar",
        category: "Mountain",
        image: "munnar.jpg",
        price: 8999,
        duration: "4h 40m",
        description: "Walk through tea gardens and misty green hills."
    },
    {
        id: 24,
        name: "Mysuru",
        category: "Heritage",
        image: "mysuru.jpg",
        price: 7999,
        duration: "4h 20m",
        description: "Explore palaces, gardens and historic landmarks."
    },
    {
        id: 25,
        name: "Odisha",
        category: "Culture",
        image: "odisha.jpeg",
        price: 10999,
        duration: "5h 20m",
        description: "Discover temple architecture and beautiful coastlines."
    },
    {
        id: 26,
        name: "Ooty",
        category: "Mountain",
        image: "ooty.jpg",
        price: 8499,
        duration: "4h 30m",
        description: "Escape to cool weather, tea gardens and scenic hills."
    },
    {
        id: 27,
        name: "Pondicherry",
        category: "Coastal",
        image: "pondicherry.jpeg",
        price: 7499,
        duration: "4h 10m",
        description: "Enjoy seaside promenades and charming French-style streets."
    },
    {
        id: 28,
        name: "Rameswaram",
        category: "Heritage",
        image: "rameswaram.jpg",
        price: 8999,
        duration: "4h 30m",
        description: "Explore sacred landmarks and memorable coastal views."
    },
    {
        id: 29,
        name: "Rishikesh",
        category: "Adventure",
        image: "rishikesh.jpeg",
        price: 12999,
        duration: "5h 30m",
        description: "Discover river scenery and outdoor adventures."
    },
    {
        id: 30,
        name: "Shillong",
        category: "Mountain",
        image: "shillong.jpeg",
        price: 13999,
        duration: "5h 50m",
        description: "Explore green hills, waterfalls and peaceful scenery."
    },
    {
        id: 31,
        name: "Telangana",
        category: "Culture",
        image: "telangana.jpeg",
        price: 8999,
        duration: "4h 40m",
        description: "Experience historic monuments and regional traditions."
    },
    {
        id: 32,
        name: "Thanjavur",
        category: "Heritage",
        image: "thanjavur.jpeg",
        price: 7999,
        duration: "4h 20m",
        description: "Discover Chola architecture and Tamil heritage."
    },
    {
        id: 33,
        name: "Valparai",
        category: "Mountain",
        image: "valparai.jpeg",
        price: 8499,
        duration: "4h 30m",
        description: "Enjoy tea estates, forests and quiet mountain roads."
    },
    {
        id: 34,
        name: "Varkala",
        category: "Beach",
        image: "varkala.jpeg",
        price: 8999,
        duration: "4h 40m",
        description: "Relax beside coastal cliffs and beautiful beaches."
    },
    {
        id: 35,
        name: "Wayanad",
        category: "Nature",
        image: "wayanad.jpg",
        price: 9499,
        duration: "4h 50m",
        description: "Explore forests, waterfalls and green countryside."
    },
    {
        id: 36,
        name: "West Bengal",
        category: "Culture",
        image: "west bengal.jpeg",
        price: 11999,
        duration: "5h 30m",
        description: "Discover varied landscapes and regional traditions."
    },
    {
        id: 37,
        name: "Yercaud",
        category: "Mountain",
        image: "yercaud.jpeg",
        price: 7999,
        duration: "4h 30m",
        description: "Enjoy peaceful hill views, gardens and a scenic lake."
    }
];


/* =========================================
   HELPER FUNCTIONS
========================================= */

function formatPrice(price) {
    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0
    }).format(price);
}

function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, function (character) {
        const entities = {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        };

        return entities[character];
    });
}

/*
  Since app.js is in static/js/ and images are in static/images/,
  this relative URL works when the page is opened from templates/
  through VS Code Live Server.
*/
function getDestinationImagePath(filename) {
    return "../static/images/" + encodeURIComponent(filename);
}


/* =========================================
   RENDER DESTINATION CARDS
========================================= */

function renderDestinations(list = destinations, containerId = "destinationGrid") {
    const grid = document.getElementById(containerId);

    if (!grid) {
        return;
    }

    if (list.length === 0) {
        grid.innerHTML = `
            <div class="no-destinations">
                <h3>🌍 No destinations found</h3>
                <p>Try a different search or category.</p>
            </div>
        `;
        return;
    }

    grid.innerHTML = list.map(function (destination) {
        const imagePath = getDestinationImagePath(destination.image);

        return `
            <article
                class="destination-card"
                data-price="${destination.price}"
            >
                <div class="destination-image">
                    <img
                        src="${imagePath}"
                        alt="${escapeHTML(destination.name)}"
                        loading="lazy"
                        onerror="this.onerror=null; this.alt='Image unavailable: ${escapeHTML(destination.name)}'; this.parentElement.classList.add('image-missing');"
                    >
                </div>

                <div class="destination-info">

                    <span class="eyebrow">
                        ${escapeHTML(destination.category)}
                    </span>

                    <h3>${escapeHTML(destination.name)}</h3>

                    <p>${escapeHTML(destination.description)}</p>

                    <div class="destination-meta">
                        <span>🕒 ${escapeHTML(destination.duration)}</span>
                        <span>⭐ Popular destination</span>
                    </div>

                    <div class="destination-price">
                        ${formatPrice(destination.price)}
                        <span style="font-size:12px;font-weight:400;">
                            / person (demo)
                        </span>
                    </div>

                    <button
                        type="button"
                        class="btn btn-primary btn-block"
                        data-select-destination="${destination.id}"
                    >
                        Explore &amp; Book →
                    </button>

                </div>
            </article>
        `;
    }).join("");
}


/* =========================================
   SEARCH AND FILTER
========================================= */

function initDestinationSearch() {
    const form = document.getElementById("destinationSearchForm");
    const searchInput = document.getElementById("destinationSearch");
    const categorySelect = document.getElementById("destinationCategory");
    const sortSelect = document.getElementById("destinationSort");

    if (!form || !searchInput || !categorySelect) {
        return;
    }

    function filterDestinations(event) {
        if (event) {
            event.preventDefault();
        }

        const query = searchInput.value.trim().toLowerCase();
        const selectedCategory = categorySelect.value;

        let filtered = destinations.filter(function (destination) {
            const matchesSearch =
                destination.name.toLowerCase().includes(query) ||
                destination.description.toLowerCase().includes(query) ||
                destination.category.toLowerCase().includes(query);

            const matchesCategory =
                selectedCategory === "all" ||
                destination.category.toLowerCase() ===
                selectedCategory.toLowerCase();

            return matchesSearch && matchesCategory;
        });

        if (sortSelect && sortSelect.value === "low") {
            filtered.sort((a, b) => a.price - b.price);
        } else if (sortSelect && sortSelect.value === "high") {
            filtered.sort((a, b) => b.price - a.price);
        }

        renderDestinations(filtered);
    }

    form.addEventListener("submit", filterDestinations);
    searchInput.addEventListener("input", filterDestinations);
    categorySelect.addEventListener("change", filterDestinations);

    if (sortSelect) {
        sortSelect.addEventListener("change", filterDestinations);
    }

    // Read search filters from the homepage URL.
    const params = new URLSearchParams(window.location.search);

    if (params.has("search")) {
        searchInput.value = params.get("search");
    }

    if (params.has("category")) {
        const category = params.get("category");

        const validCategory = [...categorySelect.options].some(
            option => option.value.toLowerCase() === category.toLowerCase()
        );

        if (validCategory) {
            categorySelect.value = category;
        }
    }

    filterDestinations();
}
/* =========================================
   SELECT DESTINATION AND OPEN DETAILS
========================================= */

function initDestinationSelection() {
    document.addEventListener("click", function (event) {
        const button = event.target.closest("[data-select-destination]");

        if (!button) {
            return;
        }

        const destinationId = button.dataset.selectDestination;

        const selectedDestination = destinations.find(function (item) {
            return String(item.id) === String(destinationId);
        });

        if (!selectedDestination) {
            alert("Destination not found. Please try again.");
            return;
        }

        // Save the selected destination
        localStorage.setItem(
            "tg_selected_destination",
            JSON.stringify(selectedDestination)
        );

        // Open the destination details page
        window.location.href = "destination_detail.html";
    });
}


/* =========================================
   INITIALIZE PAGE
========================================= */

document.addEventListener("DOMContentLoaded", function () {
    renderDestinations();
    initDestinationSearch();
    initDestinationSelection();

    console.log("TravelGo destinations loaded:", destinations.length);
});