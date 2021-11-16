import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { formatLongName, getDbIndex, setTitle } from 'uiSrc/utils'
import { PageNames } from 'uiSrc/constants'
import { connectedInstanceSelector } from 'uiSrc/slices/instances'
import { setLastPageContext } from 'uiSrc/slices/app/context'
import { loadPluginsAction } from 'uiSrc/slices/app/plugins'
import WBViewWrapper from './components/wb-view'

const WorkbenchPage = () => {
  const { name, db } = useSelector(connectedInstanceSelector)

  const dispatch = useDispatch()
  setTitle(`${formatLongName(name, 33, 0, '...')} ${getDbIndex(db)} - Workbench`)

  useEffect(() => {
    dispatch(loadPluginsAction())
  }, [])

  useEffect(() => () => {
    dispatch(setLastPageContext(PageNames.workbench))
  })

  return (<WBViewWrapper />)
}

export default WorkbenchPage
