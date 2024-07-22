import { Selector, t } from 'testcafe';
import { TextConnectionSection } from '../../../helpers/constants';

export class TestConnectionPanel {
    endpointRowString = '[data-testid^=table-endpoint]';

    targetName = Selector('[data-testid=table-target-target]');
    resultText = Selector('[data-testid=table-result-target]');

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
}
