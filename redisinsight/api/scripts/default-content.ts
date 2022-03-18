import axios from 'axios';
import * as fs from 'fs-extra';
import * as path from 'path';
import { join } from 'path';
import { get } from '../src/utils/config';
import * as AdmZip from 'adm-zip';

const PATH_CONFIG = get('dir_path');
const CONTENT_CONFIG = get('content');

async function init() {
  try {
    await fs.remove(PATH_CONFIG.defaultContent);

    await fs.ensureDir(PATH_CONFIG.defaultContent);

    const { data } = await axios.get(
      new URL(path.join(
        CONTENT_CONFIG.updateUrl,
        CONTENT_CONFIG.zip,
      )).toString(),
      {
        responseType: 'arraybuffer',
      },
    );

    // extract archive to default folder
    const zip = new AdmZip(data);
    zip.extractAllTo(PATH_CONFIG.defaultContent, true);

    const { data: buildInfo } = await axios.get(
      new URL(path.join(
        CONTENT_CONFIG.updateUrl,
        CONTENT_CONFIG.buildInfo,
      )).toString(),
      {
        responseType: 'arraybuffer',
      },
    );

    // save build info to default folder
    await fs.writeFile(
      join(PATH_CONFIG.defaultContent, CONTENT_CONFIG.buildInfo),
      buildInfo,
    );

    process.exit(0);
  } catch (e) {
    console.error('Something went wrong trying to get default commands jsons', e);
    process.exit(1);
  }
}

init();
