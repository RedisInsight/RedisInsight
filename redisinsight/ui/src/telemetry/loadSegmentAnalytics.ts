/**
 * Putting this function is a JS file to avoid Typescript errors.
 * Copied the following code from snippet from official Segment docs:
 * https://segment.com/docs/connections/sources/catalog/libraries/website/javascript/quickstart/#quickstart-analytics-js
 */

/* eslint-disable */
const loadSegmentAnalytics = (writeKey: string) => {
  // Create a queue, but don't obliterate an existing one!
  window.analytics = window.analytics || []
  const { analytics } = window

  // If the real analytics.js is already on the page return.
  if (analytics.initialize) return

  // If the snippet was invoked already show an error.
  if (analytics.invoked) {
    console.error('Segment snippet included twice.')
    return
  }

  // Invoked flag, to make sure the snippet
  // is never invoked twice.
  analytics.invoked = true

  // A list of the methods in Analytics.js to stub.
  analytics.methods = [
    'trackSubmit',
    'trackClick',
    'trackLink',
    'trackForm',
    'pageview',
    'identify',
    'reset',
    'group',
    'track',
    'ready',
    'alias',
    'debug',
    'page',
    'once',
    'off',
    'on',
  ]

  // Define a factory to create stubs. These are placeholders
  // for methods in Analytics.js so that you never have to wait
  // for it to load to actually record data. The `method` is
  // stored as the first argument, so we can replay the data.
  analytics.factory = function (method) {
    return function () {
      const args = Array.prototype.slice.call(arguments)
      args.unshift(method)
      analytics.push(args)
      return analytics
    }
  }

  // For each of our methods, generate a queueing stub.
  for (let i = 0; i < analytics.methods.length; i++) {
    const key = analytics.methods[i]
    analytics[key] = analytics.factory(key)
  }

  // Define a method to load Analytics.js from our CDN,
  // and that will be sure to only ever load it once.
  analytics.load = function (key, options) {
    // Create an async script element based on your key.
    const script = document.createElement('script')
    script.type = 'text/javascript'
    script.async = true
    script.src = `https://cdn.segment.com/analytics.js/v1/${key}/analytics.min.js`

    // Insert our script last to <head>
    const head = document.getElementsByTagName('head')[0]
    head?.appendChild(script)
    analytics._loadOptions = options
  }

  // Add a version to keep track of what's in the wild.
  analytics.SNIPPET_VERSION = '4.1.0'

  // Load Analytics.js with your key, which will automatically
  // load the tools you've enabled for your account. Boosh!
  analytics.load(writeKey)

  // Make the first page call to load the integrations. If
  // you'd like to manually name or tag the page, edit or
  // move this call however you'd like.
  // analytics.page();
}

export default loadSegmentAnalytics
