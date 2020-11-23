import * as csv from 'csv-parser';
import * as fs from 'fs';
import * as https from 'https'

// Step 1: Change your Row type
type RowType = {
    'Name': string,
    Class: string,
    Attachments: string,
    'Remarks (if any)': string
}

const fileName: string = "urls.csv";
const downloadsFolder: string = 'downloaded'
const folderDist: keyof RowType = 'Class'
// Enter the column in which the urls are...
const attachmentsColumnNumber: keyof RowType = "Attachments"
const urlRegex = /(http|ftp|https):\/\/([\w_-]+(?:(?:\.[\w_-]+)+))([\w.,@?^=%&:/~+#-]*[\w@?^=%&/~+#-])?/
// Define this if you want to override the downloaded file name
const namingFn = (record: RowType, ext: string, index: number) => `${record.Class}-${index + 1}.${ext}`

const results: Array<RowType> = [];
fs.createReadStream(fileName)
    .pipe(csv())
    .on('data', (data: RowType) => results.push(data))
    .on('end', () => {
        runExtraction(results);
    });

async function runExtraction(results: Array<RowType>) {
    const urls = results.map(row => {
        // Split urls into list seperated by ','. Airtable seperates by ',' so we use it like that.
        return row[attachmentsColumnNumber].split(',')
            .filter(url => url?.match(urlRegex)?.length > 0)
            // Get only urls. Not file names
            .map(url => url.match(urlRegex)[0]);
    });

    // Make dir if it doesn't exist
    if (!fs.existsSync(downloadsFolder))
        fs.mkdirSync(downloadsFolder);

    // Incrementer
    for (let index = 0; index < results.length; index++) {
        const row = results[index];

        for (let listIndex = 0; listIndex < urls[index].length; listIndex++) {
            const url = urls[index][listIndex];
            const fileExtension = getUrlExt(url);

            if (fileExtension === null) {
                console.error(`Could not download ${url} because of invalid extension. Please update the file extension manually and retry`)
                continue;
            }

            const fileName = namingFn(row, fileExtension, listIndex) || `${listIndex}.${fileExtension}`;

            if (!fs.existsSync(`./${downloadsFolder}/${row[folderDist]}`))
                fs.mkdirSync(`./${downloadsFolder}/${row[folderDist]}`)

            const file = fs.createWriteStream(`./${downloadsFolder}/${row[folderDist]}/${fileName}`);
            await requestAndSave(url, file);

            console.info(`✅ ${listIndex + 1}/${urls[index].length} from row ${index + 1}/${results.length}`)
        }
    }
}

function getUrlExt(url: string): string {
    const ext = url.split(/[#?]/)[0].split('.').pop().trim();
    if (ext.length > 4)
        return null;

    return ext;
}

function requestAndSave(url, file) {
    return new Promise(function (resolve, reject) {
        var req = https.get(url, resp => {
            resp.pipe(file)
            file.on('finish', () => {
                resolve(file)
            });

        });
        // reject on request error
        req.on('error', function (err) {
            // This is not a "Second reject", just a different sort of failure
            reject(err);
        });

        req.end();
    });
}