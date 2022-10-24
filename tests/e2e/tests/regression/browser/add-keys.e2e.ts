import { rte } from '../../../helpers/constants';
import { acceptLicenseTermsAndAddDatabaseApi } from '../../../helpers/database';
import { BrowserPage, CliPage } from '../../../pageObjects';
import { commonUrl, ossStandaloneConfig } from '../../../helpers/conf';
import { deleteStandaloneDatabaseApi } from '../../../helpers/api/api-database';

const browserPage = new BrowserPage();
const cliPage = new CliPage();
const jsonKeys = [['JSON-string', '"test"'], ['JSON-number', '782364'], ['JSON-boolean', 'true'], ['JSON-null', 'null'], ['JSON-array', '[1, 2, 3]']];

fixture `Different JSON types creation`
    .meta({
        type: 'regression',
        rte: rte.standalone
    })
    .page(commonUrl)
    .beforeEach(async() => {
        await acceptLicenseTermsAndAddDatabaseApi(ossStandaloneConfig, ossStandaloneConfig.databaseName);
    })
    .afterEach(async() => {
        let commandString = 'DEL';
        for (const key of jsonKeys) {
            commandString = commandString.concat(` ${key[0]}`);
        }
        await cliPage.sendCommandInCli(commandString);
        await deleteStandaloneDatabaseApi(ossStandaloneConfig);
    });
test('Verify that user can create different types(string, number, null, array, boolean) of JSON', async t => {
    for (let i = 0; i < jsonKeys.length; i++) {
        await browserPage.addJsonKey(jsonKeys[i][0], jsonKeys[i][1]);
        await t.click(browserPage.toastCloseButton);
        await t.click(browserPage.refreshKeysButton);
        await t.expect(await browserPage.isKeyIsDisplayedInTheList(jsonKeys[i][0])).ok(`${jsonKeys[i][0]} key not displayed`);
        // Add additional check for array elements
        if (jsonKeys[i][0].includes('array')) {
            for (const j of JSON.parse(jsonKeys[i][1])) {
                await t.expect(browserPage.jsonScalarValue.withText(j.toString()).exists).ok('JSON value not correct');
            }
        }
        else {
            await t.expect(browserPage.jsonKeyValue.withText(jsonKeys[i][1]).exists).ok('JSON value not correct');
        }
    }
});
