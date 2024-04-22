import favicon from 'uiSrc/assets/favicon.svg'

const setFavicon = (icon: string = favicon) => {
  const link: HTMLLinkElement = document.querySelector("link[rel*='icon']")
    || document.createElement('link')
  link.type = 'image/x-icon'
  link.rel = 'shortcut icon'
  link.href = icon
  document.getElementsByTagName('head')[0].appendChild(link)
}

export default setFavicon
