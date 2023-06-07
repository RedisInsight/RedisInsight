import * as fs from 'fs-extra';
import * as path from 'path';
import { BasePage } from '../pageObjects';
import { deleteRowsFromTableInDB, updateColumnValueInDBTable } from './database-scripts';
import { syncFeaturesApi } from './api/api-info';

const basePage = new BasePage();

/**
 * Update features-config file for static server
 * @param filePath Path to feature config json
 */
export async function modifyFeaturesConfigJson(filePath: string): Promise<void> {
    const configFileName = 'features-config.json';
    const remoteConfigPath = process.env.REMOTE_FOLDER_PATH || './remote';
    const targetFilePath = path.join(remoteConfigPath, configFileName);

    return new Promise((resolve, reject) => {
        try {
            fs.ensureFileSync(targetFilePath);
            fs.writeFileSync(targetFilePath, fs.readFileSync(filePath));
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

    await syncFeaturesApi();
    await updateColumnValueInDBTable(featuresConfigTable, 'controlNumber', controlNumber);
    await syncFeaturesApi();
    await basePage.reloadPage();
}

/**
 * Refresh test data for features sync
 */
export async function refreshFeaturesTestData(): Promise<void> {
    const featuresConfigTable = 'features_config';
    const defaultConfigPath = path.join('.', 'test-data', 'features-configs', 'insights-default-remote.json');

    await modifyFeaturesConfigJson(defaultConfigPath);
    await deleteRowsFromTableInDB(featuresConfigTable);
    await syncFeaturesApi();
}
