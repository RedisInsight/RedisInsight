const whitelist = {
  'linux': {
    'appimage': 1,
    'appimage:x64': 1,
    'deb': 1,
    'deb:x64': 1,
    'rpm': 1,
    'rpm:x64': 1,
    'snap': 1,
    'snap:x64': 1,
  },
  'mac': {
    'dmg': 1,
    'dmg:x64': 1,
    'dmg:arm64': 1,
  },
  'windows': {
    'nsis': 1,
    'nsis:x64': 1,
  },
  'docker': {
    'all': 1,
  }
};

(() => {
  const os = process.argv[2];
  const targets = process.argv[3]?.split(" ") || [];

  if (targets.length) {
    targets.forEach((target) => {
      if (!whitelist[os]?.[target]) {
        throw new Error(`Target ${target} for ${os} is not allowed. \nAllowed targets: ${Object.keys(whitelist[os] || {}).join(',')}`);
      }
    })
  }
})()
