import { Selector } from 'testcafe';

export class ShortcutsPanel {
    //-------------------------------------------------------------------------------------------
    //DECLARATION OF SELECTORS
    //*Declare all elements/components of the relevant page.
    //*Target any element/component via data-id, if possible!
    //*The following categories are ordered alphabetically (Alerts, Buttons, Checkboxes, etc.).
    //-------------------------------------------------------------------------------------------
    //BUTTONS
    shortcutsCloseButton = Selector('[data-test-subj=euiFlyoutCloseButton]');
    //TEXT ELEMENTS
    shortcutsTitle = Selector('[data-testid=shortcuts-title]');
    shortcutsDesktopApplicationSection = Selector('[data-test-subj="shortcuts-section-Desktop application"]');
    shortcutsCLISection = Selector('[data-test-subj=shortcuts-section-CLI]');
    shortcutsWorkbenchSection = Selector('[data-test-subj=shortcuts-section-Workbench]');
    //PANELS
    shortcutsPanel = Selector('[data-test-subj=shortcuts-flyout]');

}
