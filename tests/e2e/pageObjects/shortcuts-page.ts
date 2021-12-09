import { Selector } from 'testcafe';

export class ShortcutsPage {

    //------------------------------------------------------------------------------------------
    //DECLARATION OF TYPES: DOM ELEMENTS and UI COMPONENTS
    //*Assign the 'Selector' type to any element/component nested within the constructor.
    //------------------------------------------------------------------------------------------

    shortcutsPanel: Selector
    shortcutsTitle: Selector
    shortcutsDesktopApplicationSection: Selector
    shortcutsCLISection: Selector
    shortcutsWorkbenchSection: Selector
    shortcutsCloseButton: Selector

    constructor() {
        //-------------------------------------------------------------------------------------------
        //DECLARATION OF SELECTORS
        //*Declare all elements/components of the relevant page.
        //*Target any element/component via data-id, if possible!
        //*The following categories are ordered alphabetically (Alerts, Buttons, Checkboxes, etc.).
        //-------------------------------------------------------------------------------------------
        // BUTTONS
        this.shortcutsTitle = Selector('[data-testid="shortcuts-title"]');
        this.shortcutsDesktopApplicationSection = Selector('[data-test-subj="shortcuts-section-Desktop application"]');
        this.shortcutsCLISection = Selector('[data-test-subj="shortcuts-section-CLI"]');
        this.shortcutsWorkbenchSection = Selector('[data-test-subj="shortcuts-section-Workbench"]');
        this.shortcutsCloseButton = Selector('[data-test-subj="euiFlyoutCloseButton"]')
        // Panel
        this.shortcutsPanel = Selector('[data-test-subj="shortcuts-flyout"]');
    }
}
