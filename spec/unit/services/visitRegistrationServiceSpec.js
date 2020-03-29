describe("VisitRegistrationService", function () {
  var $q,
      SalesforceService,
      VisitRegistration,
      uiGmapGoogleMapApi,
      $cordovaGeolocation,
      VisitRegistrationService

  beforeEach(module('cartaFabril'))

  beforeEach(inject(function (_$q_, _$stateParams_, _SalesforceService_, _VisitRegistrationService_, _uiGmapGoogleMapApi_, _$cordovaGeolocation_, _VisitRegistration_) {
    $q = _$q_
    $stateParams = _$stateParams_
    SalesforceService = _SalesforceService_
    VisitRegistration = _VisitRegistration_
    uiGmapGoogleMapApi = _uiGmapGoogleMapApi_
    $cordovaGeolocation = _$cordovaGeolocation_
    VisitRegistrationService = _VisitRegistrationService_
  }))

  describe('#pageSize', function () {
    it("is the number of visit registrations to get per call", function () {
      expect(VisitRegistrationService.pageSize).toEqual(10)
    })
  })

  describe('#objectName', function () {
    it("is the salesforce's object name", function () {
      expect(VisitRegistrationService.objectName).toEqual('registroVisita__c')
    })
  })

  describe("#save", function () {
    var body

    beforeEach(function () {
      body = {
        category: {
          value: 'category'
        },
        clientId: 'cid',
        observations: 'observations'
      }
    })

    describe("when the id is passed", function () {
      var visitRegistrationId,
          promiseDouble

      beforeEach(function () {
        visitRegistrationId = 'vrid'
        _.extend(body, { id: visitRegistrationId })
        promiseDouble = jasmine.createSpy('Promise')

        spyOn($q, "resolve").and.callFake(function () {
          return promiseDouble
        })

        spyOn(SalesforceService, "createCustomObject")
      })

      it("doesn't call SalesforceService#createCustomObject", function () {
        VisitRegistrationService.save(body)
        expect(SalesforceService.createCustomObject).not.toHaveBeenCalled()
      })

      it("calls $q#resolve with the right params", function () {
        VisitRegistrationService.save(body)

        expect($q.resolve).toHaveBeenCalledWith({
          'id': visitRegistrationId,
          'contaId__c':   body.clientId,
          'obsVisita__c': body.observations,
          'Categoria__c': body.category.value
        })
      })

      it("returns the $q#resolve promise", function () {
        expect(VisitRegistrationService.save(body)).toEqual(promiseDouble)
      })
    })

    describe("when the id is not passed", function () {
      var promiseDouble

      beforeEach(function () {
        promiseDouble = jasmine.createSpy('Promise')
        spyOn(SalesforceService, "createCustomObject").and.callFake(function () {
          return promiseDouble
        })
      })

      it("calls Salesforce#createCustomObject with the right params", function () {
        VisitRegistrationService.save(body)

        expect(SalesforceService.createCustomObject).toHaveBeenCalledWith('registroVisita__c', {
          'contaId__c':   body.clientId,
          'obsVisita__c': body.observations,
          'Categoria__c': body.category.value
        })
      })

      it("returns the Salesforce#createCustomObject promise", function () {
        expect(VisitRegistrationService.save(body)).toEqual(promiseDouble)
      })
    })
  })

  describe("#upload", function () {
    var body, parentId, timestamp, promiseDouble

    beforeEach(function () {
      body = 'BLOB'
      parentId = 'pId'
      timestamp = '123'
      promiseDouble = jasmine.createSpy('Promise')

      spyOn(Date, 'now').and.callFake(function () {
        return timestamp
      })

      spyOn(SalesforceService, "createCustomObject").and.callFake(function () {
        return promiseDouble
      })
    })

    it("calls SalesforceService#createCustomObject with the right params", function () {
      VisitRegistrationService.upload(parentId, body)
      expect(SalesforceService.createCustomObject).toHaveBeenCalledWith('Attachment', {
        'Body':        body,
        'Name':        'img-' + timestamp,
        'ParentId':     parentId,
        'ContentType': 'image/jpeg'
      })
    })

    it("returns the SalesforceService#loadData promise", function () {
      expect(VisitRegistrationService.upload()).toEqual(promiseDouble)
    })
  })

  describe("#checkIn(clientId)", function () {
    var clientId  = 'cid',
        latitude  = 2,
        longitude = 2,
        locationObj,
        resultAddress,
        geocodeCallback,

        geocodeSpy,
        currentPositionSpy


    describe("when everything works", function () {
      beforeEach(function () {
        resultAddress = {
          formatted_address: 'formatted address'
        }

        locationObj = {
          location: {
            lat: latitude,
            lng: longitude
          }
        }

        geocodeSpy = jasmine.createSpy('Geocode').and.callFake(function (_, callback)  {
          geocodeCallback = callback

          callback(
            [resultAddress],
            'OK'
          )
        })

        var gmapsCatch = jasmine.createSpy('gmapsCatch')

        spyOn(uiGmapGoogleMapApi, 'then').and.callFake(function (callback) {
          var maps =  {
            Geocoder: function () {
              return {
                geocode: geocodeSpy
              }
            }
          }

          callback(maps)

          return { catch: gmapsCatch }
        })

        var cordovaGeoCatch = jasmine.createSpy('cordovaGeoCatch')

        var thenSpy = jasmine.createSpy('then').and.callFake(function (callback) {
          callback({
            coords: {
              latitude: latitude,
              longitude: longitude
            }
          })

          return { catch: cordovaGeoCatch }
        })

        currentPositionSpy = spyOn($cordovaGeolocation, 'getCurrentPosition').and.returnValue({ then: thenSpy })

        window.google = { maps: { GeocoderStatus: { OK: 'OK' } } }
      })

      it("calls $cordovaGeolocation#getCurrentPosition with the right params", function () {
        var catchSpy = jasmine.createSpy('catch')

        var thenSpy = jasmine.createSpy('then').and.callFake(function(callback) {
          callback()
          return { catch: catchSpy }
        })

        spyOn(VisitRegistrationService, 'save').and.returnValue({ then: thenSpy })

        VisitRegistrationService.checkIn(clientId)
        expect(currentPositionSpy).toHaveBeenCalledWith({ timeout: 5000 })
      })

      it("calls Geocoder.geocode with the right params", function () {
        var catchSpy = jasmine.createSpy('catch')

        var thenSpy = jasmine.createSpy('then').and.callFake(function(callback) {
          callback()
          return { catch: catchSpy }
        })

        spyOn(VisitRegistrationService, 'save').and.returnValue({ then: thenSpy })

        VisitRegistrationService.checkIn(clientId)
        expect(geocodeSpy).toHaveBeenCalledWith(locationObj, geocodeCallback)
      })

      it("calls VisitRegistrationService#save with the right params", function () {
        var catchSpy = jasmine.createSpy('catch')

        var thenSpy = jasmine.createSpy('then').and.callFake(function(callback) {
          callback()
          return { catch: catchSpy }
        })

        spyOn(VisitRegistrationService, 'save').and.returnValue({ then: thenSpy })
        VisitRegistrationService.checkIn(clientId)

        expect(VisitRegistrationService.save).toHaveBeenCalledWith({
          clientId: clientId,
          category: { value: VisitRegistrationService.checkInCategory },
          observations: 'proximo à ' + resultAddress.formatted_address
        })
      })

      it("resolves the promise", function () {
        var catchSpy = jasmine.createSpy('catch')

        var thenSpy = jasmine.createSpy('then').and.callFake(function(callback) {
          callback()
          return { catch: catchSpy }
        })

        spyOn(VisitRegistrationService, 'save').and.returnValue({ then: thenSpy })

        var resolveSpy = jasmine.createSpy('resolve')

        spyOn($q, 'defer').and.returnValue({ resolve: resolveSpy })

        VisitRegistrationService.checkIn(clientId)
        expect(resolveSpy).toHaveBeenCalled()
      })
    })
  })

  describe("#loadList", function () {
    var clientId = 'cid',
        attributes

    beforeEach(function () {
      attributes = [
        { id: 'id1' },
        { id: 'id2' },
        { id: 'id3' }
      ]

      var thenSpy = jasmine.createSpy('thenSpy').and.callFake(function (callback) {
        callback(attributes)
      })

      spyOn(SalesforceService, 'loadData').and.returnValue({ then: thenSpy })
    })

    it("calls SalesforceSerive#loadData with the right params", function () {
      VisitRegistrationService.loadList(clientId)
      expect(SalesforceService.loadData).toHaveBeenCalledWith("SELECT Name, obsVisita__c, Categoria__c, CreatedDate FROM registroVisita__c WHERE contaId__c = '" + clientId + "' ORDER BY CreatedDate desc LIMIT 11")
    })

    it("calls $q#resolve with an object with an array of VisitRegistrations and a flag indicating if it is the last page", function () {
      var resolveSpy = spyOn($q, 'resolve')

      VisitRegistrationService.loadList(clientId)

      expect(resolveSpy).toHaveBeenCalledWith({
        results : [
          new VisitRegistration(attributes[0]),
          new VisitRegistration(attributes[1]),
          new VisitRegistration(attributes[2])
        ],
        isLastPage: true
      })
    })
  })

  describe("#loadPage", function () {
    var clientId = 'cid',
        attributes

    beforeEach(function () {
      attributes = [
        { id: 'id01' },
        { id: 'id02' },
        { id: 'id03' },
        { id: 'id04' },
        { id: 'id05' },
        { id: 'id06' },
        { id: 'id07' },
        { id: 'id08' },
        { id: 'id09' },
        { id: 'id10' },
        { id: 'id11' },
        { id: 'id12' },
        { id: 'id13' },
        { id: 'id14' },
        { id: 'id15' },
        { id: 'id16' },
        { id: 'id17' },
        { id: 'id18' },
        { id: 'id19' },
        { id: 'id20' },
        { id: 'id21' }
      ]

    })

    it("for the page 1 calls SalesforceSerive#loadData with the right params", function () {

      var thenSpy = jasmine.createSpy('thenSpy').and.callFake(function (callback) {
        callback(attributes.slice(0, 11))
      })

      spyOn(SalesforceService, 'loadData').and.returnValue({ then: thenSpy })

      VisitRegistrationService.loadPage(clientId, 1)
      expect(SalesforceService.loadData).toHaveBeenCalledWith("SELECT Name, obsVisita__c, Categoria__c, CreatedDate FROM registroVisita__c WHERE contaId__c = '" + clientId + "' ORDER BY CreatedDate desc LIMIT 11")
    })

    it("for the page 2 calls SalesforceSerive#loadData with the right params", function () {

      var thenSpy = jasmine.createSpy('thenSpy').and.callFake(function (callback) {
        callback(attributes.slice(19, 21))
      })

      spyOn(SalesforceService, 'loadData').and.returnValue({ then: thenSpy })

      VisitRegistrationService.loadPage(clientId, 2)
      expect(SalesforceService.loadData).toHaveBeenCalledWith("SELECT Name, obsVisita__c, Categoria__c, CreatedDate FROM registroVisita__c WHERE contaId__c = '" + clientId + "' ORDER BY CreatedDate desc LIMIT 11 OFFSET 10")
    })

    it("for the page 1 calls $q#resolve with an object with an array of VisitRegistrations and a flag indicating if it is the last page", function () {
      var resolveSpy = spyOn($q, 'resolve')

      var thenSpy = jasmine.createSpy('thenSpy').and.callFake(function (callback) {
        callback(attributes.slice(0, 11))
      })

      spyOn(SalesforceService, 'loadData').and.returnValue({ then: thenSpy })

      VisitRegistrationService.loadPage(clientId, 1)

      expect(resolveSpy).toHaveBeenCalledWith({
        results : [
          VisitRegistration(attributes[0]),
          VisitRegistration(attributes[1]),
          VisitRegistration(attributes[2]),
          VisitRegistration(attributes[3]),
          VisitRegistration(attributes[4]),
          VisitRegistration(attributes[5]),
          VisitRegistration(attributes[6]),
          VisitRegistration(attributes[7]),
          VisitRegistration(attributes[8]),
          VisitRegistration(attributes[9])
        ],
        isLastPage: false
      })
    })

    it("for the page 3 calls $q#resolve with an object with an array of VisitRegistrations and a flag indicating if it is the last page", function () {
      var resolveSpy = spyOn($q, 'resolve')

      var thenSpy = jasmine.createSpy('thenSpy').and.callFake(function (callback) {
        callback(attributes.slice(20, 21))
      })

      spyOn(SalesforceService, 'loadData').and.returnValue({ then: thenSpy })

      VisitRegistrationService.loadPage(clientId, 3)

      expect(resolveSpy).toHaveBeenCalledWith({
        results : [
          VisitRegistration(attributes[20])
        ],
        isLastPage: true
      })
    })

  })

  describe("#lastCheckin", function () {
    var clientId = 'cid',
        attributes

    beforeEach(function () {
      attributes = [
        { id: 'id1' }
      ]

      var thenSpy = jasmine.createSpy('thenSpy').and.callFake(function (callback) {
        callback([attributes[0]])
      })

      spyOn(SalesforceService, 'loadData').and.returnValue({ then: thenSpy })
    })

    it("calls SalesforceService#loadData with the right params", function () {
      VisitRegistrationService.lastCheckin(clientId)
      expect(SalesforceService.loadData).toHaveBeenCalledWith("SELECT Name, obsVisita__c, Categoria__c, CreatedDate FROM registroVisita__c WHERE contaId__c = '" + clientId +  "' AND Categoria__c = 'Check In' ORDER BY CreatedDate desc LIMIT 1")
    })

    it("calls $q#resolve with an array of VisitRegistrations", function () {
      var resolveSpy = spyOn($q, 'resolve')

      VisitRegistrationService.lastCheckin(clientId)

      expect(resolveSpy).toHaveBeenCalledWith({
        results : [
          VisitRegistration(attributes[0])
        ],
        isLastPage : false
      })
    })
  })

  describe("#getCategories", function () {
    beforeEach(function () {
      spyOn(SalesforceService, 'getPicklist')
    })

    it("calls SalesforceService#getPicklist with the right params", function () {
      VisitRegistrationService.getCategories()
      expect(SalesforceService.getPicklist).toHaveBeenCalledWith({
        field: 'Categoria__c',
        objectName: 'registroVisita__c'
      })
    })
  })
})
