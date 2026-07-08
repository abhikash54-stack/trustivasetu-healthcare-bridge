import { execSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, '..');
const versionPath = path.join(root, 'docs', 'version.json');

if (!existsSync(versionPath)) {
  throw new Error('version.json is missing.');
}

const versionData = JSON.parse(readFileSync(versionPath, 'utf8'));
const version = versionData.version;
console.log(`Prepared release ${version} metadata for portal publishing.`);

if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
  console.log('AWS credentials not provided; skipping S3 publish step.');
  process.exit(0);
}

const bucket = process.env.S3_BUCKET_NAME || 'trustivasetu-releases';
const region = process.env.AWS_REGION || 'ap-south-1';
const cmd = [
  'aws', 's3', 'sync', 'docs', `s3://${bucket}/`,
  '--delete',
  '--region', region,
  '--cache-control', 'public, max-age=300',
].join(' ');

execSync(cmd, { stdio: 'inherit', cwd: root });
console.log(`Published docs assets to S3 bucket ${bucket}.`);
