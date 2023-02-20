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
      await fs.move(tmpPath, path);

      // todo: save entity
      const entity = await this.customTutorialRepository.create(plainToClass(CustomTutorial, {
        ...dto,
        id,
        path,
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

  // todo: replace any
  public async getManifest(): Promise<any> {
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
        children: {},
      },
    };
  }
}
