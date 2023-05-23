const express = require('express');

const app = express();
app.use('/remote', express.static('./remote'));

app.listen(5551);
