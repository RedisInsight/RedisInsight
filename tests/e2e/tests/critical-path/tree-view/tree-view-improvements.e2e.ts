import { Selector, t } from 'testcafe';
import { acceptLicenseTermsAndAddDatabaseApi } from '../../../helpers/database';
import {
    BrowserPage, CliPage
} from '../../../pageObjects';
import {
    commonUrl,
    ossStandaloneConfig
} from '../../../helpers/conf';
import { KeyTypesTexts, rte } from '../../../helpers/constants';
import { deleteStandaloneDatabaseApi } from '../../../helpers/api/api-database';
import { Common } from '../../../helpers/common';
import { verifyKeysDisplayedInTheList, verifyKeysNotDisplayedInTheList } from '../../../helpers/keys';

const browserPage = new BrowserPage();
const common = new Common();
const cliPage = new CliPage();
let keyNames: string[];
let keyName1: string;
let keyName2: string;
let keyNameSingle: string;
let index: string;

fixture`Tree view navigations improvement tests`
    .meta({ type: 'critical_path', rte: rte.standalone })
    .page(commonUrl);
test
    .before(async() => {
        await acceptLicenseTermsAndAddDatabaseApi(ossStandaloneConfig, ossStandaloneConfig.databaseName);
    })
    .after(async() => {
        await t.click(browserPage.patternModeBtn);
        await browserPage.deleteKeysByNames(keyNames);
        await deleteStandaloneDatabaseApi(ossStandaloneConfig);
    })('Tree view preselected folder', async t => {
        keyName1 = common.generateWord(10); // used to create index name
        keyName2 = common.generateWord(10); // used to create index name
        keyNameSingle = common.generateWord(10);
        keyNames = [`${keyName1}:1`, `${keyName1}:2`, `${keyName2}:1`, `${keyName2}:2`, keyNameSingle];

        const commands = [
            'flushdb',
            `HSET ${keyNames[0]} field value`,
            `HSET ${keyNames[1]} field value`,
            `HSET ${keyNames[2]} field value`,
            `HSET ${keyNames[3]} field value`,
            `SADD ${keyNames[4]} value`
        ];

        // Create 5 keys
        await cliPage.sendCommandsInCli(commands);
        await t.click(browserPage.treeViewButton);
        // The folder without any patterns selected and the list of keys is displayed when there is a folder without any patterns
        await verifyKeysDisplayedInTheList([keyNameSingle]);

        await browserPage.openTreeFolders([await browserPage.getTextFromNthTreeElement(1)]);
        await browserPage.selectFilterGroupType(KeyTypesTexts.Set);
        // The folder without any namespaces is selected (if exists) when folder does not exist after search/filter
        await verifyKeysDisplayedInTheList([keyNameSingle]);

        await t.click(browserPage.setDeleteButton);
        // The folder without any patterns selected and the list of keys is displayed when there is a folder without any patterns
        await verifyKeysDisplayedInTheList([keyNameSingle]);
        await verifyKeysNotDisplayedInTheList([`${keyNames[0]}:1`, `${keyNames[2]}:2`]);

        // switch between browser view and tree view
        await t.click(browserPage.browserViewButton)
            .click(browserPage.treeViewButton);
        await browserPage.deleteKeyByName(keyNames[4]);
        await t.click(browserPage.clearFilterButton);
        // get first folder name
        const firstTreeItemText = await browserPage.getTextFromNthTreeElement(0);
        const firstTreeItemKeys = Selector(`[data-testid="node-item_${firstTreeItemText}:keys:keys:"]`); // keys after node item opened
        // The first folder with namespaces is expanded and selected when there is no folder without any patterns
        await t.expect(firstTreeItemKeys.visible)
            .ok('First folder is not expanded');
        await verifyKeysDisplayedInTheList([`${firstTreeItemText}:1`, `${firstTreeItemText}:2`]);

        const commands1 = [
            `HSET ${keyNames[4]} field value`
        ];

        await cliPage.sendCommandsInCli(commands1);
        await t.click(browserPage.refreshKeysButton);
        // Refreshed Tree view preselected folder
        await t.expect(firstTreeItemKeys.visible)
            .ok('Folder is not selected');
        await verifyKeysDisplayedInTheList([`${firstTreeItemText}:1`, `${firstTreeItemText}:2`]);

        await browserPage.selectFilterGroupType(KeyTypesTexts.Hash);
        await t.expect(firstTreeItemKeys.visible).ok('Folder is not selected after searching with HASH');
        // Filtered Tree view preselected folder
        await verifyKeysDisplayedInTheList([`${firstTreeItemText}:1`, `${firstTreeItemText}:2`]);

        await browserPage.searchByKeyName('*');
        // Search capability Filtered Tree view preselected folder
        await t.expect(firstTreeItemKeys.visible).ok('Folder is not selected');
        await verifyKeysDisplayedInTheList([`${firstTreeItemText}:1`, `${firstTreeItemText}:2`]);

        await t.click(browserPage.clearFilterButton);
        // Filtered Tree view preselected folder
        await t.expect(firstTreeItemKeys.visible).ok('Folder is not selected');
        await verifyKeysDisplayedInTheList([`${firstTreeItemText}:1`, `${firstTreeItemText}:2`]);

        await browserPage.selectFilterGroupType(KeyTypesTexts.Stream);
        // Filtered Tree view preselected folder
        await t.expect(browserPage.keyListTable.textContent).contains('No results found.', 'Key is not found message not displayed');

        await t.click(browserPage.streamDeleteButton); // clear stream from filter
        // Filtered Tree view preselected folder
        await t.expect(browserPage.keyListTable.textContent).notContains('No results found.', 'Key is not found message still displayed');
        await t.expect(
            firstTreeItemKeys.visible)
            .notOk('First folder is expanded');
    });

test
    .before(async() => {
        await acceptLicenseTermsAndAddDatabaseApi(ossStandaloneConfig, ossStandaloneConfig.databaseName);
    })
    .after(async() => {
        await cliPage.sendCommandInCli(`FT.DROPINDEX ${index}`);
        await deleteStandaloneDatabaseApi(ossStandaloneConfig);
    })('Verify tree view navigation for index based search', async t => {
        keyName1 = common.generateWord(10); // used to create index name
        keyName2 = common.generateWord(10); // used to create index name
        const subFolder1 = common.generateWord(10); // used to create index name
        keyNames = [`${keyName1}:${subFolder1}:1`, `${keyName1}:${subFolder1}:2`, `${keyName2}:1:1`, `${keyName2}:1:2`];
        const commands = [
            'flushdb',
            `HSET ${keyNames[0]} field value`,
            `HSET ${keyNames[1]} field value`,
            `HSET ${keyNames[2]} field value`,
            `HSET ${keyNames[3]} field value`
        ];
        await cliPage.sendCommandsInCli(commands);

        // generate index based on keyName
        const folders = [keyName1, subFolder1];
        index = await cliPage.createIndexwithCLI(folders.join(':'));
        await t.click(browserPage.redisearchModeBtn); // click redisearch button
        await browserPage.selectIndexByName(index);
        await t.click(browserPage.treeViewButton);
        await t.click(Selector(`[data-testid="${`node-item_${folders[0]}:`}"]`)); // close folder
        await browserPage.openTreeFolders(folders);
        await t.click(browserPage.refreshKeysButton);
        // Refreshed Tree view preselected folder for index based search
        await t.expect(
            Selector(`[data-testid="node-item_${folders[0]}:${folders[1]}:keys:keys:"]`).visible)
            .ok('Folder is not selected');
    });

test
    .before(async() => {
        await acceptLicenseTermsAndAddDatabaseApi(ossStandaloneConfig, ossStandaloneConfig.databaseName);
    })
    .after(async() => {
        await t.click(browserPage.patternModeBtn);
        await browserPage.deleteKeysByNames(keyNames.slice(1));
        await deleteStandaloneDatabaseApi(ossStandaloneConfig);
    })('Search capability Refreshed Tree view preselected folder', async t => {
        keyName1 = common.generateWord(10); // used to create index name
        keyName2 = common.generateWord(10); // used to create index name
        keyNameSingle = common.generateWord(10);
        keyNames = [`${keyName1}:1`, `${keyName1}:2`, `${keyName2}:1`, `${keyName2}:2`, keyNameSingle];
        const commands = [
            'flushdb',
            `HSET ${keyNames[0]} field value`,
            `HSET ${keyNames[1]} field value`,
            `RPUSH ${keyNames[2]} field`,
            `RPUSH ${keyNames[3]} field`,
            `SADD ${keyNames[4]} value`
        ];
        await cliPage.sendCommandsInCli(commands);
        await t.click(browserPage.treeViewButton);
        // The folder without any patterns selected and the list of keys is displayed when there is a folder without any patterns
        await verifyKeysDisplayedInTheList([keyNameSingle]);

        await browserPage.openTreeFolders([keyName1]); // Type: hash
        await browserPage.openTreeFolders([keyName2]); // Type: list
        await browserPage.selectFilterGroupType(KeyTypesTexts.Hash);
        // The first folder with namespaces is expanded and selected when folder and folder without any namespaces does not exist after search/filter
        await verifyKeysDisplayedInTheList([keyNames[0], keyNames[1]]);

        await t.click(browserPage.hashDeleteButton);
        await cliPage.sendCommandsInCli([`DEL ${keyNames[0]}`]);
        await t.click(browserPage.refreshKeysButton); // refresh keys
        // The previously selected folder is preselected when key does not exist after keys refresh
        await verifyKeysDisplayedInTheList([keyNames[1]]);
        await verifyKeysNotDisplayedInTheList([keyNames[0], keyNames[2], keyNames[3], keyNames[4]]);

        await browserPage.searchByKeyName('*');
        await t.click(browserPage.refreshKeysButton);
        // Search capability Refreshed Tree view preselected folder
        await verifyKeysDisplayedInTheList([keyNames[1]]);
        await verifyKeysNotDisplayedInTheList([keyNames[0], keyNames[2], keyNames[3], keyNames[4]]);
    });
