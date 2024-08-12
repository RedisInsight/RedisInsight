import { Selector, t } from 'testcafe';
import { InstancePage } from './instance-page';

export class BaseRunCommandsPage extends InstancePage {

    submitCommandButton = Selector('[data-testid=btn-submit]');
    queryInput = Selector('[data-testid=query-input-container]');
    queryInputForText = Selector('[data-testid=query-input-container] .view-lines');

    // History containers
    queryCardCommand = Selector('[data-testid=query-card-command]');
    fullScreenButton = Selector('[data-testid=toggle-full-screen]');
    rawModeBtn = Selector('[data-testid="btn-change-mode"]');
    queryCardContainer = Selector('[data-testid^=query-card-container]');
    reRunCommandButton = Selector('[data-testid=re-run-command]');
    copyBtn = Selector('[data-testid^=copy-btn-]');
    copyCommand = Selector('[data-testid=copy-command]');

    runButtonToolTip = Selector('[data-testid=run-query-tooltip]');
    loadedCommand = Selector('[class=euiLoadingContent__singleLine]');
    runButtonSpinner = Selector('[data-testid=loading-spinner]');
    commandExecutionDateAndTime = Selector('[data-testid=command-execution-date-time]');
    executionCommandTime = Selector('[data-testid=command-execution-time-value]');
    executionCommandIcon = Selector('[data-testid=command-execution-time-icon]');
    executedCommandTitle = Selector('[data-testid=query-card-tooltip-anchor]', { timeout: 500 });
    queryResult = Selector('[data-testid=query-common-result]');
    queryInputScriptArea = Selector('[data-testid=query-input-container] .view-line');

    cssQueryCardCommand = '[data-testid=query-card-command]';
    cssQueryCardContainer = '[data-testid^="query-card-container-"]';
    cssQueryTextResult = '[data-testid=query-cli-result]';
    cssReRunCommandButton = '[data-testid=re-run-command]';
    cssDeleteCommandButton = '[data-testid=delete-command]';

    getTutorialLinkLocator = (tutorialName: string): Selector =>
        Selector(`[data-testid=query-tutorials-link_${tutorialName}]`);

    /**
     * Get card container by command
     * @param command The command
     */
    async getCardContainerByCommand(command: string): Promise<Selector> {
        return this.queryCardCommand.withExactText(command).parent(this.cssQueryCardContainer);
    }

    /**
     * Send a command in Workbench
     * @param command The command
     * @param speed The speed in seconds. Default is 1
     * @param paste
     */
    async sendCommandInWorkbench(command: string, speed = 1, paste = true): Promise<void> {
        await t
            .click(this.queryInput)
            .typeText(this.queryInput, command, { replace: true, speed, paste })
            .click(this.submitCommandButton);
    }

    /**
     * Check the last command and result in workbench
     * @param command The command to check
     * @param result The result to check
     * @param childNum Indicator which command result need to check
     */
    async checkWorkbenchCommandResult(command: string, result: string, childNum = 0): Promise<void> {
        // Compare the command with executed command
        const actualCommand = await this.queryCardContainer.nth(childNum).find(this.cssQueryCardCommand).textContent;
        await t.expect(actualCommand).contains(command, 'Actual command is not equal to executed');
        // Compare the command result with executed command
        const actualCommandResult = await this.queryCardContainer.nth(childNum).find(this.cssQueryTextResult).textContent;
        await t.expect(actualCommandResult).contains(result, 'Actual command result is not equal to executed');
    }
}
