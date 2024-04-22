@echo off

:: =============== Plugins ===============
set PLUGINS_DIR=".\redisinsight\api\static\plugins"
set PLUGINS_VENDOR_DIR=".\redisinsight\api\static\resources\plugins"

:: Default plugins assets
call sass ".\redisinsight\ui\src\styles\main_plugin.scss" ".\vendor\global_styles.css" --style=compressed --no-source-map
call sass ".\redisinsight\ui\src\styles\themes\dark_theme\_dark_theme.lazy.scss" ".\vendor\dark_theme.css" --style=compressed --no-source-map
call sass ".\redisinsight\ui\src\styles\themes\light_theme\_light_theme.lazy.scss" ".\vendor\light_theme.css" --style=compressed --no-source-map
xcopy ".\redisinsight\ui\src\assets\fonts\graphik" ".\vendor\fonts\" /s /e /y
xcopy ".\redisinsight\ui\src\assets\fonts\inconsolata" ".\vendor\fonts\" /s /e /y
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

:: Build redisgraph plugin
set REDISGRAPH_DIR=".\redisinsight\ui\src\packages\redisgraph"
call yarn --cwd "%REDISGRAPH_DIR%"
call yarn --cwd "%REDISGRAPH_DIR%" build
if not exist "%PLUGINS_DIR%\redisgraph" mkdir "%PLUGINS_DIR%\redisgraph"
if not exist "%PLUGINS_DIR%\redisgraph\dist" mkdir "%PLUGINS_DIR%\redisgraph\dist"
xcopy "%REDISGRAPH_DIR%\dist" "%PLUGINS_DIR%\redisgraph\dist\" /s /e /y
copy "%REDISGRAPH_DIR%\package.json" "%PLUGINS_DIR%\redisgraph\"

:: Build redistimeseries plugin
set REDISTIMESERSIES_DIR=".\redisinsight\ui\src\packages\redistimeseries-app"
call yarn --cwd "%REDISTIMESERSIES_DIR%"
call yarn --cwd "%REDISTIMESERSIES_DIR%" build
if not exist "%PLUGINS_DIR%\redistimeseries-app" mkdir "%PLUGINS_DIR%\redistimeseries-app"
if not exist "%PLUGINS_DIR%\redistimeseries-app\dist" mkdir "%PLUGINS_DIR%\redistimeseries-app\dist"
xcopy "%REDISTIMESERSIES_DIR%\dist" "%PLUGINS_DIR%\redistimeseries-app\dist\" /s /e /y
copy "%REDISTIMESERSIES_DIR%\package.json" "%PLUGINS_DIR%\redistimeseries-app\"

:: Build ri-explain plugin
set RI_EXPLIAIN_DIR=".\redisinsight\ui\src\packages\ri-explain"
call yarn --cwd "%RI_EXPLIAIN_DIR%"
call yarn --cwd "%RI_EXPLIAIN_DIR%" build
if not exist "%PLUGINS_DIR%\ri-explain" mkdir "%PLUGINS_DIR%\ri-explain"
if not exist "%PLUGINS_DIR%\ri-explain\dist" mkdir "%PLUGINS_DIR%\ri-explain\dist"
xcopy "%RI_EXPLIAIN_DIR%\dist" "%PLUGINS_DIR%\ri-explain\dist\" /s /e /y
copy "%RI_EXPLIAIN_DIR%\package.json" "%PLUGINS_DIR%\ri-explain\"

:: Build clients-list plugin
set CLIENTS_LIST_DIR=".\redisinsight\ui\src\packages\clients-list"
call yarn --cwd "%CLIENTS_LIST_DIR%"
call yarn --cwd "%CLIENTS_LIST_DIR%" build
if not exist "%PLUGINS_DIR%\clients-list" mkdir "%PLUGINS_DIR%\clients-list"
if not exist "%PLUGINS_DIR%\clients-list\dist" mkdir "%PLUGINS_DIR%\clients-list\dist"
xcopy "%CLIENTS_LIST_DIR%\dist" "%PLUGINS_DIR%\clients-list\dist\" /s /e /y
copy "%CLIENTS_LIST_DIR%\package.json" "%PLUGINS_DIR%\clients-list\"
