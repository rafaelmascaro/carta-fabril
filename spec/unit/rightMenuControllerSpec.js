describe("RightMenuController", function () {
  var rightMenuController, $controller, $rootScope, $scope, OrderService

  beforeEach(module('cartaFabril'))

  beforeEach(inject(function (_$q_, _$rootScope_, _$controller_, _$state_, _OrderService_) {
    $controller  = _$controller_
    $q           = _$q_
    $rootScope   = _$rootScope_
    $state       = _$state_
    OrderService = _OrderService_

    $scope              = $rootScope.$new()
    rightMenuController = $controller('RightMenuController', { $scope: $scope, $rootScope: $rootScope })
  }))

  it("have a controller", function () {
    expect(rightMenuController).toBeDefined()
  })

  describe("#select(id)", function () {
    beforeEach(function () {
      spyOn(OrderService, "selectProduct")
    })

    it("calls Order Service to select desired product", function () {
      var id = "999"
      $scope.select(id)
      expect(OrderService.selectProduct).toHaveBeenCalledWith(id)
    })
  })

  describe("#unselect(id)", function () {
    beforeEach(function () {
      spyOn(OrderService, "unselectProduct")
    })

    it("calls Order Service to remove item from selected products", function () {
      var id = "123"
      $scope.unselect(id)
      expect(OrderService.unselectProduct).toHaveBeenCalledWith(id)
    })
  })

  describe("#toggleSelect(id, selected)", function () {
    var id = "123"

    beforeEach(function () {
      spyOn($scope, "select")
      spyOn($scope, "unselect")
    })

    describe("when selected is false", function () {
      it("calls function to select", function () {
        $scope.toggleSelect(id, false)
        expect($scope.select).toHaveBeenCalledWith(id)
        expect($scope.unselect).not.toHaveBeenCalled()
      })
    })

    describe("when selected is true", function () {
      it("calls function to unselect", function () {
        $scope.toggleSelect(id, true)
        expect($scope.unselect).toHaveBeenCalledWith(id)
        expect($scope.select).not.toHaveBeenCalled()
      })
    })
  })
})