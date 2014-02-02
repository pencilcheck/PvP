'use strict';

describe('Controller: MovesCtrl', function () {

  // load the controller's module
  beforeEach(module('planetRusApp'));

  var MovesCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    MovesCtrl = $controller('MovesCtrl', {
      $scope: scope
    });
  }));

  it('should attach a list of awesomeThings to the scope', function () {
    expect(scope.awesomeThings.length).toBe(3);
  });
});
