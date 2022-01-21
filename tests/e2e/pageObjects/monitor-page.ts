import {Selector, t} from 'testcafe';

export class MonitorPage {

    //------------------------------------------------------------------------------------------
    //DECLARATION OF TYPES: DOM ELEMENTS and UI COMPONENTS
    //*Assign the 'Selector' type to any element/component nested within the constructor.
    //------------------------------------------------------------------------------------------

    expandMonitor: Selector
    monitorArea: Selector
    runMonitorToggle: Selector
    startMonitorButton: Selector
    clearMonitorButton: Selector
    monitorIsStoppedText: Selector
    monitorIsStartedText: Selector
    hideMonitor: Selector
    closeMonitor: Selector
    monitorWarningMessage: Selector
    monitorCommandLinePart: Selector

    constructor() {
        //-------------------------------------------------------------------------------------------
        //DECLARATION OF SELECTORS
        //*Declare all elements/components of the relevant page.
        //*Target any element/component via data-id, if possible!
        //*The following categories are ordered alphabetically (Alerts, Buttons, Checkboxes, etc.).
        //-------------------------------------------------------------------------------------------
        //BUTTONS
        this.expandMonitor = Selector('[data-testid=expand-monitor]');
        this.monitorArea = Selector('[data-testid=monitor]');
        this.runMonitorToggle = Selector('[data-testid=toggle-run-monitor]');
        this.startMonitorButton = Selector('[data-testid=start-monitor]');
        this.clearMonitorButton = Selector('[data-testid=clear-monitor]');
        this.monitorIsStoppedText = Selector('[data-testid=monitor-stopped]');
        this.monitorIsStartedText = Selector('[data-testid=monitor-started]');
        this.hideMonitor = Selector('[data-testid=hide-monitor]');
        this.closeMonitor = Selector('[data-testid=close-monitor]');
        this.monitorWarningMessage = Selector('[data-testid=monitor-warning-message]');
        this.monitorCommandLinePart = Selector('[data-testid=monitor] span');
    }
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
        await t.expect(this.monitorIsStoppedText.exists).ok('Monitor is stopped text');
    }
}
