'use strict';

cartaFabrilHome.config([
  '$stateProvider',

  function ($stateProvider) {
    $stateProvider.state('products', {
      url: '/products',
      templateUrl: 'templates/products.html',
      controller: 'ProductsController',
      resolve: {
        products: ['ProductsService', '$ionicLoading', function (ProductsService, $ionicLoading) {
          $ionicLoading.show({ template: 'Carregando produtos...' })

          return ProductsService.loadList().finally(function () {
            $ionicLoading.hide()
          })
        }]
      }
    })
  }
])

cartaFabrilHome.controller("ProductsController", ['$scope', '$ionicModal', '$ionicLoading', 'products', 'ProductsService',  function ($scope, $ionicModal, $ionicLoading, products, ProductsService) {
  var query = {},
      closedCategories = {}

  $scope.productsByCategory = _(products.results)
    .groupBy('category')
    .entries()
    .sortBy(function (group) {
      return group[1][0].orderCategory;
    })
    .value()

  $scope.isLastPage = products.isLastPage
  $scope.page = 1

  $scope.getMore = function () {
    return !$scope.isLastPage && ProductsService.loadPage(null, ++$scope.page).then(function (res) {

      $scope.productsByCategory = _
        .chain($scope.productsByCategory)
        .fromPairs()
        .mergeWith(
          _.groupBy(res.results, 'category'),
          function (val1, val2) {
            return [].concat(val1 || [], val2)
          }
        )
        .entries()
        .sortBy(function (group) {
          return group[1][0].orderCategory;
        })
        .value()
      ;

      $scope.isLastPage = res.isLastPage
    })
  };
  
  
  $scope.doRefresh = function() {
    
		$scope.isLastPage = false;
		$scope.productsByCategory = [];
		$scope.page = 0;

		return ProductsService.loadPage(null, ++$scope.page).then(function (res) {

		  $scope.productsByCategory = _(res.results)
		  .groupBy('category')
		  .entries()
		  .sortBy(function (group) {
			return group[1][0].orderCategory;
		  })
		  .value();
	  
		  $scope.$broadcast('scroll.refreshComplete');
		  
		})
	};

  $scope.open = function (productId) {

    $scope.product = _
      .chain($scope.productsByCategory)
      .reduce(function (acc, pair) { return acc.concat(pair[1]) }, [])
      .find({ id : productId })
      .value()

    $ionicModal.fromTemplateUrl('templates/product.html', {
      scope: $scope,
      animation: 'fade-in',
      hideDelay: true
    }).then(function(modal) {
      $scope.modal = modal
      modal.show()
    })
  }

  $scope.close = function () {
    $scope.modal.hide()
  }

  $scope.isOppened = function (category) {
    return !closedCategories[category]
  }

  $scope.toggleCategory = function (category) {
    closedCategories[category] = !closedCategories[category]
  }

}])
