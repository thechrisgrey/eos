#!/usr/bin/env node
import 'source-map-support/register';
import * as fs from 'fs';
import * as path from 'path';
import * as cdk from 'aws-cdk-lib';
import { EosAgentsStack } from '../lib/eos-agents-stack';

// EosAgentsStack lives in the Altivum account (profile altivum-og). This repo
// is public, so the account id is not written here. It comes from, in order:
//   1. the EOS_AWS_ACCOUNT environment variable
//   2. .aws-account at the repo root (gitignored; one line, the 12-digit id)
// With neither, synth and deploy refuse, so the shell's AWS_PROFILE can never
// choose the account. The path is resolved from this file, not the cwd.
const ACCOUNT_ENV = 'EOS_AWS_ACCOUNT';
const ACCOUNT_FILE = path.resolve(__dirname, '..', '..', '.aws-account');

function expectedAccount(): string {
  let account = (process.env[ACCOUNT_ENV] ?? '').trim();
  let source = ACCOUNT_ENV;
  if (!account) {
    source = ACCOUNT_FILE;
    try {
      account = fs.readFileSync(ACCOUNT_FILE, 'utf8').trim();
    } catch (err) {
      if ((err as NodeJS.ErrnoException).code !== 'ENOENT') {
        throw new Error(`Cannot read ${ACCOUNT_FILE}: ${(err as Error).message}. Refusing to synth.`);
      }
    }
  }
  if (!account) {
    throw new Error(
      `No AWS account for EosAgentsStack. Set ${ACCOUNT_ENV}=<12-digit id>, or write the id on one line to ` +
        `${ACCOUNT_FILE} (gitignored). Refusing to synth.`,
    );
  }
  if (!/^\d{12}$/.test(account)) {
    throw new Error(`${source} must hold a 12-digit AWS account id. Refusing to synth.`);
  }
  return account;
}

const app = new cdk.App();
new EosAgentsStack(app, 'EosAgentsStack', {
  // Pinned to the stack's home so the shell's AWS_PROFILE cannot move it: the
  // account is resolved above and the region is a literal.
  env: { account: expectedAccount(), region: 'us-east-1' },
});
