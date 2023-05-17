const express = require('express');
const fs = require('fs-extra');

fs.ensureDir('./remote');

const app = express();
app.use('/remote', express.static('./remote'))
app.listen(5551);
