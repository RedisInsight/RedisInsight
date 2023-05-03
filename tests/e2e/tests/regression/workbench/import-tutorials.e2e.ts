import * as path from 'path';
import { t } from 'testcafe';
import { rte } from '../../../helpers/constants';
import {
    acceptLicenseTermsAndAddDatabaseApi
} from '../../../helpers/database';
import { BrowserPage, MyRedisDatabasePage, WorkbenchPage } from '../../../pageObjects';
import { commonUrl, ossStandaloneConfig, ossStandaloneRedisearch } from '../../../helpers/conf';
import { deleteStandaloneDatabaseApi } from '../../../helpers/api/api-database';
import { Common } from '../../../helpers/common';
import { deleteAllKeysFromDB, verifyKeysDisplayedInTheList } from '../../../helpers/keys';

const myRedisDatabasePage = new MyRedisDatabasePage();
const workbenchPage = new WorkbenchPage();
const browserPage = new BrowserPage();
const zipFolderName = 'customTutorials';
const folderPath = path.join('..', 'test-data', 'upload-tutorials', zipFolderName);
const folder1 = 'folder-1';
const folder2 = 'folder-2';
const internalLinkName2 = 'vector-2';
let tutorialName = `${zipFolderName}${Common.generateWord(5)}`;
let zipFilePath = path.join('..', 'test-data', 'upload-tutorials', `${tutorialName}.zip`);
let internalLinkName1 = 'probably-1';
const verifyCompletedResultText = async(resultsText: string[]): Promise<void> => {
    for (const result of resultsText) {
        await t.expect(workbenchPage.Toast.toastBody.textContent).contains(result, 'Bulk upload completed summary not correct');
    }
    await t.expect(workbenchPage.Toast.toastBody.textContent).notContains('0:00:00.00', 'Bulk upload Time taken not correct');
};

fixture.only `Upload custom tutorials`
    .meta({ type: 'regression', rte: rte.standalone })
    .page(commonUrl)
    .beforeEach(async t => {
        await acceptLicenseTermsAndAddDatabaseApi(ossStandaloneConfig, ossStandaloneConfig.databaseName);
        await t.click(myRedisDatabasePage.NavigationPanel.workbenchButton);
    })
    .afterEach(async() => {
        await deleteStandaloneDatabaseApi(ossStandaloneConfig);
    });
/* https://redislabs.atlassian.net/browse/RI-4186, https://redislabs.atlassian.net/browse/RI-4198,
https://redislabs.atlassian.net/browse/RI-4302, https://redislabs.atlassian.net/browse/RI-4318
*/
test
    .before(async t => {
        await acceptLicenseTermsAndAddDatabaseApi(ossStandaloneConfig, ossStandaloneConfig.databaseName);
        await t.click(myRedisDatabasePage.NavigationPanel.workbenchButton);
        tutorialName = `${zipFolderName}${Common.generateWord(5)}`;
        zipFilePath = path.join('..', 'test-data', 'upload-tutorials', `${tutorialName}.zip`);
        // Create zip file for uploading
        await Common.createZipFromFolder(folderPath, zipFilePath);
    })
    .after(async() => {
        // Delete zip file
        await Common.deleteFileFromFolder(zipFilePath);
        await deleteStandaloneDatabaseApi(ossStandaloneConfig);
    })('Verify that user can upload tutorial with local zip file without manifest.json', async t => {
        // Verify that user can upload custom tutorials on docker version
        internalLinkName1 = 'probably-1';
        const imageExternalPath = 'RedisInsight screen external';
        // const imageRelativePath = 'RedisInsight screen relative';

        // Verify that user can see the “MY TUTORIALS” section in the Enablement area.
        await t.expect(workbenchPage.customTutorials.visible).ok('custom tutorials sections is not visible');
        await t.click(workbenchPage.tutorialOpenUploadButton);
        await t.expect(workbenchPage.tutorialSubmitButton.hasAttribute('disabled')).ok('submit button is not disabled');

        // Verify that User can request to add a new custom Tutorial by uploading a .zip archive from a local folder
        await t.setFilesToUpload(workbenchPage.tutorialImport, [zipFilePath]);
        await t.click(workbenchPage.tutorialSubmitButton);
        await t.expect(workbenchPage.tutorialAccordionButton.withText(tutorialName).visible).ok(`${tutorialName} tutorial is not uploaded`);

        // Verify that when user upload a .zip archive without a .json manifest, all markdown files are inserted at the same hierarchy level
        await t.click(workbenchPage.tutorialAccordionButton.withText(tutorialName));
        await t.expect((await workbenchPage.getAccordionButtonWithName(folder1)).visible).ok(`${folder1} is not visible`);
        await t.expect((await workbenchPage.getAccordionButtonWithName(folder2)).visible).ok(`${folder2} is not visible`);
        await t.click(await workbenchPage.getAccordionButtonWithName(folder1));
        await t.expect((await workbenchPage.getInternalLinkWithManifest(internalLinkName1)).visible)
            .ok(`${internalLinkName1} is not visible`);
        await t.click(await workbenchPage.getAccordionButtonWithName(folder2));
        await t.expect((await workbenchPage.getInternalLinkWithManifest(internalLinkName2)).visible)
            .ok(`${internalLinkName2} is not visible`);
        await t.expect(workbenchPage.scrolledEnablementArea.exists).notOk('enablement area is visible before clicked');
        await t.click((await workbenchPage.getInternalLinkWithManifest(internalLinkName1)));
        await t.expect(workbenchPage.scrolledEnablementArea.visible).ok('enablement area is not visible after clicked');

        // Verify that user can see image in custom tutorials by providing absolute external path in md file
        const imageExternal = await workbenchPage.getTutorialImageByAlt(imageExternalPath);
        await workbenchPage.waitUntilImageRendered(imageExternal);
        const imageExternalHeight = await imageExternal.getStyleProperty('height');
        await t.expect(parseInt(imageExternalHeight.replace(/[^\d]/g, ''))).gte(150);

        /* Uncomment after fix https://redislabs.atlassian.net/browse/RI-4486
        also need to add in probably-1.md file:
        Relative:
        ![RedisInsight screen relative](../_images/image.png) */
        // Verify that user can see image in custom tutorials by providing relative path in md file
        // const imageRelative = await workbenchPage.getTutorialImageByAlt(imageRelativePath);
        // await workbenchPage.waitUntilImageRendered(imageRelative);
        // const imageRelativeHeight = await imageRelative.getStyleProperty('height');
        // await t.expect(parseInt(imageRelativeHeight.replace(/[^\d]/g, ''))).gte(150);

        // Verify that when User delete the tutorial, then User can see this tutorial and relevant markdown files are deleted from: the Enablement area in Workbench
        await t.click(workbenchPage.closeEnablementPage);
        await t.click(workbenchPage.tutorialLatestDeleteIcon);
        await t.expect(workbenchPage.tutorialDeleteButton.visible).ok('Delete popup is not visible');
        await t.click(workbenchPage.tutorialDeleteButton);
        await t.expect(workbenchPage.tutorialDeleteButton.exists).notOk('Delete popup is still visible');
        await t.expect((workbenchPage.tutorialAccordionButton.withText(tutorialName).exists))
            .notOk(`${tutorialName} tutorial is not uploaded`);
    });
// https://redislabs.atlassian.net/browse/RI-4186, https://redislabs.atlassian.net/browse/RI-4213, https://redislabs.atlassian.net/browse/RI-4302
test('Verify that user can upload tutorial with URL with manifest.json', async t => {
    const labelFromManifest = 'LabelFromManifest';
    const link = 'https://drive.google.com/uc?id=1puRUoT8HmyZCekkeWNxBzXe_48TzXcJc&export=download';
    internalLinkName1 = 'manifest-id';
    tutorialName = 'tutorialTestByLink';

    await t.click(workbenchPage.tutorialOpenUploadButton);
    // Verify that user can upload tutorials using a URL
    await t.typeText(workbenchPage.tutorialLinkField, link);
    await t.click(workbenchPage.tutorialSubmitButton);
    await t.expect(workbenchPage.tutorialAccordionButton.withText(tutorialName).with({ timeout: 20000 }).visible)
        .ok(`${tutorialName} tutorial is not uploaded`);
    await t.click(workbenchPage.tutorialAccordionButton.withText(tutorialName));
    // Verify that User can see the same structure in the tutorial uploaded as described in the .json manifest
    await t.expect((await workbenchPage.getInternalLinkWithoutManifest(internalLinkName1)).visible)
        .ok(`${internalLinkName1} folder specified in manifest is not visible`);
    await t.expect(await (await workbenchPage.getInternalLinkWithoutManifest(internalLinkName1)).textContent)
        .eql(labelFromManifest, `${labelFromManifest} tutorial specified in manifest is not visible`);
    await t.click((await workbenchPage.getInternalLinkWithoutManifest(internalLinkName1)));
    await t.expect(workbenchPage.scrolledEnablementArea.visible).ok('enablement area is not visible after clicked');
    await t.click(workbenchPage.closeEnablementPage);
    await t.click(workbenchPage.tutorialLatestDeleteIcon);
    await t.expect(workbenchPage.tutorialDeleteButton.visible).ok('Delete popup is not visible');
    await t.click(workbenchPage.tutorialDeleteButton);
    await t.expect(workbenchPage.tutorialDeleteButton.exists).notOk('Delete popup is still visible');
    // Verify that when User delete the tutorial, then User can see this tutorial and relevant markdown files are deleted from: the Enablement area in Workbench
    await t.expect((workbenchPage.tutorialAccordionButton.withText(tutorialName).exists))
        .notOk(`${tutorialName} tutorial is not uploaded`);
});
// https://redislabs.atlassian.net/browse/RI-4352
test
    .before(async t => {
        await acceptLicenseTermsAndAddDatabaseApi(ossStandaloneRedisearch, ossStandaloneRedisearch.databaseName);
        await t.click(myRedisDatabasePage.NavigationPanel.workbenchButton);
        tutorialName = `${zipFolderName}${Common.generateWord(5)}`;
        zipFilePath = path.join('..', 'test-data', 'upload-tutorials', `${tutorialName}.zip`);
        // Create zip file for uploading
        await Common.createZipFromFolder(folderPath, zipFilePath);
    })
    .after(async() => {
        await Common.deleteFileFromFolder(zipFilePath);
        await deleteAllKeysFromDB(ossStandaloneRedisearch.host, ossStandaloneRedisearch.port);
        // Clear and delete database
        await t.click(myRedisDatabasePage.NavigationPanel.workbenchButton);
        await workbenchPage.deleteTutorialByName(tutorialName);
        await t.expect((workbenchPage.tutorialAccordionButton.withText(tutorialName).exists))
        .notOk(`${tutorialName} tutorial is not deleted`);
        await deleteStandaloneDatabaseApi(ossStandaloneRedisearch);
    })('Verify that user can bulk upload data from custom tutorial', async t => {
        const allKeysResults = ['9Commands Processed', '9Success', '0Errors'];
        const absolutePathResults = ['1Commands Processed', '1Success', '0Errors'];
        const invalidPathes = ['Invalid relative', 'Invalid absolute'];
        const keyNames = ['hashkey1', 'listkey1', 'setkey1', 'zsetkey1', 'stringkey1', 'jsonkey1', 'streamkey1', 'graphkey1', 'tskey1', 'stringkey1test'];
        internalLinkName1 = 'probably-1';

        // Upload custom tutorial
        await t
            .click(workbenchPage.tutorialOpenUploadButton)
            .setFilesToUpload(workbenchPage.tutorialImport, [zipFilePath])
            .click(workbenchPage.tutorialSubmitButton);
        await t.expect(workbenchPage.tutorialAccordionButton.withText(tutorialName).visible).ok(`${tutorialName} tutorial is not uploaded`);
        // Open tutorial
        await t
            .click(workbenchPage.tutorialAccordionButton.withText(tutorialName))
            .click(await workbenchPage.getAccordionButtonWithName(folder1))
            .click((await workbenchPage.getInternalLinkWithManifest(internalLinkName1)));

        // Verify that user can bulk upload data by relative path
        await t.click((workbenchPage.uploadDataBulkBtn.withExactText('Upload relative')));
        await t.click(workbenchPage.uploadDataBulkApplyBtn);
        // Verify that user can see the summary when the command execution is completed
        await verifyCompletedResultText(allKeysResults);

        // Verify that user can bulk upload data by absolute path
        await t.click((workbenchPage.uploadDataBulkBtn.withExactText('Upload absolute')));
        await t.click(workbenchPage.uploadDataBulkApplyBtn);
        await verifyCompletedResultText(absolutePathResults);

        // Verify that user can't upload file by invalid relative path
        // Verify that user can't upload file by invalid absolute path
        for (const path in invalidPathes) {
            await t.click((workbenchPage.uploadDataBulkBtn.withExactText(path)));
            await t.click(workbenchPage.uploadDataBulkApplyBtn);
            // Verify that user can see standard error messages when any error occurs while finding the file or parsing it
            await t.expect(workbenchPage.Toast.toastError.textContent).contains('Data file was not found', 'Bulk upload not failed');
        }

        // Open Browser page
        await t.click(myRedisDatabasePage.NavigationPanel.browserButton);
        // Verify that keys of all types can be uploaded
        await browserPage.searchByKeyName('*key1');
        await verifyKeysDisplayedInTheList(keyNames);
    });
