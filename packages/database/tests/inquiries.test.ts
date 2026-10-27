import {test,after,before} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {PGlite} from '@electric-sql/pglite';
import {PgDialect} from 'drizzle-orm/pg-core';
import {inquiryStatement} from '../src/queries';
const db=new PGlite();
const dialect=new PgDialect();
const input={name:'Visitor',email:'test@example.com',company:'Studio',service:'AI Workflow Automation',estimatedBudget:'Exploring options',message:'We need a carefully designed support workflow.'};
before(async()=>{await db.exec(readFileSync(new URL('../migrations/0000_living_atelier.sql',import.meta.url),'utf8'));});
after(async()=>{await db.close();});
async function insert(key:string){const query=dialect.sqlToQuery(inquiryStatement(input,key));return db.query<{id:string}>(query.sql,query.params);}
test('migration and production query persist an inquiry, activity, and audit atomically',async()=>{const result=await insert('test:first');assert.equal(result.rows.length,1);const id=result.rows[0].id;const inquiry=await db.query<{name:string;status:string}>('SELECT name,status FROM contact_inquiries WHERE id=$1',[id]);assert.equal(inquiry.rows[0].name,'Visitor');assert.equal(inquiry.rows[0].status,'NEW');const activity=await db.query('SELECT * FROM inquiry_activity WHERE inquiry_id=$1',[id]);const audit=await db.query('SELECT * FROM audit_events WHERE target_id=$1',[id]);assert.equal(activity.rows.length,1);assert.equal(audit.rows.length,1);});
test('shared database limiter allows five inquiries and rejects the sixth without partial records',async()=>{for(let i=0;i<5;i++)assert.equal((await insert('test:limited')).rows.length,1);const before=await db.query<{count:number}>('SELECT count(*)::int AS count FROM contact_inquiries');assert.equal((await insert('test:limited')).rows.length,0);const after=await db.query<{count:number}>('SELECT count(*)::int AS count FROM contact_inquiries');assert.equal(after.rows[0].count,before.rows[0].count);});
test('expired buckets reset and permit another inquiry',async()=>{await db.exec("UPDATE rate_limits SET expires_at=now()-interval '1 second' WHERE key='test:limited'");assert.equal((await insert('test:limited')).rows.length,1);});
test('status enum and activity foreign key enforce record integrity',async()=>{await assert.rejects(db.exec("UPDATE contact_inquiries SET status='UNKNOWN'"));await assert.rejects(db.exec("INSERT INTO inquiry_activity(inquiry_id,activity_type) VALUES('00000000-0000-0000-0000-000000000001','CREATED')"));});
test('SQL parameters preserve hostile input as text',async()=>{const hostile={...input,name:"Robert'); DROP TABLE contact_inquiries; --"};const q=dialect.sqlToQuery(inquiryStatement(hostile,'test:hostile'));const saved=await db.query<{id:string}>(q.sql,q.params);assert.equal(saved.rows.length,1);const record=await db.query<{name:string}>('SELECT name FROM contact_inquiries WHERE id=$1',[saved.rows[0].id]);assert.equal(record.rows[0].name,hostile.name);});
