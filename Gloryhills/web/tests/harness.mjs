// Execute the real TypeScript entry points with explicit local dependencies, no Next server or network.
import ts from 'typescript';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
export function loadTS(path, imports, globals={}) {
 const source=readFileSync(new URL('../'+path,import.meta.url),'utf8');
 const {outputText}=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX,target:ts.ScriptTarget.ES2022,esModuleInterop:true}});
 const exports={};
 vm.runInNewContext(outputText,{exports,require(name){if(!(name in imports))throw new Error('Unmocked import: '+name);return imports[name];},process:{env:{}},URL,Response,Request,FormData,Uint8Array,TextDecoder,console,...globals},{filename:path});
 return exports;
}
export function redirect(path){throw Object.assign(new Error('redirect'),{destination:path});}
