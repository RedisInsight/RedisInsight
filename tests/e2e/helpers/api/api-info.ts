import { t } from 'testcafe';
import { ResourcePath } from '../constants';
import { sendPostRequest } from './api-common';

/**
 * Synchronize features
 */
export async function syncFeaturesApi(): Promise<void> {
    const response = await sendPostRequest(ResourcePath.SyncFeatures);

    await t.expect(await response.status).eql(200);
}
