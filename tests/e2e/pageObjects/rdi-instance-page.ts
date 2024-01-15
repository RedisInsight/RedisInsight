import { Selector, t } from 'testcafe';
import { AddRdiInstance, RdiInstance } from './components/myRedisDatabase/add-rdi-instance';
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

