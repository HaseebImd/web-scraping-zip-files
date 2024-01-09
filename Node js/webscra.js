const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');

const baseURL = 'https://dl.dafont.com';

const url = 'https://www.dafont.com/new.php?fpp=200&psize=s'; // URL to scrape
const folderName = 'filez'; // Folder to save the downloaded files

// Create the folder if it doesn't exist
if (!fs.existsSync(folderName)) {
    fs.mkdirSync(folderName);
}

// Function to download a file
const downloadFile = async (fontName) => {
    try {
        const formattedURL = `${baseURL}/dl/?f=${fontName}`;
        const response = await axios({
            method: 'get',
            url: formattedURL,
            responseType: 'stream'
        });

        const fileName = fontName.replace(/\W+/g, '_'); // Replace non-word characters in fontName for the file name
        const filePath = path.join(__dirname, folderName, `${fileName}.zip`);

        response.data.pipe(fs.createWriteStream(filePath));
        console.log(`File ${fileName}.zip downloaded successfully.`);
    } catch (error) {
        console.error(`Error downloading ${fontName}:`, error.message);
    }
};

// Fetch the HTML content of the URL
axios.get(url)
    .then((response) => {
        const $ = cheerio.load(response.data);

        // Find elements with class "dl" within divs having class "dlbox"
        const dlLinks = $('.dlbox .dl');

        // Extract href attribute from each found element and download the file
        dlLinks.each((index, element) => {
            const href = $(element).attr('href');
            const fontName = href.split('=')[1]; // Extract font name from the URL
            downloadFile(fontName);
        });
    })
    .catch((error) => {
        console.error('Error fetching the URL:', error);
    });
