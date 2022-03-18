import fs from 'fs';
import { epPackage, projRoot } from './utils';
import { cyan, red, yellow, green } from './utils';
import { getPackageManifest } from './utils';
import glob from 'fast-glob';

const tagVersion = process.env.TAG_VERSION;
if (!tagVersion) {
  red(
    'No tag version or git head were found, make sure that you set the environment variable $TAG_VERSION \n',
  );
  process.exit(1);
}

cyan('Start updating version');

cyan(['NOTICE:', `$TAG_VERSION: ${tagVersion}`].join('\n'));
(async () => {
  if (!(process.argv.includes('-d') || process.argv.includes('--dry-run'))) {
    try {
      const packages = await glob('{extensions,tools}/*/package.json', {
        cwd: projRoot,
        absolute: true,
        onlyFiles: true,
      });
      packages.push(epPackage);
      packages.map(async (pkg) => {
        const json: Record<string, any> = getPackageManifest(pkg);
        json.version = tagVersion;
        await fs.promises.writeFile(pkg, JSON.stringify(json, null, 2), {
          encoding: 'utf-8',
        });
        yellow(`Updating ${pkg} version to ${tagVersion}`);
      });
    } catch (e) {
      console.error(e);
      process.exit(1);
    }
  }

  green(`Version updated to ${tagVersion}`);
})();