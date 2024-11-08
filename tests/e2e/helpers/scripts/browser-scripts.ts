import { exec } from 'child_process';
import * as path from 'path';
import * as fs from 'fs';
import CDP from 'chrome-remote-interface';
import { promisify } from 'util';
import { Common } from '../common';

interface Target {
    type: string;
    url: string;
}
const execPromise = promisify(exec);

/**
 * Close Chrome browser instance
 */
export async function closeChrome(): Promise<void> {
    console.log('Closing Chrome...');
    try {
        const { stdout, stderr } = await execPromise(`pkill chrome`);
        console.log('Chrome closed successfully. stdout:', stdout);
        if (stderr) {
            console.error('stderr:', stderr);
        }
    } catch (error) {
        console.error('Error closing Chrome:', error);
    }
}

/**
 * Open a new Chrome browser instance
 */
export async function openChromeWindow(): Promise<void> {
    const { isMac, isLinux } = Common.getPlatform();

    if (isMac) {
        await execPromise(`open -na "Google Chrome" --args --new-window`);
        console.log('Chrome opened on Mac');
    } else if (isLinux) {
        console.log('Opening Chrome on Linux...');
        try {
            exec(`google-chrome --remote-debugging-port=9223 --disable-gpu --disable-search-engine-choice-screen --disable-dev-shm-usage --disable-software-rasterizer --enable-logging --disable-extensions --no-default-browser-check --disable-default-apps --disable-domain-reliability --disable-web-security --no-sandbox --remote-allow-origins=* --disable-popup-blocking about:blank &`, (error, stdout, stderr) => {
                if (error) {
                    console.error(`Error launching Chrome: ${error}`);
                } else {
                    console.log("Chrome started successfully in the background.");
                }
            });
        } catch (error) {
            console.error("Error occurred in execSync:", error);
            return;
        }

        // Check if Chrome is running after opening it
        const isChromeRunning = await waitForChromeProcess();
        if (isChromeRunning) {
            console.log('Chrome is running.');
        } else {
            console.error('Chrome process not found after attempting to launch.');
        }
    }
}

/**
 * Waiting for chrome process start
 * @param maxWaitTime Max waiting time
 * @param interval Interval between check
 */
async function waitForChromeProcess(maxWaitTime = 10000, interval = 1000): Promise<boolean> {
    const start = Date.now();
    while (Date.now() - start < maxWaitTime) {
        try {
            const { stdout } = await execPromise(`pgrep "chrome"`);
            if (stdout.trim()) {
                return true;
            }
        } catch (error) {
            // Ignore errors, Chrome may not be running yet
        }
        await new Promise(resolve => setTimeout(resolve, interval));
    }
    return false;
}

/**
 * Retrieve opened tab in Google Chrome using Chrome DevTools Protocol
 * @param urlSubstring Optional substring to match in the URL
 * @returns Promise<string> Resolves to the URL of the opened tab
 */
export async function getOpenedChromeTab(urlSubstring?: string): Promise<string> {
    const { isMac, isLinux } = Common.getPlatform();
    const maxRetries = 30;
    const retryDelay = 400;
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
                console.log(`Found ${targets[0].url} url open tabs in Chrome`);

                // Check for a new tab matching criteria
                const newTab = pageTargets.find(target =>
                    (urlSubstring && target.url.includes(urlSubstring)) ||
                    target.url.includes('authorize?')
                );

                if (newTab) {
                    console.log('Correct tab found:', newTab.url);
                    return newTab.url;
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
export async function saveOpenedChromeTabUrl(logsFilePath: string, timeout = 100): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, timeout));
    try {
        const url = await getOpenedChromeTab();
        fs.writeFileSync(logsFilePath, url, 'utf8');
    } catch (err) {
        console.error('Error saving logs:', err);
    }
}

/**
 * Close Chrome browser instance
 */
export async function openChromeOnCi(): Promise<void> {
    await openChromeWindow();
    await new Promise(resolve => setTimeout(resolve, 1000));
    await closeChrome();
    await new Promise(resolve => setTimeout(resolve, 1000));
    await openChromeWindow();
    await new Promise(resolve => setTimeout(resolve, 1000));
}
