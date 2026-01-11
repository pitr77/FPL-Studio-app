import https from 'https';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// FPL Team codes mapping (team ID -> short name)
const TEAM_MAPPING = {
    1: 'arsenal',
    2: 'aston-villa',
    3: 'bournemouth',
    4: 'brentford',
    5: 'brighton',
    6: 'chelsea',
    7: 'crystal-palace',
    8: 'everton',
    9: 'fulham',
    10: 'ipswich',
    11: 'leicester',
    12: 'liverpool',
    13: 'man-city',
    14: 'man-utd',
    15: 'newcastle',
    16: 'nottingham-forest',
    17: 'southampton',
    18: 'spurs',
    19: 'west-ham',
    20: 'wolves'
};

const OUTPUT_DIR = path.join(__dirname, '..', 'public', 'icons', 'clubs');

// Create directory if it doesn't exist
if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    console.log(`✓ Created directory: ${OUTPUT_DIR}`);
}

function downloadImage(url, filepath) {
    return new Promise((resolve, reject) => {
        const file = fs.createWriteStream(filepath);
        https.get(url, (response) => {
            if (response.statusCode !== 200) {
                reject(new Error(`Failed to download: ${url} (Status: ${response.statusCode})`));
                return;
            }
            response.pipe(file);
            file.on('finish', () => {
                file.close();
                resolve();
            });
        }).on('error', (err) => {
            fs.unlink(filepath, () => { }); // Delete partial file
            reject(err);
        });
    });
}

async function downloadAllIcons() {
    console.log('Starting download of Premier League team icons...\n');

    let successCount = 0;
    let failCount = 0;

    for (const [teamId, shortName] of Object.entries(TEAM_MAPPING)) {
        const url = `https://resources.premierleague.com/premierleague/badges/t${teamId}.png`;
        const filepath = path.join(OUTPUT_DIR, `${shortName}.png`);

        try {
            await downloadImage(url, filepath);
            console.log(`✓ Downloaded: ${shortName}.png`);
            successCount++;
        } catch (error) {
            console.error(`✗ Failed: ${shortName}.png - ${error.message}`);
            failCount++;
        }
    }

    console.log(`\n========================================`);
    console.log(`Download complete!`);
    console.log(`Success: ${successCount} | Failed: ${failCount}`);
    console.log(`========================================`);
}

downloadAllIcons().catch(console.error);
