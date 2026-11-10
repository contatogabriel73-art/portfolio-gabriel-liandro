import {createRequire} from 'node:module';
import {mkdir,writeFile,copyFile,readFile,cp} from 'node:fs/promises';
import path from 'node:path';
const root=process.cwd();
const dependencies=process.env.PORTFOLIO_DEPS || root;
const require=createRequire(path.join(dependencies,'package.json'));
const {build}=require('esbuild');
const aliases=Object.fromEntries(['react','react-dom','lucide-react'].map(name=>[name,path.join(dependencies,'node_modules',name)]));
await mkdir('dist',{recursive:true});
await mkdir('.sites-runtime',{recursive:true});
const shared={bundle:true,jsx:'automatic',alias:aliases,define:{'process.env.NODE_ENV':'"production"'},logLevel:'info'};
await build({...shared,entryPoints:['app/client.tsx'],outfile:'dist/app.js',platform:'browser',minify:true});
await writeFile('.sites-runtime/render.tsx',`import React from 'react';import {renderToString} from 'react-dom/server';import Home from '../app/page';export const html=renderToString(<Home/>);`);
await build({...shared,entryPoints:['.sites-runtime/render.tsx'],outfile:'.sites-runtime/page.cjs',platform:'node',format:'cjs'});
const markup=createRequire(path.join(root,'package.json'))('./.sites-runtime/page.cjs').html;
await copyFile('app/globals.css','dist/style.css');
await copyFile('public/favicon.svg','dist/favicon.svg');
await cp('public/media','dist/media',{recursive:true});
await writeFile('dist/index.html',`<!doctype html><html lang="pt-BR"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="theme-color" content="#141613"><title>Gabriel Luiz Liandro | Vídeos e imagens com IA</title><meta name="description" content="Vídeos e imagens com inteligência artificial, edição com CapCut e um olhar de marketing digital. Conheça Gabriel Luiz Liandro."><link rel="icon" href="/favicon.svg"><link rel="stylesheet" href="/style.css"></head><body><div id="root">${markup}</div><script type="module" src="/app.js"></script></body></html>`);
console.log('Portfólio pronto em dist/');


