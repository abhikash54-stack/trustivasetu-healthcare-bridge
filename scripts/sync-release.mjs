import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, '..');

const appJsonPath = path.join(root, 'app.json');
const versionJsonPath = path.join(root, 'docs', 'version.json');
const packageJsonPath = path.join(root, 'package.json');

async function readJson(filePath) {
  return JSON.parse(await readFile(filePath, 'utf8'));
}

async function writeJson(filePath, value) {
  await writeFile(filePath, `${JSON.stringify(value, null, 2)}\n`);
}

async function main() {
  const appJson = await readJson(appJsonPath);
  const pkg = await readJson(packageJsonPath);
  const version = pkg.version;
  const buildNumber = String(appJson.expo.ios.buildNumber);
  const versionCode = Number(appJson.expo.android.versionCode);

  const versionData = {
    version,
    buildNumber: Number(buildNumber),
    releaseDate: new Date().toISOString().slice(0, 10),
    releaseNotes: `Automated release ${version} (build ${buildNumber}).`,
    apkUrl: 'https://app.trustivasetu.com/latest.apk',
    mandatory: false,
    minimumSupportedVersion: '1.0.0',
    maintenanceMode: false,
    forceUpdate: false,
    iOSAppStoreUrl: 'https://app.trustivasetu.com',
    source: 'github-actions',
    channel: process.env.APP_CHANNEL || 'production',
  };

  await writeJson(versionJsonPath, versionData);

  const checkMode = process.argv.includes('--check');
  if (checkMode) {
    const current = await readJson(versionJsonPath);
    const hasMismatch = current.version !== version || current.buildNumber !== Number(buildNumber);
    if (hasMismatch) {
      console.error('Release metadata is out of sync.');
      process.exit(1);
    }
    console.log('Release metadata is in sync.');
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
