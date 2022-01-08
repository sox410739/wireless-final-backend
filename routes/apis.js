var express = require('express');
var router = express.Router();
const sensor = require('../src/sensor');
const weather = require('../src/weather');

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.post('/sensor-sign-up', sensor.signUp);
router.get('/sensors', sensor.getSensors);
router.delete('/sensors/:sensorUID', sensor.deleteSensor);
router.post('/sensors/:sensorUID/gps-data', sensor.sensorDataUpload);
router.get('/sensors/:sensorUID/battery', sensor.getBattery);
router.get('/sensors/:sensorUID/distance', sensor.getDistance);
router.get('/sensors/:sensorUID/location', sensor.getLocation);
router.get('/sensors/:sensorUID/footprint', sensor.getFootPrint);
router.get('/sensors/history', sensor.getHistory);

router.get('/weather', weather.getWheather);

router.get('/test', (req, res) => {
  res.send('ok');
})

module.exports = router;
