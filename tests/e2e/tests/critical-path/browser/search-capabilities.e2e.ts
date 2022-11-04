import { acceptLicenseTermsAndAddDatabaseApi } from '../../../helpers/database';
import { BrowserPage, CliPage } from '../../../pageObjects';
import {
    commonUrl,
    ossStandaloneBigConfig,
    ossStandaloneConfig,
    ossStandaloneV5Config
} from '../../../helpers/conf';
import { rte } from '../../../helpers/constants';
import { deleteStandaloneDatabaseApi } from '../../../helpers/api/api-database';
import { Common } from '../../../helpers/common';
import { verifyKeysDisplayedInTheList } from '../../../helpers/keys';

const browserPage = new BrowserPage();
const common = new Common();
const cliPage = new CliPage();

const patternModeTooltipText = 'Filter by Key Name or Pattern';
const redisearchModeTooltipText = 'Search by Values of Keys';
const notSelectedIndexText = 'Select an index and enter a query to search per values of keys.';
let keyName = common.generateWord(10);
let keyNames: string[];
let indexName = common.generateWord(5);

fixture `Search capabilities in Browser`
    .meta({ type: 'critical_path', rte: rte.standalone })
    .page(commonUrl);
test
    .before(async() => {
        await acceptLicenseTermsAndAddDatabaseApi(ossStandaloneConfig, ossStandaloneConfig.databaseName);
        keyName = common.generateWord(10);
        await browserPage.addHashKey(keyName);
    })
    .after(async() => {
        // Clear and delete database
        await browserPage.deleteKeyByName(keyName);
        await cliPage.sendCommandsInCli([`DEL ${keyNames.join(' ')}`, `FT.DROPINDEX ${indexName}`]);
        await deleteStandaloneDatabaseApi(ossStandaloneConfig);
    })('RediSearch capabilities in Browser view to search per Hashes or JSONs', async t => {
        indexName = `idx:${keyName}`;
        keyNames = [`${keyName}:1`, `${keyName}:2`, `${keyName}:3`];
        const commands = [
            `HSET ${keyNames[0]} "name" "Hall School" "description" " Spanning 10 states" "class" "independent" "type" "traditional" "address_city" "London" "address_street" "Manor Street" "students" 342 "location" "51.445417, -0.258352"`,
            `HSET ${keyNames[1]} "name" "Garden School" "description" "Garden School is a new outdoor" "class" "state" "type" "forest; montessori;" "address_city" "London" "address_street" "Gordon Street" "students" 1452 "location" "51.402926, -0.321523"`,
            `HSET ${keyNames[2]} "name" "Gillford School" "description" "Gillford School is a centre" "class" "private" "type" "democratic; waldorf" "address_city" "Goudhurst" "address_street" "Goudhurst" "students" 721 "location" "51.112685, 0.451076"`,
            `FT.CREATE ${indexName} ON HASH PREFIX 1 "${keyName}:" SCHEMA name TEXT NOSTEM description TEXT class TAG type TAG SEPARATOR ";" address_city AS city TAG address_street AS address TEXT NOSTEM students NUMERIC SORTABLE location GEO`
        ];

        // Create 3 keys and index
        await cliPage.sendCommandsInCli(commands);
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
        await verifyKeysDisplayedInTheList(keyNames);
        await t.expect((await browserPage.getKeySelectorByName(keyName)).exists).notOk('Key without index displayed after search');
        // Verify that user can search by index plus key value
        await browserPage.searchByKeyName('Hall School');
        await t.expect(await browserPage.isKeyIsDisplayedInTheList(keyNames[0])).ok(`The key ${keyNames[0]} not found`);
        await t.expect(await browserPage.isKeyIsDisplayedInTheList(keyNames[1])).notOk(`Invalid key ${keyNames[1]} is displayed after search`);
        // Verify that user can search by index plus multiple key values
        await browserPage.searchByKeyName('(@name:"Hall School") | (@students:[500, 1000])');
        await t.expect(await browserPage.isKeyIsDisplayedInTheList(keyNames[0])).ok(`The first valid key ${keyNames[0]} not found`);
        await t.expect(await browserPage.isKeyIsDisplayedInTheList(keyNames[2])).ok(`The second valid key ${keyNames[2]} not found`);
        await t.expect(await browserPage.isKeyIsDisplayedInTheList(keyNames[1])).notOk(`Invalid key ${keyNames[1]} is displayed after search`);

        // Verify that user can clear the search
        await t.click(browserPage.clearFilterButton);
        await t.expect(await browserPage.isKeyIsDisplayedInTheList(keyNames[1])).ok(`The key ${keyNames[1]} not found`);
        await t.expect(await browserPage.isKeyIsDisplayedInTheList(keyName)).notOk('Search not cleared');

        // Verify that user can search by index in Tree view
        await t.click(browserPage.treeViewButton);
        // Change delimiter
        await browserPage.changeDelimiterInTreeView('-');
        await browserPage.selectIndexByName(indexName);
        await verifyKeysDisplayedInTheList(keyNames);
        await t.expect(await browserPage.isKeyIsDisplayedInTheList(keyName)).notOk('Key without index displayed after search');

        // Verify that user see the database scanned when he switch to Pattern search mode
        await t.click(browserPage.patternModeBtn);
        await t.click(browserPage.browserViewButton);
        await verifyKeysDisplayedInTheList(keyNames);
        await t.expect(await browserPage.isKeyIsDisplayedInTheList(keyName)).ok('Database not scanned after returning to Pattern search mode');
    });
test
    .before(async() => {
        await acceptLicenseTermsAndAddDatabaseApi(ossStandaloneBigConfig, ossStandaloneBigConfig.databaseName);
    })
    .after(async() => {
    // Clear and delete database
        await cliPage.sendCommandInCli(`FT.DROPINDEX ${indexName}`);
        await deleteStandaloneDatabaseApi(ossStandaloneBigConfig);
    })('Search by index keys scanned for JSON', async t => {
        keyName = common.generateWord(10);
        indexName = `idx:${keyName}`;
        const command = `FT.CREATE ${indexName} ON JSON PREFIX 1 "device:" SCHEMA id numeric`;

        // Create index for JSON keys
        await cliPage.sendCommandInCli(command);
        // Verify that user can can get 500 keys (limit 0 500) in Browser view
        await t.click(browserPage.redisearchModeBtn);
        await browserPage.selectIndexByName(indexName);
        // Verify that all keys are displayed according to selected index
        for (let i = 0; i < 15; i++) {
            await t.expect(browserPage.keyListItem.textContent).contains('device:', 'Keys out of index displayed');
        }
        // Verify that user can can get 10 000 keys in Tree view
        await t.click(browserPage.treeViewButton);
        const keysNumberOfResults = browserPage.keysNumberOfResults.textContent;
        await t.expect(keysNumberOfResults).contains('10 000', 'Number of results is not 10 000');
    });
test
    .before(async() => {
        await acceptLicenseTermsAndAddDatabaseApi(ossStandaloneV5Config, ossStandaloneV5Config.databaseName);
    })
    .after(async() => {
        await deleteStandaloneDatabaseApi(ossStandaloneV5Config);
    })('No RediSearch module message', async t => {
        const noRedisearchMessage = 'RediSearch module is not loaded. Create a free Redis database(opens in a new tab or window) with module support on Redis Cloud.';
        const externalPageLink = 'https://redis.com/try-free/?utm_source=redis&utm_medium=app&utm_campaign=redisinsight_browser_search';

        await t.click(browserPage.redisearchModeBtn);
        // Verify that user can see message in popover when he not have RediSearch module
        await t.expect(browserPage.popover.textContent).contains(noRedisearchMessage, 'Invalid text in no redisearch popover');
        // Verify that user can navigate by link to create a Redis db
        await t.click(browserPage.redisearchFreeLink);
        await common.checkURL(externalPageLink);
        await t.switchToParentWindow();
    });
test
    .before(async() => {
        await acceptLicenseTermsAndAddDatabaseApi(ossStandaloneBigConfig, ossStandaloneBigConfig.databaseName);
    })
    .after(async() => {
        await cliPage.sendCommandInCli(`FT.DROPINDEX ${indexName}`);
        await deleteStandaloneDatabaseApi(ossStandaloneBigConfig);
    })('Index creation', async t => {
        const createIndexLink = 'https://redis.io/commands/ft.create/';

        // Verify that user can cancel index creation
        await t.click(browserPage.redisearchModeBtn);
        await t.click(browserPage.selectIndexDdn);
        await t.click(browserPage.createIndex);
        await t.expect(browserPage.newIndexPanel.exists).ok('New Index panel is not displayed');
        await t.click(browserPage.cancelIndexCreation);
        await t.expect(browserPage.newIndexPanel.exists).notOk('New Index panel is displayed');

        // Verify that user can create an index with all mandatory parameters
        await t.click(browserPage.redisearchModeBtn);
        await t.click(browserPage.selectIndexDdn);
        await t.click(browserPage.createIndex);
        await t.expect(browserPage.newIndexPanel.exists).ok('New Index panel is not displayed');
        // Verify that user can see a link to create a profound index and navigate
        await t.click(browserPage.newIndexPanel.find('a'));
        await common.checkURL(createIndexLink);
        await t.switchToParentWindow();

        // Verify that user can create an index with multiple prefixes
        await t.click(browserPage.indexNameInput);
        await t.typeText(browserPage.indexNameInput, indexName);
        await t.click(browserPage.prefixFieldInput);
        await t.typeText(browserPage.prefixFieldInput, 'device:');
        await t.pressKey('enter');
        await t.typeText(browserPage.prefixFieldInput, 'mobile_');
        await t.pressKey('enter');
        await t.typeText(browserPage.prefixFieldInput, 'user_');
        await t.pressKey('enter');

        // Verify that user can create an index with multiple fields (up to 20)
        await t.click(browserPage.indexIdentifierInput);
        await t.typeText(browserPage.indexIdentifierInput, 'k0');
        await t.click(browserPage.confirmIndexCreation);
        await t.expect(browserPage.newIndexPanel.exists).notOk('New Index panel is displayed');
        await t.click(browserPage.selectIndexDdn);
        await browserPage.selectIndexByName(indexName);
    });
