const protocol = 'redisinsight://';
const callbackUrl = 'cloud/oauth/callback';

const openAppButton = document.querySelector('#open-app');

const openApp = () => {
  try {
    const currentUrl = new URL(window.location.href);
    const redirectUrl = protocol + callbackUrl + currentUrl.search;

    window.location.href = redirectUrl.toString();
  } catch (_e) {
    //
  }
};

// handlers
openAppButton.addEventListener('click', openApp);

openApp();
