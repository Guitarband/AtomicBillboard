import {test} from 'node:test';import assert from 'node:assert/strict';
const base=process.env.SECURITY_TEST_ORIGIN;
const options={skip:!base};
function url(path){const u=new URL(base);if(!['localhost','127.0.0.1','::1'].includes(u.hostname))throw new Error('Security smoke tests must run against localhost');return new URL(path,u)}
test('public email signup rejected by server',options,async()=>{const r=await fetch(url('/api/auth/sign-up/email'),{method:'POST',headers:{'content-type':'application/json',origin:base},body:JSON.stringify({name:'Test',email:'test@gmail.com',password:'long-test-password-123'})});assert.equal(r.status,400)});
test('anonymous users cannot access review queue',options,async()=>{const r=await fetch(url('/api/trpc/queue'));assert.equal(r.status,401)});
test('cross-origin tracking requests are denied',options,async()=>{for(const path of ['/api/visit','/api/attribution','/api/tracking-preference']){const r=await fetch(url(path),{method:'POST',headers:{origin:'https://foreign.example','content-type':'application/json'},body:'{}'});assert.equal(r.status,403)}});
test('anonymous users cannot upload private attachments',options,async()=>{const r=await fetch(url('/api/attachments'),{method:'POST',headers:{origin:base,'x-study-id':'fake','x-file-name':'test.txt'},body:'example'});assert.equal(r.status,401)});
