!macro preInit
  SetRegView 64
    WriteRegExpandStr HKLM "${INSTALL_REGISTRY_KEY}" InstallLocation "$PROFILE\AppData\Local\Programs\redisinsight"
    WriteRegExpandStr HKCU "${INSTALL_REGISTRY_KEY}" InstallLocation "$PROFILE\AppData\Local\Programs\redisinsight"
  SetRegView 32
    WriteRegExpandStr HKLM "${INSTALL_REGISTRY_KEY}" InstallLocation "$PROFILE\AppData\Local\Programs\redisinsight"
    WriteRegExpandStr HKCU "${INSTALL_REGISTRY_KEY}" InstallLocation "$PROFILE\AppData\Local\Programs\redisinsight"
!macroend
