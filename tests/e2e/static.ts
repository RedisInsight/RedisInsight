const express = require('express');
const fs = require('fs-extra');

fs.mkdirSync('./remote', { recursive: true });
fs.copyFileSync('./test-data/features-configs/insights-default-remote.json', './remote/features-config.json');

const app = express();
app.use('/remote', express.static('./remote'));

app.listen(5551);
