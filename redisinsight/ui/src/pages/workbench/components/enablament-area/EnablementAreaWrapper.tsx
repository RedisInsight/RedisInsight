import React, { useEffect } from 'react'
import { monaco } from 'react-monaco-editor'
import * as monacoEditor from 'monaco-editor/esm/vs/editor/editor.api'
import { useDispatch, useSelector } from 'react-redux'

import { Nullable, } from 'uiSrc/utils'
import { fetchEnablementArea, workbenchEnablementAreaSelector } from 'uiSrc/slices/workbench/wb-enablement-area'

import EnablementArea from './EnablementArea'

export interface Props {
  scriptEl: Nullable<monacoEditor.editor.IStandaloneCodeEditor>;
  setScript: (script: string) => void;
}

const EnablementAreaWrapper = React.memo(({ scriptEl, setScript }: Props) => {
  const { loading, items } = useSelector(workbenchEnablementAreaSelector)
  const dispatch = useDispatch()

  useEffect(() => {
    dispatch(fetchEnablementArea())
  }, [])

  const openScript = (script: string) => {
    setScript(script)

    setTimeout(() => {
      scriptEl?.focus()
      scriptEl?.setSelection(new monaco.Selection(0, 0, 0, 0))
    }, 0)
  }

  return (
    <EnablementArea loading={loading} openScript={openScript} items={items} />
  )
})

export default EnablementAreaWrapper
