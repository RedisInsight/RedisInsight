import * as fs from 'fs';
import * as path from 'path';
import { BasePage } from '../pageObjects';
import { updateColumnValueInDBTable } from './database-scripts';
import { syncFeaturesApi } from './api/api-info';

const basePage = new BasePage();

/**
 * Update features-config file for static server
 * @param filePath Path to feature config json
 */
export async function modifyFeaturesConfigJson(filePath: string): Promise<void> {
    const configFileName = 'features-config.json';
    const remoteConfigPath = process.env.REMOTE_FOLDER_PATH || './remote';

    return new Promise((resolve, reject) => {
        try {
            fs.writeFileSync(path.join(remoteConfigPath, configFileName), fs.readFileSync(filePath));
            resolve();
        }
        catch (err) {
            reject(new Error(`Error updating remote config file: ${err.message}`));
        }
    });
}

/**
 * Update Control Number of current user and sync
 * @param controlNumber Control number to update
 */
export async function updateControlNumber(controlNumber: number): Promise<void> {
    const featuresConfigTable = 'features_config';

    updateColumnValueInDBTable(featuresConfigTable, 'controlNumber', controlNumber);
    await syncFeaturesApi();
    await basePage.reloadPage();
}
