import {test} from "node:test";import assert from "node:assert/strict";import {emailDomain} from "../lib/email-policy.mjs";
test("rejects major public email providers and subdomains",()=>{for(const domain of ["gmail.com","outlook.com","hotmail.com","yahoo.com","icloud.com","proton.me","mail.gmail.com"]) assert.equal(emailDomain("person@"+domain),null)});
test("accepts a syntactically valid organisation domain for approval lookup",()=>assert.equal(emailDomain("person@Example.Org"),"example.org"));
test("rejects malformed addresses",()=>{for(const email of ["a@@b.com","a@localhost","a@-bad.com","not-an-email"]) assert.equal(emailDomain(email),null)});
