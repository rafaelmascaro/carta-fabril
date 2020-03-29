cartaFabrilServices.service('AuthService', ['$q', '$http', '$ionicLoading','$state', function ($q, $http,$ionicLoading,$state) {

    this.getAuthorizeUrl = function (internal) {
      var redirectUri = '@@sfRedirectUri',
          clientId    = '@@sfClientId',
          loginUrl    = internal ? '/vendor' : '/agent'
  
      var url = loginUrl + '/services/oauth2/authorize?display=popup' +
        '&response_type=token&client_id=' + escape(clientId) +
        '&redirect_uri=' + escape(redirectUri)

      return url
    }
  
    this.login = function (internal) {
      var self        = this,
          deferred    = $q.defer(),
          deferFunction = function(event) {
            deferred.reject("The sign in flow was canceled")
          }
  
      if (self.isLogged()) {
        deferred.resolve()
      } else {
        var browserRef = window.open(self.getAuthorizeUrl(internal), "_blank", "location=no, height=" + screen.height + ", width=" + screen.width)
        browserRef.moveTo(0,0)
  
        window.addEventListener("message", function (event) {
          if (event.origin.startsWith(location.origin)) {
            if (event.data.includes('error=')) {
              deferred.reject("The sign in flow was canceled")
            } else {
              self.setAuthData(event.data)
              deferred.resolve()
            }
          } else {
            deferred.reject("Wrong target origin")
          }
  
        browserRef.removeEventListener('beforeunload', deferFunction)
          browserRef.close()
        })
  
        browserRef.addEventListener('beforeunload', deferFunction)
      }
  
      return deferred.promise
    }
  
    this.refreshToken = function () {
      var self          = this,
          authData      = this.getAuthData(),
          authUrl       = "/vendor/services/oauth2/token",
          config = { headers: {"Content-Type":"application/x-www-form-urlencoded"} },
          params = {
            grant_type: "refresh_token",
            client_id: '@@sfClientId',
            client_secret: '@@sfClientSecret',
            refresh_token: authData.refresh_token
          }
  
      return $http.post(authUrl, null, {
        params: params,
        headers: {"Content-Type":"application/x-www-form-urlencoded"}
      }).then(function (response) {
        //success
        self.storeRefreshedToken(response.data.access_token)
      }, function(response) {
        //error
        $ionicLoading.hide()
        localStorage.removeItem('auth');
        localStorage.removeItem('user');  
        $state.go('login')
  
        console.log("erro ao dar refresh token")
        console.log(response)
        console.log(response.data)
        console.log(response.headers())
      })
    }
  
    this.setAuthData = function (rawParams) {
      var parts     = rawParams.split('&'),
          data      = {}
  
      for (var i = 0; i < parts.length; i++) {
        var pair = parts[i].split('=')
        data[pair[0]] = decodeURIComponent(pair[1])
      }
  
      this.storeAuthData(data)
    }
  
    this.storeAuthData = function (data) {
      localStorage.setItem("auth", JSON.stringify(data))
    }
  
    this.storeUserData = function (data) {
      localStorage.setItem("user", JSON.stringify(data))
    }
  
    this.storeRefreshedToken = function (token) {
      var authData = this.getAuthData()
  
      authData.access_token = token
  
      this.storeAuthData(authData)
    }
  
    this.getAuthData = function () {
      return JSON.parse(localStorage.getItem("auth"))
    }
  
    this.isLogged = function () {
      var authData = this.getAuthData()
  
      return authData && authData.access_token != null
    }
  
    this.getUserData = function () {
      return JSON.parse(localStorage.getItem("user"))
    }
  
    this.saveUserData = function () {
      if (this.isLogged()) {
        var authData = this.getAuthData();
  
        return $http({
          method : 'GET',
          url : authData.id.split('.com')[1],
          headers : {
            'Authorization' : authData.token_type + ' ' + authData.access_token
          }
        }).then(function(res) {
  
          this.storeUserData(res.data)
          return res.data
  
        }.bind(this))
      }
  
      return $q.reject();
    }
  }])
  