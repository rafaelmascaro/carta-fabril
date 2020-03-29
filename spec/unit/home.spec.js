describe('Home page', function () {
  var homeController, $controller, $rootScope, $scope, $state

  beforeEach(module('cartaFabril'))

  beforeEach(inject(function (_$rootScope_, _$controller_, _$state_) {
      $controller    = _$controller_
      $rootScope     = _$rootScope_
      $state         = _$state_
      $scope         = $rootScope.$new()
      homeController = $controller('HomeController', { $scope: $scope, $rootScope: $rootScope })
  }))

  it('have a controller', function () {
    expect(homeController).toBeDefined()
  })

  it('have a route to home', function () {
    expect($state.href('home')).toEqual('#/')
  })

  describe('with configured route', function () {
    var state

    beforeEach(function () {
      state = $state.get('home')
    })

    it('have an url', function () {
      expect(state.url).toEqual('/')
    })

    it('have a template', function () {
      expect(state.templateUrl).toEqual('templates/home.html')
    })

    it('have a controller', function () {
      expect(state.controller).toEqual('HomeController')
    })
  })
})
