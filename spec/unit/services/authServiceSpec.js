describe("AuthService", function () {
  var AuthService, $q, $httpBackend, $cordovaNetwork

  beforeEach(module('cartaFabril'))

  beforeEach(inject(function (_AuthService_, _$q_, _$httpBackend_, _$cordovaNetwork_) {
    AuthService = _AuthService_
    $q = _$q_
    $httpBackend = _$httpBackend_
    $cordovaNetwork = _$cordovaNetwork_

    $httpBackend.whenGET(/\.html$/).respond('');
  }))

  describe("#getAuthorizeUrl", function () {
    var clientId    = '@@sfClientId',
        redirectUri = '@@sfRedirectUri'

    describe("when login is from an internal employee", function () {
      var internal = true

      it("gets the correct authorization url", function () {
        var expectedUrl ='@@sfOauthUrl/services/oauth2/authorize?display=touch' +
          '&response_type=token&client_id=' + escape(clientId) +
          '&redirect_uri=' + escape(redirectUri)

        expect(AuthService.getAuthorizeUrl(internal)).toEqual(expectedUrl)
      })
    })

    describe("when login is from an external", function () {
      var internal = false

      it("get the correct authorization url", function () {
        var expectedUrl ='@@sfPartnerOauthUrl/services/oauth2/authorize?display=touch' +
          '&response_type=token&client_id=' + escape(clientId) +
          '&redirect_uri=' + escape(redirectUri)

        expect(AuthService.getAuthorizeUrl(internal)).toEqual(expectedUrl)
      })
    })
  })

  describe("#login", function () {
    xit("log", function () {

    })
  })

  describe("#setAuthData", function () {
    var rawParams = "token=123456&user=johngalt&session_id=999999"
        params    = { token: "123456", user: "johngalt", session_id: "999999" }

    beforeEach(function () {
      spyOn(AuthService, "storeAuthData")
    })

    it("calls the method to store auth data with correct params", function () {
      AuthService.setAuthData(rawParams)
      expect(AuthService.storeAuthData).toHaveBeenCalledWith(params)
    })
  })

  describe("#storeRefreshedToken", function () {
    var authData = { access_token: "123456", user: "johngalt", session_id: "999999" },
        newToken = "999999"

    beforeEach(function () {
      spyOn(AuthService, "getAuthData").and.returnValue(authData)
      spyOn(AuthService, "storeAuthData")
    })

    it("updates access_token on local storage", function () {
      authData.access_token = newToken
      AuthService.storeRefreshedToken(newToken)
      console.log(authData)
      expect(AuthService.storeAuthData).toHaveBeenCalledWith(authData)
    })

  })

  describe("#storeAuthData", function () {
    var params = { token: "123456", user: "johngalt", session_id: "999999" }

    afterEach(function () {
      localStorage.removeItem("auth")
    })

    it("stores auth data on local storage", function () {
      AuthService.storeAuthData(params)

      data = localStorage.getItem("auth")

      expect(data).toEqual(JSON.stringify(params))
    })
  })

  describe("#getAuthData", function () {
    var params = { token: "123456", user: "johngalt", session_id: "999999" }

    beforeEach(function () {
      localStorage.setItem("auth", JSON.stringify(params))
    })

    afterEach(function () {
      localStorage.removeItem("auth")
    })

    it("get the auth data as an object", function () {
      var authData = AuthService.getAuthData()

      expect(JSON.stringify(authData)).toEqual(JSON.stringify(params))
    })
  })

  describe("#isLogged", function () {
    describe("when no has auth data in local storage", function () {
      beforeEach(function () {
        spyOn(AuthService, "getAuthData").and.returnValue({})
      })

      it("returns false", function () {
        expect(AuthService.isLogged()).toBeFalsy()
      })
    })

    describe("when has auth data in local storage, but no has access_token", function () {
      beforeEach(function () {
        var data = { session_id: "test" }
        spyOn(AuthService, "getAuthData").and.returnValue(data)
      })

      it("returns false", function () {
        expect(AuthService.isLogged()).toBeFalsy()
      })
    })

    describe("when has auth data in local storage, and has access_token", function () {
      beforeEach(function () {
        var data = { session_id: "teste", access_token: "999999" }
        spyOn(AuthService, "getAuthData").and.returnValue(data)
      })

      it("returns true", function () {
        expect(AuthService.isLogged()).toBeTruthy()
      })
    })
  })

  describe("#saveUserData", function(){

    var isLoggedSpy;

    var userData = { foo : 'bar' }

    beforeEach(function() {
      isLoggedSpy = spyOn(AuthService, 'isLogged')
      spyOn($cordovaNetwork, 'isOffline').and.returnValue(false)
      spyOn(AuthService, "storeUserData")
      spyOn(AuthService, "getAuthData").and.returnValue({id : 'http://foo.bar/', token_type : 'Bearer', access_token : 'A999999'})
    })

    describe("when is not logged", function () {

      beforeEach(function() {
        isLoggedSpy.and.returnValue(false)
      })

      it("reject promise", function() {

        spyOn($q, 'reject')

        AuthService.saveUserData()

        expect($q.reject).toHaveBeenCalled();

      })

      it("don't makes http requests", function () {
        AuthService.saveUserData()
        $httpBackend.flush();
      })

      it("don't calls AuthService#getAuthData", function () {

        AuthService.saveUserData()

        expect(AuthService.getAuthData).not.toHaveBeenCalled()

      })

      it("don't calls AuthService#storeUserData", function () {

        AuthService.saveUserData()

        expect(AuthService.storeUserData).not.toHaveBeenCalled()

      })

    })

    describe("when is logged", function () {

      var userData = { foo : 'bar' }

      beforeEach(function() {
        isLoggedSpy.and.returnValue(true)
      })

      it("calls $http with correct params", function () {

        $httpBackend.expectGET(
          'http://foo.bar/',
          function(headers){
              return headers.Authorization === 'Bearer A999999';
          }
        ).respond(userData);

        AuthService.saveUserData()
        $httpBackend.flush();

      })

      it("calls AuthService#storeUserData with correct params", function () {

        $httpBackend.whenGET('http://foo.bar/').respond(userData)

        AuthService.saveUserData()
        $httpBackend.flush()

        expect(AuthService.storeUserData).toHaveBeenCalledWith(userData)

      })

      it("resolves with user data", function () {

        AuthService.saveUserData().then(function(res){

          expect(res).toEqual(userData)

        })

      })

    })

  })

})
