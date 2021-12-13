import { Selector } from 'testcafe';

export class HelpCenterPage {

    //------------------------------------------------------------------------------------------
    //DECLARATION OF TYPES: DOM ELEMENTS and UI COMPONENTS
    //*Assign the 'Selector' type to any element/component nested within the constructor.
    //------------------------------------------------------------------------------------------
    helpCenterPanel: Selector
    helpCenterSubmitBugButton: Selector
    helpCenterShortcutButton: Selector
    helpCenterReleaseNotesButton: Selector

    constructor() {
        //-------------------------------------------------------------------------------------------
        //DECLARATION OF SELECTORS
        //*Declare all elements/components of the relevant page.
        //*Target any element/component via data-id, if possible!
        //*The following categories are ordered alphabetically (Alerts, Buttons, Checkboxes, etc.).
        //-------------------------------------------------------------------------------------------
        // BUTTONS
        this.helpCenterSubmitBugButton = Selector('[data-testid=submit-bug-btn]');
        this.helpCenterShortcutButton = Selector('[data-testid=shortcuts-btn]');
        this.helpCenterReleaseNotesButton = Selector('[data-testid=release-notes-btn]');
        // Panel
        this.helpCenterPanel = Selector('[data-testid=help-center]')
    }
}
