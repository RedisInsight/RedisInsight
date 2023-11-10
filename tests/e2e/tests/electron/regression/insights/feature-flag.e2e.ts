import * as path from 'path';
import { BrowserPage } from '../../../../pageObjects';
import { rte } from '../../../../helpers/constants';
import { DatabaseHelper } from '../../../../helpers/database';
import { commonUrl, ossStandaloneV5Config } from '../../../../helpers/conf';
import { DatabaseAPIRequests } from '../../../../helpers/api/api-database';
import { deleteRowsFromTableInDB } from '../../../../helpers/database-scripts';
import { modifyFeaturesConfigJson, updateControlNumber } from '../../../../helpers/insights';

const browserPage = new BrowserPage();
const databaseHelper = new DatabaseHelper();
const databaseAPIRequests = new DatabaseAPIRequests();

const featuresConfigTable = 'features_config';
const pathes = {
    defaultRemote: path.join('.', 'test-data', 'features-configs', 'insights-default-remote.json'),
    dockerConfig: path.join('.', 'test-data', 'features-configs', 'insights-docker-build.json'),
    electronConfig: path.join('.', 'test-data', 'features-configs', 'insights-electron-build.json')
};

fixture `Feature flag`
    .meta({ type: 'regression', rte: rte.standalone })
    .page(commonUrl)
    .beforeEach(async() => {
        await databaseHelper.acceptLicenseTermsAndAddDatabaseApi(ossStandaloneV5Config);
    })
    .afterEach(async() => {
        await databaseAPIRequests.deleteStandaloneDatabaseApi(ossStandaloneV5Config);
        // Update remote config .json to default
        await modifyFeaturesConfigJson(pathes.defaultRemote);
        // Clear features config table
        await deleteRowsFromTableInDB(featuresConfigTable);
    });
// the test is skipped due to story https://redislabs.atlassian.net/browse/RI-5089
test.skip('Verify that Insights panel can be displayed for Electron app according to filters', async t => {
    // Update remote config .json to config with buildType filter excluding current app build
    await modifyFeaturesConfigJson(pathes.dockerConfig);
    await updateControlNumber(48.2);
    await t.expect(browserPage.InsightsPanel.explorePanelButton.exists).notOk('Insights panel displayed when filter excludes this buildType');

    // Update remote config .json to config with buildType filter including current app build
    await modifyFeaturesConfigJson(pathes.electronConfig);
    await updateControlNumber(48.2);
    await t.expect(browserPage.InsightsPanel.explorePanelButton.exists).ok('Insights panel not displayed when filter includes this buildType');
});
