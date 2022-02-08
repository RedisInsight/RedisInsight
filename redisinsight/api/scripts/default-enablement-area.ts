import axios from 'axios';
import * as fs from 'fs-extra';
import * as path from 'path';
import { join } from 'path';
import * as AdmZip from 'adm-zip';
import * as config from '../src/utils/config';

const PATH_CONFIG = config.get('dir_path');
const ENABLEMENT_AREA_CONFIG = config.get('enablementArea');

async function init() {
  try {
    await fs.remove(PATH_CONFIG.defaultEnablementArea);

    await fs.ensureDir(PATH_CONFIG.defaultEnablementArea);

    // get archive
    const { data } = await axios.get(
      new URL(path.join(
        ENABLEMENT_AREA_CONFIG.updateUrl,
        ENABLEMENT_AREA_CONFIG.zip,
      )).toString(),
      {
        responseType: 'arraybuffer',
      },
    );

    // extract archive to default folder
    const zip = new AdmZip(data);
    zip.extractAllTo(PATH_CONFIG.defaultEnablementArea, true);

    // get build info
    const { data: buildInfo } = await axios.get(
      new URL(path.join(
        ENABLEMENT_AREA_CONFIG.updateUrl,
        ENABLEMENT_AREA_CONFIG.buildInfo,
      )).toString(),
      {
        responseType: 'arraybuffer',
      },
    );

    // save build info to default folder
    await fs.writeFile(
      join(PATH_CONFIG.defaultEnablementArea, ENABLEMENT_AREA_CONFIG.buildInfo),
      buildInfo,
    );

    process.exit(0);
  } catch (e) {
    console.error('Something went wrong trying to get default enablement area archive', e);
    process.exit(1);
  }
}

init();
