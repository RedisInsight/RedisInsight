import { acceptLicenseTermsAndAddDatabaseApi } from '../../../helpers/database';
import { BrowserPage, CliPage } from '../../../pageObjects';
import {
    commonUrl,
    ossStandaloneBigConfig,
    ossStandaloneConfig
} from '../../../helpers/conf';
import { rte } from '../../../helpers/constants';
import { deleteStandaloneDatabaseApi } from '../../../helpers/api/api-database';
import { Common } from '../../../helpers/common';

const browserPage = new BrowserPage();
const common = new Common();
const cliPage = new CliPage();

let keyName = common.generateWord(10);
let keyNames: string[];
let indexName = common.generateWord(5);

fixture`Search capabilities in Browser`
    .meta({ type: 'critical_path', rte: rte.standalone })
    .page(commonUrl)
    .beforeEach(async () => {
        await acceptLicenseTermsAndAddDatabaseApi(ossStandaloneConfig, ossStandaloneConfig.databaseName);
    })
    .afterEach(async () => {
        // Delete database
        await deleteStandaloneDatabaseApi(ossStandaloneConfig);
    });
test
    .before(async () => {
        await acceptLicenseTermsAndAddDatabaseApi(ossStandaloneConfig, ossStandaloneConfig.databaseName);
        keyName = common.generateWord(10);
        await browserPage.addHashKey(keyName);
    })
    .after(async () => {
        // Clear and delete database
        await browserPage.deleteKeyByName(keyName);
        await cliPage.sendCommandInCli(`DEL ${keyNames.join(' ')}`);
        await cliPage.sendCommandInCli(`FT.DROPINDEX ${indexName}`);
        await deleteStandaloneDatabaseApi(ossStandaloneConfig);
    })('RediSearch capabilities in Browser view to search per Hashes or JSONs', async t => {
        const patternModeTooltipText = 'Filter by Key Name or Pattern';
        const redisearchModeTooltipText = 'Search by Values of Keys';
        const notSelectedIndexText = 'Select an index and enter a query to search per values of keys.';
        indexName = `idx:${keyName}`;
        keyNames = [`${keyName}:1`, `${keyName}:2`, `${keyName}:3`];
        const commands = [
            `HSET ${keyNames[0]} "name" "Hall School" "description" " Spanning 10 states" "class" "independent" "type" "traditional" "address_city" "London" "address_street" "Manor Street" "students" 342 "location" "51.445417, -0.258352"`,
            `HSET ${keyNames[1]} "name" "Garden School" "description" "Garden School is a new outdoor" "class" "state" "type" "forest; montessori;" "address_city" "London" "address_street" "Gordon Street" "students" 1452 "location" "51.402926, -0.321523"`,
            `HSET ${keyNames[2]} "name" "Gillford School" "description" "Gillford School is a centre" "class" "private" "type" "democratic; waldorf" "address_city" "Goudhurst" "address_street" "Goudhurst" "students" 721 "location" "51.112685, 0.451076"`,
            `FT.CREATE ${indexName} ON HASH PREFIX 1 "${keyName}:" SCHEMA name TEXT NOSTEM description TEXT class TAG type TAG SEPARATOR ";" address_city AS city TAG address_street AS address TEXT NOSTEM students NUMERIC SORTABLE location GEO`
        ];

        // Open CLI
        await t.click(cliPage.cliExpandButton);
        // Create keys and index
        for (const command of commands) {
            await t.typeText(cliPage.cliCommandInput, command, { replace: true, paste: true });
            await t.pressKey('enter');
        }
        await t.click(cliPage.cliCollapseButton);

        // Verify that user see the tooltips for the controls to switch the modes
        await t.click(browserPage.patternModeBtn);
        await t.hover(browserPage.patternModeBtn);
        await t.expect(browserPage.tooltip.textContent).contains(patternModeTooltipText, 'Invalid text in pattern mode tooltip');
        await t.hover(browserPage.redisearchModeBtn);
        await t.expect(browserPage.tooltip.textContent).contains(redisearchModeTooltipText, 'Invalid text in redisearch mode tooltip');

        // Verify that user see the "Select an index" message when he switch to Search
        await t.click(browserPage.redisearchModeBtn);
        await t.expect(browserPage.keyListTable.textContent).contains(notSelectedIndexText, 'Select an index message not displayed');

        // Verify that user can search by index in Browser view
        await browserPage.selectIndexByName(indexName);
        for (const keyName of keyNames) {
            await browserPage.isKeyIsDisplayedInTheList(keyName);
        }
        await t.expect((await browserPage.getKeySelectorByName(keyName)).exists).notOk('Key without index displayed after search');
        // Verify that user can search by index and key value
        await browserPage.searchByKeyName('Hall School');
        await browserPage.isKeyIsDisplayedInTheList(keyNames[0]);
        await t.expect((await browserPage.getKeySelectorByName(keyNames[1])).exists).notOk('Wrong key is displayed after search');

        // Verify that user can clear the search
        await t.click(browserPage.clearFilterButton);
        await browserPage.isKeyIsDisplayedInTheList(keyNames[1]);
        await t.expect((await browserPage.getKeySelectorByName(keyName)).exists).notOk('Search not cleared');

        // Verify that user can search by index in Tree view
        await t.click(browserPage.treeViewButton);
        // Change delimiter
        await browserPage.changeDelimiterInTreeView('-');
        await browserPage.selectIndexByName(indexName);
        for (const keyName of keyNames) {
            await browserPage.isKeyIsDisplayedInTheList(keyName);
        }
        await t.expect((await browserPage.getKeySelectorByName(keyName)).exists).notOk('Key without index displayed after search');

        // Verify that user see the database scanned when he switch to Pattern search mode
        await t.click(browserPage.patternModeBtn);
        await t.click(browserPage.browserViewButton);
        for (const keyName of keyNames) {
            await browserPage.isKeyIsDisplayedInTheList(keyName);
        }
        await t.expect((await browserPage.getKeySelectorByName(keyName)).exists).ok('Database not scanned after returning to Pattern search mode');
    });
test
.before(async () => {
    await acceptLicenseTermsAndAddDatabaseApi(ossStandaloneBigConfig, ossStandaloneBigConfig.databaseName);
})
.after(async () => {
    // Clear and delete database
    await cliPage.sendCommandInCli(`FT.DROPINDEX ${indexName}`);
    await deleteStandaloneDatabaseApi(ossStandaloneBigConfig);
})('Search by index max keys count', async t => {
    keyName = common.generateWord(10);
    indexName = `idx:${keyName}`;
    let command = `FT.CREATE ${indexName} ON JSON PREFIX 1 "device:" SCHEMA $.id TEXT NOSTEM`;
    
    // Create index for JSON keys
    await cliPage.sendCommandInCli(command);
});