const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');

const baseURL = 'https://dl.dafont.com';

const folderName = 'files'; // Folder to save the downloaded files

// Create the folder if it doesn't exist
if (!fs.existsSync(folderName)) {
    fs.mkdirSync(folderName);
}

const extractFonts = async (filePath) => {
    const extractFolder = path.join(__dirname, 'extractedFonts');

    // Create the extractedFonts folder if it doesn't exist
    if (!fs.existsSync(extractFolder)) {
        fs.mkdirSync(extractFolder);
    }

    try {
        const zip = new require('adm-zip')(filePath);
        const zipEntries = zip.getEntries();

        zipEntries.forEach((entry) => {
            if (entry.entryName.endsWith('.ttf') || entry.entryName.endsWith('.otf')) {
                const extractPath = path.join(extractFolder, entry.entryName);
                zip.extractEntryTo(entry, extractFolder, false, true);
                console.log(`Extracted ${entry.entryName} from ${path.basename(filePath)}`);
            }
        });
    } catch (error) {
        console.error('Error extracting fonts:', error.message);
    }
};

// Function to download a file
const downloadFile = async (fontName) => {
    try {
        const formattedURL = `${baseURL}/dl/?f=${fontName}`;
        const response = await axios({
            method: 'get',
            url: formattedURL,
            responseType: 'arraybuffer', // Set response type to array buffer for binary data
        });

        const fileName = fontName.replace(/\W+/g, '_'); // Replace non-word characters in fontName for the file name
        const filePath = path.join(__dirname, folderName, `${fileName}.zip`);

        fs.writeFileSync(filePath, Buffer.from(response.data)); // Save the downloaded ZIP file

        // Extract fonts from the downloaded file
        await extractFonts(filePath);
    } catch (error) {
        console.error(`Error downloading ${fontName}:`, error.message);
    }
};

// Function to scrape a single page
const scrapePage = async (pageNumber) => {
    const url = `https://www.dafont.com/new.php?page=${pageNumber}&fpp=200&psize=s`;

    try {
        const response = await axios.get(url);
        const $ = cheerio.load(response.data);

        // Find elements with class "dl" within divs having class "dlbox"
        const dlLinks = $('.dlbox .dl');

        // Extract href attribute from each found element and download the file
        dlLinks.each((index, element) => {
            const href = $(element).attr('href');
            const fontName = href.split('=')[1]; // Extract font name from the URL
            downloadFile(fontName);
        });
    } catch (error) {
        console.error(`Error fetching or scraping page ${pageNumber}:`, error.message);
    }
};

// Scrape multiple pages
const totalPages = 50; // Change this to the total number of pages you want to scrape
for (let i = 1; i <= totalPages; i++) {
    scrapePage(i);
}
