// Copyright (c) Niels P. Sorensen. All rights reserved.
// Licensed under the MIT license.
// See LICENSE file in the project root for full license information.

import express from 'express';
import { expressLogger } from './middlewares/express-logger';

const app = express();

app.use(expressLogger());

app.all('/', function (_req: express.Request, res: express.Response) {
  res.send(new Date().toISOString());
});

app.listen(8080, function () {
  console.log('Example app listening on port 8080 with express-logger middleware.');
});
