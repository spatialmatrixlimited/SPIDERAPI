const transformer = require('./index');
const runBulkProcess = () => {
    console.log('Process started with Entity data');
    transformer.transformEntity().then(r1 => {
        console.log('Entity uploaded');
        console.log(`${r1.length} entities processed!`);
        transformer.transformProperty().then(r2 => {
            console.log('Property uploaded');
            console.log(`${r2.length} properties processed!`);
            transformer.transformStreet().then(r3 => {
                console.log('Street uploaded');
                console.log(`${r3.length} streets processed!`);
            }).catch(err => {
                console.log(err);
            });
        }).catch(err => {
            console.log(err);
        });
    }).catch(err => {
        console.log(err);
    });
}

const runBulkStreetProcess = () => {
    console.log('Running The Street');
    transformer.transformStreet().then(r3 => {
        console.log('Street uploaded');
        console.log(`${r3.length} streets processed!`);
    }).catch(err => {
        console.log(err);
    });
}

exports.runBulkProcess = runBulkProcess;
exports.runBulkStreetProcess = runBulkStreetProcess;