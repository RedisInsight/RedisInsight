import { exec } from 'child_process';
import * as path from 'path';
import * as fs from 'fs';

/**
* Open a new Chrome browser instance with a specific URL
* @param url The url to open
*/
export function openChromeWithUrl(url: string = 'https://www.example.com') {
    exec(`open -na "Google Chrome" --args --new-window "${url}"`, (error) => {
        if (error) {
            console.error('Error opening Chrome:', error);
            return;
        }
    });
}

/**
* Retrieve opened tab in Google Chrome
* @param callback function to save opened tab
*/
export function getOpenedChromeTab(callback: { (windows: string | NodeJS.ArrayBufferView): void; (arg0: string): void; }) {
    const scriptPath = path.join(__dirname, 'get_chrome_tab_url.applescript');
    exec(`osascript ${scriptPath}`, (error, stdout) => {
        if (error) {
            console.error('Error retrieving tabs and windows:', error);
            return;
        }
        const windows = stdout.trim();
        callback(windows);
    });
}

/**
* Save opened chrome tab url to file
* @param logsFilePath The path to the file with logged url
* @param timeout The timeout for monitoring Chrome tabs
*/
export function saveOpenedChromeTabUrl(logsFilePath: string, timeout: number = 1000) {
    setTimeout(() => {
        getOpenedChromeTab((windows: string | NodeJS.ArrayBufferView) => {
            // Save the window information to a file
            fs.writeFile(logsFilePath, windows, (err) => {
                if (err) {
                    console.error('Error saving logs:', err);
                }
            });
        });
    }, timeout);
}

/**
* Close the Chrome tab by prefix
*/
export function closeChromeTabWithPrefix() {
    const scriptPath = path.join(__dirname, 'close_chrome_tab.applescript');
    exec(`osascript ${scriptPath}`, (error, stdout, stderr) => {
        if (error) {
            console.error('Error closing tabs in Chrome:', error);
            console.error('stdout:', stdout);
            console.error('stderr:', stderr);
            return;
        }
    });
}
