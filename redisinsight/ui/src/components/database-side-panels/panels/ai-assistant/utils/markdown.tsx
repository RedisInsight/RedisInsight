import React from 'react'
import { getDefaultEuiMarkdownProcessingPlugins } from '@elastic/eui'
import { ExternalLink } from 'uiSrc/components'

const remarkLink = (data: any) => {
  if (!data) return null

  return (
    <ExternalLink
      iconSize="s"
      href={data.href}
    >
      {data.href}
    </ExternalLink>
  )
}

const defaultPlugins = getDefaultEuiMarkdownProcessingPlugins()
defaultPlugins[1][1].components.a = remarkLink
const processingMarkdownPlugins = [...defaultPlugins, remarkLink] as any

export {
  remarkLink,
  processingMarkdownPlugins
}
