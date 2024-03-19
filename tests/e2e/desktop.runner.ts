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

    console.log('Starting TestCafe script...');

    try {
        const testcafe = await createTestCafe(testCafeOptions);

        console.log('TestCafe instance created.');

        const runner = testcafe.createRunner();

        console.log('Runner created.');

        const failedCount = await runner
            .src((process.env.TEST_FILES || 'tests/electron/**/*.e2e.ts').split('\n'))
            .browsers(['electron'])
            // Add more debug output here if needed
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
                // quarantineMode: { successThreshold: 1, attemptLimit: 3 },
                disableMultipleWindows: true
            });

        console.log('Test execution completed.');

        // Check if there were any failures
        if (failedCount > 0) {
            console.error(`There were ${failedCount} test(s) failed.`);
        } else {
            console.log('All tests passed successfully.');
        }

        await testcafe.close();
    } catch (error) {
        console.error('An error occurred:', error);
        process.exit(1); // Exit with error code
    }
})();
