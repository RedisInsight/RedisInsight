import log from 'electron-log'

export const initLogging = () => {
  if (process.env.NODE_ENV !== 'production') {
    log.transports.file.getFile().clear()
  }

  log.info('App starting.....')
}

export const logStoreStatus = (text: string) => {
  log.info(text)
}
