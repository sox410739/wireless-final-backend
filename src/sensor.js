const gcpDB = require('./database/gcpDB');

module.exports = {
    /**
     * POST
     * 註冊 sensor
     * body {
     *      UID (required), name
     * }
     */
    async signUp(req, res) {
        try {

            if (!req?.body?.UID) {
                throw _errorFormat(400, NO_SENSOR_UID)
            }
        } catch (error) {

            console.log(error);
            res.status(error.error.code).json(error);
            return;
        }
        
        let sensorUID = req.body.UID;
        let sensorName = req.body.name? req.body.name: '';
        
        try {

            let SQL = `INSERT INTO wireless_final.sensor (UID, name)
            VALUES (?, ?) `;
            params = [sensorUID, sensorName];
            
            await gcpDB.query(SQL, params);
            res.send('sign up successfully');
        } catch (error) {

            console.log(error);
            res.status(403).json( _errorFormat(403, 'SENSOR_HAD_BEEN_REGISTED') );
        }
    },


    /**
     * POST
     * GPS定位資料上傳
     */
    async sensorDataUpload(req, res) {
        if (!req.params.sensorUID || !req.body.latitude || !req.body.longitude) {
            res.status(400).json( _errorFormat(400, 'NEED_REQUIRED_ARGUMENTS') );
            return;
        }

        let sensorUID = req.params.sensorUID;
        let latitude = parseFloat(req.body.latitude);
        let longitude = parseFloat(req.body.longitude);

        if (isNaN(latitude) || latitude > 90 || latitude < -90) {
            res.status(400).json( _errorFormat(400, 'LAITUDE_FORMAT_ERROR') );
            return;
        }

        if (isNaN(longitude) || longitude > 90 || longitude < -90) {
            res.status(400).json( _errorFormat(400, 'LONGITUDE_FORMAT_ERROR') );
            return;
        }

        try {

            let SQL = `INSERT INTO wireless_final.sensor_history
            (sensor_UID, latitude, longitude, uploaded_at)
            VALUES (?, ?, ?, ?) `;
            let params = [sensorUID, latitude, longitude, new Date()];

            await gcpDB.query(SQL, params);
            res.send('gps data upload successfully');
        } catch (error) {

            console.log(error);
            if (error.errno === 1452) res.status(403).json( _errorFormat(403, 'SENSOR_HAS_NOT_REGIST') );
            else res.status(500).json( _errorFormat(500, 'DB_ERROR') );
        }
    }
}



function _errorFormat(code, message) {
    return {
        error: {
            code,
            message
        }
    }
}