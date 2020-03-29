cartaFabrilServices.service('UIService', ['$timeout', function ($timeout) {

  this.delay = 1500

  this.waitBefore = function (callback) {
    $timeout(callback, this.delay)
  }
}])
