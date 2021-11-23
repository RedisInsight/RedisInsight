# RedisInsight-plugin-sdk

High-level api for communication between RedisInsight 
plugin and RedisInsight application.

## Usage
```
npm install redisinsight-plugin-sdk
or
yarn add redisinsight-plugin-sdk
```

## Available methods

### setHeaderText(text)
Sets any custom text to the header of the command result

**Params:**

* `text` **{String}**

**Example:**

```js
import { setHeaderText } from 'redisinsight-plugin-sdk';

setHeaderText('Matched: 10')
```

### executeRedisCommand(command, callback)
**Note: Future updates**

Executes Read-only Redis Command

**Params:**

* `command` **{String}** - command to execute
* `callback` **{Function}** - callback which will be executed after receiving the response of the command
  <br>
  **Params:**
    * `data` **{Object}** - ```{ status, response }```


**Example:**

```js
import { executeRedisCommand } from 'redisinsight-plugin-sdk';

executeRedisCommand('CLIENT LIST', ({ status, response }) => {})
```
