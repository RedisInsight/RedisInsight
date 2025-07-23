import { Loader } from '@redis-ui/components'
import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  fetchRedisearchListAction,
  redisearchListSelector,
} from 'uiSrc/slices/browser/redisearch'
import { connectedInstanceSelector } from 'uiSrc/slices/instances/instances'
import {
  bufferToString,
  formatLongName,
  isRedisearchAvailable,
} from 'uiSrc/utils'
import { StyledManageIndexesListAction } from './ManageIndexesList.styles'

export const ManageIndexesList = () => {
  const { loading, data } = useSelector(redisearchListSelector)
  const { modules, host: instanceHost } = useSelector(connectedInstanceSelector)

  const dispatch = useDispatch()

  useEffect(() => {
    if (!instanceHost) {
      return
    }

    const moduleExists = isRedisearchAvailable(modules)
    if (moduleExists) {
      dispatch(fetchRedisearchListAction())
    }
  }, [instanceHost, modules])

  return (
    <StyledManageIndexesListAction data-testid="manage-indexes-list">
      {loading && <Loader data-testid="manage-indexes-list--loader" />}

      {data.map((index) => {
        const indexName = bufferToString(index)
        return (
          <div
            key={`index-${indexName}`}
            data-testid={`manage-indexes-list--item--${indexName}`}
          >
            {formatLongName(indexName)}
          </div>
        )
      })}
    </StyledManageIndexesListAction>
  )
}
