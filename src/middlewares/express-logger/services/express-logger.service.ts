// Copyright (c) Niels P. Sorensen. All rights reserved.
// Licensed under the MIT license.
// See LICENSE file in the project root for full license information.

import { boundClass } from 'autobind-decorator';
import express from 'express';
import { OutgoingHttpHeaders } from 'http';
import { DefaultLoggerAdapter } from '../defaults/defaultLoggerAdapter';
import {
  ExpressLoggerOptions,
  ExpressLoggerRequest,
  ExpressLoggerResource,
  ExpressLoggerResponse
} from '../models/models';

// tslint:disable-next-line:interface-name
interface InternalExpressResponse extends express.Response {
  _headers: any;
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
    res: express.Response,
    next: express.NextFunction
  ): Promise<void> {
    const performLogging = true;

    if (performLogging) {
      const resource = {
        request: this.convertToExpressLoggerRequest(req)
      };
      await this._options.loggerAdapter.create(resource);
      this.setupHooks(res, resource);
      next();
    } else {
      next();
    }
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
   * Override function, which is the correct way. But Typescript won't allow it because there is multiple overloads.
   * @param res
   * @param _resource
   */
  private setupHooks(res: express.Response, _resource: ExpressLoggerResource): void {
    // Wait for all promise to come back. To ensure performance, fire and forget.
    Promise.all<[number, OutgoingHttpHeaders], any>([this.writeHeadHook(res), this.sendHook(res)])
      .then(async ([[statusCode], body]) => {
        const response = this.buildExpressLoggerResponse(res, statusCode, body);
        console.log(response);
        return;
      })
      .catch(async () => {
        console.log('Something went wrong');
      });
  }

  /**
   * Hook into writeHead function of response to receive the status code
   * and the headers.
   * @param res
   */
  private writeHeadHook(res: express.Response): Promise<[number, OutgoingHttpHeaders]> {
    return new Promise<[number, OutgoingHttpHeaders]>((resolve) => {
      const defaultWriteHead = res.writeHead.bind(res);
      // @ts-ignore
      res.writeHead = (statusCode: number, reasonPhrase?: any, headers?: any) => {
        resolve([statusCode, headers]);
        defaultWriteHead(statusCode, reasonPhrase, headers);
      };
    });
  }

  /**
   * Hook into send function of the response to receive the body.
   * @param res
   */
  private sendHook(res: express.Response): Promise<any> {
    return new Promise<any>((resolve) => {
      const defaultSend = res.send.bind(res);
      // @ts-ignore
      res.send = (body?: any) => {
        resolve(body);
        defaultSend(body);
      };
    });
  }

  /**
   * Build idempotency response from hook responses and the response itself.
   * @param res
   * @param statusCode
   * @param body
   */
  private buildExpressLoggerResponse(res: express.Response, statusCode: number, body: any): ExpressLoggerResponse {
    const headerWhitelist: string[] = ['content-type'];
    const preliminaryHeaders = (res as InternalExpressResponse)._headers;
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
