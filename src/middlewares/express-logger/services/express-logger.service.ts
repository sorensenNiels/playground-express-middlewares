// Copyright (c) Niels P. Sorensen. All rights reserved.
// Licensed under the MIT license.
// See LICENSE file in the project root for full license information.

import { boundClass } from 'autobind-decorator';
import express from 'express';
import { JsonObject } from 'type-fest';
import { DefaultLoggerAdapter } from '../defaults/defaultLoggerAdapter';
import { ExpressLoggerOptions, ExpressLoggerRequest, ExpressLoggerResponse } from '../models/models';

interface InternalResponseWithBody extends express.Response {
  body?: string | JsonObject;
}

/**
 * This class represent the express logger service.
 * It contains all the logic.
 */
@boundClass
export class ExpressLoggerService {
  private _options: ExpressLoggerOptions;

  /**
   * Constructor, used to initialize default values if options are not provided.
   * @param options Options provided
   */
  constructor(options: ExpressLoggerOptions = {}) {
    const loggerAdapter = options.loggerAdapter ?? new DefaultLoggerAdapter();

    // Ensure that every propery has a value.
    this._options = {
      loggerAdapter
    };
  }

  /**
   * Provide middleware function to enable express logger.
   * @param req Express request
   * @param res Express response
   * @param next Express next function
   */
  public async provideMiddlewareFunction(
    req: express.Request,
    res: InternalResponseWithBody,
    next: express.NextFunction
  ): Promise<void> {
    const performLogging = true;

    if (performLogging) {
      res.once('error', (err) =>
        this.onResFinish(
          err,
          this.convertToExpressLoggerRequest(req),
          this.convertToExpressLoggerResponse(res, res.statusCode, res.body)
        )
      );

      res.once('finish', () =>
        this.onResFinish(
          null,
          this.convertToExpressLoggerRequest(req),
          this.convertToExpressLoggerResponse(res, res.statusCode, res.body)
        )
      );

      await this._options.loggerAdapter.create(this._options);
      this.setupHooks(res);
      next();
    } else {
      next();
    }
  }

  private onResFinish(err: any, reqInfo: ExpressLoggerRequest, resInfo: ExpressLoggerResponse) {
    console.log('SUCCESS!');
    console.log(reqInfo);
    console.log(resInfo);
  }

  /**
   * Override function, which is the correct way. But Typescript won't allow it because there is multiple overloads.
   * @param res
   */
  private setupHooks(res: InternalResponseWithBody): void {
    // Wait for all promise to come back. To ensure performance, fire and forget.
    Promise.all<any>([this.endHook(res)])
      .then(async ([body]) => {
        res.body = body;
        return;
      })
      .catch(async () => {
        console.log('Something went wrong');
      });
  }

  /**
   * Hook into end function
   * @param res
   */
  private endHook(res: express.Response): Promise<any> {
    return new Promise<any>((resolve) => {
      const defaultEnd = res.end.bind(res);
      // @ts-ignore
      res.end = (chunk: any, encoding: BufferEncoding) => {
        if (chunk) {
          const isJson = res.getHeader('content-type') && (res.getHeader('content-type') as string).indexOf('json') > 0;
          const body = chunk.toString();
          resolve(this.bodyToString(body, isJson));
        }

        defaultEnd(chunk, encoding);
      };
    });
  }

  private safeJSONParse(string: string) {
    try {
      return JSON.parse(string);
    } catch (e) {
      return undefined;
    }
  }

  private bodyToString(body, isJSON) {
    const stringBody = body && body.toString();
    if (isJSON) {
      return this.safeJSONParse(body) || stringBody;
    }
    return stringBody;
  }

  /**
   * Convert a request into a express logger request which keeps only minimal representation.
   * @param req
   */
  private convertToExpressLoggerRequest(req: express.Request): ExpressLoggerRequest {
    return {
      body: req.body,
      headers: req.headers,
      method: req.method,
      query: req.query,
      url: req.url
    };
  }

  /**
   * Build express logger response object for logger
   * @param res
   * @param statusCode
   * @param body
   */
  private convertToExpressLoggerResponse(res: express.Response, statusCode: number, body: any): ExpressLoggerResponse {
    const headerWhitelist: string[] = ['content-type'];
    const preliminaryHeaders = res.getHeaders();
    // Keeps only whitelisted headers
    const headers = Object.keys(preliminaryHeaders)
      .filter((key) => headerWhitelist.includes(key))
      .reduce((obj: any, key) => {
        obj[key] = preliminaryHeaders[key];
        return obj;
      }, {});

    return {
      statusCode,
      body,
      headers
    };
  }
}
