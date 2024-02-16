import { Selector, t } from 'testcafe';
import { TextConnectionSection } from '../../../helpers/constants';

export class TestConnectionPanel {
    endpointRowString = '[data-testid^=table-endpoint]';

    sidePanel = Selector('[data-testid=test-connection-panel]');
    successfulSection = Selector('[data-testid^=success-connections]');
    failedSection = Selector('[data-testid^=failed-connections-]');
    endpointRow = Selector(this.endpointRowString);
    closeSection = Selector('[data-testid=close-test-connections-btn]');

    /**
     * Open/Close  section
     * @param section Name of section
     * @param state State of section
     */
    async expandOrCollapseSection(section: TextConnectionSection, state: boolean): Promise<void> {

        const sectionSelector = Selector(`[data-testid^=${section}-connections-]`);
        const stateSelector =  await sectionSelector.getAttribute('data-testid');
        if(stateSelector?.includes('open') && state === false || stateSelector?.includes('close') && state === true) {
            await t.click(sectionSelector.find('button'));
        }
    }

    /**
     * get number of connection
     * @param section Name of section
     * @param state State of section
     */
    async getNumberOfSection(section: TextConnectionSection): Promise<string> {
        const sectionSelector = Selector(`[data-testid^=${section}-connections-]`);
        return sectionSelector.find('span[data-testid="number-of-connections"]').textContent;
    }

    /**
     * get row count in the section
     * @param section Name of section
     */
    async getNumberOfSectionRow(section: TextConnectionSection): Promise<string> {
        const sectionSelector = Selector(`[data-testid^=${section}-connections-]`);
        const rows =  await sectionSelector.find('[data-testid^=table-endpoint]').count;
        return rows.toString();
    }

    /**
     * get row endpoint text by index
     * @param section Name of section
     * @param index index of the row to get text
     */
    async getSectionRowTextByIndex(section: TextConnectionSection, index: number): Promise<string> {
        const sectionSelector = Selector(`[data-testid^=${section}-connections-]`);
        return await (sectionSelector.find(this.endpointRowString).nth(index)).textContent;
    }

}
