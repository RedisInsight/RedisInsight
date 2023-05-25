import { Selector } from 'testcafe';

export class HelpCenter {
    //-------------------------------------------------------------------------------------------
    //DECLARATION OF SELECTORS
    //*Declare all elements/components of the relevant page.
    //*Target any element/component via data-id, if possible!
    //*The following categories are ordered alphabetically (Alerts, Buttons, Checkboxes, etc.).
    //-------------------------------------------------------------------------------------------
    //BUTTONS
    helpCenterSubmitBugButton = Selector('[data-testid=submit-bug-btn]');
    helpCenterShortcutButton = Selector('[data-testid=shortcuts-btn]');
    helpCenterReleaseNotesButton = Selector('[data-testid=release-notes-btn]');
    //PANELS
    helpCenterPanel = Selector('[data-testid=help-center]');
}
