import * as express from 'express';
import * as fs from 'fs-extra';

fs.ensureDir('./remote');

const app = express();
app.use('/remote', express.static('./remote'))
app.listen(5551);