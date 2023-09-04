@echo off

:: =============== Plugins ===============
set PLUGINS_DIR=".\redisinsight\api\static\plugins"
set PLUGINS_VENDOR_DIR=".\redisinsight\api\static\resources\plugins"

:: Default plugins assets
call node-sass ".\redisinsight\ui\src\styles\main_plugin.scss" ".\vendor\global_styles.css" --output-style compressed
call node-sass ".\redisinsight\ui\src\styles\themes\dark_theme\_dark_theme.lazy.scss" ".\vendor\dark_theme.css" --output-style compressed
call node-sass ".\redisinsight\ui\src\styles\themes\light_theme\_light_theme.lazy.scss" ".\vendor\light_theme.css" --output-style compressed
xcopy ".\redisinsight\ui\src\assets\fonts\graphik" ".\vendor\fonts\" /s /e /y
xcopy ".\redisinsight\ui\src\assets\fonts\inconsolata" ".\vendor\fonts\" /s /e /y
if not exist %PLUGINS_VENDOR_DIR% mkdir %PLUGINS_VENDOR_DIR%
xcopy ".\vendor\." "%PLUGINS_VENDOR_DIR%" /s /e /y

@REM :: Build redisearch plugin
@REM set REDISEARCH_DIR=".\redisinsight\ui\src\packages\redisearch"
@REM call yarn --cwd "%REDISEARCH_DIR%"
@REM call yarn --cwd "%REDISEARCH_DIR%" build
@REM if not exist "%PLUGINS_DIR%\redisearch" mkdir "%PLUGINS_DIR%\redisearch"
@REM if not exist "%PLUGINS_DIR%\redisearch\dist" mkdir "%PLUGINS_DIR%\redisearch\dist"
@REM xcopy "%REDISEARCH_DIR%\dist" "%PLUGINS_DIR%\redisearch\dist\" /s /e /y
@REM copy "%REDISEARCH_DIR%\package.json" "%PLUGINS_DIR%\redisearch\"

@REM :: Build redisgraph plugin
@REM set REDISGRAPH_DIR=".\redisinsight\ui\src\packages\redisgraph"
@REM call yarn --cwd "%REDISGRAPH_DIR%"
@REM call yarn --cwd "%REDISGRAPH_DIR%" build
@REM if not exist "%PLUGINS_DIR%\redisgraph" mkdir "%PLUGINS_DIR%\redisgraph"
@REM if not exist "%PLUGINS_DIR%\redisgraph\dist" mkdir "%PLUGINS_DIR%\redisgraph\dist"
@REM xcopy "%REDISGRAPH_DIR%\dist" "%PLUGINS_DIR%\redisgraph\dist\" /s /e /y
@REM copy "%REDISGRAPH_DIR%\package.json" "%PLUGINS_DIR%\redisgraph\"

@REM :: Build redistimeseries plugin
@REM set REDISTIMESERSIES_DIR=".\redisinsight\ui\src\packages\redistimeseries-app"
@REM call yarn --cwd "%REDISTIMESERSIES_DIR%"
@REM call yarn --cwd "%REDISTIMESERSIES_DIR%" build
@REM if not exist "%PLUGINS_DIR%\redistimeseries-app" mkdir "%PLUGINS_DIR%\redistimeseries-app"
@REM if not exist "%PLUGINS_DIR%\redistimeseries-app\dist" mkdir "%PLUGINS_DIR%\redistimeseries-app\dist"
@REM xcopy "%REDISTIMESERSIES_DIR%\dist" "%PLUGINS_DIR%\redistimeseries-app\dist\" /s /e /y
@REM copy "%REDISTIMESERSIES_DIR%\package.json" "%PLUGINS_DIR%\redistimeseries-app\"

@REM :: Build ri-explain plugin
@REM set RI_EXPLIAIN_DIR=".\redisinsight\ui\src\packages\ri-explain"
@REM call yarn --cwd "%RI_EXPLIAIN_DIR%"
@REM call yarn --cwd "%RI_EXPLIAIN_DIR%" build
@REM if not exist "%PLUGINS_DIR%\ri-explain" mkdir "%PLUGINS_DIR%\ri-explain"
@REM if not exist "%PLUGINS_DIR%\ri-explain\dist" mkdir "%PLUGINS_DIR%\ri-explain\dist"
@REM xcopy "%RI_EXPLIAIN_DIR%\dist" "%PLUGINS_DIR%\ri-explain\dist\" /s /e /y
@REM copy "%RI_EXPLIAIN_DIR%\package.json" "%PLUGINS_DIR%\ri-explain\"

@REM :: Build clients-list plugin
@REM set CLIENTS_LIST_DIR=".\redisinsight\ui\src\packages\clients-list"
@REM call yarn --cwd "%CLIENTS_LIST_DIR%"
@REM call yarn --cwd "%CLIENTS_LIST_DIR%" build
@REM if not exist "%PLUGINS_DIR%\clients-list" mkdir "%PLUGINS_DIR%\clients-list"
@REM if not exist "%PLUGINS_DIR%\clients-list\dist" mkdir "%PLUGINS_DIR%\clients-list\dist"
@REM xcopy "%CLIENTS_LIST_DIR%\dist" "%PLUGINS_DIR%\clients-list\dist\" /s /e /y
@REM copy "%CLIENTS_LIST_DIR%\package.json" "%PLUGINS_DIR%\clients-list\"
