'use strict';

describe('RadioCtrl', function () {

  // load the controller's module
  beforeEach(module('scradioApp'));

  var RadioCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(module('mockedApp'));
  beforeEach(inject(function ($controller, $rootScope, SoundCloud) {
    scope = $rootScope.$new();
    RadioCtrl = $controller('RadioCtrl', {
      $scope: scope,
      SoundCloud: SoundCloud
    });
  }));

  it('should add the correct user to seeds array when addSeed is called with a user URL', function () {
    scope.seeds = [];
    scope.addSeed('https://soundcloud.com/capyac');
    expect(scope.seeds[0].permalink).toBe('capyac');
  });

  it('should add the correct user when addSeed is called with a track URL', function() {
    scope.seeds = [];
    scope.addSeed('https://soundcloud.com/capyac/birds-birds');
    expect(scope.seeds[0].permalink).toBe('capyac');
  });
});
