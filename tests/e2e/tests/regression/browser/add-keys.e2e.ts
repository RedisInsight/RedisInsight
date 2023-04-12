import { rte } from '../../../helpers/constants';
import { acceptLicenseTermsAndAddDatabaseApi } from '../../../helpers/database';
import { BrowserPage } from '../../../pageObjects';
import { commonUrl, ossStandaloneBigConfig, ossStandaloneConfig } from '../../../helpers/conf';
import { deleteStandaloneDatabaseApi } from '../../../helpers/api/api-database';
import { Common } from '../../../helpers/common';
import { BrowserActions } from '../../../common-actions/browser-actions';

const browserPage = new BrowserPage();
const browserActions = new BrowserActions();
const common = new Common();
const jsonKeys = [['JSON-string', '"test"'], ['JSON-number', '782364'], ['JSON-boolean', 'true'], ['JSON-null', 'null'], ['JSON-array', '[1, 2, 3]']];
let keyNames: string[];
let indexName: string;

fixture `Add keys`
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
        await browserPage.Cli.sendCommandInCli(commandString);
        await deleteStandaloneDatabaseApi(ossStandaloneConfig);
    });
test('Verify that user can create different types(string, number, null, array, boolean) of JSON', async t => {
    for (let i = 0; i < jsonKeys.length; i++) {
        const keySelector = await browserPage.getKeySelectorByName(jsonKeys[i][0]);
        await browserPage.addJsonKey(jsonKeys[i][0], jsonKeys[i][1]);
        await t.hover(browserPage.toastCloseButton);
        await t.click(browserPage.toastCloseButton);
        await t.click(browserPage.refreshKeysButton);
        await t.expect(keySelector.exists).ok(`${jsonKeys[i][0]} key not displayed`);
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
// https://redislabs.atlassian.net/browse/RI-3995
test
    .before(async() => {
        await acceptLicenseTermsAndAddDatabaseApi(ossStandaloneBigConfig, ossStandaloneBigConfig.databaseName);
    })
    .after(async() => {
        let commandString = 'DEL';
        for (const key of keyNames) {
            commandString = commandString.concat(` ${key}`);
        }
        const commands = [`FT.DROPINDEX ${indexName}`, commandString];
        await browserPage.Cli.sendCommandsInCli(commands);
        await deleteStandaloneDatabaseApi(ossStandaloneBigConfig);
    })('Verify that the new key is displayed at the top of the list', async t => {
        const keyName = common.generateWord(12);
        const keyName1 = common.generateWord(12);
        const keyName2 = common.generateWord(36);
        const keyName3 = common.generateWord(10);
        const keyName4 = `${common.generateWord(10)}-test`;
        const keyName5 = `hash-${common.generateWord(12)}`;
        keyNames = [keyName, keyName1, keyName2, keyName3, keyName4, keyName5];
        indexName = `idx:${keyName5}`;
        const command = `FT.CREATE ${indexName} ON HASH PREFIX 1 hash- SCHEMA name TEXT`;
        await browserPage.Cli.sendCommandInCli(command);

        await browserPage.addStringKey(keyName);
        await browserActions.verifyKeyDisplayedTopAndOpened(keyName);
        // Verify displaying added multiple keys
        await browserPage.addSetKey(keyName1);
        await browserActions.verifyKeyDisplayedTopAndOpened(keyName1);

        await browserPage.addHashKey(keyName2);
        await browserActions.verifyKeyDisplayedTopAndOpened(keyName2);
        // Verify that user can see the key removed from the top when refresh List view
        await t.click(browserPage.refreshKeysButton);
        await browserActions.verifyKeyIsNotDisplayedTop(keyName1);
        // Verify that the new key is not displayed at the top when filter per key name applied
        await browserPage.searchByKeyName('*test');
        await browserPage.addHashKey(keyName4);
        await browserActions.verifyKeyIsNotDisplayedTop(keyName4);

        await t.click(browserPage.clearFilterButton);
        await t.click(browserPage.treeViewButton);
        await browserPage.addHashKey(keyName3);
        // Verify that user can see Tree view recalculated when new key is added in Tree view
        await browserActions.verifyKeyDisplayedTopAndOpened(keyName3);

        await t.click(browserPage.redisearchModeBtn);
        await browserPage.selectIndexByName(indexName);
        await browserPage.addHashKey(keyName5, '100000', 'name', 'value');
        // Verify that the new key is not displayed at the top for the Search capability
        await browserActions.verifyKeyIsNotDisplayedTop(keyName3);
    });
