import { DatabaseHelper } from '../../../../helpers/database';
import { BrowserPage, WorkbenchPage } from '../../../../pageObjects';
import {
    commonUrl,
    ossStandaloneBigConfig,
    ossStandaloneConfig,
    ossStandaloneConfigEmpty,
    ossStandaloneRedisearch
} from '../../../../helpers/conf';
import { KeyTypesTexts, rte } from '../../../../helpers/constants';
import { DatabaseAPIRequests } from '../../../../helpers/api/api-database';
import { APIKeyRequests } from '../../../../helpers/api/api-keys';
import { Common } from '../../../../helpers/common';
import { verifyKeysDisplayingInTheList } from '../../../../helpers/keys';

const browserPage = new BrowserPage();
const workbenchPage = new WorkbenchPage();
const databaseHelper = new DatabaseHelper();
const databaseAPIRequests = new DatabaseAPIRequests();
const apiKeyRequests = new APIKeyRequests();

let keyNames: string[] = [];

fixture `Tree view verifications`
    .meta({ type: 'regression', rte: rte.standalone })
    .page(commonUrl)
    .beforeEach(async() => {
        await databaseHelper.acceptLicenseTermsAndAddDatabaseApi(ossStandaloneBigConfig);
    })
    .afterEach(async() => {
        // Delete database
        await databaseAPIRequests.deleteStandaloneDatabaseApi(ossStandaloneBigConfig);
    });
test
    .before(async() => {
        await databaseHelper.acceptLicenseTermsAndAddDatabaseApi(ossStandaloneRedisearch);
    })
    .after(async() => {
        // Delete database
        await databaseAPIRequests.deleteStandaloneDatabaseApi(ossStandaloneRedisearch);
    })('Verify that user can see message "No keys to display." when there are no keys in the database', async t => {
        const message = 'NoKeystoDisplayCreateyourfirstkeytogetstartedKeysarethefoundationofRedis.CreateyourfirstkeyortryourinteractiveTutorialstolearnhowRediscansolveyourusecases.+KeyorExplore';
        const actualMessage = await browserPage.keyListMessage.innerText;
        const cleanMessage = actualMessage.replace(/[\s\n]+/g, '');
        // Verify the message
        await t.click(browserPage.treeViewButton);
        await t.expect(cleanMessage).contains(message, 'The message is not displayed');
        await t.expect(browserPage.guideLinksBtn.count).gte(5);
        await browserPage.clickGuideLinksByName('JSON');
        await t.expect(workbenchPage.queryInput.visible).ok('Workbench page is not opened');
    });
test('Verify that user can see the total number of keys, the number of keys scanned, the “Scan more” control displayed at the top of Tree view and Browser view', async t => {
    await browserPage.selectFilterGroupType(KeyTypesTexts.Hash);
    // Verify the controls on the Browser view
    await t.expect(browserPage.totalKeysNumber.visible).ok('The total number of keys is not displayed on the Browser view');
    await t.expect(browserPage.scannedValue.visible).ok('The number of keys scanned is not displayed on the Browser view');
    await t.expect(browserPage.scanMoreButton.visible).ok('The scan more button is not displayed on the Browser view');
    // Verify the controls on the Tree view
    await t.click(browserPage.treeViewButton);
    await t.expect(browserPage.totalKeysNumber.visible).ok('The total number of keys is not displayed on the Tree view');
    await t.expect(browserPage.scannedValue.visible).ok('The number of keys scanned is not displayed on the Tree view');
    await t.expect(browserPage.scanMoreButton.visible).ok('The scan more button is not displayed on the Tree view');
});
test('Verify that when user deletes the key he can see the key is removed from the folder, the number of keys is reduced, the percentage is recalculated', async t => {
    const mainFolder = browserPage.TreeView.getFolderSelectorByName('device');
    // Open the first key in the tree view and remove
    await t.click(browserPage.treeViewButton);
    // Verify the default separator
    await t.click(browserPage.TreeView.treeViewSettingsBtn);
    await t.expect(browserPage.TreeView.treeViewDelimiterInput.value).eql(':', 'The “:” (colon) not used as a default separator for namespaces');
    // Verify that user can see that “:” (colon) used as a default separator for namespaces and see the number of keys found per each namespace
    await t.expect(browserPage.TreeView.treeViewKeysNumber.visible).ok('The user can not see the number of keys');

    await t.expect(mainFolder.visible).ok('The key folder is not displayed');
    await t.click(mainFolder);
    const numberOfKeys = await browserPage.TreeView.getFolderCountSelectorByName('device').textContent;
    const targetFolderName = await mainFolder.nth(1).find('[data-testid^=folder-]').textContent;
    const targetFolderSelector = browserPage.TreeView.getFolderSelectorByName(`device:${targetFolderName}`);
    await t.click(targetFolderSelector);
    await browserPage.deleteKey();
    // Verify the results
    await t.expect(targetFolderSelector.exists).notOk('The previous folder is not closed after removing key folder');
    await t.click(browserPage.TreeView.treeViewDeviceFolder);
    await t.expect(mainFolder.nth(1).textContent).notEql(targetFolderName, 'The key folder is not removed from the tree view');
    const actualCount = await browserPage.TreeView.getFolderCountSelectorByName('device').textContent;
    await t.expect(+actualCount).lt(+numberOfKeys, 'The number of keys is not recalculated');
});
test
    .before(async() => {
        await databaseHelper.acceptLicenseTermsAndAddDatabaseApi(ossStandaloneConfigEmpty);
    })
    .after(async() => {
        // Clear and delete database
        for(const name of keyNames) {
            await apiKeyRequests.deleteKeyByNameApi(name, ossStandaloneConfigEmpty.databaseName);
        }
        await databaseAPIRequests.deleteStandaloneDatabaseApi(ossStandaloneConfigEmpty);
    })('Verify that if there are keys without namespaces, they are displayed in the root directory after all folders by default in the Tree view', async t => {
        keyNames = [
            `atest:a-${Common.generateWord(10)}`,
            `atest:z-${Common.generateWord(10)}`,
            `ztest:a-${Common.generateWord(10)}`,
            `ztest:z-${Common.generateWord(10)}`,
            `atest-${Common.generateWord(10)}`,
            `ztest-${Common.generateWord(10)}`
        ];
        const commands = [
            'flushdb',
            `HSET ${keyNames[0]} field value`,
            `HSET ${keyNames[1]} field value`,
            `HSET ${keyNames[2]} field value`,
            `SADD ${keyNames[3]} value`,
            `SADD ${keyNames[4]} value`,
            `HSET ${keyNames[5]} field value`
        ];
        const expectedSortedByASC = [
            keyNames[0].split(':')[1],
            keyNames[1].split(':')[1],
            keyNames[2].split(':')[1],
            keyNames[3].split(':')[1],
            keyNames[4],
            keyNames[5]
        ];
        const expectedSortedByDESC = [
            keyNames[3].split(':')[1],
            keyNames[2].split(':')[1],
            keyNames[1].split(':')[1],
            keyNames[0].split(':')[1],
            keyNames[5],
            keyNames[4]
        ];

        // Create 5 keys
        await browserPage.Cli.sendCommandsInCli(commands);
        await t.click(browserPage.treeViewButton);

        // Verify that if there are keys without namespaces, they are displayed in the root directory after all folders by default in the Tree view
        await browserPage.TreeView.openTreeFolders([`${keyNames[0]}`.split(':')[0]]);
        await browserPage.TreeView.openTreeFolders([`${keyNames[2]}`.split(':')[0]]);
        let actualItemsArray = await browserPage.TreeView.getAllItemsArray();
        // Verify that user can see all folders and keys sorted by name ASC by default
        await t.expect(actualItemsArray).eql(expectedSortedByASC);

        // Verify that user can change the sorting ASC-DESC
        await browserPage.TreeView.changeOrderingInTreeView('DESC');
        await browserPage.TreeView.openTreeFolders([`${keyNames[2]}`.split(':')[0]]);
        await browserPage.TreeView.openTreeFolders([`${keyNames[0]}`.split(':')[0]]);
        actualItemsArray = await browserPage.TreeView.getAllItemsArray();
        await t.expect(actualItemsArray).eql(expectedSortedByDESC);
    });

https://redislabs.atlassian.net/browse/RI-5131
test
    .before(async() => {
        await databaseHelper.acceptLicenseTermsAndAddDatabaseApi(ossStandaloneConfig);
    })
    .after(async() => {
        await browserPage.Cli.sendCommandInCli('flushdb');
        await databaseAPIRequests.deleteStandaloneDatabaseApi(ossStandaloneConfig);
    })('Verify that if filtering results has only 1 folder, the folder will be expanded', async t => {
        const name = Common.generateWord(10);
        const additionalCharacter = Common.generateWord(1);
        const keyName1 = Common.generateWord(3);
        const keyName2 = Common.generateWord(3);
        keyNames = [`${name}${additionalCharacter}:${keyName1}`, `${name}${additionalCharacter}:${keyName2}`, name];

        const commands = [
            'flushdb',
            `HSET ${keyNames[0]} field value`,
            `HSET ${keyNames[1]} field value`,
            `HSET ${keyNames[2]} field value`
        ];
        await browserPage.Cli.sendCommandsInCli(commands);
        await t.click(browserPage.treeViewButton);

        // Verify if there is only folder, a user can see keys inside
        await browserPage.searchByKeyName(`${name}${additionalCharacter}*`);
        await verifyKeysDisplayingInTheList([keyName1, keyName2], true);

        // Verify if there are folder and key, a user can't see keys inside the folder
        await browserPage.searchByKeyName(`${name}*`);
        await verifyKeysDisplayingInTheList([keyName1, keyName2], false);
    });

