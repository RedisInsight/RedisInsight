import { Selector, t } from 'testcafe';
import { BaseOverviewPage } from './base-overview-page';
import { RdiNavigationPanel } from './components/navigation/rdi-navigation-panel';

export class RdiInstancePage extends BaseOverviewPage {

    NavigationPanel = new RdiNavigationPanel();

    dryRunButton = Selector('[data-testid=rdi-jobs-dry-run]');
    dryRunSubmitBtn = Selector('[data-testid=dry-run-btn]');
    closeDryRunPanelBtn = Selector('[data-testid=close-dry-run-btn]');
    dryRunPanel = Selector('[data-testid=dry-run-panel]');
    transformationsTab = Selector('[data-testid=transformations-tab]');
    transformationInput = Selector('[data-testid=wrapper-input-value]');
    transformationResults = Selector('[data-testid=wrapper-transformations-output]');
    commandsOutput = Selector('[data-testid=commands-output]');
    outputTab = Selector('[data-testid=output-tab]');
    refreshPipelineIcon = Selector('[data-testid=refresh-pipeline-btn]');
    exportPipelineIcon = Selector('[data-testid=download-pipeline-btn]');
    importPipelineIcon = Selector('[data-testid=upload-pipeline-btn]');
    applyRefreshBtn = Selector('[data-testid=refresh-pipeline-apply-btn]');
    deployPipelineBtn = Selector('[data-testid=deploy-rdi-pipeline]');
    deployConfirmBtn = Selector('[data-testid=deploy-confirm-btn]');
    uploadPipelineBtn = Selector('[data-testid=submit-btn]');
    okUploadPipelineBtn = Selector('[data-testid=ok-btn]');
    closeImportModelBtn = Selector('[data-testid=import-file-modal] button');

    configurationInput = Selector('[data-testid=wrapper-rdi-config]');
    importInput = Selector('[data-testid=import-file-modal-filepicker]');
    successDeployNotification = Selector('[data-testid=success-deploy-pipeline-notification]');
    errorDeployNotification = Selector('[data-test-subj=toast-error-deploy]');
    failedUploadingPipelineNotification = Selector('[data-testid=result-failed]');
    closeNotification =  Selector('[class*=euiModal__closeIcon]');
    noPipelineText = Selector('[data-testid=no-pipeline]');

    breadcrumbsLink = Selector('[data-testid=my-rdi-instances-btn]');

    //Jobs
    addJobBtn = Selector('[data-testid=add-new-job]');
    jobNameInput = Selector('[data-testid^=job-name-input-]');
    applyJobNameBtn = Selector('[data-testid=apply-btn]');
    cancelJobNameBtn = Selector('[data-testid=cancel-btn]');
    jobItem = Selector('[data-testid*=rdi-nav-job-actions]');
    deleteConfirmBtn  = Selector('[data-testid=confirm-btn]');
    jobsPipelineTitle = Selector('[class*=rdi__title]');

    /**
     * Add Job by name
     * @param name job name
     */
    async addJob(name: string): Promise<void> {
        await t.click(this.addJobBtn);
        await t.typeText(this.jobNameInput, name);
        await t.click(this.applyJobNameBtn);
    }

    /**
     * Open Job by name
     * @param name job name
     */
    async openJobByName(name: string): Promise<void> {
        const jobBtnSelector = Selector(`[data-testid=rdi-nav-job-${name}]`);
        await t.click(jobBtnSelector);
    }

    /**
     * Delete Job by name
     * @param name job name
     */
    async deleteJobByName(name: string): Promise<void> {
        const jobBtnSelector = Selector(`[data-testid=delete-job-${name}]`);
        await t.click(jobBtnSelector);
        await t.click(this.deleteConfirmBtn);
    }

    /**
     * Edit Job by name
     * @param name job name
     */
    async editJobByName(name: string, newName: string): Promise<void> {
        const jobBtnSelector = Selector(`[data-testid=edit-job-name-${name}]`);
        await t.click(jobBtnSelector)
            .typeText(this.jobNameInput, newName, { replace: true })
            .click(this.applyJobNameBtn);
    }

    /**
     * Send a data in Transformation Input
     * @param text The text to send
     * @param speed The speed in seconds. Default is 1
     * @param paste
     */
    async sendTransformationInput(command: string, speed = 1, paste = true): Promise<void> {
        await t
            .click(this.transformationInput)
            .typeText(this.transformationInput, command, { replace: true, speed, paste })
            .click(this.dryRunSubmitBtn);
    }

    /**
     * Import pipeline
     * @param filePath the name if the file
     */
    async uploadPipeline(filePath: string): Promise<void> {
        await t
            .click(this.importPipelineIcon)
            .setFilesToUpload(this.importInput, filePath)
            .click(this.uploadPipelineBtn);
    }
}

