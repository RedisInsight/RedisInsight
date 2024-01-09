import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import parse from 'html-react-parser'
import { monaco } from 'react-monaco-editor'

import { CodeBlock } from 'uiSrc/components'
import { rdiDryRunJobSelector } from 'uiSrc/slices/rdi/dryRun'
import { DryRunJobResultStatus } from 'uiSrc/slices/interfaces'
import { MonacoLanguage } from 'uiSrc/constants'

const DryRunJobCommands = () => {
  const { results } = useSelector(rdiDryRunJobSelector)

  const [commands, setCommands] = useState<string>('')

  useEffect(() => {
    if (results && results.commands?.status === DryRunJobResultStatus.Success) {
      try {
        monaco.editor.colorize((results.commands?.data ?? []).join('\n').trim(), MonacoLanguage.Redis, {})
          .then((data) => {
            setCommands(data)
          })
      } catch (e) {
        setCommands((results.commands?.data ?? []).join(''))
      }
    }

    if (results && results?.commands?.status === DryRunJobResultStatus.Failed) {
      setCommands(`<span class="rdi-dry-run__error">${results?.commands.error ?? ''}</span>`)
    }
  }, [results])

  return (
    <div className="rdi-dry-run__codeBlock" data-testid="commands-output">
      <CodeBlock className="rdi-dry-run__code">
        {parse(commands)}
      </CodeBlock>
    </div>
  )
}

export default DryRunJobCommands
