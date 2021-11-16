@echo off

:: =============== Plugins ===============
set PLUGINS_DIR=".\redisinsight\api\src\static\plugins"
set PLUGINS_VENDOR_DIR=".\redisinsight\api\src\static\resources\plugins"

:: Default plugins assets
call node-sass ".\redisinsight\ui\src\styles\main_plugin.scss" ".\vendor\global_styles.css" --output-style compressed
call node-sass ".\redisinsight\ui\src\styles\themes\dark_theme\_dark_theme.lazy.scss" ".\vendor\dark_theme.css" --output-style compressed
call node-sass ".\redisinsight\ui\src\styles\themes\light_theme\_light_theme.lazy.scss" ".\vendor\light_theme.css" --output-style compressed
xcopy ".\redisinsight\ui\src\assets\fonts\graphik" ".\vendor\fonts\" /s /e /y
if not exist %PLUGINS_VENDOR_DIR% mkdir %PLUGINS_VENDOR_DIR%
xcopy ".\vendor\." "%PLUGINS_VENDOR_DIR%" /s /e /y

:: Build redisearch plugin
set REDISEARCH_DIR=".\redisinsight\ui\src\packages\redisearch"
call yarn --cwd "%REDISEARCH_DIR%"
call yarn --cwd "%REDISEARCH_DIR%" build
if not exist "%PLUGINS_DIR%\redisearch" mkdir "%PLUGINS_DIR%\redisearch"
if not exist "%PLUGINS_DIR%\redisearch\dist" mkdir "%PLUGINS_DIR%\redisearch\dist"
xcopy "%REDISEARCH_DIR%\dist" "%PLUGINS_DIR%\redisearch\dist\" /s /e /y
copy "%REDISEARCH_DIR%\package.json" "%PLUGINS_DIR%\redisearch\"

:: =============== Enablement area ===============
xcopy ".\redisinsight\ui\src\packages\enablement-area" ".\redisinsight\api\src\static\workbench\" /s /e /y
