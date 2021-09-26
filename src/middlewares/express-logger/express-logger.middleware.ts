// Copyright (c) Niels P. Sorensen. All rights reserved.
// Licensed under the MIT license.
// See LICENSE file in the project root for full license information.

import express from 'express';
import { ExpressLoggerOptions } from './models/models';
import { ExpressLoggerService } from './services/express-logger.service';

export const ERROR_MSG_NOT_INITIALIZED = 'Express logger service has not been initialized by the middleware.';

// Represent a valid function to use as a middleware for express
type expressMiddleware = (req: express.Request, res: express.Response, next: express.NextFunction) => Promise<void>;

// Keep a single instance of the service
let expressLoggerService: ExpressLoggerService = null;

export function getSharedExpressLoggerService(): ExpressLoggerService {
  if (expressLoggerService) {
    return expressLoggerService;
  }
  throw new Error(ERROR_MSG_NOT_INITIALIZED);
}

/**
 * Return a function used as a express middleware.
 */
export const expressLogger = (options?: ExpressLoggerOptions): expressMiddleware => {
  expressLoggerService = new ExpressLoggerService(options);
  return expressLoggerService.provideMiddlewareFunction;
};
