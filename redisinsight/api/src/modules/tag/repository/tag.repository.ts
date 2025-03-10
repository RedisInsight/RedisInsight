import { Tag } from '../models/tag';

export abstract class TagRepository {
  /**
   * List all tags.
   * @returns {Promise<Tag[]>} A promise that resolves to an array of tags.
   */
  abstract list(): Promise<Tag[]>;

  /**
   * Get a tag by its ID.
   * @param {string} id - The ID of the tag.
   * @returns {Promise<Tag>} A promise that resolves to the tag.
   */
  abstract get(id: string): Promise<Tag>;

  /**
   * Get a tag by its key and value.
   * @param {string} key - The key of the tag.
   * @param {string} value - The value of the tag.
   * @returns {Promise<Tag>} A promise that resolves to the tag.
   */
  abstract getByKeyValuePair(key: string, value: string): Promise<Tag>;

  /**
   * Create a new tag.
   * @param {Tag} tag - The tag to create.
   * @returns {Promise<Tag>} A promise that resolves to the created tag.
   */
  abstract create(tag: Tag): Promise<Tag>;

  /**
   * Update an existing tag.
   * @param {string} id - The ID of the tag to update.
   * @param {Partial<Tag>} tag - The updated tag data.
   * @returns {Promise<void>} A promise that resolves when the tag is updated.
   */
  abstract update(id: string, tag: Partial<Tag>): Promise<void>;

  /**
   * Delete a tag by its ID.
   * @param {string} id - The ID of the tag to delete.
   * @returns {Promise<void>} A promise that resolves when the tag is deleted.
   */
  abstract delete(id: string): Promise<void>;

  /**
   * Check if a tag is used by any databases.
   * @param {string} id - The ID of the tag.
   * @returns {Promise<boolean>} A promise that resolves to a boolean indicating if the tag is used.
   */
  abstract isTagUsed(id: string): Promise<boolean>;
}
