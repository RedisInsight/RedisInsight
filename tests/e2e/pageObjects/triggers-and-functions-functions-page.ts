import { Selector } from 'testcafe';
import { FunctionsSections } from '../helpers/constants';
import { InstancePage } from './instance-page';
export class TriggersAndFunctionsFunctionsPage extends InstancePage {

    librariesLink = Selector('[data-testid=triggered-functions-tab-libraries]');

    //Masks
    // insert name
    functionNameMask = '[data-testid=row-$name]';
    sectionMask = '[data-testid^=function-details-$name]';

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
}
