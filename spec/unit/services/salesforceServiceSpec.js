describe("SalesforceService", function () {
  var jsforceTest, $q, AuthService, SalesforceService

  beforeEach(module('cartaFabril'))

  beforeEach(inject(function (_$q_, _AuthService_, _SalesforceService_) {
    $q                = _$q_
    AuthService       = _AuthService_
    SalesforceService = _SalesforceService_
  }))

  describe("#connect", function () {
    describe("when connecting to salesforce org", function () {
      var authData = { instance_url: "someUrl", access_token: "someToken", refresh_token: "someRefresh", id: 'someId' },
        conn       = { on : function () {} },
        spyConn

      beforeEach(function () {
        jsforceTest = jsforce

        spyOn(jsforceTest, "Connection").and.returnValue(conn)
        spyOn(AuthService, "getAuthData").and.returnValue(authData)
      })

      it("calls authService to load auth data", function () {
        SalesforceService.connect()
        expect(AuthService.getAuthData).toHaveBeenCalled()
      })

      it("connects to salesforce with params", function () {
        SalesforceService.connect()
        expect(jsforceTest.Connection).toHaveBeenCalledWith({
          instanceUrl: authData.instance_url,
          accessToken: authData.access_token,
          refreshToken: authData.refresh_token,
          oauth2 : {
            clientId: '@@sfClientId',
            clientSecret: '@@sfClientSecret',
            redirectUri: '@@sfRedirectUri',
            loginUrl: '@@sfPartnerOauthUrl'
          }
        })
      })

      it("connects to salesforce with correct oauth loginUrl", function () {
        authData.id = 'testOrLogin.salesforce.com'
        SalesforceService.connect()
        expect(jsforceTest.Connection).toHaveBeenCalledWith({
          instanceUrl: authData.instance_url,
          accessToken: authData.access_token,
          refreshToken: authData.refresh_token,
          oauth2 : {
            clientId: '@@sfClientId',
            clientSecret: '@@sfClientSecret',
            redirectUri: '@@sfRedirectUri',
            loginUrl: '@@sfOauthUrl'
          }
        })
      })
    })
  })

  describe("#loadData(query)", function () {
    var query = "select Id from Account",
        conn  = {
          query: function (query, callback) {} ,
          logout: function (callback) {},
          on: function (){}
        },
        spyConn

    beforeEach(function () {
      spyOn(SalesforceService, "connect").and.returnValue(conn)
    })

    it("connects to salesforce organization", function () {
      SalesforceService.loadData(query)
      expect(SalesforceService.connect).toHaveBeenCalled()
    })

    it("executes connection query", function () {
      spyConn = spyOn(conn, "query")
      SalesforceService.loadData(query)
      expect(spyConn).toHaveBeenCalledWith(query, jasmine.any(Function))
    })

    // it("disconnects from salesforce organization", function () {
    //   spyConn = spyOn(conn, "logout")
    //   SalesforceService.loadData(query)
    //   expect(spyConn).toHaveBeenCalled()
    // })

    describe("when query has been executed successfully", function () {
      conn = {
        query: function (query, callback) {
          callback(false, { ok: "ok", records: records })
        },
        logout: function (callback) {},
        on: function (){}
      }

      var records = { foo: "bar" },
          resolved,
          deferred = {
            resolve: function (object) {},
            reject: function (object) {},
            promise: records
          }

      beforeEach(function () {
        spyOn($q, "defer").and.returnValue(deferred)
        resolved = spyOn(deferred, "resolve")
      })

      it("resolves and returns promise with records", function () {
        var returned = SalesforceService.loadData(query)
        expect(resolved).toHaveBeenCalledWith(records)
        expect(returned).toEqual(deferred.promise)
      })
    })

    describe("when query has not been executed successfully", function () {
      var records = { foo: "bar" },
          authMock = {
            refreshToken: function () { return authMock },
            then: function () { return authMock }
          }

      errConn = {
        query: function (query, callback) {
          callback(true, records)
        },
        logout: function (callback) {}
      }

      beforeEach(function () {
        SalesforceService.connect.and.returnValue(errConn) //reseting spy

        spyOn(AuthService, "refreshToken").and.returnValue(authMock)
      })

      xit("refreshes auth token", function () {
        SalesforceService.loadData(query)
        expect(AuthService.refreshToken()).toHaveBeenCalled()
      })
    })
  })

  describe("#placeOrder(body)", function () {
    var body = { body: "something" }
        conn = { request: function (params, callback) {}, on : function (){} }

    beforeEach(function () {
      spyOn(SalesforceService, "connect").and.returnValue(conn)
    })

    it("connects to salesforce organization", function () {
      SalesforceService.placeOrder(body)
      expect(SalesforceService.connect).toHaveBeenCalled()
    })

    it("executes request to place order", function () {
      spyConn = spyOn(conn, "request")
      SalesforceService.placeOrder(body)
      expect(spyConn).toHaveBeenCalled()
    })
  })

  describe("#getPicklist(options)", function () {
    var err,
        meta,
        conn,
        sobject,
        options = {
          field: "field",
          objectName: "objectName"
        }

    beforeEach(function () {
      conn = {on : function (){}}
      sobject = {}

      sObjectFn = jasmine.createSpy('sobjectFn')
      sDescribeFn = jasmine.createSpy('describeFn')

      conn.sobject = sObjectFn.and.returnValue(sobject)
      sobject.describe = sDescribeFn.and.callFake(function (callback) {
        callback(err, meta)
      })

      spyOn(SalesforceService, 'connect').and.returnValue(conn)
    })

    it("connects to salesforce organization", function () {
      SalesforceService.getPicklist(options)
      expect(SalesforceService.connect).toHaveBeenCalled()
    })

    it("calls SalesforceService#sobject with the right params", function () {
      SalesforceService.getPicklist(options)
      expect(sObjectFn).toHaveBeenCalledWith(options.objectName)
    })

    it("calls SalesforceService#describe with the right params", function () {
      SalesforceService.getPicklist(options)
      expect(sDescribeFn).toHaveBeenCalled()
    })

    describe("when the describe callback is called without error", function () {
      var deferredSpy

      beforeEach(function () {
        meta = {
          fields: [
            { name: 'foo' },
            { name: 'bar' },
            {
              name: options.field,
              picklistValues: [
                {
                  foo: 'bar',
                  label: 'label1',
                  value: 'value1'

                },
                {
                  foo: 'bar',
                  label: 'label2',
                  value: 'value2'
                }
              ]
            }
          ]
        }
        rejectSpy = jasmine.createSpy('reject')
        resolveSpy = jasmine.createSpy('resolve')

        spyOn($q, 'defer').and.returnValue({ reject: rejectSpy, resolve: resolveSpy })
      })

      it("resolves the promise with the picklist", function () {
        SalesforceService.getPicklist(options)
        expect(resolveSpy).toHaveBeenCalledWith([
          { label: 'label1', value: 'value1' },
          { label: 'label2', value: 'value2' }
        ])
      })

      it("doesn't reject the promise", function () {
        SalesforceService.getPicklist(options)
        expect(rejectSpy).not.toHaveBeenCalled()
      })
    })

    describe("when the describe callback is called with error", function () {
      var deferredSpy

      beforeEach(function () {
        err = 'something'
        rejectSpy = jasmine.createSpy('reject')
        resolveSpy = jasmine.createSpy('resolve')

        spyOn($q, 'defer').and.returnValue({ reject: rejectSpy, resolve: resolveSpy })
      })

      it("rejects the promise", function () {
        SalesforceService.getPicklist(options)
        expect(rejectSpy).toHaveBeenCalledWith(err)
      })

      it("doesn't resolve the promise", function () {
        SalesforceService.getPicklist(options)
        expect(resolveSpy).not.toHaveBeenCalled()
      })
    })
  })

  describe("#createCustomObject(options)", function () {
    var err,
        res,
        conn,
        sobject,

        createdId,

        body = {
          field1: "value1",
          field2: "value2"
        },
        objectName = 'customObject__c'

    beforeEach(function () {
      conn = {on : function (){}}
      sobject = {}

      createdId = 'cid'

      sObjectFn = jasmine.createSpy('sobjectFn')
      createFn  = jasmine.createSpy('createFn')

      conn.sobject = sObjectFn.and.returnValue(sobject)
      sobject.create = createFn.and.callFake(function (body, callback) {
        callback(err, { id: createdId })
      })

      spyOn(SalesforceService, 'connect').and.returnValue(conn)
    })

    it("connects to salesforce organization", function () {
      SalesforceService.createCustomObject(objectName, body)
      expect(SalesforceService.connect).toHaveBeenCalled()
    })

    it("calls SalesforceService#sobject with the right params", function () {
      SalesforceService.createCustomObject(objectName, body)
      expect(sObjectFn).toHaveBeenCalledWith(objectName)
    })

    it("calls SalesforceService#describe with the right params", function () {
      SalesforceService.createCustomObject(objectName, body)
      expect(createFn).toHaveBeenCalled()
    })

    describe("when the describe callback is called without error", function () {
      var deferredSpy

      beforeEach(function () {
        rejectSpy = jasmine.createSpy('reject')
        resolveSpy = jasmine.createSpy('resolve')

        spyOn($q, 'defer').and.returnValue({ reject: rejectSpy, resolve: resolveSpy })
      })

      it("resolves the promise with the picklist", function () {
        SalesforceService.createCustomObject(objectName, body)
        expect(resolveSpy).toHaveBeenCalledWith(_.extend(body, { id: createdId }))
      })

      it("doesn't reject the promise", function () {
        SalesforceService.createCustomObject(objectName, body)
        expect(rejectSpy).not.toHaveBeenCalled()
      })
    })

    describe("when the describe callback is called with error", function () {
      var deferredSpy

      beforeEach(function () {
        err = 'something'
        rejectSpy = jasmine.createSpy('reject')
        resolveSpy = jasmine.createSpy('resolve')

        spyOn($q, 'defer').and.returnValue({ reject: rejectSpy, resolve: resolveSpy })
      })

      it("rejects the promise", function () {
        SalesforceService.createCustomObject(objectName, body)
        expect(rejectSpy).toHaveBeenCalledWith(err)
      })

      it("doesn't resolve the promise", function () {
        SalesforceService.createCustomObject(objectName, body)
        expect(resolveSpy).not.toHaveBeenCalled()
      })
    })
  })


  describe("#login", function () {

    var user = {user_type : 'WHATEVER', user_id : 'ua1'};
    var loadDataResponse = { Account : { Name : 'FOO_BAR' }, Profile : { Name : 'Vendedor' } }

    beforeEach(function() {

      var loginThenSpy = jasmine.createSpy('loginThenSpy').and.callFake(function (callback) {
        callback()
      })

      spyOn(AuthService, 'login').and.returnValue({ then: loginThenSpy })


      var loadDataThenSpy = jasmine.createSpy('loadDataThenSpy').and.callFake(function (callback) {
        callback([loadDataResponse])
      })

      spyOn(SalesforceService, 'loadData').and.returnValue({ then: loadDataThenSpy })


      var saveUserDataThenSpy = jasmine.createSpy('saveUserDataThenSpy').and.callFake(function (callback) {
        callback(user)
      })

      spyOn(AuthService, 'saveUserData').and.returnValue({ then: saveUserDataThenSpy })


    })

    it("calls AuthService#login with same params", function() {

      var internal = true;

      SalesforceService.login(internal);

      expect(AuthService.login).toHaveBeenCalledWith(internal)

    })

    it("calls AuthService#saveUserData", function() {

      SalesforceService.login(true)

      expect(AuthService.saveUserData).toHaveBeenCalled()

    })

    describe("when the user is not a POWER_PARTNER and a Vendedor", function () {

      beforeEach(function() {

        spyOn(AuthService, 'getUserData').and.returnValue({ profile : 'Vendedor' })

      })

      it("don't calls SalesforceService#loadData", function () {

        SalesforceService.login(true)

        expect(SalesforceService.loadData).toHaveBeenCalledWith("SELECT Id, Account.Name, Profile.Name FROM User WHERE Id = 'ua1'")

      })

    })

    describe("when the user is a POWER_PARTNER", function() {

      beforeEach(function() {

        user.user_type = 'POWER_PARTNER'
        spyOn(AuthService, 'getUserData').and.returnValue({ profile : 'Representante' })

        loadDataResponse.Profile.Name = 'Representante'

      })

      it("calls SalesforceService#loadData with the right params", function () {

        SalesforceService.login(false)

        expect(SalesforceService.loadData).toHaveBeenCalledWith("SELECT Id, Account.Name, Profile.Name FROM User WHERE Id = 'ua1'")

      })

      it("calls AuthService#storeUserData with the right params", function () {

        spyOn(AuthService, 'storeUserData')

        SalesforceService.login(false)

        expect(AuthService.storeUserData).toHaveBeenCalledWith({user_type : 'POWER_PARTNER', user_id : 'ua1', partner : 'FOO_BAR', profile : 'Representante'})

      })

    })

  })
})
