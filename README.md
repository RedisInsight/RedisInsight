[![CircleCI](https://circleci.com/gh/RedisInsight/RedisInsight/tree/latest.svg?style=svg)](https://circleci.com/gh/RedisInsight/RedisInsight/tree/latest)

# <img src="https://redis.com/wp-content/uploads/2019/11/ico-redisinsight.svg" alt="logo" width="25"/>  RedisInsight

**Best in class Redis developer GUI to view and interact with your data!**

![RedisInsight Browser screenshot](/.github/redisinsight_browser.png)

Built with love using Electron, [Elastic UI](https://elastic.github.io/eui/#/), [Monaco Editor](https://microsoft.github.io/monaco-editor/) and NodeJS.

## Overview

RedisInsight is an intuitive and efficient GUI for Redis, allowing you to interact with your databases and manage your data—with built-in support for Redis modules.

### RedisInsight features:

* Browse, filter and visualise your key-value Redis data structures
* CRUD support for Lists, Hashes, Strings, Sets, Sorted Sets 
* CRUD support for [RedisJSON](https://oss.redis.com/redisjson/)
* Visualizations of your [RediSearch](https://oss.redis.com/redisearch/) index queries
* Intelligent Redis command auto-complete with support for [RedisJSON](https://oss.redis.com/redisjson/), [RediSearch](https://oss.redis.com/redisearch/), [RedisGraph](https://oss.redis.com/redisgraph/), [RedisTimeSeries](https://oss.redis.com/redistimeseries/), [RedisAI](https://oss.redis.com/redisai/)
* Command-line interface (CLI) that lets you run commands against your Redis server
* Ability to build your own visualization plugins
* Built-in click-through guides for Redis capabilities
* Oficially supported for Redis OSS, [Redis Cloud](https://redis.com/try-free/). Works with Microsoft Azure Cache for Redis (official support upcoming).
* Available for macOS, Windows and Linux 

Check out the [release notes](https://docs.redis.com/staging/release-ri-v2.0/ri/release-notes/). 

### Telemetry

RedisInsight collects telemetry data, that is leveraged to help improve the developer experience (DX) within the app. We value your privacy and all the data collected is anonymised. Of course, you also have the option to not enable it at all.

## Try RedisInsight

This repository includes the code for the newly released in public preview RedisInsight 2.0. Check out the [blogpost](https://redis.com/blog/introducing-redisinsight-2/) announcing it. 

The current GA version of RedisInsight is 1.11. You can run RedisInsight 2.0 along with the GA version. 

Both versions are available for download as a packaged solution for free from [here](https://docs.redis.com/latest/ri/installing/). 

## Feedback

* Request a new [feature](https://github.com/RedisInsight/RedisInsight/issues/new?assignees=&labels=&template=feature_request.md&title=%5BFeature+Request%5D%3A)
* Upvote [popular feature requests](https://github.com/RedisInsight/RedisInsight/issues?q=is%3Aopen+is%3Aissue+label%3Afeature+sort%3Areactions-%2B1-desc)
* File a [bug](https://github.com/RedisInsight/RedisInsight/issues/new?assignees=&labels=&template=bug_report.md&title=%5BBug%5D%3A)


## RedisInsight Plugins

With RedisInsight you can now also extend the core functionality by building your own data visualizations. See our wiki for more information.

## Contributing

If you would like to contribute to the code base or fix and issue, please consult the wiki.

## License 

RedisInsight is licensed under [SSPL](/LICENSE) license.

