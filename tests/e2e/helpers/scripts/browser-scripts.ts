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
 * Open a new Chrome browser instance
 */
export function openChromeWindow(): void {
    const { isMac, isLinux } = getPlatform();

    if (isMac) {
        exec(`open -na "Google Chrome" --args --new-window`, (error) => {
            if (error) {
                console.error('Error opening Chrome:', error);
                return;
            }
        });
    }
    else if (isLinux) {
        exec(`google-chrome --new-window`, (error) => {
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
export function getOpenedChromeTab(callback: (url: string) => void): void {
    const { isMac, isLinux } = getPlatform();
    const maxRetries = 10;
    const retryDelay = 500;

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
    } else if (isLinux) {
        let attempts = 0;

        const checkChromeAndGetTab = () => {
            // Check if Chrome is running
            exec('xdotool search --onlyvisible --class "chrome"', (error, stdout) => {
                if (error || !stdout.trim()) {
                    console.log(`Chrome not detected, retrying... (${attempts + 1}/${maxRetries})`);
                    attempts++;
                    
                    // Retry if Chrome is not open and we haven't reached the max retries
                    if (attempts < maxRetries) {
                        setTimeout(checkChromeAndGetTab, retryDelay);
                    } else {
                        console.error('Chrome did not open within the expected time.');
                    }
                    return;
                }

                console.log('Chrome detected, focusing on Chrome window...');
                // Activate the Chrome window
                exec('xdotool search --onlyvisible --class "chrome" windowactivate', (error) => {
                    if (error) {
                        console.error('Error focusing on Chrome window:', error);
                        return;
                    }

                    // Simulate Ctrl+L to focus on the URL bar and Ctrl+C to copy the URL
                    exec('xdotool key ctrl+l; xdotool key ctrl+c', (error) => {
                        if (error) {
                            console.error('Error sending keyboard shortcuts to Chrome:', error);
                            return;
                        }

                        // Retrieve the URL from the clipboard using xclip
                        exec('xclip -o', (error, stdout) => {
                            if (error) {
                                console.error('Error getting clipboard content:', error);
                                return;
                            }
                            const url = stdout.trim();
                            callback(url);
                        });
                    });
                });
            });
        };

        // Start the process by checking for Chrome
        checkChromeAndGetTab();
    } else {
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
export function saveOpenedChromeTabUrl(logsFilePath: string, timeout = 500): void {
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
