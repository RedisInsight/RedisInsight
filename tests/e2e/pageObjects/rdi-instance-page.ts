import { Selector, t } from 'testcafe';
import { RdiPopoverOptions, RdiTemplateDatabaseType, RdiTemplatePipelineType } from '../helpers/constants';
import { BaseOverviewPage } from './base-overview-page';
import { RdiNavigationPanel } from './components/navigation/rdi-navigation-panel';
import { TestConnectionPanel } from './components/rdi/test-connection-panel';
import { RdiHeader } from './components/rdi/rdi-header';
import { PipelineManagementPanel } from './components/rdi/pipeline-management-panel';

export class RdiInstancePage extends BaseOverviewPage {

    NavigationPanel = new RdiNavigationPanel();
    TestConnectionPanel = new TestConnectionPanel();
    PipelineManagementPanel = new PipelineManagementPanel();
    RdiHeader = new RdiHeader();

    dryRunButton = Selector('[data-testid=rdi-jobs-dry-run]');
    dryRunSubmitBtn = Selector('[data-testid=dry-run-btn]');
    closeDryRunPanelBtn = Selector('[data-testid=close-dry-run-btn]');
    dryRunPanel = Selector('[data-testid=dry-run-panel]');
    transformationsTab = Selector('[data-testid=transformations-tab]');
    transformationInput = Selector('[data-testid=wrapper-input-value]');
    transformationResults = Selector('[data-testid=wrapper-transformations-output]');
    commandsOutput = Selector('[data-testid=commands-output]');
    outputTab = Selector('[data-testid=output-tab]');
    uploadPipelineBtn = Selector('[data-testid=submit-btn]');
    okUploadPipelineBtn = Selector('[data-testid=ok-btn]');
    closeImportModelBtn = Selector('[data-testid=import-file-modal] button');

    configurationInput = Selector('[data-testid=wrapper-rdi-config]');
    configurationLink = Selector('[data-testid=rdi-pipeline-config-link]');

    jobsInput = Selector('[data-testid=wrapper-rdi-monaco-jobs]');
    draggableArea = Selector('[data-testid=draggable-area]');
    dedicatedLanguageSelect = Selector('[data-testid=dedicated-editor-language-select]');

    successDeployNotification = Selector('[data-testid=success-deploy-pipeline-notification]');
    errorDeployNotification = Selector('[data-test-subj=toast-error-deploy]');
    failedUploadingPipelineNotification = Selector('[data-testid=result-failed]');
    closeNotification =  Selector('[class*=euiModal__closeIcon]');
    noPipelineText = Selector('[data-testid=no-pipeline]');

    // Test Connection
    textConnectionBtn = Selector('[data-testid=rdi-test-connection-btn]');

    //template
    templateButton = Selector('[data-testid^=template-trigger-]');
    templateApplyButton = Selector('[data-testid=template-apply-btn]');
    templateCancelButton = Selector('[data-testid=template-apply-btn]');
    pipelineDropdown =  Selector('[data-testid=strategy-type-select]');
    databaseDropdown =  Selector('[data-testid=db-type-select]');

    //dialog
    selectOptionDialog = Selector('[data-testid=rdi-pipeline-source-dialog]', { timeout: 100 });

    tooltip = Selector('[role=tooltip]', { timeout: 500 });
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
     * Select value from template dropdowns
     * @param pipeline value of pipeline dropdown
     * @param database value of database dropdown
     */
    async setTemplateDropdownValue(pipeline: RdiTemplatePipelineType, database?: RdiTemplateDatabaseType): Promise<void> {
        await t.click(this.pipelineDropdown);
        let selector =  Selector(`[id='${pipeline}']`);
        await t.click(selector);
        if(database != null) {
            await t.click(this.databaseDropdown);
            selector =  Selector(`[id='${database}']`);
            await t.click(selector);
        }
        await t.click(this.templateApplyButton);
    }

    /**
     * Select option from 'Select an option to start with your pipeline' popover
     * @param option option to select
     */
    async selectStartPipelineOption(option: RdiPopoverOptions): Promise<void> {

        const selector =  Selector(`[data-testid='${option}-source-pipeline-dialog']`);
        await t.click(selector);
    }

    /**
     * Verify tooltip contains text
     * @param expectedText Expected link that is compared with actual
     */
    async verifyTooltipContainsText(expectedText: string): Promise<void> {
        await t.expect(this.tooltip.nth(-1).textContent).contains(expectedText, `"${expectedText}" Text is incorrect in tooltip`);
    }
}
