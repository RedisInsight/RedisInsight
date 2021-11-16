import { Titlebar, Color } from 'custom-electron-titlebar';

const MyTitleBar = new Titlebar({
  backgroundColor: Color.fromHex('#101317'),
  shadow: true,
});

MyTitleBar.updateTitle('RedisInsight');
