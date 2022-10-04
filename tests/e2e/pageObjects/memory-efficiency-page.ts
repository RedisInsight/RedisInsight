import { Selector } from 'testcafe';

export class MemoryEfficiencyPage {
    //-------------------------------------------------------------------------------------------
    //DECLARATION OF SELECTORS
    //*Declare all elements/components of the relevant page.
    //*Target any element/component via data-id, if possible!
    //*The following categories are ordered alphabetically (Alerts, Buttons, Checkboxes, etc.).
    //-------------------------------------------------------------------------------------------
    //BUTTONS
    newReportBtn = Selector('[data-testid=start-database-analysis-btn]');
    // ICONS
    reportTooltipIcon = Selector('[data-testid=db-new-reports-icon]');
    //TEXT ELEMENTS
    noReportsText = Selector('[data-testid=empty-analysis-no-reports]');
    noKeysText = Selector('[data-testid=empty-analysis-no-keys]');
}
