// src/js/mapa.js

let map = null; // Variável para armazenar a instância do mapa
let currentMarker = null; // Variável para armazenar o marcador atual

/**
 * Inicializa o mapa Leaflet no elemento #globe-container.
 * Se o mapa já existir, ele é retornado.
 * @returns {L.Map} A instância do mapa.
 */
export function initMap() {
    if (map === null) {
        // Certifica-se de que o elemento do mapa está visível antes de inicializar
        const globeContainer = document.querySelector("#globe-container");
        if (globeContainer) {
            globeContainer.classList.remove("hide"); // Remove a classe 'hide' se estiver presente
        }

        map = L.map('globe-container').setView([0, 0], 2); // Inicia com um centro genérico e zoom baixo
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map);
    }
    return map;
}

/**
 * Adiciona ou atualiza um marcador no mapa e centraliza a visualização.
 * @param {number} lat Latitude.
 * @param {number} lon Longitude.
 * @param {string} popupText Texto para o pop-up do marcador.
 */
export function updateMapLocation(lat, lon, popupText = "Local do clima") {
    const mapInstance = initMap(); // Garante que o mapa esteja inicializado

    const newLatLng = L.latLng(lat, lon);

    // Remove o marcador existente, se houver
    if (currentMarker) {
        mapInstance.removeLayer(currentMarker);
    }

    // Adiciona um novo marcador
    currentMarker = L.marker(newLatLng).addTo(mapInstance)
        .bindPopup(popupText)
        .openPopup(); // Abre o pop-up automaticamente

    // Centraliza e ajusta o zoom para o novo local
    mapInstance.setView(newLatLng, 13); // Zoom 13 é um bom nível para ver a área da cidade
}

/**
 * Esconde o contêiner do mapa.
 */
export function hideMap() {
    const globeContainer = document.querySelector("#globe-container");
    if (globeContainer) {
        globeContainer.classList.add("hide");
    }
    // Não destrói o mapa, apenas o esconde para reutilização
}