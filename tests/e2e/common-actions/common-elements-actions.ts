import { t } from 'testcafe';

export class CommonElementsActions {

    /**
     * Select Checkbox
     * @param checkbox Selector of the checkbox to check
     * @param value value of the checkbox
     */
    static async checkCheckbox(checkbox: Selector, value: boolean): Promise<void> {

        if (await checkbox.checked !== value) {
            await t.click(checkbox);
        }
    }

}
