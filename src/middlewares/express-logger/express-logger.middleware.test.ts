import { assert } from 'chai';
import { ERROR_MSG_NOT_INITIALIZED, expressLogger, getSharedExpressLoggerService } from './express-logger.middleware';

describe('ExpressLogger middleware', () => {
  it('returns an error if not initialized', () => {
    try {
      getSharedExpressLoggerService();
      assert.fail('Expecting error to be thrown because the middleware has not been called.');
    } catch (err: any) {
      assert.equal(err.message, ERROR_MSG_NOT_INITIALIZED);
      assert.ok(err);
    }
  });

  it('returns valid function and instantiate expressLogger service', () => {
    const middleware = expressLogger();
    assert.isFunction(middleware);
    const service = getSharedExpressLoggerService();
    assert.ok(service);
  });
});
