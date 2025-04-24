// esbuild.config.js
const esbuild = require('esbuild');
const fs = require('fs');

esbuild.build({
  entryPoints: ['./main.ts'],
  outfile: '../Auto_Redeem_Steamkey.user.js',
  bundle: true,
  format: 'cjs',
  minify: false,
  sourcemap: false,
  legalComments: 'none',
  charset: 'utf8',
  platform: 'browser',
  external: ['sweetalert'],
  banner: {
    js: fs.readFileSync('./header.js').toString()
  }
}).catch(() => process.exit(1));
