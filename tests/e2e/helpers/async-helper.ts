async function asyncFilter(arr: any, callback: any) {
    const fail = Symbol();
    return (await Promise.all(arr.map(async item => (await callback(item)) ? item : fail))).filter(i => i !== fail);
};

async function asyncFind(arr: any, asyncCallback: any) {
    const index = (await Promise.all(arr.map(asyncCallback))).findIndex(result => result);
    return arr[index];
}

function doAsyncStuff() {
    return Promise.resolve();
};

export { asyncFilter, asyncFind, doAsyncStuff };