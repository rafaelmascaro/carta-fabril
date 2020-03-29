describe("ProductsController", function () {
  var productsController, $controller, $rootScope, $scope, $state

  beforeEach(module('cartaFabril'))

  beforeEach(inject(function (_$rootScope_, _$controller_, _$state_) {
    $controller    = _$controller_
    $rootScope     = _$rootScope_
    $state         = _$state_

    $scope             = $rootScope.$new()
    productsController = $controller('ProductsController', { $scope: $scope, $rootScope: $rootScope, products: [] })
  }))

  it("have a controller", function () {
    expect(productsController).toBeDefined()
  })

  it("have a route to informations", function () {
    expect($state.href("products")).toEqual("#/products")
  })

  describe("with configured route", function () {
    var state

    beforeEach(function () {
      state = $state.get("products")
    })

    it("have an url", function () {
      expect(state.url).toEqual("/products")
    })

    it("have a template", function () {
      expect(state.templateUrl).toEqual('templates/products.html')
    })

    it("have a controller", function () {
      expect(state.controller).toEqual("ProductsController")
    })
  })
})
