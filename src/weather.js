const axios = require('axios');
const WEATHER_API_KEY = require('../config').weatherApiKey;

async function getWheather(req, res) {
    try {
        let latitude = req.query.latitude;
        let longitude = req.query.longitude;

        if (!latitude || !longitude) {
            res.status(400).json( _errorFormat(400, 'NEED_REQUIRED_ARGUMENTS') );
            return;
        }

        let weatherRes = await callWeatherApi(latitude, longitude);
        let weatherData = weatherRes.data;

        res.json({
            weather: weatherData.weather[0].description,
            temperature: weatherData.main.temp,
            icon: `http://openweathermap.org/img/w/${weatherData.weather[0].icon}.png`
        });



    } catch (error) {
        console.log(error);
        res.status(500).json( _errorFormat(500, 'INTERNAL_ERROR') );
    }
}

module.exports = {
    getWheather
}


function callWeatherApi(lat, lon) {
    let config = {
        method: 'GET',
        url: 'https://api.openweathermap.org/data/2.5/weather',
        params: {
            lat,
            lon,
            appid: WEATHER_API_KEY,
            lang: 'zh_tw',
            units: 'metric'
        }
    }
    return axios(config);
}

/**
 * 直線距離
 * @returns 
 */
function getDistance(x1, y1, x2, y2) {
    let x = x1 - x2;
    let y = y1 - y2;

    return Math.sqrt(x*x + y*y);
}

function _errorFormat(code, message) {
    return {
        error: {
            code,
            message
        }
    }
}

