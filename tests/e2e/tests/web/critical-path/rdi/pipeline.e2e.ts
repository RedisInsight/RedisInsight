import * as fs from 'fs';
import { join as joinPath } from 'path';
import * as path from 'path';
import { t } from 'testcafe';
import { RdiInstancePage } from '../../../../pageObjects/rdi-instance-page';
import { AddNewRdiParameters, RdiApiRequests } from '../../../../helpers/api/api-rdi';
import { BrowserActions } from '../../../../common-actions/browser-actions';
import { fileDownloadPath, commonUrl } from '../../../../helpers/conf';
import { DatabasesActions } from '../../../../common-actions/databases-actions';
import { MyRedisDatabasePage } from '../../../../pageObjects';
import { RdiInstancesListPage } from '../../../../pageObjects/rdi-instances-list-page';
import { RdiPopoverOptions, RedisOverviewPage } from '../../../../helpers/constants';
import { DatabaseHelper } from '../../../../helpers';

const myRedisDatabasePage = new MyRedisDatabasePage();
const rdiInstancePage = new RdiInstancePage();
const rdiInstancesListPage = new RdiInstancesListPage();
const rdiApiRequests = new RdiApiRequests();
const browserActions = new BrowserActions();
const databasesActions = new DatabasesActions();
const databaseHelper = new DatabaseHelper();

let foundExportedFiles: string[];

const filePathes = {
    unsuccessful: path.join('..', '..', '..', '..', 'test-data', 'rdi', 'UnsuccessRDI_Pipeline.zip'),
    fullPipeline: path.join('..', '..', '..', '..', 'test-data', 'rdi', 'RDI_pipelineConfigurations.zip')
};
const rdiInstance: AddNewRdiParameters = {
    name: 'testInstance',
    url: 'https://11.111.111.111',
    username: 'username',
    password: '111'
};

//skip the tests until rdi integration is added
fixture.skip `Pipeline`
    .meta({ type: 'critical_path', feature: 'rdi' })
    .page(commonUrl)
    .beforeEach(async() => {
        await databaseHelper.acceptLicenseTerms();
        await rdiApiRequests.addNewRdiApi(rdiInstance);
        await myRedisDatabasePage.setActivePage(RedisOverviewPage.Rdi);
        await rdiInstancesListPage.clickRdiByName(rdiInstance.name);

    })
    .afterEach(async() => {
        await rdiApiRequests.deleteAllRdiApi();
    });
test('Verify that new changes are highlight in the files', async() => {
    const text = 'text';

    await rdiInstancePage.selectStartPipelineOption(RdiPopoverOptions.Server);
    await t.expect(rdiInstancePage.PipelineManagementPanel.configHighlightingIcon.exists).notOk('highlighted changes icon is displayed ');

    await rdiInstancePage.MonacoEditor.sendTextToMonaco(rdiInstancePage.configurationInput, text);
    const enteredText = await rdiInstancePage.MonacoEditor.getTextFromMonaco();
    await t.expect(enteredText).eql(text, 'config text was not changed');
    await t.expect(rdiInstancePage.PipelineManagementPanel.configHighlightingIcon.exists).ok('highlighted changes icon is not displayed ');
});

// https://redislabs.atlassian.net/browse/RI-5199
test('Verify that user can deploy pipeline', async() => {
    const messageText = 'Are you sure you want to deploy the pipeline?';
    const emptyText = 'empty';
    const expectedText = 'sources:';
    const jobName = 'test';

    // upload full pipeline
    await rdiInstancePage.selectStartPipelineOption(RdiPopoverOptions.File);
    await rdiInstancePage.RdiHeader.uploadPipeline(filePathes.fullPipeline);
    await t.click(rdiInstancePage.okUploadPipelineBtn);
    await t.click(rdiInstancePage.RdiHeader.deployPipelineBtn);
    // Verify that user can see message when request to deploy the pipeline
    await browserActions.verifyDialogContainsText(messageText, true);

    // Verify that user the successful  message when the pipeline has been deployed
    await t.click(rdiInstancePage.RdiHeader.deployConfirmBtn);
    await t.expect(rdiInstancePage.loadingIndicator.exists).notOk({ timeout: 60000 });
    await t.expect(rdiInstancePage.Toast.toastBody.textContent).contains('Congratulations!');
    await t.click(rdiInstancePage.Toast.toastCloseButton);
    await rdiInstancePage.MonacoEditor.sendTextToMonaco(rdiInstancePage.configurationInput, emptyText, true);

    await t.click(rdiInstancePage.RdiHeader.uploadPipelineButton);
    await t.click(rdiInstancePage.RdiHeader.uploadConfirmPipelineButton);
    await t.expect(rdiInstancePage.loadingIndicator.exists).notOk({ timeout: 20000 });
    let updatedText = await rdiInstancePage.MonacoEditor.getTextFromMonaco();
    await t.expect(updatedText).contains(expectedText, 'config text was not updated');
    await t.expect(updatedText).notContains(emptyText, 'config text was not updated');

    // upload pipeline without jobs
    await rdiInstancePage.PipelineManagementPanel.deleteJobByName(jobName);

    await t.click(rdiInstancePage.RdiHeader.deployPipelineBtn);
    await t.click(rdiInstancePage.RdiHeader.deployConfirmBtn);
    await t.expect(rdiInstancePage.loadingIndicator.exists).notOk({ timeout: 60000 });
    await t.expect(rdiInstancePage.Toast.toastBody.textContent).contains('Congratulations!');
    await t.click(rdiInstancePage.Toast.toastCloseButton);

    await rdiInstancePage.MonacoEditor.sendTextToMonaco(rdiInstancePage.configurationInput, emptyText, true);

    await t.click(rdiInstancePage.RdiHeader.uploadPipelineButton);
    await t.click(rdiInstancePage.RdiHeader.uploadConfirmPipelineButton);
    await t.expect(rdiInstancePage.loadingIndicator.exists).notOk({ timeout: 20000 });
    updatedText = await rdiInstancePage.MonacoEditor.getTextFromMonaco();
    await t.expect(updatedText).contains(expectedText, 'config text was not updated');
    const selector = await rdiInstancePage.PipelineManagementPanel.getJobByName(jobName);
    await t.expect(selector.exists).notOk('Job is exist');

});
// https://redislabs.atlassian.net/browse/RI-5142
test
    .after(async() => {
        // Delete exported file
        fs.unlinkSync(joinPath(fileDownloadPath, foundExportedFiles[0]));
        await rdiApiRequests.deleteAllRdiApi();
    })('Verify that user can download pipeline', async() => {
        await rdiInstancePage.selectStartPipelineOption(RdiPopoverOptions.Server);
        await t
            .click(rdiInstancePage.RdiHeader.downloadPipelineButton)
            .wait(2000);

        // Verify that user can see “RDI_pipeline” as the default file name
        foundExportedFiles = await databasesActions.findFilesByFileStarts(fileDownloadPath, 'RDI_pipeline');
        // Verify that user can export database
        await t.expect(foundExportedFiles.length).gt(0, 'The Exported file not saved');
    });

// https://redislabs.atlassian.net/browse/RI-5143
test('Verify that user can import pipeline', async() => {
    const expectedText = 'sources';
    // check success uploading
    await rdiInstancePage.selectStartPipelineOption(RdiPopoverOptions.File);
    await rdiInstancePage.RdiHeader.uploadPipeline(filePathes.fullPipeline);
    await t.click(rdiInstancePage.okUploadPipelineBtn);
    const updatedText = await rdiInstancePage.MonacoEditor.getTextFromMonaco();
    await t.expect(updatedText).contains(expectedText, 'config text was not updated');
    // check unsuccessful uploading
    await t.click(rdiInstancePage.RdiHeader.uploadFromFileButton);
    await rdiInstancePage.RdiHeader.uploadPipeline(filePathes.unsuccessful);
    const failedText = await rdiInstancePage.failedUploadingPipelineNotification.textContent;
    await t.expect(failedText).contains('There was a problem with the .zip file');
    await t.click(rdiInstancePage.closeNotification);
    await t.click(rdiInstancePage.RdiHeader.uploadFromFileButton);
    await t.expect(rdiInstancePage.uploadPipelineBtn.exists).ok('the upload dialog is not opened');
});
