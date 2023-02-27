import { Injectable, Logger } from '@nestjs/common';
import { join } from 'path';
import * as fs from 'fs-extra';
import { CustomTutorial } from 'src/modules/custom-tutorial/models/custom-tutorial';
import {
  CustomTutorialManifest,
  CustomTutorialManifestType,
  RootCustomTutorialManifest,
} from 'src/modules/custom-tutorial/models/custom-tutorial.manifest';
import { plainToClass } from 'class-transformer';

const MANIFEST_FILE = 'manifest.json';

@Injectable()
export class CustomTutorialManifestProvider {
  private logger = new Logger('CustomTutorialManifestProvider');

  /**
   * Try to get and parse manifest.json
   * In case of any error will not throw an error but return null
   * In this case tutorial will be displayed but without anything inside
   * So user will be able to fix (re-import) tutorial or remove it
   * @param path
   */
  public async getManifestJson(path: string): Promise<CustomTutorialManifest[]> {
    try {
      const manifestJson = JSON.parse(
        await fs.readFile(join(path, MANIFEST_FILE), 'utf8'),
      );

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
