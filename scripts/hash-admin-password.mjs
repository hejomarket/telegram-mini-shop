#!/usr/bin/env node
import { randomBytes, scrypt as scryptCallback } from 'node:crypto';
import { promisify } from 'node:util';
import { createInterface } from 'node:readline/promises';

const scrypt = promisify(scryptCallback);
let password = process.argv[2] || process.env.ADMIN_PASSWORD_INPUT;
if (!password) {
  const rl = createInterface({ input: process.stdin, output: process.stderr });
  password = await rl.question('Admin password: ');
  rl.close();
}
if (!password || password.length < 12) {
  console.error('Password must be at least 12 characters.');
  process.exit(1);
}
const salt = randomBytes(16);
const cost = 64;
const derived = await scrypt(password, salt, cost);
console.log(`scrypt$${cost}$${salt.toString('base64url')}$${derived.toString('base64url')}`);
