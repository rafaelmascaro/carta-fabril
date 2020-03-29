cartaFabrilHome.controller("MenuController", ["$scope", "$state", "SalesforceService", function ($scope, $state, SalesforceService) {
  $scope.version = '@@version'
  $scope.env = '@@env' !== 'production' ? '@@env ' : ''
  if (SalesforceService.isLogged()) {
    SalesforceService.versionIsValid($scope.version).then((result) => { $scope.versionIsValid = result.sucesso })
  }else{
    $scope.versionIsValid = true
  }

  $scope.logout = function () {
    localStorage.removeItem('auth');
    localStorage.removeItem('user');

    $state.go('login')
  }
}])
