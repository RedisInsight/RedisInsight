
## Install

Install Playwright browsers -  'yarn playwright install'

Install Playwright operating system dependencies requires sudo / root - 'sudo yarn playwright install-deps'




## Runs
Runs the end-to-end tests.

```yarn playwright test```

Runs the tests only on Desktop Chrome.

```yarn playwright test --project=chromium```

Runs the tests in debug mode.

```yarn playwright test --debug```

Runs the tests in a specific file.

```yarn playwright test example```

Starts the interactive UI mode. This also can be set in the config

```yarn playwright test --ui```


## Extra tooling
Inside that directory, you can run several commands:

Auto generate tests with Codegen.

```yarn playwright codegen```


Allure report display needs JAVA_HOME set 
and to run the server JDK version 8 to 11 otherwise you get 
``` 
Starting web server...
Exception in thread "main" java.lang.UnsatisfiedLinkError: Can't load library: /usr/lib/jvm/java-17-openjdk-amd64/lib/libawt_xawt.so
at java.base/java.lang.ClassLoader.loadLibrary(ClassLoader.java:2398)
at java.base/java.lang.Runtime.load0(Runtime.java:755)
at java.base/java.lang.System.load(System.java:1970)
at java.base/jdk.internal.loader.NativeLibraries.load(Native Method) 
```
