/**
 * Helper function to work with arr.filter() method with async functions
 * @param array The array
 * @param callback The callback function need to be processed
 */
async function asyncFilter(array: string[], callback: (item: any) => Promise<boolean>): Promise<any[]> {
    const fail = Symbol();
    return (await Promise.all(array.map(async item => (await callback(item)) ? item : fail))).filter(i => i !== fail);
};

/**
 * Helper function to work with arr.find() method with async functions
 * @param array The array
 * @param asyncCallback The callback function need to be processed
 */
async function asyncFind(array: string[], asyncCallback: (item: any) => Promise<boolean>): Promise<string> {
    const index = (await Promise.all(array.map(asyncCallback))).findIndex(result => result);
    return array[index];
}

/**
 * Helper function for waiting until promise be resolved
 */
function doAsyncStuff(): Promise<void> {
    return Promise.resolve();
};

export { asyncFilter, asyncFind, doAsyncStuff };