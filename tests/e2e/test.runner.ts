import testcafe from 'testcafe';

const runnerConfig = {
    browsers: ['electron'],
    tests: ['tests/**/*.e2e.ts'],
    // @ts-ignore
    filter: (testName, fixtureName, fixturePath, testMeta): boolean => {
        return testMeta.env !== 'web'
    },
    reporters: [
        'spec',
        {
            name: 'xunit',
            output: './results/results.xml'
        },
        {
            name: 'json',
            output: './results/e2e.results.json'
        }
    ],
    runOptions: {
        skipJsErrors: true,
        browserInitTimeout: 60000,
        speed: 1
    }
}

export const run = async(config = runnerConfig): Promise<void> => {
    await testcafe('localhost')
        .then(t => {
            return t
                .createRunner()
                .src(config.tests)
                .browsers(config.browsers)
                .filter(config.filter)
                .reporter(config.reporters)
                .run(config.runOptions);
        })
        .then(() => {
            process.exit(0);
        })
        .catch((e) => {
            console.error(e)
            process.exit(1);
        })

}

run();
