import { Selector, t } from 'testcafe';
import { EditorButton } from '../common/editorButton';

export class PipelineManagementPanel {
    EditorButton = new EditorButton();
    configurationTab = Selector('[data-testid=rdi-nav-btn-config] div');

    refreshPipelineIcon = Selector('[data-testid=refresh-pipeline-btn]');
    exportPipelineIcon = Selector('[data-testid=download-pipeline-btn]');
    importPipelineIcon = Selector('[data-testid=upload-pipeline-btn]');
    importInput = Selector('[data-testid=import-file-modal-filepicker]');
    uploadPipelineBtn = Selector('[data-testid=submit-btn]');

    //Jobs
    addJobBtn = Selector('[data-testid=add-new-job]');
    jobNameInput = Selector('[data-testid^=job-name-input-]');
    jobItem = Selector('[data-testid*=rdi-nav-job-actions]');
    confirmBtn  = Selector('[data-testid=confirm-btn]');
    jobsPipelineTitle = Selector('[class*=rdi__title]');

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
    /**
     * Add Job by name
     * @param name job name
     */
    async addJob(name: string): Promise<void> {
        await t.click(this.addJobBtn);
        await t.typeText(this.jobNameInput, name);
        await t.click(this.EditorButton.applyBtn);
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
        await t.click(this.confirmBtn);
    }

    /**
     * Edit Job by name
     * @param name job name
     */
    async editJobByName(name: string, newName: string): Promise<void> {
        const jobBtnSelector = Selector(`[data-testid=edit-job-name-${name}]`);
        await t.click(jobBtnSelector)
            .typeText(this.jobNameInput, newName, { replace: true })
            .click(this.EditorButton.applyBtn);
    }
}
