import { v4 as uuidv4 } from 'uuid';
import { randomBytes } from 'crypto';
import { getASCIISafeStringFromBuffer, getBufferFromSafeASCIIString } from "src/utils/cli-helper";

const API = {
  DATABASES: 'databases',
};

const TEST_RUN_ID = `=${uuidv4()}`;
const KEY_TTL = 100;
const CLUSTER_HASH_SLOT = '{slot1}';
const APP_DEFAULT_SETTINGS = {
  scanThreshold: 10000,
  batchSize: 5,
  theme: null,
  agreements: null,
};

const unprintableBuf = Buffer.concat([
  Buffer.from('acedae', 'hex'),
  Buffer.from(CLUSTER_HASH_SLOT),
]);

export const constants = {
  // api
  API,
  // common
  TEST_RUN_ID,
  TEST_RUN_NAME: process.env.TEST_RUN_NAME || '',
  KEY_TTL,
  CLUSTER_HASH_SLOT,
  getRandomString: () => `${TEST_RUN_ID}_${uuidv4()}_${CLUSTER_HASH_SLOT}`,
  generateRandomKey: () => `${TEST_RUN_ID}_${uuidv4()}_${CLUSTER_HASH_SLOT}`,
  APP_DEFAULT_SETTINGS,
  TEST_KEYTAR_PASSWORD: process.env.SECRET_STORAGE_PASSWORD || 'somepassword',
  TEST_ENCRYPTION_STRATEGY: 'KEYTAR',
  TEST_AGREEMENTS_VERSION: '1.0.3',

  // local database
  TEST_LOCAL_DB_FILE_PATH: process.env.TEST_LOCAL_DB_FILE_PATH || './redisinsight.db',
  TEST_NOT_EXISTED_INSTANCE_ID: uuidv4(),
  TEST_INSTANCE_ID: uuidv4(),
  TEST_INSTANCE_NAME: uuidv4(),
  TEST_INSTANCE_ACL_ID: uuidv4(),
  TEST_INSTANCE_ACL_NAME: uuidv4(),
  TEST_INSTANCE_ACL_USER: uuidv4(),
  TEST_INSTANCE_ACL_PASS: uuidv4(),
  TEST_NEW_INSTANCE_NAME: uuidv4(),
  TEST_CLI_UUID_1: uuidv4(),
  TEST_INSTANCE_ID_2: uuidv4(),
  TEST_INSTANCE_NAME_2: uuidv4(),
  TEST_INSTANCE_HOST_2: uuidv4(),
  TEST_INSTANCE_ID_3: uuidv4(),
  TEST_INSTANCE_NAME_3: uuidv4(),
  TEST_INSTANCE_HOST_3: uuidv4(),

  TEST_RTE_ON_PREMISE: process.env.TEST_RTE_ON_PREMISE ? process.env.TEST_RTE_ON_PREMISE === 'true' : true,
  TEST_RTE_SHARED_DATA: process.env.TEST_RTE_SHARED_DATA ? process.env.TEST_RTE_SHARED_DATA === 'true' : false,
  TEST_RTE_BIG_DATA: process.env.TEST_RTE_BIG_DATA ? process.env.TEST_RTE_BIG_DATA === 'true' : false,
  TEST_RTE_CRDT: process.env.TEST_RTE_CRDT ? process.env.TEST_RTE_CRDT === 'true' : false,
  TEST_RTE_TYPE: process.env.TEST_RTE_DISCOVERY_TYPE || 'STANDALONE',
  TEST_RTE_HOST: process.env.TEST_RTE_DISCOVERY_HOST,
  TEST_RTE_PORT: process.env.TEST_RTE_DISCOVERY_PORT,
  TEST_RTE_USER: process.env.TEST_RTE_DISCOVERY_USER,
  TEST_RTE_PASSWORD: process.env.TEST_RTE_DISCOVERY_PASSWORD,

  // sentinel
  TEST_SENTINEL_MASTER_GROUP: process.env.TEST_SENTINEL_MASTER_GROUP || 'primary1',
  TEST_SENTINEL_MASTER_USER: process.env.TEST_SENTINEL_MASTER_USER,
  TEST_SENTINEL_MASTER_PASS: process.env.TEST_SENTINEL_MASTER_PASS,

  // re
  TEST_RE_HOST: process.env.TEST_RE_HOST || 'localhost',
  TEST_RE_PORT: parseInt(process.env.TEST_RE_PORT) || 9443,
  TEST_RE_USER: process.env.TEST_RE_USER,
  TEST_RE_PASS: process.env.TEST_RE_PASS,

  // cloud
  TEST_CLOUD_RTE: process.env.TEST_CLOUD_RTE,
  TEST_CLOUD_API: process.env.REDIS_CLOUD_URL || process.env.TEST_CLOUD_API || 'https://api.qa.redislabs.com/v1',
  TEST_CLOUD_API_KEY: process.env.TEST_CLOUD_API_KEY,
  TEST_CLOUD_API_SECRET_KEY: process.env.TEST_CLOUD_API_SECRET_KEY,
  TEST_CLOUD_SUBSCRIPTION_NAME: process.env.TEST_CLOUD_SUBSCRIPTION_NAME || 'ITests',
  TEST_CLOUD_SUBSCRIPTION_ID: process.env.TEST_CLOUD_SUBSCRIPTION_ID,
  TEST_CLOUD_DATABASE_NAME: process.env.TEST_CLOUD_DATABASE_NAME || 'ITests-db',

  STANDALONE: 'STANDALONE',
  CLUSTER: 'CLUSTER',
  SENTINEL: 'SENTINEL',


  // // STANDALONE TLS PASS AUTH
  // ...{
  //   TEST_REDIS_HOST: '172.30.100.103',
  //   TEST_REDIS_PORT: parseInt(process.env.TEST_REDIS_PORT) || 6379,
  //   TEST_REDIS_DB_INDEX: 0,
  //   TEST_REDIS_USER: process.env.TEST_REDIS_USER,
  //   TEST_REDIS_PASSWORD: 'defaultpass',
  //   TEST_REDIS_TLS_CA: '-----BEGIN CERTIFICATE-----\n' +
  //     'MIIFHzCCAwegAwIBAgIUKeAfHPO6uJBW+s8fY2cWKOc+DfgwDQYJKoZIhvcNAQEL\n' +
  //     'BQAwHzELMAkGA1UEBhMCQVUxEDAOBgNVBAMMB2V4YW1wbGUwHhcNMjExMDI4MTMy\n' +
  //     'NzI2WhcNMzExMDI2MTMyNzI2WjAfMQswCQYDVQQGEwJBVTEQMA4GA1UEAwwHZXhh\n' +
  //     'bXBsZTCCAiIwDQYJKoZIhvcNAQEBBQADggIPADCCAgoCggIBANF9A4aeHru2fX1j\n' +
  //     'U+Bz9D2supYsMG64f+wXNrFPTMxPS/rdjNcqAWeVCknY7d8EO0uBf64Gm4ufQAPV\n' +
  //     'boINIdgoso9tGfl5LMaaiYq0aD5CK0wmU38pPbKA2Vr9bkrNIYLUFU6oPI7RJ5fL\n' +
  //     'Pl/vbvHyaXQKcDd5xxusAu3Ytrylq3WaLNWwhT//WRor4SU2qt9s06PiOgCABY+D\n' +
  //     'olMXI72gDaehRhnbOVXc6GadlHCsE5GHYJ3WcLLY0rGEdlwphcEG5TRVHGBiHOg/\n' +
  //     'J0vsiuhwTLyRqQq5L6eFm33d4aRI9JLY8LlU5ywGiVoNl+fFdQr3ovWw7eObQSbg\n' +
  //     'BuOJhQBTpEmiPgiOC3kAUUrgT/uGS1x9RX+Wj0sY6zs+qOkfhFAcScXQBeZSLNT9\n' +
  //     'RYAjZQOTtTQYVwH8NcF2MlwI3tb3qk2+2Xby4YfTHxp42B8IHkedwfFzrwfUDnNM\n' +
  //     'Cm3GSVtDGv/j4/7fp0oZZROpd5+h1wRhR/HO08rkpwuobo6xGRrrxqbdlsid3OB4\n' +
  //     'Kk92Wl8reccxyr2a/7OlrWk284xpQI/nlU6a8bByJp2eTPYuNJFfJkrqua94YOJy\n' +
  //     'K4d4tLNbQ4X/5g12unGEHg8/HVNHJjCKiU2Gwxhxm50EqmgdgaboDmf+GuVF0tL1\n' +
  //     'kGPbbjSrlt2pS+Tdza9EJfmAzVppAgMBAAGjUzBRMB0GA1UdDgQWBBQWqqhnKa+s\n' +
  //     '5ToC0TYKlIdfytda/jAfBgNVHSMEGDAWgBQWqqhnKa+s5ToC0TYKlIdfytda/jAP\n' +
  //     'BgNVHRMBAf8EBTADAQH/MA0GCSqGSIb3DQEBCwUAA4ICAQATnfNftaIalbJmNHrq\n' +
  //     '7KIxyAAEimiIvci5i1f2X8ZB4XY1TWcf0eQ/+oJW9E2Kj83yGaAqKg1FFP8ugquG\n' +
  //     'pxzMyljTlQi3cWp58ByaYg2XMEyRY5FtbcdbHHJgdM2PSHsegWN/vfJw3H3J2673\n' +
  //     'J6Kc/69IwJcE+aYDbLa/cnnRBn9AKHdtNoRmPH+s162oo8I86LQuG942Hx2CHCjt\n' +
  //     'ttkLwVBtsBKc5hRaPR+Psx68jS41iHJGHUwHNcPl7llBAQe8kKNg4GHJWT5vh7rd\n' +
  //     'rw4jAGCsoaE5Ol1HyRDprpdcC4o+eQbhMrjMcFzYduuCx1F96BlSXA2mQe+9lD08\n' +
  //     'LzdS35ILmSqCTbtOcdHCmnjWp9fhl5mIrJ+I3G33QPHaHJXBfWGNidxjkibwdVxK\n' +
  //     'eNAOv4lEMCoVQ0occzNyUluJQUFJyvXtXWFSErRH6b78Gsc/AvPijPbSNuT8hRK9\n' +
  //     'GC3yRYltDFXcr4+2lxJyoQoR6Y8399oaJm4U17fOIwlM+iI8dT8x+qsT8brw+5kk\n' +
  //     'oKu4jz8jfkZrUF8V8hIfAUc08IvMAmDwvIMeAjXFmDBEECxXBGRw2hTcY/53Nfdt\n' +
  //     'PRWzaL/YtKOy/9UfJQKs3Ihqte59/v3EJO9x9vTLmcpoCgh9piNVgD6OS38cOiEa\n' +
  //     'snS90+qMig9Gx3aJ+UvktWcp3Q==\n' +
  //     '-----END CERTIFICATE-----\n',
  //   TEST_USER_TLS_CERT: '-----BEGIN CERTIFICATE-----\n' +
  //     'MIIEzTCCArWgAwIBAgIUALiX/81ndGTG8UCPzu8r4Ev2IhEwDQYJKoZIhvcNAQEL\n' +
  //     'BQAwHzELMAkGA1UEBhMCQVUxEDAOBgNVBAMMB2V4YW1wbGUwHhcNMjExMDI4MTMy\n' +
  //     'NzI3WhcNMzExMDI2MTMyNzI3WjANMQswCQYDVQQGEwJBVTCCAiIwDQYJKoZIhvcN\n' +
  //     'AQEBBQADggIPADCCAgoCggIBAM4osMW/hBlde+/E20wP9X+zJ0AMD6OtfhqQ5brC\n' +
  //     'gbVs9mPccZ/8R0fj83YtZfnoEodMZ/7yUTeCCPMdprAezMU1KBf9EpZmTdWhpO3e\n' +
  //     'kESHcQdsKkqGtyjYF7dDahTmKt4a4aHlPH0DJLltB5HlbVabkzlo+3S8QaNwH5lY\n' +
  //     'yJTQIqiqVzs9oRLT76nZuJjsym0dNXE42rO3KCniI6kvJDmUzBD8Wc94iDExfy7q\n' +
  //     'qHyV7b2DCp1w7XP4yrQAFQ6kiVqNcfTTAO4MHNP54V2nZLPdOsUD5BsYY8hu0HDc\n' +
  //     '/PisZ9ZMcw7LMfpUd3dfA9zefQXPQsWJK20ZCNmdIFtwvIFUpYu/FEF3FWO83zeI\n' +
  //     'XkVZiuCOnoFvp8JIDvXgzXUBWzvYmxLqVSZAuabqU5pKRswDPLGlZTkHbuP2DiXD\n' +
  //     'LD5AsTnICpzYkUeERSZKf2qc/nTUk04W/7FUT/75ItVzZvu90mPJlmArB0j4zdAG\n' +
  //     'KwKo8v/cF1hA1YznhibxcUAA/Q/O3Y6CPQ7C3NeaGKcycgUxWoEY3Leno40ukijd\n' +
  //     'R0MvsaY7V0/up37fkPtH9rcCkZOGVT5Q4Ww9gVO3yseXVkxbJyzHV1tuwg6yY9wO\n' +
  //     'LOU2Bbmazkjlkb8a5OyQol2zZNJ0L3lvRWTildtGUTsBkeqI6HAedTTHJkhjHh/P\n' +
  //     'P0+TAgMBAAGjEzARMA8GA1UdEQQIMAaHBH8AAAEwDQYJKoZIhvcNAQELBQADggIB\n' +
  //     'AKn+aH60zdd4ItMOhgd4BIok/u6S4NF0oe4kDwC/EU5C0hbuT6gLAn7ArHMeadue\n' +
  //     'OuSnhqIPfxNR9WCes9OU1O00WeCuWCE4XfNMMFN5iDFfLxO4Oy5Adt0T74hWbcy6\n' +
  //     'h28TdcjrkJEr7HR59G5tQ8TW5gVB4a0WXDw0ob9DSxbFKZU1uZm9L/+MgB/SNCHL\n' +
  //     'GZSKt75Z/M10b9BTC3OG9swsoWvXEjR2ICiwzk+LxVf5K38faDyBrNJVglrpEUZz\n' +
  //     'gP60kL73qK0y1/i35UuP0yIJIy48XnDsSByN7eBVsNTGMW3CFLKWA4RVfnEHNUff\n' +
  //     'vsLHXZFYsUIPnPc5jksFwb/wKAe9JbCrgQPhBYaIYkRGiYt64C48r3boIIVoz9+1\n' +
  //     '9Nq0Ik06fCzlI9APq2nzEiVeB7mDyZ692neu32QM6zRkYor+W8uI21YnRJWlOx7+\n' +
  //     'x2GIh2EZnEYNvbpbvk/fV5AqkYOu9auRAkcKfME7dJ3Gwndl0YBOjE2DMTv6vIjS\n' +
  //     'dVuGXQCvlzkRAnPMh5MR5/bSUKVvBryXs9ecAMgoVXBVB+4tGWct5ziL+8qyNtgA\n' +
  //     'WJ2EWj3xtLlMwwQmLjRsCrZjL4liLJG8Yn8Ehfq1rRJREH2O8uYKCO1fdhuI0Y5S\n' +
  //     'iBPfqJi6QBHj7i01K9OpNUB7l+xAFLA3cBsegcm2GPoL\n' +
  //     '-----END CERTIFICATE-----\n',
  //   TEST_USER_TLS_KEY: '-----BEGIN PRIVATE KEY-----\n' +
  //     'MIIJQQIBADANBgkqhkiG9w0BAQEFAASCCSswggknAgEAAoICAQDOKLDFv4QZXXvv\n' +
  //     'xNtMD/V/sydADA+jrX4akOW6woG1bPZj3HGf/EdH4/N2LWX56BKHTGf+8lE3ggjz\n' +
  //     'HaawHszFNSgX/RKWZk3VoaTt3pBEh3EHbCpKhrco2Be3Q2oU5ireGuGh5Tx9AyS5\n' +
  //     'bQeR5W1Wm5M5aPt0vEGjcB+ZWMiU0CKoqlc7PaES0++p2biY7MptHTVxONqztygp\n' +
  //     '4iOpLyQ5lMwQ/FnPeIgxMX8u6qh8le29gwqdcO1z+Mq0ABUOpIlajXH00wDuDBzT\n' +
  //     '+eFdp2Sz3TrFA+QbGGPIbtBw3Pz4rGfWTHMOyzH6VHd3XwPc3n0Fz0LFiSttGQjZ\n' +
  //     'nSBbcLyBVKWLvxRBdxVjvN83iF5FWYrgjp6Bb6fCSA714M11AVs72JsS6lUmQLmm\n' +
  //     '6lOaSkbMAzyxpWU5B27j9g4lwyw+QLE5yAqc2JFHhEUmSn9qnP501JNOFv+xVE/+\n' +
  //     '+SLVc2b7vdJjyZZgKwdI+M3QBisCqPL/3BdYQNWM54Ym8XFAAP0Pzt2Ogj0OwtzX\n' +
  //     'mhinMnIFMVqBGNy3p6ONLpIo3UdDL7GmO1dP7qd+35D7R/a3ApGThlU+UOFsPYFT\n' +
  //     't8rHl1ZMWycsx1dbbsIOsmPcDizlNgW5ms5I5ZG/GuTskKJds2TSdC95b0Vk4pXb\n' +
  //     'RlE7AZHqiOhwHnU0xyZIYx4fzz9PkwIDAQABAoICAHyc/+0oDHNAnK+bsGrTorNj\n' +
  //     '2S/Pmox3TChGuXYgKEM/79cA4vWvim6cDQe7/U4Hx1tdBeeHFSyWP06k96Kxm1kA\n' +
  //     '/pExedDLWfTt1kGqLE4gCGRSL2YI9CGOLRerei3TysmiOgygAeYWxlYG33KC2Ypm\n' +
  //     'U6F6IbS4LnzaQ19v2R6KiMim3j+CyyAUV2O1pO1bBCjcZPdhRGEpLu/SL3gOdLkR\n' +
  //     'hiAmSSstUjVaE+SKFvnnrmLFGN996SoWkoAnJJNLRXMk2GMCQCejzrEa8+ymSCqo\n' +
  //     'aOO5rGHsZjQ7N2dhTNALdmCEqW+hxz3nXKcdGbqiCbQ/Sb8ZYNR7M2xGm85p4Ka9\n' +
  //     '0UK4cOM1VJPwz8hotSKAUmXnpbu73CsZi5HyzwZkk4FpcaYCYrCbGVmm1cIKEKI7\n' +
  //     '8SN/oqgFdj4Ha9cemnu+RecQZouK+wPWtcILd2kstJl52TV952fVOrnXQDo6XCXB\n' +
  //     'fbs9IYN1hB6N79xv4L7Jj53hSRMeSNf70Ejkh1FXPOvmvFT12wy5JQdBBR5nnb4a\n' +
  //     'GEsMpGVe1k3bxjK7K263tLSH0UZ8dMgdSx1E4D1hT1K/gEwTSMOJ0E1R0M6SJmF2\n' +
  //     '6TnZ0MbJWx6PbICmyZrd2agfTQrq6CgY1fWLGbQrtnwXtsUR7PiHarydXfs3V8g1\n' +
  //     'xHnK1bItOBBMOMcWV93hAoIBAQD2xMceUfBUN0TeWrJ4izD3lUYxmWqjTg7kPcjJ\n' +
  //     '0VN8v3txGAcyPmbuz5AEzvdFjTispoZNB9QOrmsUVWTQDE5otnei9kHWzqJWYHg4\n' +
  //     'USuUuAh8OJGCiepo8zHT3qHDNhKGtOAp5LC8TaOznUFr35zCBCOsvQfRUKrv5IOc\n' +
  //     'vCFjO07Xly8+M3qK7/UswRQ6480VlE2t1p+VNaORHdTDg2tes3/9owuiNmR/sPT8\n' +
  //     'nIoe01LS7qmZoiB1vracaLcBf1Iwd7RvKg7mgFJzmowZUYxyX2YGK5qZ1h74In2X\n' +
  //     '55+qQnNW0RwPijopTv711pMhMKWl8i3ilcCfoeBXz8zCwFfbAoIBAQDV3wHAO7ic\n' +
  //     'MYP/Bm5jgIwlix1eOWY/yB+VqdYn2GmC49vTEIlIVlFRq0vZE06iUxs87BIV08zO\n' +
  //     '4w/iKXd7ktkuhphiEuU2yXA3LQPHpbSOW43RONbf4glFU/DlP/P6fiybbWj6+f7L\n' +
  //     '7Zbvtz5AW03Y4ZpagJTqOgVdJ0MdLnh9vZj6okGGV1fidKtG6hr7Z/oLhnl9aAZK\n' +
  //     '4vrvBZ//qz99vEVByiV5kRaJDulu+diBy4n6iBjzjHA5a9e7lY3sUBw3DMgb7kYs\n' +
  //     'JJPkCPdSxCYq4Ef3z/Eao0tyUuCzyznfCMGJA1gBdTpwDNDCTaXqkjR5nvsdE5k0\n' +
  //     'IVQgFPtcOPCpAoIBABujNlni+3OzLPdqWQq/LCDOiyoK8LKRj4FomhBgbWVPXNfx\n' +
  //     'xPyPmJ+uh4bCV1dm1a4giHIgKlPqnPuOBNh4SF/Z79REmGMiiXP7IfvMu4DQi8K9\n' +
  //     '4y4nnCVc93uvN5bRe4mywFhw0IqGd4sqVaVrSfdA124FTdbXng14HnVzbJncjpv+\n' +
  //     'xr/ErDjbXy5AAbAGy3VbQsfxfbYMZ+Fc4fNzyJa2q+MQW8EzLlZOz2Frdty09lXB\n' +
  //     'fSVDzzbgwTsLT1PPmrjq7z50C28teA6ShJZhV8WHgbm3MH2CSb2ov0BAJNXA04Ip\n' +
  //     'sWbcKF9wBYYrHhddh2/qi9EQzJ4UVzf+ggRd3nkCggEAWcjyWjp4KRJcgJ65jwoz\n' +
  //     'S7uYS6s7MsGYCOOw5S9kNC/mZDhH+ddK8kdAY1RIqbrL74qHmSQ+kgge7epMn9Mp\n' +
  //     'W+/jXyDhm1t7wZ4jPRhisXTcF56ODpU9IR65PfTYPyvjHCkVbm+vOPt4ZxB9kNUD\n' +
  //     '3G3xt9bNLXvILrBB66lLqjYDWAzwBy751Tb3hKDZTPv8rAP7Uttt8NhTUi8BWXsR\n' +
  //     '/34fcRwlGWEAne9lrlIzQ2IofcXO+8fUgTa17ak+WJvVDINQKvGgAf4lHBFrixKP\n' +
  //     'l2ZqsC1a4bz1+nuym6hQlkJ9xUBjHNGTA+FNbpTcd5qDbx9/+lf09D6dq45DbBb3\n' +
  //     'aQKCAQBrnFYocTm/fIeKo1n1kyF2ULkd6k984ztH8UyluXleSS1ShFFoo/x3vz35\n' +
  //     'fsZNUggRnSe7/OBGZYquF/1roVULI1hKh4tbEmW4SWNeTFvwXKdRe6T7NnWSZtS/\n' +
  //     'KtamA3lT2wtoEVOvfMo8M0hoFuRWdT2M0i+LKZQdRsq18XPLqdHt1kkSNcnPDERm\n' +
  //     '4gLQ8zXTf2fHrtZmyM8fc0GuTVwprPFeJkLtSPehkeXSTgb6rpyelX9NBUILwRgP\n' +
  //     'nw0+cbjFDFKaLnIrMFoVAAn/8DcnbbSt1TZhgNsMxY+GHWPBYW8SUi5nBmQQtmA7\n' +
  //     'n3ju44acIPvJ9sWuZruVlWZGFaHm\n' +
  //     '-----END PRIVATE KEY-----\n',
  // },
  // // STANDALONE PASS

  // // // STANDALONE PASS
  // ...{
  //   TEST_REDIS_HOST: '172.30.100.102',
  //   TEST_REDIS_PORT: parseInt(process.env.TEST_REDIS_PORT) || 6379,
  //   TEST_REDIS_DB_INDEX: 0,
  //   TEST_REDIS_USER: process.env.TEST_REDIS_USER,
  //   TEST_REDIS_PASSWORD: 'defaultpass',
  //   TEST_REDIS_TLS_CA: undefined,
  //   TEST_USER_TLS_CERT: undefined,
  //   TEST_USER_TLS_KEY: undefined,
  // },

  // // // STANDALONE CA
  // ...{
  //   TEST_REDIS_HOST: '172.30.100.104',
  //   TEST_REDIS_PORT: parseInt(process.env.TEST_REDIS_PORT) || 6379,
  //   TEST_REDIS_DB_INDEX: 0,
  //   TEST_REDIS_USER: process.env.TEST_REDIS_USER,
  //   TEST_REDIS_PASSWORD: 'defaultpass',
  //   TEST_REDIS_TLS_CA: '-----BEGIN CERTIFICATE-----\n' +
  //     'MIIFHzCCAwegAwIBAgIUKeAfHPO6uJBW+s8fY2cWKOc+DfgwDQYJKoZIhvcNAQEL\n' +
  //     'BQAwHzELMAkGA1UEBhMCQVUxEDAOBgNVBAMMB2V4YW1wbGUwHhcNMjExMDI4MTMy\n' +
  //     'NzI2WhcNMzExMDI2MTMyNzI2WjAfMQswCQYDVQQGEwJBVTEQMA4GA1UEAwwHZXhh\n' +
  //     'bXBsZTCCAiIwDQYJKoZIhvcNAQEBBQADggIPADCCAgoCggIBANF9A4aeHru2fX1j\n' +
  //     'U+Bz9D2supYsMG64f+wXNrFPTMxPS/rdjNcqAWeVCknY7d8EO0uBf64Gm4ufQAPV\n' +
  //     'boINIdgoso9tGfl5LMaaiYq0aD5CK0wmU38pPbKA2Vr9bkrNIYLUFU6oPI7RJ5fL\n' +
  //     'Pl/vbvHyaXQKcDd5xxusAu3Ytrylq3WaLNWwhT//WRor4SU2qt9s06PiOgCABY+D\n' +
  //     'olMXI72gDaehRhnbOVXc6GadlHCsE5GHYJ3WcLLY0rGEdlwphcEG5TRVHGBiHOg/\n' +
  //     'J0vsiuhwTLyRqQq5L6eFm33d4aRI9JLY8LlU5ywGiVoNl+fFdQr3ovWw7eObQSbg\n' +
  //     'BuOJhQBTpEmiPgiOC3kAUUrgT/uGS1x9RX+Wj0sY6zs+qOkfhFAcScXQBeZSLNT9\n' +
  //     'RYAjZQOTtTQYVwH8NcF2MlwI3tb3qk2+2Xby4YfTHxp42B8IHkedwfFzrwfUDnNM\n' +
  //     'Cm3GSVtDGv/j4/7fp0oZZROpd5+h1wRhR/HO08rkpwuobo6xGRrrxqbdlsid3OB4\n' +
  //     'Kk92Wl8reccxyr2a/7OlrWk284xpQI/nlU6a8bByJp2eTPYuNJFfJkrqua94YOJy\n' +
  //     'K4d4tLNbQ4X/5g12unGEHg8/HVNHJjCKiU2Gwxhxm50EqmgdgaboDmf+GuVF0tL1\n' +
  //     'kGPbbjSrlt2pS+Tdza9EJfmAzVppAgMBAAGjUzBRMB0GA1UdDgQWBBQWqqhnKa+s\n' +
  //     '5ToC0TYKlIdfytda/jAfBgNVHSMEGDAWgBQWqqhnKa+s5ToC0TYKlIdfytda/jAP\n' +
  //     'BgNVHRMBAf8EBTADAQH/MA0GCSqGSIb3DQEBCwUAA4ICAQATnfNftaIalbJmNHrq\n' +
  //     '7KIxyAAEimiIvci5i1f2X8ZB4XY1TWcf0eQ/+oJW9E2Kj83yGaAqKg1FFP8ugquG\n' +
  //     'pxzMyljTlQi3cWp58ByaYg2XMEyRY5FtbcdbHHJgdM2PSHsegWN/vfJw3H3J2673\n' +
  //     'J6Kc/69IwJcE+aYDbLa/cnnRBn9AKHdtNoRmPH+s162oo8I86LQuG942Hx2CHCjt\n' +
  //     'ttkLwVBtsBKc5hRaPR+Psx68jS41iHJGHUwHNcPl7llBAQe8kKNg4GHJWT5vh7rd\n' +
  //     'rw4jAGCsoaE5Ol1HyRDprpdcC4o+eQbhMrjMcFzYduuCx1F96BlSXA2mQe+9lD08\n' +
  //     'LzdS35ILmSqCTbtOcdHCmnjWp9fhl5mIrJ+I3G33QPHaHJXBfWGNidxjkibwdVxK\n' +
  //     'eNAOv4lEMCoVQ0occzNyUluJQUFJyvXtXWFSErRH6b78Gsc/AvPijPbSNuT8hRK9\n' +
  //     'GC3yRYltDFXcr4+2lxJyoQoR6Y8399oaJm4U17fOIwlM+iI8dT8x+qsT8brw+5kk\n' +
  //     'oKu4jz8jfkZrUF8V8hIfAUc08IvMAmDwvIMeAjXFmDBEECxXBGRw2hTcY/53Nfdt\n' +
  //     'PRWzaL/YtKOy/9UfJQKs3Ihqte59/v3EJO9x9vTLmcpoCgh9piNVgD6OS38cOiEa\n' +
  //     'snS90+qMig9Gx3aJ+UvktWcp3Q==\n' +
  //     '-----END CERTIFICATE-----\n',
  //   TEST_USER_TLS_CERT: undefined,
  //   TEST_USER_TLS_KEY: undefined,
  // },

  // // STANDALONE NO AUTH
  // ...{
  //   TEST_REDIS_HOST: process.env.TEST_REDIS_HOST || 'localhost',
  //   TEST_REDIS_PORT: parseInt(process.env.TEST_REDIS_PORT) || 6379,
  //   TEST_REDIS_DB_INDEX: 7,
  //   TEST_REDIS_USER: process.env.TEST_REDIS_USER,
  //   TEST_REDIS_PASSWORD: process.env.TEST_REDIS_PASSWORD,
  //   TEST_REDIS_TLS_CA: process.env.TEST_REDIS_TLS_CA,
  //   TEST_USER_TLS_CERT: process.env.TEST_USER_TLS_CERT,
  //   TEST_USER_TLS_KEY: process.env.TEST_USER_TLS_KEY,
  // },
  //
  // // CLUSTER NO AUTH
  // ...{
  //   TEST_REDIS_HOST: process.env.TEST_REDIS_HOST || '172.30.100.151',
  //   TEST_REDIS_PORT: parseInt(process.env.TEST_REDIS_PORT) || 6379,
  //   TEST_REDIS_DB_INDEX: 7,
  //   TEST_REDIS_USER: process.env.TEST_REDIS_USER,
  //   TEST_REDIS_PASSWORD: process.env.TEST_REDIS_PASSWORD,
  //   TEST_REDIS_TLS_CA: process.env.TEST_REDIS_TLS_CA,
  //   TEST_USER_TLS_CERT: process.env.TEST_USER_TLS_CERT,
  //   TEST_USER_TLS_KEY: process.env.TEST_USER_TLS_KEY,
  // },
  //

  // // CLUSTER TLS CA
  // ...{
  //   TEST_REDIS_HOST: process.env.TEST_REDIS_HOST || '172.30.100.181',
  //   TEST_REDIS_PORT: parseInt(process.env.TEST_REDIS_PORT) || 6379,
  //   TEST_REDIS_DB_INDEX: 7,
  //   TEST_REDIS_USER: process.env.TEST_REDIS_USER,
  //   TEST_REDIS_PASSWORD: 'defaultpass',
  //   TEST_REDIS_TLS_CA: '-----BEGIN CERTIFICATE-----\n' +
  //     'MIIFHzCCAwegAwIBAgIUKeAfHPO6uJBW+s8fY2cWKOc+DfgwDQYJKoZIhvcNAQEL\n' +
  //     'BQAwHzELMAkGA1UEBhMCQVUxEDAOBgNVBAMMB2V4YW1wbGUwHhcNMjExMDI4MTMy\n' +
  //     'NzI2WhcNMzExMDI2MTMyNzI2WjAfMQswCQYDVQQGEwJBVTEQMA4GA1UEAwwHZXhh\n' +
  //     'bXBsZTCCAiIwDQYJKoZIhvcNAQEBBQADggIPADCCAgoCggIBANF9A4aeHru2fX1j\n' +
  //     'U+Bz9D2supYsMG64f+wXNrFPTMxPS/rdjNcqAWeVCknY7d8EO0uBf64Gm4ufQAPV\n' +
  //     'boINIdgoso9tGfl5LMaaiYq0aD5CK0wmU38pPbKA2Vr9bkrNIYLUFU6oPI7RJ5fL\n' +
  //     'Pl/vbvHyaXQKcDd5xxusAu3Ytrylq3WaLNWwhT//WRor4SU2qt9s06PiOgCABY+D\n' +
  //     'olMXI72gDaehRhnbOVXc6GadlHCsE5GHYJ3WcLLY0rGEdlwphcEG5TRVHGBiHOg/\n' +
  //     'J0vsiuhwTLyRqQq5L6eFm33d4aRI9JLY8LlU5ywGiVoNl+fFdQr3ovWw7eObQSbg\n' +
  //     'BuOJhQBTpEmiPgiOC3kAUUrgT/uGS1x9RX+Wj0sY6zs+qOkfhFAcScXQBeZSLNT9\n' +
  //     'RYAjZQOTtTQYVwH8NcF2MlwI3tb3qk2+2Xby4YfTHxp42B8IHkedwfFzrwfUDnNM\n' +
  //     'Cm3GSVtDGv/j4/7fp0oZZROpd5+h1wRhR/HO08rkpwuobo6xGRrrxqbdlsid3OB4\n' +
  //     'Kk92Wl8reccxyr2a/7OlrWk284xpQI/nlU6a8bByJp2eTPYuNJFfJkrqua94YOJy\n' +
  //     'K4d4tLNbQ4X/5g12unGEHg8/HVNHJjCKiU2Gwxhxm50EqmgdgaboDmf+GuVF0tL1\n' +
  //     'kGPbbjSrlt2pS+Tdza9EJfmAzVppAgMBAAGjUzBRMB0GA1UdDgQWBBQWqqhnKa+s\n' +
  //     '5ToC0TYKlIdfytda/jAfBgNVHSMEGDAWgBQWqqhnKa+s5ToC0TYKlIdfytda/jAP\n' +
  //     'BgNVHRMBAf8EBTADAQH/MA0GCSqGSIb3DQEBCwUAA4ICAQATnfNftaIalbJmNHrq\n' +
  //     '7KIxyAAEimiIvci5i1f2X8ZB4XY1TWcf0eQ/+oJW9E2Kj83yGaAqKg1FFP8ugquG\n' +
  //     'pxzMyljTlQi3cWp58ByaYg2XMEyRY5FtbcdbHHJgdM2PSHsegWN/vfJw3H3J2673\n' +
  //     'J6Kc/69IwJcE+aYDbLa/cnnRBn9AKHdtNoRmPH+s162oo8I86LQuG942Hx2CHCjt\n' +
  //     'ttkLwVBtsBKc5hRaPR+Psx68jS41iHJGHUwHNcPl7llBAQe8kKNg4GHJWT5vh7rd\n' +
  //     'rw4jAGCsoaE5Ol1HyRDprpdcC4o+eQbhMrjMcFzYduuCx1F96BlSXA2mQe+9lD08\n' +
  //     'LzdS35ILmSqCTbtOcdHCmnjWp9fhl5mIrJ+I3G33QPHaHJXBfWGNidxjkibwdVxK\n' +
  //     'eNAOv4lEMCoVQ0occzNyUluJQUFJyvXtXWFSErRH6b78Gsc/AvPijPbSNuT8hRK9\n' +
  //     'GC3yRYltDFXcr4+2lxJyoQoR6Y8399oaJm4U17fOIwlM+iI8dT8x+qsT8brw+5kk\n' +
  //     'oKu4jz8jfkZrUF8V8hIfAUc08IvMAmDwvIMeAjXFmDBEECxXBGRw2hTcY/53Nfdt\n' +
  //     'PRWzaL/YtKOy/9UfJQKs3Ihqte59/v3EJO9x9vTLmcpoCgh9piNVgD6OS38cOiEa\n' +
  //     'snS90+qMig9Gx3aJ+UvktWcp3Q==\n' +
  //     '-----END CERTIFICATE-----\n',
  //   TEST_USER_TLS_CERT: process.env.TEST_USER_TLS_CERT,
  //   TEST_USER_TLS_KEY: process.env.TEST_USER_TLS_KEY,
  // },


  // // SENTINEL PASS
  ...{
    TEST_REDIS_HOST: '172.30.100.200',
    TEST_REDIS_PORT: parseInt(process.env.TEST_REDIS_PORT) || 26379,
    TEST_REDIS_DB_INDEX: 0,
    TEST_REDIS_USER: process.env.TEST_REDIS_USER,
    TEST_REDIS_PASSWORD: 'defaultpass',
    TEST_SENTINEL_MASTER_GROUP: 'sent-5-primary1',
    TEST_RTE_DISCOVERY_TYPE: 'SENTINEL',
    TEST_SENTINEL_MASTER_PASS: 'defaultpass',
    TEST_REDIS_TLS_CA: undefined,
    TEST_USER_TLS_CERT: undefined,
    TEST_USER_TLS_KEY: undefined,
  },
  //
  // TEST_REDIS_PASSWORD=testpass
  // TEST_SENTINEL_MASTER_GROUP=primary1
  // TEST_RTE_DISCOVERY_TYPE=SENTINEL
  // TEST_SENTINEL_MASTER_PASS=dbpass
  // TEST_REDIS_PORT=26379

  // certificates
  TEST_USER_CERT_ID: uuidv4(),
  TEST_USER_CERT_NAME: uuidv4(),
  TEST_USER_CERT_FILENAME: 'user.crt',
  TEST_USER_CERT_KEY_FILENAME: 'user.key',

  TEST_CLIENT_CERT_NAME: 'client certificate',
  TEST_CLIENT_CERT: '-----BEGIN CERTIFICATE-----\nMIIFJTCCAw0CFCnZUPMfcoAU/VJYA6Qf4cZIJp4iMA0GCSqGSIb3DQEBCwUAMEUx\nCzAJBgNVBAYTAkFVMRMwEQYDVQQIDApTb21lLVN0YXRlMSEwHwYDVQQKDBhJbnRl\ncm5ldCBXaWRnaXRzIFB0eSBMdGQwHhcNMjEwNjIyMTcwMDQ2WhcNMzUwMzAxMTcw\nMDQ2WjBZMQswCQYDVQQGEwJBVTETMBEGA1UECAwKU29tZS1TdGF0ZTEhMB8GA1UE\nCgwYSW50ZXJuZXQgV2lkZ2l0cyBQdHkgTHRkMRIwEAYDVQQDDAlsb2NhbGhvc3Qw\nggIiMA0GCSqGSIb3DQEBAQUAA4ICDwAwggIKAoICAQDfRqe8YhMbWSlcbpGcIxXf\ncxYt9IYa1oAhW/KJ7iHwjldy82ht6mdYIvhqSxo8Xo9AUpMl9LT3mZv1aCup8G4u\nS5DXdYNV5KuTTP8zx5pcw0GVKLKB7THOOFV8Fzyx8dQAA24Z7Bz9aRRAeQsm2+tN\nQHL6D71uVPt9D07Tu2GGjivFhT/gHn1VBFbrpGEF+Z5dQbh7fd1j3kBpEtSrMrTh\nQfYVWtpdRW6JvsdG/Y07fkFCWEHbgVGqnVjJEc38ieCImDFK6vR+Q1bFqtvkr1zw\nKx6X6Hol32LeI2TJ+cPtHak8L53cKJyoIe3xu/9uIqhqGL+GUqBGLNsGYVR9RgfF\nwndk3/2ZeRodxKKsjaIMBlLLgmZkXoO6+hmyE3RNZv1fmgrTbjs1XTlxpi+byVs1\nuqHFBKLt2NclAOIXf8IGt9+5cPSOenMEW3pUUUb8yXKUgBKfEU8HO38tbLDpY0hW\n3mS/hIiTzcr5kD1jgoJ17SKZXKgOd0dhilN263YZnpcy0zFTeLNyTBAopte84Mmh\nRoMFVM2r6449P7sbm1YvyUNTGwgwsFpr2eJNcKk8laW4uSelvSLxlm6e4VtQ0FEX\n+7igpL6Mxdu3BUqhJrcoeNzz4AvbwZWie9IbSaIz+FeB1lMXDAt1kis+QCNc1S6a\n4Ulsl2HAApT8u3Fdfs+c3QIDAQABMA0GCSqGSIb3DQEBCwUAA4ICAQClCb7TfzWz\nSMT/6Y9cB4phR/FFQxqumNaE1ER1hLvU1wiGX85KwpAQOpIOS3J8pDYmTIiD2Zl4\n/EoHr//OsfYQQ05LT7pR5qPHyz+pxp/OH35k+LIaPtG3E2PrkjHffG5udRhGAxtr\nP3pampp0NaoFDtVNSjj73jedxhXKQVIPypK34yGOa67ISbDOzWQEoHCUwFPsNIp0\nd3uq8WDb0Er9sX2pCheuHYtxs6jgNaXOmJT8VkAKwaKnpUejfFiA/YPtsGgkSlEX\nhv1G0jmMquhPrMBq/pQrqvnA69dPi009L8m+aO1q1w5HQhH67JPjYSVR8A+OWfJ+\n2oMRO6UP2Ryf3G4STL1sL7GF9rWWsKtQH8T4ESZ3WfHcw7NjuEt2ngH2bplAei/e\nxCVDWgNfAWYQqbJhqv4NMEaIh5L0GkTTCnjxsEq2ByFlka+hQqz+6PQW/gQYScgT\n2+D0DQW7RP1pvheLwYABLDkx1y0eXBOmcthxVn9GyjZOmZFreRIBhlHp2lN6wUiR\n9Qj7UvwJ7Jhocc2mNwNxEmFLRoKku+1uoc/n3b/chaq0WadlDohWmE7hiKA25AG+\nRj54Ou5G78qbWstZPR/sAXQGtUkgXuAkh+RcP8OcfpImUryZ/4cIoSzgAIE+NYX6\nif8fVyASWrgcBKk5RUyFCZKMkJceV9ZGFg==\n-----END CERTIFICATE-----\n',
  TEST_CLIENT_KEY: '-----BEGIN RSA PRIVATE KEY-----\n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\n-----END RSA PRIVATE KEY-----\n',

  TEST_CA_ID: uuidv4(),
  TEST_CA_NAME: 'ca certificate',
  TEST_CA_FILENAME: 'redisCA.crt',
  TEST_CA_CERT: '-----BEGIN CERTIFICATE-----\nMIIFazCCA1OgAwIBAgIUavmmz7/4r2muhE1He1u/6S1jLXEwDQYJKoZIhvcNAQEL\nBQAwRTELMAkGA1UEBhMCQVUxEzARBgNVBAgMClNvbWUtU3RhdGUxITAfBgNVBAoM\nGEludGVybmV0IFdpZGdpdHMgUHR5IEx0ZDAeFw0yMTA2MjIxNjMwNTJaFw00ODEx\nMDcxNjMwNTJaMEUxCzAJBgNVBAYTAkFVMRMwEQYDVQQIDApTb21lLVN0YXRlMSEw\nHwYDVQQKDBhJbnRlcm5ldCBXaWRnaXRzIFB0eSBMdGQwggIiMA0GCSqGSIb3DQEB\nAQUAA4ICDwAwggIKAoICAQDGUx5tjluzcotvXlr4XCqAbdO+ehD/djqzb3KxB4p4\nUNE5tqS4TykvbisASOnNj/643J0BSYKEZwNBjy/oAWmc3cVMq30WnWRENGRUKyr+\nqhgjR0OGMHxpAU8DiDgsJAuvvh86SU0xIo6PUWyO38XNIOGt05s61My9fW+Allai\n5/jj6knBej42cRY7B9hUgHfko9NXE5oUVFKE+dpH9IiMUGBm7SDi1ysB1vIMQhcT\n8ugQHdwXAiQfhDODNuDG48z6OprhGgHN5lYNFd3oFlweoFaqE0psFRh9bR5AuqES\nubxEFqMVwEjyJa8BgObRBwdHoipZt1FLDeKTP5/MGUm5n/2X+pcAi4Q7+9i+aVz5\ngFiCz6ndOFEj3X4CXcHHLVzI8ukQ3wQiDFXnomLOcFcuAJ9t+MisUOwts/Nvmqa0\n+copNgXu2N8K01G77HX1qbJ0uyF6pupw2EWW0yJXkoSeOeaFegHPMx6y3RUx1adl\nKu9vQ8JDodK4OwHfQcSBgj8aKA7huBnclgpBmM6B1czC6pw7DN6orLOlsx6cUusP\n4mELM2CNNYLUQuxhghTO8lAQTgvvth5MNSpxA6x/gKFGmLN9XUJIZweQQymeY137\n8elXS2yuoSyppisB+HDvp6MbegN1ldzhI0AjdUj9NDiiO5sDk+XscKA8tsZz/MgW\nMQIDAQABo1MwUTAdBgNVHQ4EFgQU0CzAfHYx+Tr/axoAsurYNR/t2RMwHwYDVR0j\nBBgwFoAU0CzAfHYx+Tr/axoAsurYNR/t2RMwDwYDVR0TAQH/BAUwAwEB/zANBgkq\nhkiG9w0BAQsFAAOCAgEAd6Fqt+Ji1DV/7XA6e5QeCjqhrPxsXaUorbNSy2a4U59y\nRj5lmI8RUPBt6AtSLWpeZ5JU2NQpK+4YfbopSPnVtc8Xipta1VmSr2grjT0n4cjY\nXkMHV4bwaHBhr1OI2REcBOiwNP2QzXK7uFa75nZUyQSC0C3Qi5EJri2+a6xMsuF5\nE8a9eyIvst1ESXJ9IJITc8e/eYFtpGw7WRClcm1UblwqYpO9sW9fFuZDpuBC0UH1\nGXolRnFYN8PstjxmXHtrjHGcmOY+t1yFnyxOgZ01rmaFt+JEFbPOmgN17wcAidrV\nAuXKWal9zrtlJc1J8GPHPpBTlZ+Qq5TlPI7Z3Boj9FCZdl3JEWUZGP7TPjxCWLoH\n2/wJppE7w2bQcnidQngZhf2PN5RNQASUa2QBae7rkztReJ6A/xMWXAOfgkj13IbS\nPIDZnBQYp5DKAxL9PRB/javL57/fUtYAxxzZK4xbvwY/lygv3+NetPqRHnx/IVBj\nuEal2rpdwyFcoJ3DODbh9eh6tWJB4wR8QyYm3ATF1VV+x6XX5u5t5Z4IUt8WJkgn\nHGzepJVYxzJMzjlyjqF1IG9e1da8c4DdRgmOn3R55G5BWQR3i6J+RAQY/O1S3VKA\n0FDYT/EDZRbtXWwStSWUIPxNZt62vNGgwzprQow9OfJHRuOzlzIiK2BqnixboOs=\n-----END CERTIFICATE-----\n',

  // Redis Strings
  TEST_STRING_TYPE: 'string',
  TEST_STRING_KEY_1: TEST_RUN_ID + '_string_1' + CLUSTER_HASH_SLOT,
  TEST_STRING_VALUE_1: TEST_RUN_ID + '_value_1',
  GENERATE_BIG_TEST_STRING_VALUE: (sizeInMB = 1) => randomBytes(sizeInMB * 1024 * 1024).toString(),
  TEST_STRING_EXPIRE_1: KEY_TTL,
  TEST_STRING_KEY_2: TEST_RUN_ID + '_string_2' + CLUSTER_HASH_SLOT,
  TEST_STRING_VALUE_2: TEST_RUN_ID + '_value_2',
  TEST_STRING_EXPIRE_2: KEY_TTL,
  TEST_STRING_KEY_ASCII: getASCIISafeStringFromBuffer(getBufferFromSafeASCIIString(TEST_RUN_ID + '_str_ascii_€' + CLUSTER_HASH_SLOT)),
  TEST_STRING_KEY_ASCII_BUFFER: getBufferFromSafeASCIIString(TEST_RUN_ID + '_str_ascii_€' + CLUSTER_HASH_SLOT),
  TEST_STRING_KEY_ASCII_UNICODE: TEST_RUN_ID + '_str_ascii_€' + CLUSTER_HASH_SLOT,
  TEST_STRING_KEY_ASCII_VALUE: TEST_RUN_ID + '_value_ascii',
  TEST_STRING_KEY_BIN_BUFFER_1: Buffer.concat([Buffer.from(TEST_RUN_ID), Buffer.from('strk'), unprintableBuf]),
  get TEST_STRING_KEY_BIN_BUF_OBJ_1() { return { type: 'Buffer', data: [...this.TEST_STRING_KEY_BIN_BUFFER_1] } },
  get TEST_STRING_KEY_BIN_ASCII_1() { return getASCIISafeStringFromBuffer(this.TEST_STRING_KEY_BIN_BUFFER_1) },
  get TEST_STRING_KEY_BIN_UTF8_1() { return this.TEST_STRING_KEY_BIN_BUFFER_1.toString('utf-8') },
  TEST_STRING_VALUE_BIN_BUFFER_1:  Buffer.concat([Buffer.from(TEST_RUN_ID), Buffer.from('strv'), unprintableBuf]),
  get TEST_STRING_VALUE_BIN_ASCII_1() { return getASCIISafeStringFromBuffer(this.TEST_STRING_VALUE_BIN_BUFFER_1) },
  get TEST_STRING_VALUE_BIN_UTF8_1() { return this.TEST_STRING_VALUE_BIN_BUFFER_1.toString('utf-8') },
  get TEST_STRING_VALUE_BIN_BUF_OBJ_1() { return { type: 'Buffer', data: [...this.TEST_STRING_VALUE_BIN_BUFFER_1] } },

  // Redis List
  TEST_LIST_TYPE: 'list',
  TEST_LIST_KEY_1: TEST_RUN_ID + '_list_1' + CLUSTER_HASH_SLOT,
  TEST_LIST_ELEMENT_1: TEST_RUN_ID + '_list_el_1',
  TEST_LIST_ELEMENT_2: TEST_RUN_ID + '_list_el_2',
  TEST_LIST_EXPIRE_1: KEY_TTL,
  TEST_LIST_KEY_2: TEST_RUN_ID + '_list_2' + CLUSTER_HASH_SLOT,
  TEST_LIST_HUGE_KEY: 'big list 1M',
  TEST_LIST_HUGE_INDEX: 678900,
  TEST_LIST_HUGE_ELEMENT: ' 321099',
  TEST_LIST_KEY_BIN_BUFFER_1: Buffer.concat([Buffer.from(TEST_RUN_ID), Buffer.from('listk'), unprintableBuf]),
  get TEST_LIST_KEY_BIN_BUF_OBJ_1() { return { type: 'Buffer', data: [...this.TEST_LIST_KEY_BIN_BUFFER_1] } },
  get TEST_LIST_KEY_BIN_ASCII_1() { return getASCIISafeStringFromBuffer(this.TEST_LIST_KEY_BIN_BUFFER_1) },
  get TEST_LIST_KEY_BIN_UTF8_1() { return this.TEST_LIST_KEY_BIN_BUFFER_1.toString('utf-8') },
  TEST_LIST_ELEMENT_BIN_BUFFER_1: Buffer.concat([Buffer.from(TEST_RUN_ID), Buffer.from('liste'), unprintableBuf]),
  get TEST_LIST_ELEMENT_BIN_ASCII_1() { return getASCIISafeStringFromBuffer(this.TEST_LIST_ELEMENT_BIN_BUFFER_1) },
  get TEST_LIST_ELEMENT_BIN_UTF8_1() { return this.TEST_LIST_ELEMENT_BIN_BUFFER_1.toString('utf-8') },
  get TEST_LIST_ELEMENT_BIN_BUF_OBJ_1() { return { type: 'Buffer', data: [...this.TEST_LIST_ELEMENT_BIN_BUFFER_1] } },

  // Redis Set
  TEST_SET_TYPE: 'set',
  TEST_SET_KEY_1: TEST_RUN_ID + '_set_1' + CLUSTER_HASH_SLOT,
  TEST_SET_MEMBER_1: TEST_RUN_ID + '_set_mem_1',
  TEST_SET_MEMBER_2: TEST_RUN_ID + '_set_mem_2',
  TEST_SET_EXPIRE_1: KEY_TTL,
  TEST_SET_KEY_2: TEST_RUN_ID + '_set_2' + CLUSTER_HASH_SLOT,
  TEST_SET_HUGE_KEY: 'big set 1M',
  TEST_SET_HUGE_ELEMENT: ' 356897',
  TEST_SET_KEY_BIN_BUFFER_1: Buffer.concat([Buffer.from(TEST_RUN_ID), Buffer.from('setk'), unprintableBuf]),
  get TEST_SET_KEY_BIN_BUF_OBJ_1() { return { type: 'Buffer', data: [...this.TEST_SET_KEY_BIN_BUFFER_1] } },
  get TEST_SET_KEY_BIN_ASCII_1() { return getASCIISafeStringFromBuffer(this.TEST_SET_KEY_BIN_BUFFER_1) },
  get TEST_SET_KEY_BIN_UTF8_1() { return this.TEST_SET_KEY_BIN_BUFFER_1.toString('utf-8') },
  TEST_SET_MEMBER_BIN_BUFFER_1: Buffer.concat([Buffer.from(TEST_RUN_ID), Buffer.from('setm'), unprintableBuf]),
  get TEST_SET_MEMBER_BIN_ASCII_1() { return getASCIISafeStringFromBuffer(this.TEST_SET_MEMBER_BIN_BUFFER_1) },
  get TEST_SET_MEMBER_BIN_UTF8_1() { return this.TEST_SET_MEMBER_BIN_BUFFER_1.toString('utf-8') },
  get TEST_SET_MEMBER_BIN_BUF_OBJ_1() { return { type: 'Buffer', data: [...this.TEST_SET_MEMBER_BIN_BUFFER_1] } },

  // Redis ZSet
  TEST_ZSET_TYPE: 'zset',
  TEST_ZSET_KEY_1: TEST_RUN_ID + '_zset_1' + CLUSTER_HASH_SLOT,
  TEST_ZSET_MEMBER_1: TEST_RUN_ID + '_zset_mem_1',
  TEST_ZSET_MEMBER_1_SCORE: 0,
  TEST_ZSET_MEMBER_2: TEST_RUN_ID + '_zset_mem_2',
  TEST_ZSET_MEMBER_2_SCORE: 0.1,
  TEST_ZSET_EXPIRE_1: KEY_TTL,
  TEST_ZSET_KEY_2: TEST_RUN_ID + '_zset_2' + CLUSTER_HASH_SLOT,
  TEST_ZSET_KEY_3: TEST_RUN_ID + '_zset_3' + CLUSTER_HASH_SLOT,
  TEST_ZSET_HUGE_KEY: 'big zset 1M',
  TEST_ZSET_HUGE_MEMBER: ' 356897',
  TEST_ZSET_HUGE_SCORE: 356897,
  TEST_ZSET_KEY_BIN_BUFFER_1: Buffer.concat([Buffer.from(TEST_RUN_ID), Buffer.from('zsetk'), unprintableBuf]),
  get TEST_ZSET_KEY_BIN_BUF_OBJ_1() { return { type: 'Buffer', data: [...this.TEST_ZSET_KEY_BIN_BUFFER_1] } },
  get TEST_ZSET_KEY_BIN_ASCII_1() { return getASCIISafeStringFromBuffer(this.TEST_ZSET_KEY_BIN_BUFFER_1) },
  get TEST_ZSET_KEY_BIN_UTF8_1() { return this.TEST_ZSET_KEY_BIN_BUFFER_1.toString('utf-8') },
  TEST_ZSET_MEMBER_BIN_BUFFER_1: Buffer.concat([Buffer.from(TEST_RUN_ID), Buffer.from('zsetm'), unprintableBuf]),
  get TEST_ZSET_MEMBER_BIN_ASCII_1() { return getASCIISafeStringFromBuffer(this.TEST_ZSET_MEMBER_BIN_BUFFER_1) },
  get TEST_ZSET_MEMBER_BIN_UTF8_1() { return this.TEST_ZSET_MEMBER_BIN_BUFFER_1.toString('utf-8') },
  get TEST_ZSET_MEMBER_BIN_BUF_OBJ_1() { return { type: 'Buffer', data: [...this.TEST_ZSET_MEMBER_BIN_BUFFER_1] } },

  // Redis Hash
  TEST_HASH_TYPE: 'hash',
  TEST_HASH_KEY_1: TEST_RUN_ID + '_hash_1' + CLUSTER_HASH_SLOT,
  TEST_HASH_FIELD_1_NAME: TEST_RUN_ID + '_hash_f_1_name',
  TEST_HASH_FIELD_1_VALUE: TEST_RUN_ID + '_hash_f_1_val',
  TEST_HASH_FIELD_2_NAME: TEST_RUN_ID + '_hash_f_2_name',
  TEST_HASH_FIELD_2_VALUE: TEST_RUN_ID + '_hash_f_2_val',
  TEST_HASH_EXPIRE_1: KEY_TTL,
  TEST_HASH_KEY_2: TEST_RUN_ID + '_hash_2' + CLUSTER_HASH_SLOT,
  TEST_HASH_HUGE_KEY: 'big hash 1M',
  TEST_HASH_HUGE_KEY_FIELD: 'key678900',
  TEST_HASH_HUGE_KEY_VALUE: ' 678900',
  TEST_HASH_KEY_BIN_BUFFER_1: Buffer.concat([Buffer.from(TEST_RUN_ID), Buffer.from('hashk'), unprintableBuf]),
  get TEST_HASH_KEY_BIN_BUF_OBJ_1() { return { type: 'Buffer', data: [...this.TEST_HASH_KEY_BIN_BUFFER_1] } },
  get TEST_HASH_KEY_BIN_ASCII_1() { return getASCIISafeStringFromBuffer(this.TEST_HASH_KEY_BIN_BUFFER_1) },
  get TEST_HASH_KEY_BIN_UTF8_1() { return this.TEST_HASH_KEY_BIN_BUFFER_1.toString('utf-8') },
  TEST_HASH_FIELD_BIN_BUFFER_1: Buffer.concat([Buffer.from(TEST_RUN_ID), Buffer.from('hashf'), unprintableBuf]),
  get TEST_HASH_FIELD_BIN_BUF_OBJ_1() { return { type: 'Buffer', data: [...this.TEST_HASH_FIELD_BIN_BUFFER_1] } },
  get TEST_HASH_FIELD_BIN_ASCII_1() { return getASCIISafeStringFromBuffer(this.TEST_HASH_FIELD_BIN_BUFFER_1) },
  get TEST_HASH_FIELD_BIN_UTF8_1() { return this.TEST_HASH_FIELD_BIN_BUFFER_1.toString('utf-8') },
  TEST_HASH_VALUE_BIN_BUFFER_1: Buffer.concat([Buffer.from(TEST_RUN_ID), Buffer.from('hashv'), unprintableBuf]),
  get TEST_HASH_VALUE_BIN_BUF_OBJ_1() { return { type: 'Buffer', data: [...this.TEST_HASH_VALUE_BIN_BUFFER_1] } },
  get TEST_HASH_VALUE_BIN_ASCII_1() { return getASCIISafeStringFromBuffer(this.TEST_HASH_VALUE_BIN_BUFFER_1) },
  get TEST_HASH_VALUE_BIN_UTF8_1() { return this.TEST_HASH_VALUE_BIN_BUFFER_1.toString('utf-8') },

  // Redis Stream
  TEST_STREAM_TYPE: 'stream',
  TEST_STREAM_KEY_1: TEST_RUN_ID + '_stream_1' + CLUSTER_HASH_SLOT,
  TEST_STREAM_KEY_2: TEST_RUN_ID + '_stream_2' + CLUSTER_HASH_SLOT,
  TEST_STREAM_DATA_1: TEST_RUN_ID + '_stream_data_1',
  TEST_STREAM_DATA_2: TEST_RUN_ID + '_stream_data_2',
  TEST_STREAM_ID_1: '100-0',
  TEST_STREAM_FIELD_1: TEST_RUN_ID + '_stream_field_1',
  TEST_STREAM_VALUE_1: TEST_RUN_ID + '_stream_value_1',
  TEST_STREAM_ID_2: '200-0',
  TEST_STREAM_ID_3: '300-0',
  TEST_STREAM_ID_4: '400-0',
  TEST_STREAM_FIELD_2: TEST_RUN_ID + '_stream_field_2',
  TEST_STREAM_VALUE_2: TEST_RUN_ID + '_stream_value_2',
  TEST_STREAM_EXPIRE_1: KEY_TTL,
  TEST_STREAM_HUGE_KEY: TEST_RUN_ID + '_stream_huge' + CLUSTER_HASH_SLOT,
  TEST_STREAM_GROUP_1: TEST_RUN_ID + '_stream_group_1',
  TEST_STREAM_CONSUMER_1: TEST_RUN_ID + '_stream_consumer_1',
  TEST_STREAM_GROUP_2: TEST_RUN_ID + '_stream_group_2',
  TEST_STREAM_CONSUMER_2: TEST_RUN_ID + '_stream_consumer_2',
  TEST_STREAM_KEY_BIN_BUFFER_1: Buffer.concat([Buffer.from(TEST_RUN_ID), Buffer.from('streamk'), unprintableBuf]),
  get TEST_STREAM_KEY_BIN_BUF_OBJ_1() { return { type: 'Buffer', data: [...this.TEST_STREAM_KEY_BIN_BUFFER_1] } },
  get TEST_STREAM_KEY_BIN_ASCII_1() { return getASCIISafeStringFromBuffer(this.TEST_STREAM_KEY_BIN_BUFFER_1) },
  get TEST_STREAM_KEY_BIN_UTF8_1() { return this.TEST_STREAM_KEY_BIN_BUFFER_1.toString('utf-8') },
  TEST_STREAM_FIELD_BIN_BUFFER_1: Buffer.concat([Buffer.from(TEST_RUN_ID), Buffer.from('streamf'), unprintableBuf]),
  get TEST_STREAM_FIELD_BIN_BUF_OBJ_1() { return { type: 'Buffer', data: [...this.TEST_STREAM_FIELD_BIN_BUFFER_1] } },
  get TEST_STREAM_FIELD_BIN_ASCII_1() { return getASCIISafeStringFromBuffer(this.TEST_STREAM_FIELD_BIN_BUFFER_1) },
  get TEST_STREAM_FIELD_BIN_UTF8_1() { return this.TEST_STREAM_FIELD_BIN_BUFFER_1.toString('utf-8') },
  TEST_STREAM_VALUE_BIN_BUFFER_1: Buffer.concat([Buffer.from(TEST_RUN_ID), Buffer.from('streamv'), unprintableBuf]),
  get TEST_STREAM_VALUE_BIN_BUF_OBJ_1() { return { type: 'Buffer', data: [...this.TEST_STREAM_VALUE_BIN_BUFFER_1] } },
  get TEST_STREAM_VALUE_BIN_ASCII_1() { return getASCIISafeStringFromBuffer(this.TEST_STREAM_VALUE_BIN_BUFFER_1) },
  get TEST_STREAM_VALUE_BIN_UTF8_1() { return this.TEST_STREAM_VALUE_BIN_BUFFER_1.toString('utf-8') },
  TEST_STREAM_GROUP_BIN_BUFFER_1: Buffer.concat([Buffer.from(TEST_RUN_ID), Buffer.from('streamg'), unprintableBuf]),
  get TEST_STREAM_GROUP_BIN_BUF_OBJ_1() { return { type: 'Buffer', data: [...this.TEST_STREAM_GROUP_BIN_BUFFER_1] } },
  get TEST_STREAM_GROUP_BIN_ASCII_1() { return getASCIISafeStringFromBuffer(this.TEST_STREAM_GROUP_BIN_BUFFER_1) },
  get TEST_STREAM_GROUP_BIN_UTF8_1() { return this.TEST_STREAM_GROUP_BIN_BUFFER_1.toString('utf-8') },
  TEST_STREAM_CONSUMER_BIN_BUFFER_1: Buffer.concat([Buffer.from(TEST_RUN_ID), Buffer.from('streamc'), unprintableBuf]),
  get TEST_STREAM_CONSUMER_BIN_BUF_OBJ_1() { return { type: 'Buffer', data: [...this.TEST_STREAM_CONSUMER_BIN_BUFFER_1] } },
  get TEST_STREAM_CONSUMER_BIN_ASCII_1() { return getASCIISafeStringFromBuffer(this.TEST_STREAM_CONSUMER_BIN_BUFFER_1) },
  get TEST_STREAM_CONSUMER_BIN_UTF8_1() { return this.TEST_STREAM_CONSUMER_BIN_BUFFER_1.toString('utf-8') },

  // ReJSON-RL
  TEST_REJSON_TYPE: 'ReJSON-RL',
  TEST_REJSON_KEY_1: TEST_RUN_ID + '_rejson_1' + CLUSTER_HASH_SLOT,
  TEST_REJSON_VALUE_1: { test: 'value' },
  TEST_REJSON_EXPIRE_1: KEY_TTL,
  TEST_REJSON_KEY_2: TEST_RUN_ID + '_rejson_2' + CLUSTER_HASH_SLOT,
  TEST_REJSON_VALUE_2: [{ obj: 1 }],
  TEST_REJSON_EXPIRE_2: KEY_TTL,
  TEST_REJSON_KEY_3: TEST_RUN_ID + '_rejson_3' + CLUSTER_HASH_SLOT,
  TEST_REJSON_VALUE_3: { array: [{ obj: 1 }, 2, 3], object: { some: randomBytes(1024).toString('hex'), field: 'value'} },
  TEST_REJSON_EXPIRE_3: KEY_TTL,
  TEST_REJSON_KEY_BIN_BUFFER_1: Buffer.concat([Buffer.from(TEST_RUN_ID), Buffer.from('setk'), unprintableBuf]),
  get TEST_REJSON_KEY_BIN_BUF_OBJ_1() { return { type: 'Buffer', data: [...this.TEST_REJSON_KEY_BIN_BUFFER_1] } },
  get TEST_REJSON_KEY_BIN_ASCII_1() { return getASCIISafeStringFromBuffer(this.TEST_REJSON_KEY_BIN_BUFFER_1) },
  get TEST_REJSON_KEY_BIN_UTF8_1() { return this.TEST_REJSON_KEY_BIN_BUFFER_1.toString('utf-8') },

  // TSDB-TYPE
  TEST_TS_TYPE: 'TSDB-TYPE',
  TEST_TS_KEY_1: TEST_RUN_ID + '_ts_1' + CLUSTER_HASH_SLOT,
  TEST_TS_TIMESTAMP_1: 1627537290803,
  TEST_TS_VALUE_1: 10,
  TEST_TS_TIMESTAMP_2: 1627537290804,
  TEST_TS_VALUE_2: 20,

  // Graph
  TEST_GRAPH_TYPE: 'graphdata',
  TEST_GRAPH_KEY_1: TEST_RUN_ID + '_graph_1' + CLUSTER_HASH_SLOT,
  TEST_GRAPH_NODE_1: TEST_RUN_ID + 'n1',
  TEST_GRAPH_NODE_2: TEST_RUN_ID + 'n2',

  // RediSearch
  TEST_SEARCH_HASH_INDEX_1: TEST_RUN_ID + '_hash_search_idx_1' + CLUSTER_HASH_SLOT,
  TEST_SEARCH_HASH_KEY_PREFIX_1: TEST_RUN_ID + '_hash_search:',
  TEST_SEARCH_JSON_INDEX_1: TEST_RUN_ID + '_json_search_idx_1' + CLUSTER_HASH_SLOT,
  TEST_SEARCH_JSON_KEY_PREFIX_1: TEST_RUN_ID + '_json_search:',

  // Command Executions
  TEST_COMMAND_EXECUTION_ID_1: uuidv4(),

  // Plugins
  TEST_PLUGIN_VISUALIZATION_ID_1: uuidv4(),

  // Pub/Sub
  TEST_PUB_SUB_CHANNEL_1: 'channel-a',
  TEST_PUB_SUB_CHANNEL_2: 'channel-b',
  TEST_PUB_SUB_CHANNEL_3: 'channel-c',
  TEST_PUB_SUB_P_CHANNEL_1: '*',
  TEST_PUB_SUB_MESSAGE_1: 'message-a',
  TEST_PUB_SUB_MESSAGE_2: 'message-b',
  TEST_PUB_SUB_MESSAGE_3: 'message-c',

  // Notifications
  TEST_NOTIFICATION_1: {
    timestamp: 1656054100,
    title: 'Title-1',
    category: 'Release',
    categoryColor: '#ea14fd',
    body: 'Body-1',
    read: false,
    type: 'global',
  },
  TEST_NOTIFICATION_2: {
    timestamp: 1656054200,
    title: 'Title-2',
    category: 'News',
    categoryColor: null,
    body: 'Body-2',
    read: false,
    type: 'global',
  },
  TEST_NOTIFICATION_3: {
    timestamp: 1656054300,
    title: 'Title-3',
    category: null,
    categoryColor: null,
    body: 'Body-3',
    read: true,
    type: 'global',
  },
  TEST_NOTIFICATION_NE_1: {
    timestamp: 1656054101,
    title: 'Title-1',
    body: 'Body-1',
    read: false,
    type: 'global',
  },
  TEST_NOTIFICATION_NE_2: {
    timestamp: 1656054201,
    title: 'Title-2',
    body: 'Body-2',
    read: false,
    type: 'global',
  },
  TEST_NOTIFICATION_NE_3: {
    timestamp: 1656054303,
    title: 'Title-3',
    body: 'Body-3',
    read: true,
    type: 'global',
  },

  // Database Analysis
  TEST_DATABASE_ANALYSIS_ID_1: uuidv4(),
  TEST_DATABASE_ANALYSIS_CREATED_AT_1: new Date(),
  TEST_DATABASE_ANALYSIS_DELIMITER_1: ':',
  TEST_DATABASE_ANALYSIS_FILTER_1: {
    type: null,
    match: '*',
    count: 10_000,
  },
  TEST_DATABASE_ANALYSIS_PROGRESS_1: {
    total: 1_000_000,
    scanned: 10_000,
    processed: 10_000,
  },
  TEST_DATABASE_ANALYSIS_TOTAL_KEYS_1: {
    total: 10_000,
    types: [
      {
        type: 'string',
        total: 50_000,
      },
      {
        type: 'list',
        total: 50_000,
      },
    ]
  },
  TEST_DATABASE_ANALYSIS_TOTAL_MEMORY_1: {
    total: 10_000_000,
    types: [
      {
        type: 'string',
        total: 5_000_000,
      },
      {
        type: 'list',
        total: 5_000_000,
      },
    ]
  },
  TEST_DATABASE_ANALYSIS_TOP_KEYS_NSP_1: {
    nsp: 'Namespace',
    memory: 10_000_000,
    keys: 10_000_000,
    types: [
      {
        type: 'string',
        keys: 5_000,
        memory: 5_000_000,
      },
      {
        type: 'list',
        keys: 5_000,
        memory: 5_000_000,
      },
    ]
  },
  TEST_DATABASE_ANALYSIS_TOP_MEMORY_NSP_1: {
    nsp: 'Namespace',
    memory: 10_000_000,
    keys: 10_000_000,
    types: [
      {
        type: 'string',
        keys: 5_000,
        memory: 5_000_000,
      },
      {
        type: 'list',
        keys: 5_000,
        memory: 5_000_000,
      },
    ]
  },
  TEST_DATABASE_ANALYSIS_TOP_KEYS_1: {
    name: 'Key Name',
    type: 'string',
    memory: 1_000,
    length: 1_000,
    ttl: -1,
  },
  TEST_DATABASE_ANALYSIS_EXPIRATION_GROUP_1: {
    label: '1-4 Hrs',
    total: 10_000_000,
    threshold: 4 * 60 * 60 * 1000,
  },


  // etc...
}
