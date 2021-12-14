const gcpDB = require('./database/gcpDB');
const moment = require('moment-timezone');

module.exports = {
    
    async getSensors(req, res) {
        try {
            let SQL = `SELECT * from wireless_final.sensor `;
            let params = [];
            
            let result = await gcpDB.query(SQL, params);
            
            res.json(result);
            
        } catch (error) {
            console.log(error);
            res.status(500).json( _errorFormat(500, 'INTERNAL_ERROR') );
        }
    },
    
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
                throw _errorFormat(400, 'NO_SENSOR_UID')
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
        
        if (isNaN(longitude) || longitude > 180 || longitude < -180) {
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
    }, 

    /**
     * GET
     * 獲得歷史觀測紀錄
     */
    async getHistory(req, res) {
        try {
            let limit = parseInt(req.query.limit) || 5;
            let SQL = `SELECT * from wireless_final.sensor_history
            ORDER BY uploaded_at DESC 
            LIMIT ?`;
            let params = [limit];

            let result = await gcpDB.query(SQL, params);
            for (let data of result) {
                data.uploaded_at = moment.tz(data.uploaded_at, 'Asia/Taipei').format('YYYY-MM-DD HH:mm:ss');
            }
            res.json(result);
        } catch (error) {
            console.log(error);
            res.status(500).json( _errorFormat(500, 'DB_ERROR') );
        }
    },

    async deleteSensor(req, res) {
        try {
            let sensorUID = req.params.sensorUID;
            let SQL = `DELETE from wireless_final.sensor 
            WHERE UID = ? `;
            let params = [sensorUID];

            await gcpDB.query(SQL, params);
            res.send('delete successfully');
        } catch (error) {
            console.log(error);
            res.status(500).json( _errorFormat(500, 'DB_ERROR') );
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