import { useState, useCallback, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { tagsSelector, setSelectedTags } from 'uiSrc/slices/instances/tags'

export const useFilterTags = () => {
  const dispatch = useDispatch()
  const { data: tagsData, selectedTags } = useSelector(tagsSelector)
  const [isPopoverOpen, setIsPopoverOpen] = useState(false)
  const [tagSearch, setTagSearch] = useState('')

  const onPopoverToggle = () => {
    setIsPopoverOpen(!isPopoverOpen)
  }

  const onTagChange = useCallback(
    (tag: string, checked: boolean) => {
      dispatch(
        setSelectedTags(
          selectedTags.includes(tag)
            ? selectedTags.filter((t) => t !== tag)
            : [...selectedTags, tag],
        ),
      )
    },
    [dispatch, selectedTags],
  )

  const onKeyChange = useCallback(
    (key: string, checked: boolean) => {
      const tagsWithKey = tagsData
        .filter((tag) => tag.key === key)
        .map((tag) => `${tag.key}:${tag.value}`)
      const allSelected = tagsWithKey.every((tag) => selectedTags.includes(tag))
      dispatch(
        setSelectedTags(
          allSelected
            ? selectedTags.filter((tag) => !tagsWithKey.includes(tag))
            : [
                ...selectedTags,
                ...tagsWithKey.filter((tag) => !selectedTags.includes(tag)),
              ],
        ),
      )
    },
    [dispatch, tagsData, selectedTags],
  )

  const filteredTags = useMemo(
    () =>
      tagsData.filter((tag) => `${tag.key}:${tag.value}`.includes(tagSearch)),
    [tagSearch, tagsData],
  )

  const groupedTags = useMemo(
    () =>
      filteredTags.reduce(
        (acc, tag) => {
          if (!acc[tag.key]) {
            acc[tag.key] = []
          }
          acc[tag.key].push(tag.value)
          return acc
        },
        {} as Record<string, string[]>,
      ),
    [filteredTags],
  )

  return {
    isPopoverOpen,
    tagSearch,
    selectedTags,
    setTagSearch,
    onPopoverToggle,
    onTagChange,
    onKeyChange,
    groupedTags,
  }
}
