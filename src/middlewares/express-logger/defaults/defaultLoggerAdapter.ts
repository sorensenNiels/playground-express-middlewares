// Copyright (c) Niels P. Sorensen. All rights reserved.
// Licensed under the MIT license.
// See LICENSE file in the project root for full license information.

import { ExpressLoggerResource, IExpressLoggerAdapter } from '../models/models';

export class DefaultLoggerAdapter implements IExpressLoggerAdapter {
  create(loggerResource: ExpressLoggerResource): Promise<void> {
    console.log(loggerResource);
    return;
  }
}
