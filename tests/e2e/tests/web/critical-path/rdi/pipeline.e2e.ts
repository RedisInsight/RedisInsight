import * as fs from 'fs';
import { join as joinPath } from 'path';
import * as path from 'path';
import { t } from 'testcafe';
import { RdiInstancePage } from '../../../../pageObjects/rdi-instance-page';
import { AddNewRdiParameters, RdiApiRequests } from '../../../../helpers/api/api-rdi';
import { MonacoEditor } from '../../../../common-actions/monaco-editor';
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
    successful: path.join('..', '..', '..', '..', 'test-data', 'rdi', 'RDIPipeline.zip'),
    unsuccessful: path.join('..', '..', '..', '..', 'test-data', 'rdi', 'UnsuccessRDI_Pipeline.zip')
};
const rdiInstance: AddNewRdiParameters = {
    name: 'testInstance',
    url: 'http://localhost:4000',
    username: 'username',
    password: 'password'
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
test('Verify that user can refresh pipeline', async() => {
    const text = 'text';
    const expectedText = 'connections:';

    await rdiInstancePage.selectStartPipelineOption(RdiPopoverOptions.Pipeline);
    await MonacoEditor.sendTextToMonaco(rdiInstancePage.configurationInput, text);
    const enteredText = await MonacoEditor.getTextFromMonaco();
    await t.expect(enteredText).eql(text, 'config text was not changed');
    await t.click(rdiInstancePage.RdiHeader.uploadPipelineButton);
    await t.click(rdiInstancePage.RdiHeader.confirmUploadingPipelineBatton);
    const updatedText = await MonacoEditor.getTextFromMonaco();
    await t.expect(updatedText).contains(expectedText, 'config text was not updated');
    await t.expect(updatedText).notContains(text, 'config text was not updated');

});
// https://redislabs.atlassian.net/browse/RI-5199
test('Verify that user can deploy pipeline', async() => {
    const messageText = 'Are you sure you want to deploy the pipeline?';
    const successMessage = 'Deployment completed successfully!';
    const errorMessage = 'Unfortunately we’ve found some errors in your pipeline.';

    await rdiInstancePage.selectStartPipelineOption(RdiPopoverOptions.Server);
    await t.click(rdiInstancePage.RdiHeader.deployPipelineBtn);
    // Verify that user can see message when request to deploy the pipeline
    await browserActions.verifyDialogContainsText(messageText, true);

    // Verify that user the successful  message when the pipeline has been deployed
    await t.click(rdiInstancePage.RdiHeader.deployConfirmBtn);
    await t.expect(rdiInstancePage.successDeployNotification.textContent).contains(successMessage, 'Pipeline deployment is unsuccessful');

    await t.click(rdiInstancePage.Toast.toastCloseButton);
    // Verify that user the error message when the pipeline deployment failed
    // TODO need to add - Modify deploy.js to receive an error
    await t.click(rdiInstancePage.RdiHeader.deployPipelineBtn);
    await t.click(rdiInstancePage.RdiHeader.deployConfirmBtn);
    await t.expect(rdiInstancePage.errorDeployNotification.textContent).contains(errorMessage, 'Pipeline deployment is successful');

    await t.click(rdiInstancePage.Toast.toastCloseButton);
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
    const expectedText = 'Uploaded';
    // check success uploading
    await rdiInstancePage.selectStartPipelineOption(RdiPopoverOptions.File);
    await rdiInstancePage.RdiHeader.uploadPipeline(filePathes.successful);
    await t.click(rdiInstancePage.okUploadPipelineBtn);
    const updatedText = await MonacoEditor.getTextFromMonaco();
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
