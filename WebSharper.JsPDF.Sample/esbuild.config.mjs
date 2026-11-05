import { build } from 'esbuild'

await build({
  entryPoints: ['./build/WebSharper.JsPDF.Sample.js'],
  bundle: true,
  minify: true,
  format: 'iife',
  outfile: '../dist/Scripts/WebSharper.JsPDF.Sample.min.js',
  globalName: 'wsbundle'
})

console.log('Bundled: WebSharper.JsPDF.Sample.js')
