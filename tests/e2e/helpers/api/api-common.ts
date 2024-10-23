import request from 'supertest';
import { Common } from '../common';

const endpoint = Common.getEndpoint();
const jsonType = 'application/json';

/**
 * Send GET request using API
 * @param resourcePath URI path segment
 */
export async function sendGetRequest(resourcePath: string): Promise<any> {
    const windowId = Common.getWindowId();
    let requestEndpoint: any;

    requestEndpoint = request(endpoint)
        .get(resourcePath)
        .set('Accept', jsonType);
    if (await windowId) {
        requestEndpoint.set('X-Window-Id', await windowId);
    }

    return requestEndpoint;
}

/**
 * Send POST request using API
 * @param resourcePath URI path segment
 * @param body Request body
 */
export async function sendPostRequest(
    resourcePath: string,
    body?: Record<string, unknown>
): Promise<any> {
    const windowId = Common.getWindowId();
    let requestEndpoint: any;

    requestEndpoint = request(endpoint)
        .post(resourcePath)
        .send(body)
        .set('Accept', jsonType);

    if (await windowId) {
        requestEndpoint.set('X-Window-Id', await windowId);
    }
    return requestEndpoint;
}

/**
 * Send DELETE request using API
 * @param resourcePath URI path segment
 * @param body Request body
 */
export async function sendDeleteRequest(
    resourcePath: string,
    body?: Record<string, unknown>
): Promise<any> {
    const windowId = Common.getWindowId();
    let requestEndpoint: any;

    requestEndpoint = request(endpoint)
        .delete(resourcePath)
        .send(body)
        .set('Accept', jsonType);

    if (await windowId) {
        requestEndpoint.set('X-Window-Id', await windowId);
    }

    return requestEndpoint;
}
