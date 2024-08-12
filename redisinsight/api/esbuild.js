const esbuild = require('esbuild');
require('dotenv').config();
const { dependencies } = require('../package.json');

const production = process.argv.includes('--production');
const watch = process.argv.includes('--watch');

const define = {
  'process.env.NODE_ENV': JSON.stringify(production ? 'production' : 'development'),
};

const external = [
  '@nestjs/microservices',
  '@fastify/static',
  // packages with binaries
  ...Object.keys(dependencies),
];

async function main() {
  const ctx = await esbuild.context({
    entryPoints: ['dist/src/main.js'],
    bundle: true,
    format: 'cjs',
    minifyWhitespace: true,
    // if true - some nestjs decorators are not working
    minifyIdentifiers: false,
    sourcemap: !production,
    sourcesContent: false,
    platform: 'node',
    outfile: 'dist-minified/main.js',
    define,
    external,
    logLevel: 'silent',
    plugins: [
      /* add to the end of plugins array */
      // eslint-disable-next-line @typescript-eslint/no-use-before-define
      esbuildProblemMatcherPlugin,
    ],
  });
  if (watch) {
    await ctx.watch();
  } else {
    await ctx.rebuild();
    await ctx.dispose();
  }
}

/**
 * @type {import('esbuild').Plugin}
 */
const esbuildProblemMatcherPlugin = {
  name: 'esbuild-problem-matcher',

  setup(build) {
    build.onStart(() => {
      console.debug('[esbuild] build started');
    });
    build.onEnd((result) => {
      result.errors.forEach(({ text, location }) => {
        console.error(`✘ [ERROR] ${text}`);
        console.error(`    ${location.file}:${location.line}:${location.column}:`);
      });
      console.debug('[esbuild] build finished');
    });
  },
};

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
