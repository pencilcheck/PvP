'use strict';

describe('Service: UserSession', function () {

  // load the service's module
  beforeEach(module('planetRusApp'));

  // instantiate service
  var UserSession;
  beforeEach(inject(function (_UserSession_) {
    UserSession = _UserSession_;
  }));

  it('should do something', function () {
    expect(!!UserSession).toBe(true);
  });

});
