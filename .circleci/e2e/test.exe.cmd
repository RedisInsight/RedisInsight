@echo off

set COMMON_URL=%USERPROFILE%/AppData/Local/Programs/redisinsight/resources/app.asar/dist/renderer/index.html
set ELECTRON_PATH=%USERPROFILE%/AppData/Local/Programs/redisinsight/RedisInsight.exe
set OSS_STANDALONE_HOST=%E2E_CLOUD_DATABASE_HOST%
set OSS_STANDALONE_PORT=%E2E_CLOUD_DATABASE_PORT%
set OSS_STANDALONE_USERNAME=%E2E_CLOUD_DATABASE_USERNAME%
set OSS_STANDALONE_PASSWORD=%E2E_CLOUD_DATABASE_PASSWORD%
set RI_SOCKETS_CORS=true

call yarn --cwd tests/e2e install

call "./release/RedisInsight-preview-win-installer.exe"

:: waiting until app auto launches
timeout 5

:: close an auto launched app
taskkill /im RedisInsight-preview.exe /f
taskkill /im RedisInsight-preview-win-installer.exe /f

:: run tests
call yarn --cwd tests/e2e dotenv -e .desktop.env yarn --cwd tests/e2e test:desktop:ci:win
