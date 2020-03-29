cartaFabrilServices.service('CameraService', ['$cordovaCamera', function ($cordovaCamera) {
  this.getPicture = function(source) {
    return $cordovaCamera.getPicture({
      quality: 50,
      saveToPhotoAlbum: false,
      destinationType: Camera.DestinationType.DATA_URL,
      sourceType: Camera.PictureSourceType[source]
    })
  }
}])
