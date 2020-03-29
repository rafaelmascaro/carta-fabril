cartaFabrilOrders.controller("RightMenuController", ["$scope", "OrderService",
  function RightMenuController($scope, OrderService) {

  $scope.orderService = OrderService

  $scope.select = function (id) {
    OrderService.selectProduct(id)
  }

  $scope.unselect = function (id) {
    OrderService.unselectProduct(id)
  }

  $scope.toggleSelect = function (id, selected) {
    selected ? this.unselect(id) : this.select(id)
  }
}])
