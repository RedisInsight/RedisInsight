import {Selector, t} from 'testcafe';

export class MonitorPage {
    //-------------------------------------------------------------------------------------------
    //DECLARATION OF SELECTORS
    //*Declare all elements/components of the relevant page.
    //*Target any element/component via data-id, if possible!
    //*The following categories are ordered alphabetically (Alerts, Buttons, Checkboxes, etc.).
    //-------------------------------------------------------------------------------------------
    //BUTTONS
    expandMonitor = Selector('[data-testid=expand-monitor]');
    runMonitorToggle = Selector('[data-testid=toggle-run-monitor]');
    startMonitorButton = Selector('[data-testid=start-monitor]');
    clearMonitorButton = Selector('[data-testid=clear-monitor]');
    hideMonitor = Selector('[data-testid=hide-monitor]');
    closeMonitor = Selector('[data-testid=close-monitor]');
    //TEXT ELEMENTS
    monitorIsStoppedText = Selector('[data-testid=monitor-stopped]');
    monitorIsStartedText = Selector('[data-testid=monitor-started]');
    monitorArea = Selector('[data-testid=monitor]');
    monitorWarningMessage = Selector('[data-testid=monitor-warning-message]');
    monitorCommandLinePart = Selector('[data-testid=monitor] span');
    monitorCommandLineTimestamp = Selector('[data-testid=monitor] span').withText(/[0-9]{2}:[0-9]{2}:[0-9]{2}.[0-9]{3}/);
    monitorNoPermissionsMessage = Selector('[data-testid=monitor-error-message]');

    /**
     * Check specific command in Monitor
     * @param command A command which should be displayed in monitor
     * @param parameters An arguments which should be displayed in monitor
     */
    async checkCommandInMonitorResults(command: string, parameters?: string[]): Promise<void> {
        const commandArray = command.split(' ');
        for (const value of commandArray) {
            await t.expect(this.monitorCommandLinePart.withText(value).exists).ok({timeout: 6000});
        }
        if (!!parameters) {
            for (const argument of parameters) {
                await t.expect(this.monitorCommandLinePart.withText(argument).exists).ok({timeout: 6000});
            }
        }
    }
    /**
     * Start monitor function
     */
    async startMonitor(): Promise<void> {
        await t.click(this.expandMonitor);
        await t.click(this.startMonitorButton);
        //Check for "info" command that is sent automatically every 5 seconds from BE side
        await this.checkCommandInMonitorResults('info');
    }
    /**
     * Stop monitor function
     */
    async stopMonitor(): Promise<void> {
        await t.click(this.runMonitorToggle);
        await t.expect(this.monitorIsStoppedText.exists).ok('Profiler is stopped text');
    }
}
