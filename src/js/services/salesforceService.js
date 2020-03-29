cartaFabrilServices.service('SalesforceService', ['$q', '$timeout', '$ionicPopup', 'AuthService',
  function SalesforceService($q, $timeout, $ionicPopup, AuthService) {

  this.loginUrl = null

  function oauthUrl(internal) {
    return !!internal ? '@@sfOauthUrl' : '@@sfPartnerOauthUrl'
  }

  this.isLogged = function () {
    var authData = AuthService.getAuthData()

    return authData && authData.access_token != null
  }

  this.connect = function () {
    var authData = AuthService.getAuthData()

    console.log("auth data => " + JSON.stringify(authData))

    this.loginUrl = this.loginUrl || oauthUrl(authData.id.match(/(\w+)\.salesforce/))

    var conn = new jsforce.Connection({
      instanceUrl: authData.instance_url,
      accessToken: authData.access_token,
      refreshToken: authData.refresh_token,
      oauth2 : {
        clientId: '@@sfClientId',
        clientSecret: '@@sfClientSecret',
        redirectUri: '@@sfRedirectUri',
        loginUrl: this.loginUrl
      }
    })

    conn.on("refresh", function(accessToken, res) {
      console.log('refreshed auth data', res)
      AuthService.storeAuthData(_.assign(authData, res))
    });

    return conn
  }

  this.loadData = function (query) {
    var self     = this,
        deferred = $q.defer(),
        conn     = this.connect(),
        canceled = false

    var timeout = $timeout(function () {
      canceled = true
      $ionicPopup.alert({
        title: 'Falha de conexão',
        template: 'Tempo máximo de resposta excedido.'
      })
      deferred.reject(new Error('CONNECTION_TIMEOUT'))
    }, 30000)

    conn.query(query, function(err, result) {
      if (!canceled) {
        $timeout.cancel(timeout)

        if (err) {
          console.log(err)
          AuthService.refreshToken().then(function () {
            if (!canceled) {
              console.log("loading list...")
              self.loadData(query)
            }
          }, function(err) {
            if (!canceled) {
              console.log(err)
              $ionicPopup.alert({
                title: 'Falha de conexão',
                template: 'Por favor, verifique sua conexão com a Internet.'
              })
              deferred.reject(new Error('CONNECTION_ERROR'))
            }
          })
        } else {
          deferred.resolve(result.records)
        }
      }
    })

    return deferred.promise
  }

  this.placeOrder = function (body) {
    var conn        = this.connect(),
        deferred    = $q.defer(),
        requestBody = {
          method: "post",
          url: "/services/data/v32.0/commerce/sale/order",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(body)
        }

    conn.request(requestBody, function (err, result) {
      if (err) {
        console.log("Erro ao gravar pedido")
        console.log(err)

        deferred.reject({error: err})
      } else {
        deferred.resolve(result)
      }
    })

    return deferred.promise
  }

  this.updateOrder = function (body) {
    var conn        = this.connect(),
        deferred    = $q.defer()

    conn.apex.put("/UpdateOrder", body, function (err, result) {
      if (err) {
        console.log("Erro ao dar update")
        console.log(err)

        deferred.reject({error: err})
      } else {
        deferred.resolve({ records : [{ Id : body.order.Id }] })
      }
    })

    return deferred.promise
  }

  this.createOrUpdatePlanning = function (body) {
    var conn        = this.connect(),
        deferred    = $q.defer()

    conn.apex.put("/CreateOrUpdatePlanning", body, function (err, result) {
      if (err) {
        console.log("Erro ao criar ou atualizar")
        console.log(err)

        deferred.reject({error: err})
      } else {
        deferred.resolve({ records : [{ body : body }] })
      }
    })

    return deferred.promise
  }  

  this.finishPlanning = function (body) {
    var conn        = this.connect(),
        deferred    = $q.defer()

    conn.apex.put("/FinishPlanning", body, function (err, result) {
      if (err) {
        console.log("Erro ao criar ou atualizar")
        console.log(err)

        deferred.reject({error: err})
      } else {
        deferred.resolve({ records : [{ body : body }] })
      }
    })

    return deferred.promise
  }    

  this.getPicklist = function (options) {
    var picklist,
        deferred = $q.defer()

    this.connect().sobject(options.objectName).describe(function (err, meta) {
      picklist = (meta || {}).fields && _.map(_(meta.fields).filter({ name: options.field }).first().picklistValues, function (e) { return { 'label': e.label, 'value': e.value } })
      err ? deferred.reject(err) : deferred.resolve(picklist)
    })

    return deferred.promise
  }

  this.createCustomObject = function (objectName, body) {
    var deferred = $q.defer()

    this.connect().sobject(objectName).create(body, function (err, res) {
      err ? deferred.reject(err) : deferred.resolve(_.extend(body, { id: res.id }))
    })

    return deferred.promise
  }

  this.updateCustomObject = function (objectName, body) {
    var deferred = $q.defer()

    this.connect().sobject(objectName).update(body, function (err, res) {
      err ? deferred.reject(err) : deferred.resolve(_.extend(body, { id: res.id }))
    })

    return deferred.promise
  }  

  this.versionIsValid = function (version) {
    var conn     = this.connect(),
        deferred = $q.defer(),
        getPath  = "/services/apexrest/VersaoMobile?versao=" + version

    conn.apex.get(getPath, {}, function(err, res) {
      if (err) {
        deferred.reject({ error: err })
      } else {
        deferred.resolve({ sucesso : res.sucesso })
      }
    })

    return deferred.promise
  }

  this.loadOrderData = function (clientId, orderId) {
    var conn     = this.connect(),
        deferred = $q.defer(),
        getPath  = "/LoadOrderData?clientId=" + clientId +
          "&userId=" + AuthService.getUserData().user_id

    if (orderId) {
      getPath += "&orderId=" + orderId
    }

    conn.apex.get(getPath, {}, function(err, res) {
      if (err) {
        deferred.reject({ error: err })
      } else {
        deferred.resolve({ orderData: res })
      }
    })

    return deferred.promise
  }

  this.loadNewPlanningData = function () {
    var conn     = this.connect(),
        deferred = $q.defer(),
        getPath  = "/LoadNewPlanningData?userId=" + AuthService.getUserData().user_id

    conn.apex.get(getPath, {}, function(err, res) {
      if (err) {
        deferred.reject({ error: err })
      } else {
        deferred.resolve({ newPlanningData: res })
      }
    })

    return deferred.promise
  }  

  this.login = function (internal) {
    this.loginUrl = oauthUrl(internal)

    return AuthService.login(internal).then(function () {
      return AuthService.saveUserData().then(function (user) {

        var query = [
          'SELECT',
            'Id, Account.Name, ProfileName__c, codigo__c',
          'FROM',
            'User',
          'WHERE',
            "Id = '" + user.user_id + "'"
        ].join(' ')

        return this.loadData(query).then(function (userResults) {

          _.extend(user, {
            partner : _.get(userResults[0], 'Account.Name'),
            profile : _.get(userResults[0], 'ProfileName__c'),
            codigoVendedor : _.get(userResults[0], 'codigo__c')
          });

          AuthService.storeUserData(user);

          return $q.resolve();

        })

      }.bind(this))
    }.bind(this))
  }
}])
