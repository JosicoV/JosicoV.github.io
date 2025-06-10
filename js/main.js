const OPENWEATHERMAP_API_KEY = '16d605f9f71a75eeb8e927bd8ed6550d'; // <-- ¡REEMPLAZA ESTO!

document.addEventListener('DOMContentLoaded', () => {
    const userLocalTimeElem = document.querySelector('#user-me-info #user-local-time');
    const myLocalTimeElem = document.querySelector('#user-me-info #my-local-time');
    
    const myWeatherIconElem = document.querySelector('#user-me-info #my-weather-icon');
    const userWeatherIconElem = document.querySelector('#user-me-info #user-weather-icon');

    // const codeInfoTextElem = document.querySelector('.code-info-text'); 

    // --- Funciones para la hora ---
    function updateUserLocalTime() {
        if (userLocalTimeElem) {
            const now = new Date();
            userLocalTimeElem.textContent = now.toLocaleTimeString();
        }
    }

    function updateMyLocalTime() {
        if (myLocalTimeElem) {
            const now = new Date();
            // Ejemplo: Hora en Madrid (España)
            const options = { timeZone: 'Europe/Madrid', hour: '2-digit', minute: '2-digit', second: '2-digit' };
            try {
                myLocalTimeElem.textContent = now.toLocaleTimeString('es-ES', options);
            } catch (e) {
                // Fallback si la timezone no es reconocida o Intl no está completamente soportado
                myLocalTimeElem.textContent = "Error al obtener hora";
                console.error("Error formatting time for Madrid:", e);
            }
        }
    }

    // if (codeInfoTextElem) {
    //     codeInfoTextElem.textContent = "Hecho con HTML, CSS y JS. Ver código:";
    // }


    // Actualizar horas inicialmente
    updateUserLocalTime();
    updateMyLocalTime();

    // Actualizar cada segundo
    setInterval(() => {
        updateUserLocalTime();
        updateMyLocalTime();
    }, 1000);

    // --- Funciones para el Tiempo Meteorológico ---
    function getWeatherIcon(weatherMain) {
        // Mapeo simple de condiciones principales a iconos emoji
        // Puedes expandir esto basado en: https://openweathermap.org/weather-conditions
        switch (weatherMain) {
            case 'Clear': return '☀️';
            case 'Clouds': return '☁️';
            case 'Rain': return '🌧️';
            case 'Drizzle': return '🌦️';
            case 'Thunderstorm': return '⛈️';
            case 'Snow': return '❄️';
            case 'Mist': case 'Smoke': case 'Haze': case 'Dust':
            case 'Fog': case 'Sand': case 'Ash': case 'Squall': case 'Tornado':
                return '🌫️';
            default: return '❓'; // Icono para desconocido o no mapeado
        }
    }

    async function fetchWeather(lat, lon, iconElement) {
        if (!OPENWEATHERMAP_API_KEY || OPENWEATHERMAP_API_KEY === 'TU_API_KEY_DE_OPENWEATHERMAP') {
            console.warn("API Key de OpenWeatherMap no configurada. Los iconos del tiempo no se actualizarán.");
            if (iconElement) iconElement.textContent = '🔑'; // Indica problema de API Key
            return;
        }
        if (!iconElement) return;

        const apiUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${OPENWEATHERMAP_API_KEY}&units=metric&lang=es`;

        try {
            const response = await fetch(apiUrl);
            if (!response.ok) {
                throw new Error(`Error API del tiempo! Estado: ${response.status}`);
            }
            const data = await response.json();
            if (data.weather && data.weather.length > 0) {
                const weatherMain = data.weather[0].main; // Ej: "Clear", "Clouds"
                const weatherDescription = data.weather[0].description;
                const temp = data.main.temp;
                iconElement.textContent = getWeatherIcon(weatherMain);
                iconElement.title = `${weatherDescription}, ${temp.toFixed(1)}°C`; // Info extra al pasar el ratón
            } else {
                iconElement.textContent = '🤷'; // No hay datos del tiempo
            }
        } catch (error) {
            console.error("Error al obtener el tiempo:", error);
            iconElement.textContent = '⚠️'; // Icono de error
        }
    }

    // Obtener mi tiempo (ej. Madrid: lat 40.4168, lon -3.7038)
    const myLat = 40.4168;
    const myLon = -3.7038;
    if (myWeatherIconElem) {
        fetchWeather(myLat, myLon, myWeatherIconElem);
    }

    // Obtener tiempo del usuario (requiere permiso de geolocalización)
    // (Esta parte se moverá dentro del bloque de geolocalización)


    // --- Lógica para mostrar el código CSS en el visor ---
    const cssCodeViewPre = document.querySelector('#css-code-view pre code');
    const cssToggleLink = Array.from(document.querySelectorAll('.toggle-code-link')).find(a => a.getAttribute('href') === '#css-code-view');

    async function fetchAndDisplayCssCode() {
        if (cssCodeViewPre) {
            try {
                const response = await fetch('css/styles.css'); // Ruta a tu archivo CSS
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                let text = await response.text();
                // Escapar HTML para visualización segura
                text = text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
                cssCodeViewPre.innerHTML = text;
            } catch (error) {
                cssCodeViewPre.textContent = `Error al cargar el código CSS: ${error.message}`;
                console.error("Error fetching CSS code:", error);
            }
        }
    }
    if (cssToggleLink) fetchAndDisplayCssCode(); // Cargar al inicio si el visor está preparado

    // --- Lógica para mostrar el código JS en el visor ---
    const jsCodeViewPre = document.querySelector('#js-code-view pre code');
    const jsToggleLink = Array.from(document.querySelectorAll('.toggle-code-link')).find(a => a.getAttribute('href') === '#js-code-view');

    async function fetchAndDisplayJsCode() {
        if (jsCodeViewPre) {
            try {
                // Añadimos { cache: 'no-store' } para intentar evitar problemas de caché al cargar el propio script
                const response = await fetch('js/main.js', { cache: 'no-store' });
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status} al intentar cargar main.js`);
                }
                let text = await response.text();

                if (text.trim() === "") {
                    jsCodeViewPre.textContent = "[El contenido de main.js parece estar vacío o no se pudo leer correctamente.]";
                    console.warn("El contenido obtenido de main.js para el visor está vacío o solo contiene espacios en blanco.");
                    return; 
                }

                // Escapar HTML para visualización segura
                text = text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
                jsCodeViewPre.innerHTML = text;
            } catch (error) {
                jsCodeViewPre.textContent = `Error al cargar el código JS: ${error.message}`;
                console.error("Error fetching JS code:", error);
            }
        } else {
            console.error("Elemento 'pre code' dentro de #js-code-view no encontrado. Verifica el HTML.");
        }
    }
    

    if (jsToggleLink) fetchAndDisplayJsCode(); // Cargar al inicio si el visor está preparado

    // --- Obtener tiempo del usuario usando Geolocalización ---
    if (userWeatherIconElem && navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const userLat = position.coords.latitude;
                const userLon = position.coords.longitude;
                fetchWeather(userLat, userLon, userWeatherIconElem);
            },
            (error) => {
                console.error("Error al obtener la ubicación del usuario:", error.message);
                userWeatherIconElem.textContent = '📍'; // Icono de error de ubicación/permiso denegado
                // Opcional: mostrar tiempo de una ciudad por defecto si se deniega la ubicación
                // fetchWeather(LAT_POR_DEFECTO, LON_POR_DEFECTO, userWeatherIconElem);
            }
        );
    } else if (userWeatherIconElem) {
        console.warn("Geolocalización no soportada por este navegador o elemento no encontrado.");
        userWeatherIconElem.textContent = '🚫'; // Geolocalización no soportada
    }
});