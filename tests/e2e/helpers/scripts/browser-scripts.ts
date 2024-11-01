import { exec, execSync } from 'child_process';
import * as path from 'path';
import * as fs from 'fs';
import CDP from 'chrome-remote-interface';

interface Target {
    type: string;
    url: string;
}


/**
 * Get current machine platform
 */
function getPlatform(): { isMac: boolean, isLinux: boolean } {
    return {
        isMac: process.platform === 'darwin',
        isLinux: process.platform === 'linux'
    };
}

export function closeChrome(): void {
    console.log('Closing Chrome...');
    exec(`pkill chrome`, (error, stdout, stderr) => {
        if (error) {
            console.error('Error closing Chrome:', error);
            return;
        }
        console.log('Chrome closed successfully. stdout:', stdout);
        console.error('stderr:', stderr);
    });
}

/**
 * Open a new Chrome browser instance
 */
export function openChromeWindow(): void {
    const { isMac, isLinux } = getPlatform();

    if (isMac) {
        exec(`open -na "Google Chrome" --args --new-window`, (error) => {
            if (error) {
                console.error('Error opening Chrome on Mac:', error);
                return;
            }
        });
    }
    else if (isLinux) {
        console.log('Opening Chrome on Linux...');
        // exec(`google-chrome --remote-debugging-port=9223 --disable-gpu --disable-dev-shm-usage --disable-software-rasterizer --enable-logging --disable-extensions --no-default-browser-check --disable-default-apps --disable-domain-reliability --disable-web-security --incognito --profile-directory=Default --remote-allow-origins=* --disable-popup-blocking --v=1 about:blank`, (error, stdout, stderr) => {
        //     if (error) {
        //         console.error('Error opening Chrome on Linux:', error);
        //         return;
        //     }
        //     console.log('Linux Chrome stdout:', stdout);
        //     console.error('Linux Chrome stderr:', stderr);

        // });
        try {
            console.log("Attempting to open Chrome with execSync");
            const output = execSync(`google-chrome --remote-debugging-port=9223 --disable-gpu --disable-dev-shm-usage --disable-software-rasterizer --enable-logging --disable-extensions --no-default-browser-check --disable-default-apps --disable-domain-reliability --disable-web-security --incognito --profile-directory=Default --user-data-dir=/tmp/chrome-profile --remote-allow-origins=* --disable-popup-blocking --v=1 about:blank`, { stdio: 'inherit', timeout: 10000 });
            console.log("Chrome opened successfully with execSync:", output);
        } catch (error) {
            console.error("Error occurred in execSync:", error);
        }
        // Check if Chrome is running after opening it
        setTimeout(() => {
            exec(`pgrep "chrome"`, (err, stdout) => {
                if (err || !stdout.trim()) {
                    console.error('Chrome process not found after attempting to launch.');
                } else {
                    console.log('Chrome is running with PID:', stdout.trim());
                }
            });
        }, 10000);
    }
}

/**
 * Retrieve opened tab in Google Chrome using Chrome DevTools Protocol
 * @param urlSubstring Optional substring to match in the URL
 * @returns Promise<string> Resolves to the URL of the opened tab
 */
export async function getOpenedChromeTab(urlSubstring?: string): Promise<string> {
    const { isMac, isLinux } = getPlatform();
    const maxRetries = 20;
    const retryDelay = 800;
    const chromeDebuggingPort = 9223;

    if (isMac) {
        const scriptPath = path.join(__dirname, 'get_chrome_tab_url.applescript');
        return new Promise((resolve, reject) => {
            exec(`osascript ${scriptPath}`, (error, stdout) => {
                if (error) {
                    console.error('Error retrieving tabs and windows on macOS:', error);
                    reject(error);
                    return;
                }
                resolve(stdout.trim());
            });
        });
    } else if (isLinux) {
        for (let attempts = 0; attempts < maxRetries; attempts++) {
            console.log(`Attempting to connect to Chrome DevTools (Attempt: ${attempts + 1}/${maxRetries})...`);

            try {
                const targets = await new Promise<Target[]>((resolve, reject) => {
                    CDP.List({ port: chromeDebuggingPort }, (err, targets) => {
                        if (err) {
                            console.error('Error connecting to Chrome with CDP:', err);
                            reject(err);
                        } else {
                            resolve(targets);
                        }
                    });
                });

                const pageTargets = targets.filter(target => target.type === 'page');
                console.log(`Found ${pageTargets.length} open tabs in Chrome`);

                // Check for a new tab matching criteria
                const newTab = pageTargets.find(target =>
                    (urlSubstring && target.url.includes(urlSubstring)) ||
                    target.url.includes('auth.') // Change this according to your requirements
                );

                if (newTab) {
                    console.log('Correct tab found:', newTab.url);
                    return newTab.url; // Return the found URL
                } else {
                    console.log('No matching tab found, retrying...');
                }
            } catch (err) {
                console.error('Error during Chrome connection attempt:', err);
            }

            // Wait before the next attempt
            await new Promise(resolve => setTimeout(resolve, retryDelay));
        }

        throw new Error('No new tab matching criteria was found within the maximum attempts.');
    } else {
        throw new Error('Unsupported operating system: ' + process.platform);
    }
}

/**
 * Save opened chrome tab URL to file
 * @param logsFilePath The path to the file with logged URL
 * @param timeout The timeout for monitoring Chrome tabs
 */
export async function saveOpenedChromeTabUrl(logsFilePath: string, timeout = 2000): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, timeout));
    try {
        const url = await getOpenedChromeTab();
        await fs.promises.writeFile(logsFilePath, url, 'utf8');
    } catch (err) {
        console.error('Error saving logs:', err);
    }
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
