const distancematrix = require('./src/distanceMatrix');


main()
async function main() {
    try {
        let result = await distancematrix('24, 121.42', '24.2225, 121.1523');
        console.log(result);

        result.rows.forEach(element => {
            console.log(element);
        });
        console.log(result.rows[0].elements[0]);       
    } catch (error) {
        console.log(error);
    }
}