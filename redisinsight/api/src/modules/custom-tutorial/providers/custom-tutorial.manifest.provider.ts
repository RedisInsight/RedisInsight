import { Injectable, Logger } from '@nestjs/common';
import { join, parse } from 'path';
import * as fs from 'fs-extra';
import { CustomTutorial } from 'src/modules/custom-tutorial/models/custom-tutorial';
import {
  CustomTutorialManifest,
  CustomTutorialManifestType,
  RootCustomTutorialManifest,
} from 'src/modules/custom-tutorial/models/custom-tutorial.manifest';
import { plainToClass } from 'class-transformer';

const MANIFEST_FILE = 'manifest.json';
const SYS_MANIFEST_FILE = '_manifest.json';

@Injectable()
export class CustomTutorialManifestProvider {
  private logger = new Logger('CustomTutorialManifestProvider');

  /**
   * Auto generate system manifest json (_manifest.json)
   * @param path
   * @private
   */
  private async generateManifestFile(path: string): Promise<any[]> {
    try {
      const manifest = await this.generateManifestEntry(path, '/');

      await fs.writeFile(join(path, SYS_MANIFEST_FILE), JSON.stringify(manifest), 'utf8');

      return manifest;
    } catch (e) {
      this.logger.warn('Unable to automatically generate manifest file', e);
      return null;
    }
  }

  /**
   * Discover all .md files and folders and generate manifest based on it
   * Manifest labels will be created based on files and folders names
   * For files [.md] will be excluded
   * All folders and files which starts from "_" and "." will be excluded also
   * @param path
   * @param relativePath
   * @private
   */
  private async generateManifestEntry(path: string, relativePath: string = '/'): Promise<any[]> {
    const manifest = [];
    const entries = await fs.readdir(path);

    for (let i = 0; i < entries.length; i += 1) {
      const entry = entries[i];

      if (entry.startsWith('.') || entry.startsWith('_')) {
        // eslint-disable-next-line no-continue
        continue;
      }

      const isDirectory = (await fs.lstat(join(path, entry))).isDirectory();

      const { name, ext } = parse(entry);

      if (isDirectory) {
        manifest.push({
          id: entry,
          label: name,
          type: CustomTutorialManifestType.Group,
          args: {
            initialIsOpen: true,
          },
          children: await this.generateManifestEntry(join(path, entry), join(relativePath, entry)),
        });
      } else if (ext === '.md') {
        manifest.push({
          id: entry,
          label: name,
          type: CustomTutorialManifestType.InternalLink,
          args: {
            path: join(relativePath, entry),
          },
        });
      }
    }

    return manifest;
  }

  private async getManifestJsonFile(path): Promise<any> {
    try {
      return JSON.parse(
        await fs.readFile(join(path, MANIFEST_FILE), 'utf8'),
      );
    } catch (e) {
      this.logger.warn('Unable to get manifest for tutorial');
    }

    try {
      return JSON.parse(
        await fs.readFile(join(path, SYS_MANIFEST_FILE), 'utf8'),
      );
    } catch (e) {
      this.logger.warn('Unable to get _manifest for tutorial');
    }

    return await this.generateManifestFile(path) as any;
  }

  /**
   * Try to get and parse manifest.json
   * In case of any error will not throw an error but return null
   * In this case tutorial will be displayed but without anything inside
   * So user will be able to fix (re-import) tutorial or remove it
   * @param path
   */
  public async getManifestJson(path: string): Promise<CustomTutorialManifest[]> {
    try {
      const manifestJson = await this.getManifestJsonFile(path);

      const model = plainToClass(CustomTutorialManifest, manifestJson as [], { excludeExtraneousValues: true });

      return model?.length ? model : [];
    } catch (e) {
      this.logger.warn('Unable to get manifest for tutorial');
      return null;
    }
  }

  /**
   * Generate custom manifest based on manifest.json inside tutorial folder and
   * additional data from local database
   * @param tutorial
   */
  public async generateTutorialManifest(tutorial: CustomTutorial): Promise<RootCustomTutorialManifest> {
    try {
      return {
        type: CustomTutorialManifestType.Group,
        id: tutorial.id,
        label: tutorial.name,
        _actions: tutorial.actions,
        _path: tutorial.path,
        children: await this.getManifestJson(tutorial.absolutePath),
      };
    } catch (e) {
      this.logger.warn('Unable to generate manifest for tutorial', e);
      return null;
    }
  }
}
