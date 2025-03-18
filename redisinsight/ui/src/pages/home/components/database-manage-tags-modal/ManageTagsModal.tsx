import React, { useState } from 'react'
import {
  EuiButton,
  EuiFieldText,
  EuiIcon,
  EuiSpacer,
  EuiTitle,
  EuiText,
} from '@elastic/eui'
import { Instance } from 'uiSrc/slices/interfaces'
import { FormDialog } from 'uiSrc/components'
import { Tag } from 'uiSrc/slices/interfaces/tag'

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
  const [tags, setTags] = useState<PartialTag[]>(instance.tags || [])

  const handleTagChange = (index: number, key: string, value: string) => {
    setTags((tags) => {
      const newTags = [...tags]
      newTags[index] = { ...newTags[index], [key]: value }

      return newTags
    })
  }

  const handleAddTag = () => {
    setTags((tags) => [...tags, { key: '', value: '' }])
  }

  const handleRemoveTag = (index: number) => {
    setTags((tags) => tags.filter((_, i) => i !== index))
  }

  const handleSave = () => {
    onSave(instance.id, tags)
  }

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
          <EuiButton onClick={handleSave} fill size="s">
            Save tags
          </EuiButton>
        </div>
      }
      className={styles.manageTagsModal}
    >
      <table className={styles.tagForm}>
        <thead className={styles.tagFormHeader}>
          <tr>
            <th>Key</th>
            <th>Value</th>
          </tr>
        </thead>
        <tbody>
          {tags.map((tag, index) => (
            <tr key={`${tag.key}:${tag.value}`} className={styles.tagFormRow}>
              <td>
                <EuiFieldText
                  value={tag.key}
                  onChange={(e) =>
                    handleTagChange(index, 'key', e.target.value)
                  }
                />
              </td>
              <td>
                <div className={styles.tagValue}>
                  :
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
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <EuiSpacer />
      <EuiButton
        iconType="plus"
        onClick={handleAddTag}
        size="s"
        color="primary"
      >
        Add additional tag
      </EuiButton>
    </FormDialog>
  )
}
