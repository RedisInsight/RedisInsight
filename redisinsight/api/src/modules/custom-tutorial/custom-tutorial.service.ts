import {
  BadRequestException,
  Injectable, Logger, NotFoundException,
} from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { CustomTutorialRepository } from 'src/modules/custom-tutorial/repositories/custom-tutorial.repository';
import { CustomTutorial, CustomTutorialActions } from 'src/modules/custom-tutorial/models/custom-tutorial';
import { UploadCustomTutorialDto } from 'src/modules/custom-tutorial/dto/upload.custom-tutorial.dto';
import { plainToClass } from 'class-transformer';
import ERROR_MESSAGES from 'src/constants/error-messages';
import { CustomTutorialFsProvider } from 'src/modules/custom-tutorial/providers/custom-tutorial.fs.provider';
import {
  CustomTutorialManifestProvider,
} from 'src/modules/custom-tutorial/providers/custom-tutorial.manifest.provider';
import {
  CustomTutorialManifestType,
  RootCustomTutorialManifest,
} from 'src/modules/custom-tutorial/models/custom-tutorial.manifest';
import { wrapHttpError } from 'src/common/utils';

@Injectable()
export class CustomTutorialService {
  private logger = new Logger('CustomTutorialService');

  constructor(
    private readonly customTutorialRepository: CustomTutorialRepository,
    private readonly customTutorialFsProvider: CustomTutorialFsProvider,
    private readonly customTutorialManifestProvider: CustomTutorialManifestProvider,
  ) {}

  /**
   * Create custom tutorial entity + static files based on input
   * Currently from zip file only
   * @param dto
   */
  public async create(dto: UploadCustomTutorialDto): Promise<RootCustomTutorialManifest> {
    try {
      let tmpPath = '';

      if (dto.file) {
        tmpPath = await this.customTutorialFsProvider.unzipFromMemoryStoredFile(dto.file);
      } else if (dto.link) {
        tmpPath = await this.customTutorialFsProvider.unzipFromExternalLink(dto.link);
      } else {
        throw new BadRequestException('File or external link should be provided');
      }

      // todo: validate

      // create tutorial model
      const model = plainToClass(CustomTutorial, {
        ...dto,
        id: uuidv4(),
      });

      await this.customTutorialFsProvider.moveFolder(tmpPath, model.absolutePath);

      const tutorial = await this.customTutorialRepository.create(model);

      return await this.customTutorialManifestProvider.generateTutorialManifest(tutorial);
    } catch (e) {
      this.logger.error('Unable to create custom tutorials', e);
      throw wrapHttpError(e);
    }
  }

  /**
   * Get global manifest for all custom tutorials
   * In the future will be removed with some kind of partial load
   */
  public async getGlobalManifest(): Promise<RootCustomTutorialManifest[]> {
    const children = [];

    try {
      const tutorials = await this.customTutorialRepository.list();

      const manifests = await Promise.all(
        tutorials.map(
          this.customTutorialManifestProvider.generateTutorialManifest.bind(this.customTutorialManifestProvider),
        ),
      ) as Record<string, any>[];

      manifests.forEach((manifest) => {
        if (manifest) {
          children.push(manifest);
        }
      });
    } catch (e) {
      this.logger.warn('Unable to generate entire custom tutorials manifest', e);
    }

    return [
      {
        type: CustomTutorialManifestType.Group,
        id: 'custom-tutorials',
        label: 'MY TUTORIALS',
        _actions: [CustomTutorialActions.CREATE],
        args: {
          withBorder: true,
          initialIsOpen: true,
        },
        children,
      },
    ];
  }

  public async get(id: string): Promise<CustomTutorial> {
    const model = await this.customTutorialRepository.get(id);

    if (!model) {
      this.logger.error(`Custom Tutorial with ${id} was not Found`);
      throw new NotFoundException(ERROR_MESSAGES.CUSTOM_TUTORIAL_NOT_FOUND);
    }

    return model;
  }

  public async delete(id: string): Promise<void> {
    try {
      const tutorial = await this.get(id);
      await this.customTutorialRepository.delete(id);
      await this.customTutorialFsProvider.removeFolder(tutorial.absolutePath);
    } catch (e) {
      this.logger.error('Unable to delete custom tutorial', e);
      throw wrapHttpError(e);
    }
  }
}
