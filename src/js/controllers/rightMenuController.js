cartaFabrilOrders.controller("RightMenuController", ["$scope", "$rootScope","OrderService",
  function RightMenuController($scope, $rootScope,OrderService) {

  $scope.orderService = OrderService

  $scope.select = function (id) {
    OrderService.selectProduct(id);
	$rootScope.$broadcast('update:DatepickerMinDate');
  }

  $scope.unselect = function (id) {
    OrderService.unselectProduct(id);
	$rootScope.$broadcast('update:DatepickerMinDate');
  }

  $scope.toggleSelect = function (id, selected) {
    selected ? this.unselect(id) : this.select(id)
  }
}])
