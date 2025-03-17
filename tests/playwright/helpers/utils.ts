export const createTimeout = (errorMessage: string, timeout: number): Promise<never> =>
    new Promise((_, reject) => {
        setTimeout(() => {
            reject(new Error(errorMessage));
        }, timeout);
    });
