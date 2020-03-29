describe("CameraService", function () {
  var $q,
      $cordovaCamera,
      CameraService

  beforeEach(module('cartaFabril'))

  beforeEach(inject(function (_$q_, _$cordovaCamera_, _CameraService_) {
    $q = _$q_
    $cordovaCamera = _$cordovaCamera_
    CameraService = _CameraService_
  }))

  describe('#options', function () {
    it("configures the camera", function () {
      expect(CameraService.options).toEqual({
        quality: 50,
        saveToPhotoAlbum: false
      })
    })
  })

  describe('#getPicture', function () {
    var camera,
        dataUrl,

        cordovaCamera,
        getPicture,

        getPictureFn,
        thenFn,

        errorRes,
        imageData,
        rejectSpy,
        resolveSpy,

        thenSpy

    beforeEach(function () {
      camera = 1
      dataUrl = 2

      window.Camera = {}

      window.Camera.PictureSourceType = {}
      window.Camera.PictureSourceType.CAMERA = camera

      window.Camera.DestinationType = {}
      window.Camera.DestinationType.DATA_URL = dataUrl
    })

    it("calls CameraService#configureCameraOptions", function () {
      spyOn(CameraService, 'configureCameraOptions')

      CameraService.getPicture()
      expect(CameraService.configureCameraOptions).toHaveBeenCalled()
    })

    it("calls $cordovaCamera#getPicture with the right params", function () {
      spyOn($cordovaCamera, 'getPicture').and.returnValue({ then: function(){} })

      CameraService.getPicture()

      expect($cordovaCamera.getPicture).toHaveBeenCalledWith({
        quality: 50,
        saveToPhotoAlbum: false,
        destinationType: dataUrl,
        sourceType: camera
      })
    })

    describe("the picture being taken", function () {

      describe("when the picture is successfully taken", function () {
        beforeEach(function () {
          imageData = '010101',
          resolveSpy = jasmine.createSpy('resolve')

          thenSpy = jasmine.createSpy('then').and.callFake(function (callback) {
            callback(imageData)
          })

          spyOn($cordovaCamera, 'getPicture').and.returnValue({
            then: thenSpy
          })

          spyOn($q, 'defer').and.returnValue({
            resolve: resolveSpy
          })
        })

        it("resolves the promise with the right params", function () {
          CameraService.getPicture()
          expect(resolveSpy).toHaveBeenCalledWith(imageData)
        })
      })

      describe("when the picture unsuccessfully taken", function () {
        beforeEach(function () {
          errorRes = 'error',
          rejectSpy  = jasmine.createSpy('reject')

          thenSpy = jasmine.createSpy('then').and.callFake(function (success, error) {
            error(errorRes)
          })

          spyOn($cordovaCamera, 'getPicture').and.returnValue({
            then: thenSpy
          })

          spyOn($q, 'defer').and.returnValue({
            reject: rejectSpy
          })
        })

        it("rejects the promise with the right params", function () {
          CameraService.getPicture()
          expect(rejectSpy).toHaveBeenCalledWith(errorRes)
        })
      })
    })
  })

  describe('#configureCameraOptions', function () {
    var camera = 1,
        dataUrl = 2

    beforeEach(function () {
      window.Camera = {}

      window.Camera.PictureSourceType = {}
      window.Camera.PictureSourceType.CAMERA = camera

      window.Camera.DestinationType = {}
      window.Camera.DestinationType.DATA_URL = dataUrl
    })

    it("extends the camera options with device specific configurations", function () {
      CameraService.configureCameraOptions()
      expect(CameraService.options).toEqual({
        quality: 50,
        saveToPhotoAlbum: false,
        destinationType: dataUrl,
        sourceType: camera
      })
    })
  })
})
