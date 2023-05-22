import { t } from 'testcafe';
import * as request from 'supertest';
import { Common } from '../common';

const endpoint = Common.getEndpoint();

/**
 * Synchronize features
 */
export async function syncFeaturesApi(): Promise<void> {
    const response = await request(endpoint).post('/features/sync')
        .set('Accept', 'application/json');
    await t.expect(response.status).eql(200, `Synchronization request failed: ${await response.body.message}`);
}
