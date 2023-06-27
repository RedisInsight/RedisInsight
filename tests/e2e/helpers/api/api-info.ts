import { sendRequest } from './api-common';
import { Methods } from '../constants';

/**
 * Synchronize features
 */
export async function syncFeaturesApi(): Promise<void> {
    await sendRequest(Methods.post, '/features/sync', 200);
}
