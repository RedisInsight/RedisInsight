import { exec } from 'child_process';
import * as path from 'path';
import * as fs from 'fs';

type Callback = (url: string) => void;

/**
 * Get current machine platform
 */
function getPlatform(): { isMac: boolean, isLinux: boolean } {
    return {
        isMac: process.platform === 'darwin',
        isLinux: process.platform === 'linux'
    };
}

/**
 * Open a new Chrome browser instance with a specific URL
 * @param url The URL to open
 */
export function openChromeWithUrl(url = 'https://www.example.com'): void {
    const { isMac, isLinux } = getPlatform();

    if (isMac) {
        exec(`open -na "Google Chrome" --args --new-window "${url}"`, (error) => {
            if (error) {
                console.error('Error opening Chrome:', error);
                return;
            }
        });
    }
    else if (isLinux) {
        exec(`google-chrome --new-window "${url}"`, (error) => {
            if (error) {
                console.error('Error opening Chrome:', error);
                return;
            }
        });
    }
}

/**
 * Retrieve opened tab in Google Chrome using Chrome DevTools Protocol
 * @param callback Function to save opened tab
 */
export function getOpenedChromeTab(callback: Callback): void {
    const { isMac, isLinux } = getPlatform();

    if (isMac) {
        const scriptPath = path.join(__dirname, 'get_chrome_tab_url.applescript');
        exec(`osascript ${scriptPath}`, (error, stdout) => {
            if (error) {
                console.error('Error retrieving tabs and windows on macOS:', error);
                return;
            }
            const url = stdout.trim();
            callback(url);
        });
    }
    else if (isLinux) {
        exec('xdotool search --onlyvisible --class "Google-chrome" getwindowname $(xdotool getactivewindow)', (error, stdout) => {
            if (error) {
                console.error('Error retrieving tabs and windows on Linux:', error);
                return;
            }
            const url = parseUrlFromTitle(stdout.trim());
            callback(url);
        });
    }
    else {
        console.error('Unsupported operating system:', process.platform);
    }
}

/**
 * Parse the URL from the window title (this may vary based on how the title is formatted)
 */
function parseUrlFromTitle(title: string): string {
    const match = title.match(/\[(.*)\]/);
    return match ? match[1] : title;
}

/**
* Save opened chrome tab url to file
* @param logsFilePath The path to the file with logged url
* @param timeout The timeout for monitoring Chrome tabs
*/
export function saveOpenedChromeTabUrl(logsFilePath: string, timeout = 1000): void {
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
 * @param prefix The prefix to match the tab URL
 */
export function closeChromeTabWithPrefix(prefix: string): void {
    const { isMac, isLinux } = getPlatform();

    if (isMac) {
        const scriptPath = path.join(__dirname, 'close_chrome_tab.applescript');
        exec(`osascript ${scriptPath} "${prefix}"`, (error, stdout, stderr) => {
            if (error) {
                console.error('Error closing tabs in Chrome on macOS:', error);
                console.error('stdout:', stdout);
                console.error('stderr:', stderr);
                return;
            }
        });
    }
    else if (isLinux) {
        exec('wmctrl -c "$(xdotool search --onlyvisible --class \'Google-chrome\' | xargs -I {} xdotool getwindowname {})"', (error, stdout, stderr) => {
            if (error) {
                console.error('Error closing tabs in Chrome on Linux:', error);
                console.error('stdout:', stdout);
                console.error('stderr:', stderr);
                return;
            }
            // Filtering the output based on the prefix
            if (stdout.includes(prefix)) {
                exec(`xdotool search --onlyvisible --class "Google-chrome" windowkill $(xdotool search --onlyvisible --class "Google-chrome" | grep "${prefix}")`, (err) => {
                    if (err) {
                        console.error('Error killing the window:', err);
                    }
                });
            }
        });
    }
    else {
        console.error('Unsupported operating system:', process.platform);
    }
}
