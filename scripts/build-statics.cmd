@echo off

:: =============== Plugins ===============
set PLUGINS_DIR=".\redisinsight\api\static\plugins"
set PLUGINS_VENDOR_DIR=".\redisinsight\api\static\resources\plugins"

:: Default plugins assets
call sass ".\redisinsight\ui\src\styles\main_plugin.scss" ".\vendor\global_styles.css" --style=compressed --no-source-map
call sass ".\redisinsight\ui\src\styles\themes\dark_theme\darkTheme.scss" ".\vendor\dark_theme.css" --style=compressed --no-source-map
call sass ".\redisinsight\ui\src\styles\themes\light_theme\lightTheme.scss" ".\vendor\light_theme.css" --style=compressed --no-source-map
xcopy ".\redisinsight\ui\src\assets\fonts\graphik" ".\vendor\fonts\" /s /e /y
xcopy ".\redisinsight\ui\src\assets\fonts\inconsolata" ".\vendor\fonts\" /s /e /y
if not exist %PLUGINS_VENDOR_DIR% mkdir %PLUGINS_VENDOR_DIR%
xcopy ".\vendor\." "%PLUGINS_VENDOR_DIR%" /s /e /y

:: Build general plugins
set GENERAL_DIR=".\redisinsight\ui\src\packages\general"
call yarn --cwd "%GENERAL_DIR%"
call yarn --cwd "%GENERAL_DIR%" build
if not exist "%PLUGINS_DIR%\general" mkdir "%PLUGINS_DIR%\general"
if not exist "%PLUGINS_DIR%\general\dist" mkdir "%PLUGINS_DIR%\general\dist"
xcopy "%GENERAL_DIR%\dist" "%PLUGINS_DIR%\general\dist\" /s /e /y
copy "%GENERAL_DIR%\package.json" "%PLUGINS_DIR%\general\"
