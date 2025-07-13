//api key e teste http
//https://api.openweathermap.org/data/2.5/lat=33.44&lon=-94.04&appid=65f698452048880cbff39647a7b9b8e5
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

const weatherContainer = document.querySelector("weather-data");

const getWeatherData = async(city) => {
    const apiWeatherURL = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${apiKey}&lang=pt_br`;

    const res = await fetch(apiWeatherURL);
    const data = await res.json();

    console.log(data);
    return data;
};

const showWeatherData = async (city) => {
    const data = await getWeatherData(city);

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

    weatherContainer.classList.remove("hide");
};

searchBtn.addEventListener("click", (e) =>{
    e.preventDefault();

    const city = cityInput.value;
    showWeatherData(city);

    // console.log(city);
});