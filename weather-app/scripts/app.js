const API_KEY = 'your_api_key_here'; // You'll need to get a free API key from OpenWeatherMap
const BASE_URL = 'https://api.openweathermap.org/data/2.5';

// DOM Elements
const cityInput = document.getElementById('city-input');
const searchBtn = document.getElementById('search-btn');
const locationBtn = document.getElementById('location-btn');
const weatherCard = document.getElementById('weather-card');
const forecastCards = document.getElementById('forecast-cards');
const errorMessage = document.getElementById('error-message');

// Elements to update
const cityName = document.getElementById('city-name');
const currentDate = document.getElementById('current-date');
const temp = document.getElementById('temp');
const humidity = document.getElementById('humidity');
const windSpeed = document.getElementById('wind-speed');
const pressure = document.getElementById('pressure');
const weatherImg = document.getElementById('weather-img');
const weatherDesc = document.getElementById('weather-desc');

// Event Listeners
searchBtn.addEventListener('click', searchWeather);
locationBtn.addEventListener('click', getLocationWeather);
cityInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        searchWeather();
    }
});

// Set current date
function setCurrentDate() {
    const now = new Date();
    const options = { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    };
    currentDate.textContent = now.toLocaleDateString('en-US', options);
}

// Search weather by city name
async function searchWeather() {
    const city = cityInput.value.trim();
    if (!city) return;

    try {
        const weatherData = await getWeatherData(city);
        const forecastData = await getForecastData(city);
        
        displayWeather(weatherData);
        displayForecast(forecastData);
        hideError();
    } catch (error) {
        showError();
    }
}

// Get weather by user's location
function getLocationWeather() {
    if (!navigator.geolocation) {
        alert('Geolocation is not supported by your browser');
        return;
    }

    navigator.geolocation.getCurrentPosition(
        async (position) => {
            const { latitude, longitude } = position.coords;
            try {
                const weatherData = await getWeatherByCoords(latitude, longitude);
                const forecastData = await getForecastByCoords(latitude, longitude);
                
                displayWeather(weatherData);
                displayForecast(forecastData);
                hideError();
            } catch (error) {
                showError();
            }
        },
        (error) => {
            alert('Unable to retrieve your location');
        }
    );
}

// API calls
async function getWeatherData(city) {
    const response = await fetch(
        `${BASE_URL}/weather?q=${city}&units=metric&appid=${API_KEY}`
    );
    
    if (!response.ok) {
        throw new Error('City not found');
    }
    
    return await response.json();
}

async function getForecastData(city) {
    const response = await fetch(
        `${BASE_URL}/forecast?q=${city}&units=metric&appid=${API_KEY}`
    );
    
    if (!response.ok) {
        throw new Error('Forecast not available');
    }
    
    return await response.json();
}

async function getWeatherByCoords(lat, lon) {
    const response = await fetch(
        `${BASE_URL}/weather?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`
    );
    return await response.json();
}

async function getForecastByCoords(lat, lon) {
    const response = await fetch(
        `${BASE_URL}/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`
    );
    return await response.json();
}

// Display weather data
function displayWeather(data) {
    cityName.textContent = `${data.name}, ${data.sys.country}`;
    temp.textContent = Math.round(data.main.temp);
    humidity.textContent = `${data.main.humidity}%`;
    windSpeed.textContent = `${data.wind.speed} km/h`;
    pressure.textContent = `${data.main.pressure} hPa`;
    weatherDesc.textContent = data.weather[0].description;
    
    const iconCode = data.weather[0].icon;
    weatherImg.src = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
    weatherImg.alt = data.weather[0].description;
}

// Display forecast data
function displayForecast(data) {
    const dailyForecasts = getDailyForecasts(data.list);
    
    forecastCards.innerHTML = dailyForecasts.map(day => `
        <div class="forecast-card">
            <div class="forecast-date">${formatDate(day.dt)}</div>
            <img src="https://openweathermap.org/img/wn/${day.weather[0].icon}.png" 
                 alt="${day.weather[0].description}">
            <div class="forecast-temp">${Math.round(day.main.temp)}°C</div>
            <div class="forecast-desc">${day.weather[0].description}</div>
        </div>
    `).join('');
}

// Helper functions
function getDailyForecasts(forecastList) {
    const forecasts = [];
    const seenDates = new Set();
    
    for (const forecast of forecastList) {
        const date = new Date(forecast.dt * 1000).toDateString();
        if (!seenDates.has(date) && forecasts.length < 5) {
            seenDates.add(date);
            forecasts.push(forecast);
        }
    }
    
    return forecasts;
}

function formatDate(timestamp) {
    const date = new Date(timestamp * 1000);
    return date.toLocaleDateString('en-US', { weekday: 'short' });
}

function showError() {
    errorMessage.style.display = 'block';
}

function hideError() {
    errorMessage.style.display = 'none';
}

// Initialize
setCurrentDate();

// Demo data for when no API key is provided
function loadDemoData() {
    cityName.textContent = 'New York, US';
    currentDate.textContent = new Date().toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });
    temp.textContent = '22';
    humidity.textContent = '65%';
    windSpeed.textContent = '15 km/h';
    pressure.textContent = '1013 hPa';
    weatherDesc.textContent = 'clear sky';
    weatherImg.src = 'https://openweathermap.org/img/wn/01d@2x.png';
    
    // Demo forecast
    forecastCards.innerHTML = `
        <div class="forecast-card">
            <div class="forecast-date">Mon</div>
            <img src="https://openweathermap.org/img/wn/01d.png" alt="clear sky">
            <div class="forecast-temp">22°C</div>
            <div class="forecast-desc">clear sky</div>
        </div>
        <div class="forecast-card">
            <div class="forecast-date">Tue</div>
            <img src="https://openweathermap.org/img/wn/02d.png" alt="few clouds">
            <div class="forecast-temp">20°C</div>
            <div class="forecast-desc">few clouds</div>
        </div>
        <div class="forecast-card">
            <div class="forecast-date">Wed</div>
            <img src="https://openweathermap.org/img/wn/03d.png" alt="scattered clouds">
            <div class="forecast-temp">19°C</div>
            <div class="forecast-desc">scattered clouds</div>
        </div>
        <div class="forecast-card">
            <div class="forecast-date">Thu</div>
            <img src="https://openweathermap.org/img/wn/10d.png" alt="light rain">
            <div class="forecast-temp">18°C</div>
            <div class="forecast-desc">light rain</div>
        </div>
        <div class="forecast-card">
            <div class="forecast-date">Fri</div>
            <img src="https://openweathermap.org/img/wn/01d.png" alt="clear sky">
            <div class="forecast-temp">23°C</div>
            <div class="forecast-desc">clear sky</div>
        </div>
    `;
}

// Load demo data initially (remove this when you add your API key)
loadDemoData();
