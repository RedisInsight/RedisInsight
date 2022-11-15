import { t, Selector } from 'testcafe';

export class DiscoverMasterGroupsPage {
    //-------------------------------------------------------------------------------------------
    //DECLARATION OF SELECTORS
    //*Declare all elements/components of the relevant page.
    //*Target any element/component via data-id, if possible!
    //*The following categories are ordered alphabetically (Alerts, Buttons, Checkboxes, etc.).
    //-------------------------------------------------------------------------------------------
    //BUTTONS
    selectAllCheckbox = Selector('[data-test-subj=checkboxSelectAll]');
    addPrimaryGroupButton = Selector('[data-testid=btn-add-primary-group]');
    masterGroupsTitle = Selector('//h1[text()="Auto-Discover Redis Sentinel Primary Groups"]');

    /**
 * Add all Master Groups from Sentinel
 */
    async addMasterGroups(): Promise<void> {
        await t
            .click(this.selectAllCheckbox)
            .expect(this.selectAllCheckbox.checked).ok();
        await t
            .click(this.addPrimaryGroupButton);
    }
}
