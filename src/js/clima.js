const apiKey = "65f698452048880cbff39647a7b9b8e5";

const cityInput = document.querySelector("#city-input");
const searchBtn = document.querySelector("#search");

const cityElement = document.querySelector("#city");
const tempElement = document.querySelector("#temperature span");
const descElement = document.querySelector("#description");
const weatherIconElement = document.querySelector("#weather-icon");
const countryElement = document.querySelector("#country");
const umidityElement = document.querySelector("#umidity span");
const windElement = document.querySelector("#wind span");

const tempMaxElement = document.querySelector("#temp-max span");
const tempMinElement = document.querySelector("#temp-min span");
const feelsLikeElement = document.querySelector("#feels-like span");

const weatherContainer = document.querySelector("#weather-data");
const suggestionsContainer = document.querySelector("#suggestions-container");

const errorMessage = document.querySelector("#error-message");
const loader = document.querySelector("#loader");

let map = null;
let marker = null;

const showLoader = () => {
    loader.classList.remove("hide");
};

const hideLoader = () => {
    loader.classList.add("hide");
};

const hideError = () => {
    errorMessage.classList.add("hide");
};

const getWeatherData = async(city, lat = null, lon = null) => {
    showLoader();
    let apiWeatherURL;

    if (lat !== null && lon !== null) {
        apiWeatherURL = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}&lang=pt_br`;
    } else {
        apiWeatherURL = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${apiKey}&lang=pt_br`;
    }

    const res = await fetch(apiWeatherURL);
    const data = await res.json();

    hideLoader();

    if (data.cod === "404") {
        throw new Error("Cidade não encontrada.");
    }

    console.log(data);
    return data;
};

const initializeOrUpdateMap = (lat, lon) => {
    const mapDiv = document.querySelector("#map");
    mapDiv.classList.remove("hide");

    if (!map) {
        map = L.map("map").setView([lat, lon], 10);
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            attribution: '&copy; OpenStreetMap contributors'
        }).addTo(map);
        marker = L.marker([lat, lon]).addTo(map);
    } else {
        map.setView([lat, lon], 10);
        marker.setLatLng([lat, lon]);
    }
    marker.bindPopup(cityElement.innerText).openPopup();

    setTimeout(() => {
        map.invalidateSize();
    }, 100);
};


const showWeatherData = async (city, lat = null, lon = null) => {
    hideError();
    weatherContainer.classList.add("hide");
    document.querySelector("#map").classList.add("hide"); 
    
    try {
        const data = await getWeatherData(city, lat, lon);
        
        initializeOrUpdateMap(data.coord.lat, data.coord.lon);
        cityElement.innerText = data.name;
        var country = data.sys.country.toLowerCase();
        countryElement.setAttribute(
            "src",
            `https://flagcdn.com/16x12/${country}.png`
        );
        tempElement.innerText = parseInt(data.main.temp);
        descElement.innerText = data.weather[0].description;
        weatherIconElement.setAttribute(
            "src",
            `https://openweathermap.org/img/wn/${data.weather[0].icon}.png`
        );
        umidityElement.innerText = parseInt(data.main.humidity) + "%";
        windElement.innerText = parseFloat(data.wind.speed) + " km/h";

        tempMaxElement.innerText = parseInt(data.main.temp_max);
        tempMinElement.innerText = parseInt(data.main.temp_min);
        feelsLikeElement.innerText = parseInt(data.main.feels_like);

        weatherContainer.classList.remove("hide");

    } catch (error) {
        errorMessage.classList.remove("hide");
        weatherContainer.classList.add("hide");
        document.querySelector("#map").classList.add("hide"); 
        console.error("Erro ao buscar dados do clima:", error);
    }
};

let debounceTimer;

const getCitySuggestions = async (query) => {
    const apiGeocodingURL = `http://api.openweathermap.org/geo/1.0/direct?q=${query}&limit=5&appid=${apiKey}`;

    try {
        const res = await fetch(apiGeocodingURL);
        const data = await res.json();
        return data;
    } catch (error) {
        console.error("Erro ao buscar sugestões de cidade:", error);
        return [];
    }
};

const displaySuggestions = (suggestions) => {
    suggestionsContainer.innerHTML = "";

    if (suggestions.length === 0) {
        suggestionsContainer.classList.add("hide");
        return;
    }

    suggestionsContainer.classList.remove("hide");

    suggestions.forEach(city => {
        const suggestionItem = document.createElement("div");
        suggestionItem.classList.add("suggestion-item");

        let cityName = city.name;
        if (city.state) {
            cityName += `, ${city.state}`;
        }
        cityName += `, ${city.country}`;
        suggestionItem.innerText = cityName;

        suggestionItem.addEventListener("click", () => {
            cityInput.value = city.name; 
            suggestionsContainer.classList.add("hide");
            showWeatherData(city.name, city.lat, city.lon); 
        });

        suggestionsContainer.appendChild(suggestionItem);
    });
};

searchBtn.addEventListener("click", (e) => {
    e.preventDefault();
    suggestionsContainer.classList.add("hide");
    const city = cityInput.value;
    showWeatherData(city);
});

cityInput.addEventListener("input", (e) => {
    const query = e.target.value.trim();

    weatherContainer.classList.add("hide");
    errorMessage.classList.add("hide");
    document.querySelector("#map").classList.add("hide"); 

    clearTimeout(debounceTimer);

    if (query.length < 3) {
        suggestionsContainer.innerHTML = "";
        suggestionsContainer.classList.add("hide");
        return;
    }

    debounceTimer = setTimeout(async () => {
        const suggestions = await getCitySuggestions(query);
        displaySuggestions(suggestions);
    }, 500);

});

cityInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
        e.preventDefault();
        suggestionsContainer.classList.add("hide");
        const city = cityInput.value;
        showWeatherData(city);
    }
});

document.addEventListener("click", (e) => {
    if (!cityInput.contains(e.target) && !suggestionsContainer.contains(e.target)) {
        suggestionsContainer.classList.add("hide");
    }
});