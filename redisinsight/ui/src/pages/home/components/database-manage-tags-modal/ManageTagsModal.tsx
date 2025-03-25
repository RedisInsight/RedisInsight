/* eslint-disable react/no-array-index-key */
import React, { useState, useMemo, useCallback } from 'react'
import { useDispatch } from 'react-redux'
import {
  EuiButton,
  EuiFieldText,
  EuiIcon,
  EuiSpacer,
  EuiTitle,
  EuiText,
  EuiButtonEmpty,
  EuiToolTip,
} from '@elastic/eui'
import { Instance } from 'uiSrc/slices/interfaces'
import { FormDialog } from 'uiSrc/components'

import { updateInstanceAction } from 'uiSrc/slices/instances/instances'
import { addMessageNotification } from 'uiSrc/slices/app/notifications'
import successMessages from 'uiSrc/components/notifications/success-messages'
import {
  INVALID_FIELD_MESSAGE,
  VALID_TAG_REGEX,
} from './constants'
import { TagSuggestions } from './TagSuggestions'
import styles from './styles.module.scss'

type ManageTagsModalProps = {
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
  const [focusedTagKeyIndex, setFocusedTagKeyIndex] = useState<number | null>(
    null,
  )
  const [focusedTagValueIndex, setFocusedTagValueIndex] = useState<
    number | null
  >(null)

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
          !VALID_TAG_REGEX.test(tag.key) || !VALID_TAG_REGEX.test(tag.value),
      ),
    [tags],
  )

  const isSaveButtonDisabled = !isModified || hasErrors

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
        <div className={styles.footer}>
          <EuiButton onClick={onClose} size="s">
            Close
          </EuiButton>
          <EuiButton
            onClick={handleSave}
            fill
            size="s"
            color="secondary"
            isDisabled={isSaveButtonDisabled}
          >
            Save tags
          </EuiButton>
        </div>
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
              (!VALID_TAG_REGEX.test(tag.key) ||
                tags.some((t, i) => i !== index && t.key === tag.key))
            const isValueInvalid =
              Boolean(tag.value) && !VALID_TAG_REGEX.test(tag.value)

            return (
              <div key={`tag-row-${index}`} className={styles.tagFormRow}>
                <div>
                  <EuiToolTip
                    content={isKeyInvalid && INVALID_FIELD_MESSAGE}
                    position="top"
                  >
                    <div>
                      <EuiFieldText
                        value={tag.key}
                        isInvalid={isKeyInvalid}
                        onChange={(e) =>
                          handleTagChange(index, 'key', e.target.value)
                        }
                        onFocusCapture={() => {
                          setFocusedTagKeyIndex(index)
                          setFocusedTagValueIndex(null)
                        }}
                        // onBlur={() => setFocusedTagKeyIndex(null)}
                      />
                      {focusedTagKeyIndex === index && (
                        <TagSuggestions
                          targetKey={undefined}
                          searchTerm={tag.key}
                          currentTagKeys={currentTagKeys}
                          onChange={(value) => {
                            handleTagChange(index, 'key', value)
                            setFocusedTagKeyIndex(null)
                          }}
                        />
                      )}
                    </div>
                  </EuiToolTip>
                  :
                </div>
                <div>
                  <EuiToolTip
                    content={tag.key && isValueInvalid && INVALID_FIELD_MESSAGE}
                    position="top"
                  >
                    <div>
                      <EuiFieldText
                        value={tag.value}
                        isInvalid={isValueInvalid}
                        disabled={!tag.key || isKeyInvalid}
                        onChange={(e) =>
                          handleTagChange(index, 'value', e.target.value)
                        }
                        onFocusCapture={() => {
                          setFocusedTagValueIndex(index)
                          setFocusedTagKeyIndex(null)
                        }}
                      />
                      {focusedTagValueIndex === index && (
                        <TagSuggestions
                          targetKey={tag.key}
                          searchTerm={tag.value}
                          currentTagKeys={currentTagKeys}
                          onChange={(value) => {
                            handleTagChange(index, 'value', value)
                            setFocusedTagValueIndex(null)
                          }}
                        />
                      )}
                    </div>
                  </EuiToolTip>
                  <EuiIcon
                    type="trash"
                    onClick={() => handleRemoveTag(index)}
                    className={styles.deleteIcon}
                  />
                </div>
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
      >
        Add additional tag
      </EuiButtonEmpty>
    </FormDialog>
  )
}
