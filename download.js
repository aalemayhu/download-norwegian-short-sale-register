const fs = require('fs');

const {InstrumentsApi} = require("norwegian-short-sale-register");
const {firstValueFrom} = require('rxjs');
const xhr = require('xhr2');

/**
 * This is a workaround to avoid a reference error when running in Node.
 * Fixes ReferenceError: XMLHttpRequest is not defined
 */
function ensureXMLHttpRequestIsDefined() {
    if (typeof XMLHttpRequest === 'undefined') {
        global.XMLHttpRequest = xhr;
    }
}

function getDateFormat(date) {
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();

    return `${day}.${month}.${year}`;
}

async function main() {
    const jsonOutputPath = `${process.env.HOME ?? '.'}/Downloads/shorting_history${getDateFormat(new Date())}.json`;
    const getPublicShortingHistory = new InstrumentsApi().instrumentsGetPublicShortingHistory();

    try {
        if (fs.existsSync(jsonOutputPath)) {
            console.log('skipping since file exists at', jsonOutputPath);
            process.exit(0);
        }
        const value = await firstValueFrom(getPublicShortingHistory);
        fs.writeFileSync(jsonOutputPath, JSON.stringify(value));

        console.log('Downloaded to', jsonOutputPath);
    } catch (error) {
        const errorLogPath = jsonOutputPath + '.error.log'
        console.log('Failed to download. Full error log available at', errorLogPath)
        fs.writeFileSync(errorLogPath, error);
    }
}

ensureXMLHttpRequestIsDefined();
main();