import * as path from 'path';
import { rte } from '../../../helpers/constants';
import {
    acceptLicenseTermsAndAddDatabaseApi
} from '../../../helpers/database';
import { MyRedisDatabasePage, WorkbenchPage } from '../../../pageObjects';
import { commonUrl, ossStandaloneConfig } from '../../../helpers/conf';
import { deleteStandaloneDatabaseApi } from '../../../helpers/api/api-database';
import {Common} from '../../../helpers/common';

const myRedisDatabasePage = new MyRedisDatabasePage();
const workbenchPage = new WorkbenchPage();
const common = new Common();
const filePath = path.join('..', '..', '..', 'test-data', 'upload-tutorials', 'sample.zip');
const tutorialName = `tutorialName-${common.generateWord(10)}`;
const link = 'https://drive.google.com/uc?export=download&id=1mlyDKWLu12L02FblOPh15EwG2Vy_FhJ7';
let folder1 = 'folder-1';
let folder2 = 'folder-2';
let internalLinkName1 = 'probably-1';
let internalLinkName2 = 'vector-2';

fixture `Upload custom tutorials`
    .meta({type: 'regression', rte: rte.standalone})
    .page(commonUrl)
    .beforeEach(async t => {
        await acceptLicenseTermsAndAddDatabaseApi(ossStandaloneConfig, ossStandaloneConfig.databaseName);
        await t.click(myRedisDatabasePage.workbenchButton);
    })
    .afterEach(async() => {
        await deleteStandaloneDatabaseApi(ossStandaloneConfig);
    });
// https://redislabs.atlassian.net/browse/RI-4186, https://redislabs.atlassian.net/browse/RI-4198
test('Verify that user can upload tutorial with local zip file without manifest.json', async t => {
    // Verify that user can upload custom tutorials on docker version
    folder1 = 'folder-1';
    folder2 = 'folder-2';
    internalLinkName1 = 'probably-1';
    internalLinkName2 = 'vector-2';
    // Verify that user can see the “MY TUTORIALS” section in the Enablement area.
    await t.expect(workbenchPage.customTutorials.visible).ok('custom tutorials sections is not visible');
    await t.click(workbenchPage.tutorialOpenUploadButton);
    // Verify that User can enter a tutorial name
    await t.typeText(workbenchPage.tutorialNameField, tutorialName);
    await t.expect(workbenchPage.tutorialSubmitButton.hasAttribute('disabled')).ok('submit button is not disabled');
    // Verify that User can request to add a new custom Tutorial by uploading a .zip archive from a local folder
    await t.setFilesToUpload(workbenchPage.tutorialImport, [filePath]);
    await t.click(workbenchPage.tutorialSubmitButton);
    await t.expect(workbenchPage.tutorialAccordionButton.withText(tutorialName).visible).ok(`${tutorialName} tutorial is not uploaded`);
    // Verify that when user upload a .zip archive without a .json manifest, all markdown files are inserted at the same hierarchy level
    await t.click(workbenchPage.tutorialAccordionButton.withText(tutorialName));
    await t.expect((await workbenchPage.getAccordionButtonWithName(folder1)).visible).ok(`${folder1} is not visible`);
    await t.expect((await workbenchPage.getAccordionButtonWithName(folder2)).visible).ok(`${folder2} is not visible`);
    await t.expect((await workbenchPage.getInternalLinkWithManifest(internalLinkName1)).visible)
        .ok(`${internalLinkName1} is not visible`);
    await t.expect((await workbenchPage.getInternalLinkWithManifest(internalLinkName2)).visible)
        .ok(`${internalLinkName2} is not visible`);
    await t.expect(workbenchPage.scrolledEnablementArea.exists).notOk('enablement area is visible before clicked');
    await t.click((await workbenchPage.getInternalLinkWithManifest(internalLinkName1)));
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
// https://redislabs.atlassian.net/browse/RI-4186, https://redislabs.atlassian.net/browse/RI-4213
test('Verify that user can upload tutorial with URL with manifest.json', async t => {
    internalLinkName1 = 'working_probably';

    await t.click(workbenchPage.tutorialOpenUploadButton);
    await t.typeText(workbenchPage.tutorialNameField, tutorialName);
    // Verify that user can upload tutorials using a URL
    await t.typeText(workbenchPage.tutorialLinkField, link);
    await t.click(workbenchPage.tutorialSubmitButton);
    await t.expect(workbenchPage.tutorialAccordionButton.withText(tutorialName).with({ timeout: 20000 }).visible)
        .ok(`${tutorialName} tutorial is not uploaded`);
    await t.click(workbenchPage.tutorialAccordionButton.withText(tutorialName));
    // Verify that User can see the same structure in the tutorial uploaded as described in the .json manifest
    await t.expect((await workbenchPage.getInternalLinkWithoutManifest(internalLinkName1)).visible)
        .ok(`${internalLinkName1} folder is not visible`);
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
