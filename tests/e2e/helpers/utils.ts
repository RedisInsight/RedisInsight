import { ClientFunction } from 'testcafe';

export const goBackHistory = ClientFunction(() => window.history.back());

export const createTimeout = (errorMessage: string, timeout: number): Promise<any> =>
    new Promise((_, reject) => {
        setTimeout(() => {
            reject(new Error(errorMessage));
        }, timeout);
    });
