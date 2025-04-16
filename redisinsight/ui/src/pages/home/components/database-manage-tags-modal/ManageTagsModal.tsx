/* eslint-disable react/no-array-index-key */
import React, { useState, useMemo, useCallback } from 'react'
import { useDispatch } from 'react-redux'
import {
  EuiButton,
  EuiIcon,
  EuiSpacer,
  EuiTitle,
  EuiText,
  EuiButtonEmpty,
} from '@elastic/eui'
import { ConnectionProvider, Instance } from 'uiSrc/slices/interfaces'
import { FormDialog } from 'uiSrc/components'
import WarningIcon from 'uiSrc/assets/img/warning.svg?react'

import { updateInstanceAction } from 'uiSrc/slices/instances/instances'
import { addMessageNotification } from 'uiSrc/slices/app/notifications'
import successMessages from 'uiSrc/components/notifications/success-messages'
import { VALID_TAG_KEY_REGEX, VALID_TAG_VALUE_REGEX } from './constants'
import { TagInputField } from './TagInputField'
import styles from './styles.module.scss'

export type ManageTagsModalProps = {
  instance: Instance
  onClose: () => void
}

export const ManageTagsModal = ({
  instance,
  onClose,
}: ManageTagsModalProps) => {
  const dispatch = useDispatch()
  const editedInstanceTags = useMemo(
    () => (instance?.tags || []).map(({ key, value }) => ({ key, value })),
    [instance?.tags],
  )
  const [tags, setTags] = useState(editedInstanceTags)
  const currentTagKeys = useMemo(
    () => new Set(tags.map((tag) => tag.key)),
    [tags],
  )

  const isModified = useMemo(
    () =>
      tags.length !== editedInstanceTags.length ||
      tags.some(
        (tag, index) =>
          tag.key !== editedInstanceTags[index].key ||
          tag.value !== editedInstanceTags[index].value,
      ),
    [tags, editedInstanceTags],
  )

  const hasErrors = useMemo(
    () =>
      tags.some(
        (tag) =>
          !VALID_TAG_KEY_REGEX.test(tag.key) || !VALID_TAG_VALUE_REGEX.test(tag.value),
      ),
    [tags],
  )

  const isSaveButtonDisabled = !isModified || hasErrors
  const isCloudDb = instance.provider === ConnectionProvider.RE_CLOUD

  const handleTagChange = useCallback(
    (index: number, key: 'key' | 'value', value: string) => {
      if (value[0] === ' ') {
        return
      }

      setTags((tags) => {
        const newTags = [...tags]
        newTags[index] = { ...newTags[index], [key]: value.toLowerCase() }

        return newTags
      })
    },
    [],
  )

  const handleAddTag = useCallback(() => {
    setTags((tags) => [...tags, { key: '', value: '' }])
  }, [])

  const handleRemoveTag = useCallback((index: number) => {
    setTags((tags) => tags.filter((_, i) => i !== index))
  }, [])

  const handleSave = useCallback(() => {
    const tagsToSave = tags.filter((tag) => tag.key && tag.value)
    dispatch(
      updateInstanceAction({ id: instance.id, tags: tagsToSave }, () => {
        dispatch(addMessageNotification(successMessages.SUCCESS_TAGS_UPDATED()))
      }),
    )
  }, [instance.id, tags])

  return (
    <FormDialog
      isOpen
      onClose={onClose}
      header={
        <div className={styles.header}>
          <EuiTitle size="s">
            <h4>Manage tags for {instance.name}</h4>
          </EuiTitle>
          <EuiSpacer size="s" />
          <EuiText size="s" color="subdued">
            <p>
              Tags are key-value pairs that let you categorize your databases.
            </p>
          </EuiText>
        </div>
      }
      footer={
        <>
          {isCloudDb && (
            <div className={styles.warning}>
              <EuiIcon type={WarningIcon} color="warning" size="m" />
              <EuiText size="m">
                Tag changes in Redis Insight apply locally and are not synced
                with Redis Cloud.
              </EuiText>
            </div>
          )}
          <div className={styles.footer}>
            <EuiButton onClick={onClose} size="s" data-testid="close-button">
              Close
            </EuiButton>
            <EuiButton
              onClick={handleSave}
              fill
              size="s"
              color="secondary"
              isDisabled={isSaveButtonDisabled}
              data-testid="save-tags-button"
            >
              Save tags
            </EuiButton>
          </div>
        </>
      }
      className={styles.manageTagsModal}
    >
      <div className={styles.tagForm}>
        <div className={styles.tagFormHeader}>
          <div>Key</div>
          <div>Value</div>
        </div>
        <div className={styles.tagFormBody}>
          {tags.map((tag, index) => {
            const isKeyInvalid =
              Boolean(tag.key) &&
              (!VALID_TAG_KEY_REGEX.test(tag.key) ||
                tags.some((t, i) => i !== index && t.key === tag.key))
            const isValueInvalid =
              Boolean(tag.value) && !VALID_TAG_VALUE_REGEX.test(tag.value)

            return (
              <div key={`tag-row-${index}`} className={styles.tagFormRow}>
                <TagInputField
                  isInvalid={isKeyInvalid}
                  value={tag.key}
                  currentTagKeys={currentTagKeys}
                  onChange={(value) => {
                    handleTagChange(index, 'key', value)
                  }}
                  rightContent={<>:</>}
                />
                <TagInputField
                  isInvalid={isValueInvalid}
                  disabled={!tag.key || isKeyInvalid}
                  value={tag.value}
                  currentTagKeys={currentTagKeys}
                  suggestedTagKey={tag.key}
                  onChange={(value) => {
                    handleTagChange(index, 'value', value)
                  }}
                  rightContent={
                    <EuiIcon
                      type="trash"
                      onClick={() => handleRemoveTag(index)}
                      className={styles.deleteIcon}
                      data-testid="remove-tag-button"
                    />
                  }
                />
              </div>
            )
          })}
        </div>
      </div>
      <EuiSpacer size="s" />
      <EuiButtonEmpty
        iconType="plus"
        onClick={handleAddTag}
        size="s"
        color="text"
        className={styles.addTagButton}
        data-testid="add-tag-button"
      >
        Add additional tag
      </EuiButtonEmpty>
    </FormDialog>
  )
}
