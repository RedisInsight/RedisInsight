import {RequestMock, t} from 'testcafe';
import {commonUrl} from "./conf";

const settingsApiUrl = `${commonUrl}/api/settings`;

const mockedSettingsResponse = {
    agreements: {
        version: '0',
        eula: false,
        analytics: false
    }}

export class Common {
    mock = RequestMock()
            .onRequestTo(settingsApiUrl)
            .respond(mockedSettingsResponse, 200);

    async waitForElementNotVisible(elm): Promise<void> {
        await t.expect(elm.exists).notOk({ timeout: 20000 });
    }

    /**
     * Create array of keys
     * @param length The amount of array elements
     */
    createArrayWithKeys(length: number): string[] {
        return Array.from({length}, (_, i) => `key${i}`)
    }

    /**
    * Create array of keys and values
    * @param length The amount of array elements
    */
    async createArrayWithKeyValue(length: number): Promise<string[]> {
        const arr = [];
        for(let i = 1; i <= length * 2; i++) {
            arr[i] = `key${i}`;
            arr[i + 1] = `value${i}`;
            i++;
        }
        return arr;
    }

    /**
    * Create array of keys and values with edittable counter value
    * @param length The amount of array elements
    * @param keyName The name of the key
    */
     async createArrayWithKeyValueAndKeyname(length: number, keyName: string): Promise<string[]> {
        const keyNameArray = [];
        for(let i = 1; i <= length; i++) {
            const key = `${keyName}${i}`;
            const value = `value${i}`;
            keyNameArray.push(key, value);
        }
        return keyNameArray;
    }

    /**
     * Create array of pairs [key, value]
     * @param length The amount of array elements
     */
    createArrayPairsWithKeyValue(length: number): [string, number][] {
        return Array.from({ length }, (_, i) => [`key${i}`, i])
    }

    /**
    * Create array of numbers
    * @param length The amount of array elements
    */
    async createArray(length: number): Promise<string[]> {
        const arr = [];
        for(let i = 1; i <= length; i++) {
            arr[i] = `${i}`;
        }
        return arr;
    }

    /**
    * Get background colour of element
    * @param element The selector of the element
    */
     async getBackgroundColour(element: Selector): Promise<string> {
        return element.getStyleProperty('background-color');
    }
}
