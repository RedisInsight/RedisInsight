import { Selector, t } from 'testcafe';
import { FunctionsSections } from '../helpers/constants';
import { InstancePage } from './instance-page';
export class TriggersAndFunctionsFunctionsPage extends InstancePage {

    //Links
    librariesLink = Selector('[data-testid=triggered-functions-tab-libraries]');

    //Buttons
    invokeButton = Selector('[data-testid=invoke-btn]');
    addArgumentItemButton = Selector('[data-testid=add-new-argument-item]');
    addKeyNameItemButton = Selector('[data-testid=add-new-key-item]');
    runInCliButton = Selector('[data-testid=invoke-function-btn]');
    findKeyButton = Selector('[data-testid=find-key-btn]');

    // inputs
    keyNameStreamFunctions =  Selector('[data-testid=keyName-field]');

    //Masks
    // insert name
    functionNameMask = '[data-testid=row-$name]';
    sectionMask = '[data-testid^=function-details-$name]';
    argumentRowMask = '[data-testid=argument-field-$index]';
    keyNameRowMask = '[data-testid=keyname-field-$index]';

    /**
     * get function by name
     * @param name The functions Name
     */
    getFunctionsNameSelector(name: string): Selector {
        return Selector(this.functionNameMask.replace(/\$name/g, name));
    }

    /**
     * get all fields and all field's values from the section
     * @param sectionName The section Name
     */
    async getFieldsAndValuesBySection(sectionName: FunctionsSections): Promise<string> {
        return Selector(this.sectionMask.replace(/\$name/g, sectionName)).textContent;
    }

    /**0
     * Enter function arguments
     * @param args function arguments
     */
    async enterFunctionArguments(args: string[]): Promise<void> {
        for (let i = 0; i < args.length; i++) {
            if (i > 0) {
                await t.click(this.addArgumentItemButton);
            }
            const input = Selector(this.argumentRowMask.replace(/\$index/g, i.toString()));
            await t.typeText(input, args[i]);
        }
    }
    /**
         * Enter function key name
         * @param args key names
         */
    async enterFunctionKeyName(args: string[]): Promise<void> {
        for(let i = 0; i < args.length; i++) {
            if (i > 0) {
                await t.click(this.addKeyNameItemButton);
            }
            const input =  Selector(this.keyNameRowMask.replace(/\$index/g, i.toString()));
            await t.typeText(input, args[i]);
        }
    }
}
