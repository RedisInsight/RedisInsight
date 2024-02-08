import { t } from 'testcafe';
import { ResourcePath } from '../constants';
import { sendDeleteRequest, sendGetRequest, sendPostRequest } from './api-common';

export class RdiApiRequests {

    /**
     * Delete all rdi through api
     */
    async deleteAllRdiApi(): Promise<void> {
        const allRdi = await this.getAllRdi();
        console.log(`common db count is "${allRdi}"`);
        if (allRdi.length > 0) {
            const rdiIds: string[] = [];
            for (let i = 0; i < allRdi.length; i++) {
                const dbData = JSON.parse(JSON.stringify(allRdi[i]));
                rdiIds.push(dbData.id);
            }
            if (rdiIds.length > 0) {
                const requestBody = { ids: rdiIds };
                const response = await sendDeleteRequest(
                    ResourcePath.Rdi,
                    requestBody
                );
                await t.expect(await response.status).eql(200);
            }
        }
    }

    /**
     * Get all rdi instances through api
     */
    async getAllRdi(): Promise<string[]> {
        const response = await sendGetRequest(ResourcePath.Rdi);

        await t.expect(await response.status).eql(200);
        return await response.body;
    }

    /**
     * Add a new rdi through api using host and port
     * @param rdiParameters The rdi parameters
     */
    async addNewRdiApi(
        rdiParameters: AddNewRdiParameters
    ): Promise<void> {

        const response = await sendPostRequest(
            ResourcePath.Rdi,
            rdiParameters
        );
        await t
            .expect(await response.body.name)
            .eql(
                rdiParameters.name,
                `rdi Name is not equal to ${rdiParameters.name} in response`
            );
        await t.expect(await response.status).eql(201);
    }
}
/**
 * Add new database parameters
 * @param username The username for rdi
 * @param name rdi name(alias)
 * @param password The password for rdi
 * @param url The url of the rdi
 */
export type AddNewRdiParameters = {
    username: string,
    name: string,
    password: string,
    url: string
};
