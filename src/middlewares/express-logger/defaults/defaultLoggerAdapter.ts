// Copyright (c) Niels P. Sorensen. All rights reserved.
// Licensed under the MIT license.
// See LICENSE file in the project root for full license information.

import {
  ExpressLoggerOptions,
  ExpressLoggerRequest,
  ExpressLoggerResponse,
  IExpressLoggerAdapter
} from '../models/models';

export class DefaultLoggerAdapter implements IExpressLoggerAdapter {
  responseLogger(expressLoggerResponse: ExpressLoggerResponse): Promise<void> {
    console.log('RESPONSE -->', expressLoggerResponse);
    return;
  }
  requestLogger(expressLoggerRequest: ExpressLoggerRequest): Promise<void> {
    console.log('REQUEST -->', expressLoggerRequest);
    return;
  }
  create(_loggerOptions: ExpressLoggerOptions): Promise<void> {
    return;
  }
}
