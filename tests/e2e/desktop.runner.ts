import testcafe from 'testcafe';

(async(): Promise<void> => {
    await testcafe('localhost')
        .then(t => {
            return t
                .createRunner()
                .src((process.env.TEST_FILES || 'tests/**/*.e2e.ts').split('\n'))
                .browsers(['electron'])
                .filter((_testName, _fixtureName, _fixturePath, testMeta): boolean => {
                    return testMeta.env !== 'web'
                })
                .reporter([
                    'spec',
                    {
                        name: 'xunit',
                        output: './results/results.xml'
                    },
                    {
                        name: 'json',
                        output: './results/e2e.results.json'
                    }
                ])
                .run({
                    disableScreenshots: true,
                    skipJsErrors: true,
                    browserInitTimeout: 60000,
                    speed: 1
                });
        })
        .then(() => {
            process.exit(0);
        })
        .catch((e) => {
            console.error(e)
            process.exit(1);
        });
})();
