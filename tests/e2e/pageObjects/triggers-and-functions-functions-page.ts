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
     * Is functions displayed in the table
     * @param name The functions Name
     */
    getFunctionsNameSelector(name: string): Selector {
        return Selector(this.functionNameMask.replace(/\$name/g, name));
    }

    /**
     * Is function displayed in the list
     * @param sectionName The functions Name
     */
    async getFieldsAndValuesBySection(sectionName: FunctionsSections): Promise<string> {
        return  Selector(this.sectionMask.replace(/\$name/g, sectionName)).textContent;
    }
}
