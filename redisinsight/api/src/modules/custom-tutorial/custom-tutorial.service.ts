import { Injectable } from '@nestjs/common';
import * as AdmZip from 'adm-zip';
import { v4 as uuidv4 } from 'uuid';
import * as os from 'os';
import * as fs from 'fs-extra';
import { join } from 'path';
import { CustomTutorialRepository } from 'src/modules/custom-tutorial/repositories/custom-tutorial.repository';
import { CustomTutorial } from 'src/modules/custom-tutorial/models/custom-tutorial';
import { UploadCustomTutorialDto } from 'src/modules/custom-tutorial/dto/upload.custom-tutorial.dto';
import config from 'src/utils/config';
import { plainToClass } from 'class-transformer';

const PATH_CONFIG = config.get('dir_path');
const SERVER_CONFIG = config.get('server');
const TMP_FOLDER = `${os.tmpdir()}/RedisInsight-v2/custom-tutorials`;

@Injectable()
export class CustomTutorialService {
  constructor(
    private readonly customTutorialRepository: CustomTutorialRepository,
  ) {}

  public async upload(dto: UploadCustomTutorialDto) {
    try {
      // upload tutorial to tmp folder
      const tmpFolderName = uuidv4();
      const tmpPath = join(TMP_FOLDER, tmpFolderName);
      await fs.ensureDir(tmpPath);
      const zip = new AdmZip(dto.file.buffer);
      await fs.remove(tmpPath);
      await zip.extractAllTo(tmpPath, true);

      // todo: validate

      // todo: mode to main folder
      const id = uuidv4();
      const path = join(PATH_CONFIG.customTutorials, id);
      const uri = id;
      console.log('___ uri', uri);
      await fs.move(tmpPath, path);

      // todo: save entity
      const entity = await this.customTutorialRepository.create(plainToClass(CustomTutorial, {
        ...dto,
        id,
        path,
        uri,
      }));

      console.log('___ entity', entity);

      // await fs.writeFile(
      //   join(this.options.destinationPath, this.options.buildInfo),
      //   JSON.stringify(await this.getRemoteBuildInfo()),
      // );
    } catch (e) {
      throw e;
    }
  }

  private async generateTutorialManifest(tutorial: CustomTutorial): Promise<Record<string, any>> {
    try {
      const rootPath = join(PATH_CONFIG.customTutorials, tutorial.id);
      const children = JSON.parse(
        await fs.readFile(join(rootPath, 'manifest.json'), 'utf8'),
      );

      return {
        type: 'group',
        id: tutorial.id,
        label: tutorial.name,
        actions: ['delete'],
        uri: tutorial.uri,
        children,
      };
    } catch (e) {
      console.log('___ oo', e);
      // todo: error log
      return null;
    }
  }

  // todo: replace any
  public async getManifest(): Promise<any> {
    const children = {};

    try {
      const tutorials = await this.customTutorialRepository.list();
      console.log('___ tutorials', tutorials);

      const manifests = await Promise.all(tutorials.map(this.generateTutorialManifest.bind(this))) as Record<string, any>[];

      console.log('___ manifests', manifests);

      manifests.forEach((manifest) => {
        if (manifest) {
          children[manifest.id] = manifest;
        }
      });
    } catch (e) {
      // silent
    }

    return {
      'my-tutorials': {
        type: 'group',
        id: 'mu-tutorials',
        label: 'My Tutorials',
        actions: ['create'],
        args: {
          withBorder: true,
          initialIsOpen: true,
        },
        children,
      },
    };
  }

  public async delete(id): Promise<void> {
    console.log('___ trynig to delete', id);
    const path = join(PATH_CONFIG.customTutorials, id);
    console.log('___ path', path);

    try {
      await this.customTutorialRepository.delete(id);
      try {
        await fs.remove(path);
      } catch (e) {
        console.log('___ err', e)
        // ignore errors
      }
    } catch (e) {
      // todo: logs
      throw e;
    }
  }
}
