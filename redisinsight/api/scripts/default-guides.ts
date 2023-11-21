import * as path from 'path';
import { getFile, updateFolderFromArchive, updateFile } from '../src/utils/file-helper';
import { get } from '../src/utils/config';

const PATH_CONFIG = get('dir_path');
const GUIDES_CONFIG = get('guides');

const archiveUrl = new URL(path.join(
  GUIDES_CONFIG.updateUrl,
  GUIDES_CONFIG.zip,
)).toString();

const buildInfoUrl = new URL(path.join(
  GUIDES_CONFIG.updateUrl,
  GUIDES_CONFIG.buildInfo,
)).toString();

async function init() {
  try {
    // // get archive
    const data = await getFile(archiveUrl);

    // extract archive to default folder
    await updateFolderFromArchive(PATH_CONFIG.defaultGuides, data);

    // // get build info
    const buildInfo = await getFile(buildInfoUrl);

    // save build info to default folder
    await updateFile(PATH_CONFIG.defaultGuides, GUIDES_CONFIG.buildInfo, buildInfo);

    process.exit(0);
  } catch (e) {
    console.error('Something went wrong trying to get default guides archive', e);
    process.exit(1);
  }
}

init();
