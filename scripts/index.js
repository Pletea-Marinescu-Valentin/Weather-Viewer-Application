"use strict";

const API = "141c20f93839284778e4f1e3b2aeaafa";

const PEXELS_API_KEY =
  "FQK8wZQXuclOXBtUIMqLkqO1TDi1BqAqm46FB3s0TlcugocfDZgegI3z";
const pexelsEndpoint = "https://api.pexels.com/v1/search?query=";

const dayEl = document.querySelector(".default_day");
const dateEl = document.querySelector(".default_date");
const btnEl = document.querySelector(".btn_search");
const inputEl = document.querySelector(".input_field");

const iconsContainer = document.querySelector(".icons");
const dayInfoEl = document.querySelector(".day_info");
const listContentEl = document.querySelector(".list_content ul");

const days = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

const day = new Date();
const dayName = days[day.getDay()];
dayEl.textContent = dayName;

let month = day.toLocaleString("default", { month: "long" });
let date = day.getDate();
let year = day.getFullYear();

console.log();
dateEl.textContent = date + " " + month + " " + year;

btnEl.addEventListener("click", (e) => {
  e.preventDefault();

  if (inputEl.value !== "") {
    const Search = inputEl.value;
    inputEl.value = "";
    findLocation(Search);
  } else {
    console.log("Please Enter City or Country Name");
  }
});

window.addEventListener("load", (event) => {
  const loadingSpinner = document.querySelector(".loading-spinner");
  loadingSpinner.classList.add("hidden");
});

const listContentContainer = document.querySelector(".list_content");

async function findLocation(name) {
  const loadingSpinner = document.querySelector(".loading-spinner");
  loadingSpinner.classList.remove("hidden");

  iconsContainer.innerHTML = "";
  dayInfoEl.innerHTML = "";
  listContentEl.innerHTML = "";
  try {
    const API_URL = `https://api.openweathermap.org/data/2.5/weather?q=${name}&appid=${API}`;
    const data = await fetch(API_URL);
    const result = await data.json();

    const pexelsURL = `${pexelsEndpoint}${name}`;
    const pexelsData = await fetch(pexelsURL, {
      headers: {
        Authorization: PEXELS_API_KEY,
      },
    });
    const pexelsResult = await pexelsData.json();
    const cityImageURL = pexelsResult.photos[0].src.large;
    document.body.style.backgroundImage = `url(${cityImageURL})`;

    console.log(result);

    if (result.cod !== "404") {
      const ImageContent = displayImageContent(result);

      const rightSide = rightSideContent(result);

      displayForeCast(result.coord.lat, result.coord.lon);

      setTimeout(() => {
        iconsContainer.insertAdjacentHTML("afterbegin", ImageContent);
        iconsContainer.classList.add("fadeIn");
        dayInfoEl.insertAdjacentHTML("afterbegin", rightSide);
        loadingSpinner.classList.add("hidden");
        listContentContainer.style.display = "block";
      }, 1500);
    } else {
      const errorMessage = `<h2 class="weather_temp">City not found</h2>
        <h3 class="cloudtxt">Please enter a valid city name</h3>`;
      iconsContainer.innerHTML = errorMessage;
      loadingSpinner.classList.add("hidden");
    }
  } catch (error) {
    const errorMessage = `<h2 class="weather_temp">Error</h2>
    <h3 class="cloudtxt">There was an error fetching data</h3>`;
    iconsContainer.innerHTML = errorMessage;
    loadingSpinner.classList.add("hidden");
  }
}

function displayImageContent(data) {
  return `<img src="https://openweathermap.org/img/wn/${
    data.weather[0].icon
  }@4x.png" alt="" />
    <h2 class="weather_temp">${Math.round(data.main.temp - 275.15)}°C</h2>
    <h3 class="cloudtxt">${data.weather[0].description}</h3>`;
}

function rightSideContent(result) {
  return `<div class="content">
          <p class="title">NAME</p>
          <div class="content-name">
            <span class="value">${result.name}</span>
            <button class="favorite-btn" onclick="addToFavorites('${
              result.name
            }')">❤️</button>
          </div>
        </div>
        <div class="content">
          <p class="title">TEMP</p>
          <span class="value">${Math.round(result.main.temp - 275.15)}°C</span>
        </div>
        <div class="content">
          <p class="title">HUMIDITY</p>
          <span class="value">${result.main.humidity}%</span>
        </div>
        <div class="content">
          <p class="title">WIND SPEED</p>
          <span class="value">${result.wind.speed} Km/h</span>
        </div>`;
}

let favoriteCities = [];

// Save favorites to localStorage
function saveFavorites() {
  localStorage.setItem("favoriteCities", JSON.stringify(favoriteCities));
}

// Load favorites from localStorage
function loadFavorites() {
  const storedFavorites = localStorage.getItem("favoriteCities");
  if (storedFavorites) {
    favoriteCities = JSON.parse(storedFavorites);
    displayFavorites();
  }
}

// Modify addToFavorites to save to localStorage
function addToFavorites(cityName) {
  if (!favoriteCities.includes(cityName)) {
    favoriteCities.push(cityName);
    saveFavorites();
    displayFavorites();
  }
}

function displayFavorites() {
  const favoritesList = document.querySelector(".favorites-list");
  favoritesList.innerHTML = "";

  favoriteCities.forEach((city) => {
    const listItem = document.createElement("li");
    listItem.textContent = city;
    listItem.addEventListener("click", () => findLocation(city));
    favoritesList.appendChild(listItem);
  });
}

displayFavorites();

// Add unit conversion toggle
let isCelsius = true;

function toggleUnit() {
  isCelsius = !isCelsius;
  const tempElements = document.querySelectorAll(".weather_temp, .day_temp");
  tempElements.forEach((el) => {
    const temp = parseFloat(el.textContent);
    el.textContent = isCelsius
      ? `${Math.round((temp - 32) * (5 / 9))}°C`
      : `${Math.round(temp * (9 / 5) + 32)}°F`;
  });
}

// Add event listener for unit toggle
document.addEventListener("DOMContentLoaded", () => {
  const unitToggleBtn = document.createElement("button");
  unitToggleBtn.textContent = "Toggle °C/°F";
  unitToggleBtn.className = "unit-toggle-btn";
  unitToggleBtn.addEventListener("click", toggleUnit);
  document.body.appendChild(unitToggleBtn);

  loadFavorites(); // Load favorites on page load
});

async function displayForeCast(lat, long) {
  const ForeCast_API = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${long}&appid=${API}`;
  const data = await fetch(ForeCast_API);
  const result = await data.json();
  const uniqeForeCastDays = [];
  const daysForecast = result.list.filter((forecast) => {
    const forecastDate = new Date(forecast.dt_txt).getDate();
    if (!uniqeForeCastDays.includes(forecastDate)) {
      return uniqeForeCastDays.push(forecastDate);
    }
  });
  const reversedDaysForecast = daysForecast.reverse();

  console.log(reversedDaysForecast);

  reversedDaysForecast.forEach((content, indx) => {
    if (indx <= 4) {
      listContentEl.insertAdjacentHTML("afterbegin", forecast(content));
    }
  });
}

function forecast(frContent) {
  const day = new Date(frContent.dt_txt);
  const dayName = days[day.getDay()];
  const splitDay = dayName.split("", 3);
  const joinDay = splitDay.join("");

  return `<li>
  <img src="https://openweathermap.org/img/wn/${
    frContent.weather[0].icon
  }@2x.png" />
  <span>${joinDay}</span>
  <span class="day_temp">${Math.round(frContent.main.temp - 275.15)}°C</span>
</li>`;
}
