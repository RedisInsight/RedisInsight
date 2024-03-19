// import testcafe from 'testcafe';

// (async(): Promise<void> => {
//     await testcafe('localhost')
//         .then(t => {
//             return t
//                 .createRunner()
//                 .compilerOptions({
//                     'typescript': {
//                         configPath: 'tsconfig.testcafe.json',
//                         experimentalDecorators: true
//                     } })
//                 .src((process.env.TEST_FILES || 'tests/electron/**/*.e2e.ts').split('\n'))
//                 .browsers(['electron'])
//                 .screenshots({
//                     path: './report/screenshots/',
//                     takeOnFails: true,
//                     pathPattern: '${USERAGENT}/${DATE}_${TIME}/${FIXTURE}_${TEST}_${FILE_INDEX}.png'
//                 })
//                 .reporter([
//                     'spec',
//                     {
//                         name: 'xunit',
//                         output: './results/results.xml'
//                     },
//                     {
//                         name: 'json',
//                         output: './results/e2e.results.json'
//                     },
//                     {
//                         name: 'html',
//                         output: './report/report.html'
//                     }
//                 ])
//                 .run({
//                     skipJsErrors: true,
//                     browserInitTimeout: 60000,
//                     selectorTimeout: 5000,
//                     assertionTimeout: 5000,
//                     speed: 1,
//                     quarantineMode: { successThreshold: 1, attemptLimit: 3 },
//                     disableMultipleWindows: true
//                 });
//         })
//         .then((failedCount) => {
//             process.exit(failedCount);
//         })
//         .catch((e) => {
//             console.error(e);
//             process.exit(1);
//         });
// })();


(async () => {
    const createTestCafe = require('testcafe');
    const testCafeOptions = {
        hostname: 'localhost'
    };

    const testcafe = await createTestCafe(testCafeOptions);

    await testcafe
        .createRunner()
        .src((process.env.TEST_FILES || 'tests/electron/**/*.e2e.ts').split('\n'))
        .browsers(['electron'])
        .screenshots({
            path: './report/screenshots/',
            takeOnFails: true,
            pathPattern:
                '${USERAGENT}/${DATE}_${TIME}/${FIXTURE}_${TEST}_${FILE_INDEX}.png',
        })
        .reporter([
            'spec',
            {
                name: 'xunit',
                output: './results/results.xml',
            },
            {
                name: 'json',
                output: './results/e2e.results.json',
            },
            {
                name: 'html',
                output: './report/report.html',
            },
        ])
        .compilerOptions({
          typescript: {
              configPath: 'tsconfig.testcafe.json',
              experimentalDecorators: true,
          },
      })
        .run({
            skipJsErrors: true,
            browserInitTimeout: 60000,
            selectorTimeout: 5000,
            assertionTimeout: 5000,
            speed: 1,
            pageRequestTimeout: 8000,
            quarantineMode: { successThreshold: 1, attemptLimit: 3 },
            disableMultipleWindows: true
        });

    await testcafe.close();
})();
