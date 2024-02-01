import { Selector, t } from 'testcafe';
import { BaseOverviewPage } from './base-overview-page';

export class RdiInstancePage extends BaseOverviewPage {
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
    applyRefreshBtn = Selector('[data-testid=refresh-pipeline-apply-btn]');
    deployPipelineBtn = Selector('[data-testid=deploy-rdi-pipeline]');
    deployConfirmBtn = Selector('[data-testid=deploy-confirm-btn]');

    configurationInput = Selector('[data-testid=wrapper-rdi-config]');
    successDeployNotification = Selector('[data-testid=success-deploy-pipeline-notification]');
    errorDeployNotification = Selector('[data-test-subj=toast-error-deploy]');

    /**
     * Open Job by name
     * @param name job name
     */
    async openJobByName(name: string): Promise<void> {
        const jobBtnSelector = Selector(`[data-testid=rdi-nav-job-${name}]`);
        await t.click(jobBtnSelector);
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
}

