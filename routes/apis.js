var express = require('express');
var router = express.Router();
const sensor = require('../src/sensor');

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.post('/sensor-sign-up', sensor.signUp);
router.get('/sensors', sensor.getSensors);
router.delete('/sensors/:sensorUID', sensor.deleteSensor);
router.post('/sensors/:sensorUID/gps-data', sensor.sensorDataUpload);
router.get('/sensors/history', sensor.getHistory);

router.get('/test', (req, res) => {
  res.send('ok');
})

module.exports = router;
