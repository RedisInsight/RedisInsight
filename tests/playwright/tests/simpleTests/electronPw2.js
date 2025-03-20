const { _electron: electron } = require('@playwright/test');
/**
 * test that doesn't involve anything else than playwright meant for simple demonstration
 */
(async () => {
  console.log("🚀 Starting RedisInsight...");

  const electronApp = await electron.launch({
    executablePath: '/home/tsvetan-tsvetkov/Downloads/Redis-Insight-linux-x86_64.AppImage', // CAHNGE
    args: ['index.html'],
    // env: { DEBUG: 'pw:electron*' }, // Enable debug logs if needed
    timeout: 60000, // Max wait time
  });


   console.log("⏳ Waiting for window...");


  let windows = [];
  let elapsedTime = 0;
  const maxWaitTime = 60000; // 60 seconds
  const interval = 2000; // Check every 2 seconds

  // Wait for a window to appear
  while (windows.length === 0 && elapsedTime < maxWaitTime) {
    await new Promise((resolve) => setTimeout(resolve, interval)); // Wait 2s
    windows = await electronApp.windows(); // Check for open windows
    elapsedTime += interval;
    console.log(`🔍 Checking for windows... (${elapsedTime / 1000}s elapsed)`);

    if (windows.length > 0) {
      console.log(`✅ Found ${windows.length} window(s)!`);
      break;
    }
  }
 ;

  if (windows.length === 0) {
    console.error("❌ No windows detected after 60s! Exiting.");
    await electronApp.close();
    return;
  }

  const window = windows[0]; // Pick the first window
  await window.waitForLoadState('domcontentloaded'); // Ensure it's fully loaded

  // ✅ Print the window title
  const title = await window.title();
  console.log(`🖥️ Window Title: ${title}`);


  // ✅ Click an element containing specific text
  const textToClick = "Add Redis Database"; // Change this to the actual text
  try {
    await window.getByText(textToClick).click();
    console.log(`🖱️ Clicked on "${textToClick}" successfully!`);
  } catch (error) {
    console.error(`❌ Could not find or click on "${textToClick}".`, error);
  }
  await window.reload();
  // ✅ Capture a screenshot
  await window.screenshot({ path: 'screenshot.png' });
  console.log("📸 Screenshot captured!");

  // Exit the app.
  await electronApp.close();
})();
