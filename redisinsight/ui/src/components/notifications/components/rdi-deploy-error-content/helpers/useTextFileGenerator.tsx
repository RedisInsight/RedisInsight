import { useCallback } from 'react'

const useTextFileDownload = () => {
  const textToDownloadableFile = useCallback(
    (text: string, fileName: string = 'log.txt') => {
      const blob = new Blob([text], { type: 'text/plain' })
      const fileUrl = URL.createObjectURL(blob)

      return () => {
        const a = document.createElement('a')
        a.href = fileUrl
        a.download = fileName
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)

        // Cleanup after download to avoid memory leaks
        URL.revokeObjectURL(fileUrl)
      }
    },
    [],
  )

  return { textToDownloadableFile }
}

export default useTextFileDownload
