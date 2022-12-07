import { acceptLicenseTermsAndAddDatabaseApi } from '../../../helpers/database';
import {
    BrowserPage, CliPage
} from '../../../pageObjects';
import {
    commonUrl,
    ossStandaloneBigConfig,
    ossStandaloneConfig
} from '../../../helpers/conf';
import { KeyTypesTexts, rte } from '../../../helpers/constants';
import { deleteStandaloneDatabaseApi } from '../../../helpers/api/api-database';
import { Common } from '../../../helpers/common';
import { Selector, t } from 'testcafe';
import { verifyKeysDisplayedInTheList } from '../../../helpers/keys';

const browserPage = new BrowserPage();
const common = new Common();

const cliPage = new CliPage();

let keyNames: string[];

let keyName1: string;
let keyName2: string;
let keynameSingle: string;

let index: string;

fixture`Tree view navigations improvement tests`
    .meta({ type: 'critical_path', rte: rte.standalone })
    .page(commonUrl)
test
    .before(async () => {
        await acceptLicenseTermsAndAddDatabaseApi(ossStandaloneConfig, ossStandaloneConfig.databaseName);
    })
    .after(async () => {
        await t.click(browserPage.patternModeBtn);
        await browserPage.deleteKeysByNames(keyNames);
        await deleteStandaloneDatabaseApi(ossStandaloneConfig);
    })
    ('Verify that if any keys are found and will not be redirected from the previously selected directory', async t => {

        keyName1 = common.generateWord(10); // used to create index name
        keyName2 = common.generateWord(10); // used to create index name
        keynameSingle = common.generateWord(10);
        keyNames = [`${keyName1}:1`, `${keyName1}:2`, `${keyName2}:1`, `${keyName2}:2`, keynameSingle];

        const commands = [
            `HSET ${keyNames[0]} field value`,
            `HSET ${keyNames[1]} field value`,
            `HSET ${keyNames[2]} field value`,
            `HSET ${keyNames[3]} field value`,
            `HSET ${keyNames[4]} field value`,
        ];

        // Create 5 keys
        await cliPage.sendCommandsInCli(commands);

        // Switch to tree view
        await browserPage.deleteKeyByName(keyNames[4]);
        await t.click(browserPage.clearFilterButton);
        await t.click(browserPage.treeViewButton);

        // get first folder name
        const firstTreeItemText = await browserPage.getTextFromFirstTreeElement();
        const treeItemKeys = Selector(`[data-testid="node-item_${firstTreeItemText}:keys:keys:"]`); // keys after node item opened  

        // verify that the first folder with namespaces is expanded and selected
        await t.expect(
            treeItemKeys.visible).
            ok("First folder is not expanded");
        await verifyKeysDisplayedInTheList([firstTreeItemText + ":1", firstTreeItemText + ":2"]); // verify created keys are visible

        const commands1 = [
            `HSET ${keyNames[4]} field value`,
        ];

        // Create 4 keys and index
        await cliPage.sendCommandsInCli(commands1);
        await t.click(browserPage.refreshKeysButton); // refresh keys

        await t.expect(
            treeItemKeys.visible).
            ok("Folder is not selected");
        await verifyKeysDisplayedInTheList([firstTreeItemText + ":1", firstTreeItemText + ":2"]); // verify created keys are visible

        await browserPage.selectFilterGroupType(KeyTypesTexts.Hash);

        await t.expect(treeItemKeys.visible).ok("Folder is not selected after searching with HASH");
        await verifyKeysDisplayedInTheList([firstTreeItemText + ":1", firstTreeItemText + ":2"]); // verify created keys are visible

        await browserPage.searchByKeyName('*');

        await t.expect(treeItemKeys.visible).ok("Folder is not selected");
        await verifyKeysDisplayedInTheList([firstTreeItemText + ":1", firstTreeItemText + ":2"]); // verify created keys are visible

        await t.click(browserPage.clearFilterButton);

        await t.expect(treeItemKeys.visible).ok("Folder is not selected");
        await verifyKeysDisplayedInTheList([firstTreeItemText + ":1", firstTreeItemText + ":2"]); // verify created keys are visible

        await browserPage.selectFilterGroupType(KeyTypesTexts.Stream);

        await t.expect(
            Selector(`[role="rowgroup"]`).find(`div`).withText("No results found.").visible).
            ok("No results text is visible"); // verify no results found

        await t.click(browserPage.streamDeleteButton); // clear stream from filter

        await t.expect(
            Selector(`[role="rowgroup"]`).find(`div`).withText("No results found.").visible).
            notOk("No result text is still visible");
        await t.expect(
            treeItemKeys.visible).
            notOk("First folder is expanded");

    });

test
    .before(async () => {
        await acceptLicenseTermsAndAddDatabaseApi(ossStandaloneBigConfig, ossStandaloneBigConfig.databaseName);
    })
    .after(async () => {
        await cliPage.sendCommandInCli(`FT.DROPINDEX ${index}`);
        await deleteStandaloneDatabaseApi(ossStandaloneBigConfig);
    })
    ('Verify tree view navigation for index based search', async t => {
        // generate index based on keyName
        let folders = ["mobile", "2"];

        index = await cliPage.createRandomIndexNamewithCLI();

        await t.click(browserPage.redisearchModeBtn); // click redisearch button
        await browserPage.selectIndexByName(index);

        await t.click(browserPage.treeViewButton);
        await browserPage.openTreeFolders(folders);
        await t.click(browserPage.refreshKeysButton);

        await t.expect(
            Selector(`[data-testid="node-item_${folders[0]}:${folders[1]}:keys:keys:"]`).visible)
            .ok("Folder is not selected");

    });
