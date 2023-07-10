import { t } from 'testcafe';
import { sendPostRequest } from './api-common';
import { ResourcePath } from '../constants';

/**
 * Synchronize features
 */
export async function syncFeaturesApi(): Promise<void> {
    const response = await sendPostRequest(ResourcePath.SyncFeatures);

    await t.expect(await response.status).eql(200);
}
