import { HttpClient } from './http-client'
import { ResourcePath } from '../constants'


/**
 * Synchronize features
 */
export async function syncFeaturesApi(apiUrl: string): Promise<void> {
    const apiClient = new HttpClient(apiUrl).getClient()
    const response = await apiClient.post(ResourcePath.SyncFeatures, {})
    if (!response) {
        throw new Error('Failed to synchronize features: Empty response')
    }
}
