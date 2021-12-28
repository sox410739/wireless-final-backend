const axios = require('axios');
const GOOGLE_APIKEY = require('../config').googleApiKey;

module.exports = async function(origins, destinations, mode='walking') {
    let config = {
        method: 'GET',
        url: 'https://maps.googleapis.com/maps/api/distancematrix/json',
        params: {
            origins,
            destinations,
            key: GOOGLE_APIKEY,
            language: 'zh-TW',
            mode
        }
    }

    let result = await axios(config);
    return result.data;
}