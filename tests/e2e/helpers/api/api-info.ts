import { t } from 'testcafe';
import * as request from 'supertest';
import { Common } from '../common';
import * as express from 'express';
import * as fs from 'fs-extra';

const endpoint = Common.getEndpoint();

/**
 * Synchronize features
 */
export async function syncFeaturesApi(): Promise<void> {
    const response = await request(endpoint).post('/features/sync')
        .set('Accept', 'application/json');
    await t.expect(response.status).eql(200, `Synchronization request failed: ${await response.body.message}`);
}

/**
 * Initiate remote server to fetch various static data like notificaitons or features configs
 */
export const initRemoteServer = async () => {
    const path = './test-data/remote';
    await fs.ensureDir(path);

    const app = express();
    app.use('/remote', express.static(path));
    // Start the server
    await app.listen(3000);
}
