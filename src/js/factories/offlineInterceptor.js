angular.module('cartaFabril')

.factory('OfflineInterceptor', ['$q', '$timeout', '$injector', '$cordovaNetwork', function ($q, $timeout, $injector, $cordovaNetwork) {
  var OfflineInterceptor = function (){}

  OfflineInterceptor.prototype.request = function (config) {
    var $ionicPopup,
        $ionicLoading,
        offlineCounter = 0,

        isOffline,
        isExternalRequest

    $ionicPopup = $injector.get('$ionicPopup')
    $ionicLoading = $injector.get('$ionicLoading')

    isOffline = $cordovaNetwork.isOffline()
    isExternalRequest = config.url.match('salesforce.com')

    if (isExternalRequest && isOffline) {
      offlineCounter++

      if (offlineCounter == 1) {
        $ionicLoading.hide()

        $ionicPopup.alert({
          title: 'Sem conexão',
          template: 'Sem conexão com a internet. Tente novamente em instantes.'
        })
      }

      $timeout(function () {
        offlineCounter = 0
      }, 5000)

      return $q.reject(config)
    } else {
      return $q.resolve(config)
    }
  }

  return OfflineInterceptor
}])
