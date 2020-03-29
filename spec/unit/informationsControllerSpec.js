describe("InformationsController", function () {
  var informationsController, $controller, $rootScope, $scope, $state

  beforeEach(module('cartaFabril'))

  beforeEach(inject(function (_$rootScope_, _$controller_, _$state_) {
    $controller    = _$controller_
    $rootScope     = _$rootScope_
    $state         = _$state_

    $scope                 = $rootScope.$new()
    informationsController = $controller('InformationsController', { $scope: $scope, $rootScope: $rootScope, infos: [{results: []}, {results: []}, {results: []}] })
  }))

  it("have a controller", function () {
    expect(informationsController).toBeDefined()
  })

  it("have a route to informations", function () {
    expect($state.href("informations")).toEqual('#/informations')
  })

  describe("with configured route", function () {
    var state

    beforeEach(function () {
      state = $state.get("informations")
    })

    it("have an url", function () {
      expect(state.url).toEqual("/informations")
    })

    it("have a template", function () {
      expect(state.templateUrl).toEqual('templates/informations.html')
    })

    it("have a controller", function () {
      expect(state.controller).toEqual('InformationsController')
    })
  })
})
