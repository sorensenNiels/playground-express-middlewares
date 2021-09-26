// Copyright (c) Niels P. Sorensen. All rights reserved.
// Licensed under the MIT license.
// See LICENSE file in the project root for full license information.

/**
 * ExpressLogger request.
 */
export interface ExpressLoggerRequest {
  body: any;
  headers: any;
  method: string;
  query: any;
  url: string;
}

/**
 * ExpressLogger response.
 * Keep a reference of the response (ex: http status) and the body.
 */
export class ExpressLoggerResponse {
  public statusCode?: number;
  public headers: any;
  public body?: any;
}

/**
 * ExpressLoger resource.
 */
export interface ExpressLoggerResource {
  request: ExpressLoggerRequest;
  response?: ExpressLoggerResponse;
}

/**
 * Interface to implement for performing the actual logging
 */
export interface IExpressLoggerAdapter {
  /**
   * Create an instance of the Express logger logging adapter
   * @param loggerResource Idempotency resource
   */
  create(loggerResource: ExpressLoggerResource): Promise<void>;
}

/**
 * Options available to configure the idempotency middleware.
 */
// tslint:disable-next-line:interface-name
export interface ExpressLoggerOptions {
  // The data adapter used to store the resources.
  // Default is the InMemoryDataAdapter.
  loggerAdapter?: IExpressLoggerAdapter;
}
