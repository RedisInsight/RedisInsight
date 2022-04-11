import {Selector} from 'testcafe';

export class DatabaseOverviewPage {

    //------------------------------------------------------------------------------------------
    //DECLARATION OF TYPES: DOM ELEMENTS and UI COMPONENTS
    //*Assign the 'Selector' type to any element/component nested within the constructor.
    //------------------------------------------------------------------------------------------

    overviewTotalKeys: Selector
    overviewTotalMemory: Selector
    databaseModules: Selector
    overviewRedisStackLogo: Selector

    constructor() {
        //-------------------------------------------------------------------------------------------
        //DECLARATION OF SELECTORS
        //*Declare all elements/components of the relevant page.
        //*Target any element/component via data-id, if possible!
        //*The following categories are ordered alphabetically (Alerts, Buttons, Checkboxes, etc.).
        //-------------------------------------------------------------------------------------------
        // TEXT INPUTS (also referred to as 'Text fields')
        this.overviewTotalKeys = Selector('[data-test-subj=overview-total-keys]');
        this.overviewTotalMemory = Selector('[data-test-subj=overview-total-memory]');
        this.databaseModules = Selector('[data-testid$=module]');
        this.overviewRedisStackLogo = Selector('[data-testid=redis-stack-logo]');
    }
}
