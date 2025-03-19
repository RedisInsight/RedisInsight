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
} from '@elastic/eui'
import { Instance } from 'uiSrc/slices/interfaces'
import { FormDialog } from 'uiSrc/components'
import { Tag } from 'uiSrc/slices/interfaces/tag'

import { updateInstanceAction } from 'uiSrc/slices/instances/instances'
import styles from './styles.module.scss'

type PartialTag = Pick<Tag, 'key' | 'value'>

type ManageTagsModalProps = {
  instance: Instance
  onClose: () => void
  onSave: (id: string, tags: PartialTag[]) => void
}

export const ManageTagsModal = ({
  instance,
  onClose,
  onSave,
}: ManageTagsModalProps) => {
  const dispatch = useDispatch()
  const [tags, setTags] = useState<PartialTag[]>(
    (instance.tags || []).map(({ key, value }) => ({ key, value })),
  )

  const isModified = useMemo(
    () =>
      tags.length !== instance.tags?.length ||
      tags.some(
        (tag, index) =>
          tag.key !== instance.tags?.[index].key ||
          tag.value !== instance.tags?.[index].value,
      ),
    [tags, instance.tags],
  )

  const handleTagChange = useCallback(
    (index: number, key: 'key' | 'value', value: string) => {
      setTags((tags) => {
        const newTags = [...tags]
        newTags[index] = { ...newTags[index], [key]: value }

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
    onSave(instance.id, tags)

    dispatch(
      updateInstanceAction({ id: instance.id, tags }, () => {
        // TODO: show success toast
      }),
    )
  }, [onSave, instance.id, tags])

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
            isDisabled={!isModified}
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
          {tags.map((tag, index) => (
            <div key={`tag-row-${index}`} className={styles.tagFormRow}>
              <div>
                <EuiFieldText
                  value={tag.key}
                  onChange={(e) =>
                    handleTagChange(index, 'key', e.target.value)
                  }
                />
                :
              </div>
              <div>
                <EuiFieldText
                  value={tag.value}
                  onChange={(e) =>
                    handleTagChange(index, 'value', e.target.value)
                  }
                />
                <EuiIcon
                  type="trash"
                  onClick={() => handleRemoveTag(index)}
                  className={styles.deleteIcon}
                />
              </div>
            </div>
          ))}
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
