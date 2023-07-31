const protocol = 'redisinsight://'
const callbackUrl = 'cloud/oauth/callback'

const openAppButton = document.querySelector('#open-app')

const openApp = (forceOpen) => {
  try {
    const currentUrl = new URL(window.location.href)
    const redirectUrl = protocol + callbackUrl + currentUrl.search
    const isOpened = window.location.hash === '#success'

    if (forceOpen || !isOpened) {
      window.location.href = redirectUrl.toString()
    }

    window.location.hash = '#success'
  } catch (_e) {
    //
  }
}

// handlers
openAppButton.addEventListener('click', () => openApp(true))

openApp()
