import { Selector, t } from 'testcafe';
import { BaseOverviewPage } from './base-overview-page';
import { RdiNavigationPanel } from './components/navigation/rdi-navigation-panel';
import { TestConnectionPanel } from './components/rdi/test-connection-panel';
import { PipelineManagementPanel } from './components/rdi/pipeline-management-panel';

export class RdiInstancePage extends BaseOverviewPage {

    NavigationPanel = new RdiNavigationPanel();
    TestConnectionPanel = new TestConnectionPanel();
    PipelineManagementPanel = new PipelineManagementPanel();

    dryRunButton = Selector('[data-testid=rdi-jobs-dry-run]');
    dryRunSubmitBtn = Selector('[data-testid=dry-run-btn]');
    closeDryRunPanelBtn = Selector('[data-testid=close-dry-run-btn]');
    dryRunPanel = Selector('[data-testid=dry-run-panel]');
    transformationsTab = Selector('[data-testid=transformations-tab]');
    transformationInput = Selector('[data-testid=wrapper-input-value]');
    transformationResults = Selector('[data-testid=wrapper-transformations-output]');
    commandsOutput = Selector('[data-testid=commands-output]');
    outputTab = Selector('[data-testid=output-tab]');

    deployPipelineBtn = Selector('[data-testid=deploy-rdi-pipeline]');
    deployConfirmBtn = Selector('[data-testid=deploy-confirm-btn]');

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

    breadcrumbsLink = Selector('[data-testid=my-rdi-instances-btn]');
    rdiNameLinkBreadcrumbs = Selector('[data-testid=rdi-instance-name]');

    // Test Connection
    textConnectionBtn = Selector('[data-testid=rdi-test-connection-btn]');

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

