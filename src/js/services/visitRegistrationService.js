cartaFabrilServices.service('VisitRegistrationService', ['$q', '$ionicPopup', '$injector', 'uiGmapGoogleMapApi', 'SalesforceService', 'VisitRegistration', 'SalesforceModelUtils', 'appTarget',
  function VisitRegistrationService($q, $ionicPopup, $injector, uiGmapGoogleMapApi, SalesforceService, VisitRegistration, SalesforceModelUtils, appTarget) {

  this.pageSize = 10
  this.objectName = 'registroVisita__c'
  this.model = VisitRegistration

  this.checkInCategory = 'Check In'

  this.save = function (body) {
    var sfBody = {
      contaId__c:   body.clientId,
      obsVisita__c: body.observations,
      Categoria__c: (body.category || {}).value
    }

    if (body.id) { return $q.resolve(_.extend(sfBody, { id: body.id })) }

    return SalesforceService.createCustomObject(this.objectName, sfBody)
  }

  this.upload = function (parentId, body) {
    var sfBody = {
      Body:        body,
      Name:        'img-' + Date.now(),
      ParentId:    parentId,
      ContentType: 'image/jpeg'
    }

    return SalesforceService.createCustomObject('Attachment', sfBody)
  }

  this.checkIn = function (clientId) {
    if (appTarget != 'mobile') { return }

    var self = this,
        deferred = $q.defer()

    uiGmapGoogleMapApi.then(function(maps) {
      var geocoder = new maps.Geocoder()

      $injector.get('$cordovaGeolocation').getCurrentPosition({ timeout: 5000 }).then(function (position) {
        geocoder.geocode({ location: { lat: position.coords.latitude, lng: position.coords.longitude } }, function (results, status) {
          var attributes = {
            clientId: clientId,
            category: { value: self.checkInCategory },
            observations: 'proximo à ' + results[0].formatted_address
          }

          if (status === google.maps.GeocoderStatus.OK) {
            self.save(attributes).then(function () {
               deferred.resolve(attributes)
            }).catch(function () {
              deferred.reject(true)
            })
          } else {
            deferred.reject(true)
          }
        })
      }).catch(function () {
        $ionicPopup.alert({
          title: 'Erro ao fazer Check In',
          template: 'Habilite o GPS do dispositivo e tente novamente.'
        })
        deferred.reject(false)
      })
    }).catch(function () {
      deferred.reject(true)
    })

    return deferred.promise
  }

  this.buildListQuery = function buildListQuery(filterParams) {
    return [
      "SELECT",
        "Name, obsVisita__c, Categoria__c, CreatedDate",
      "FROM " + this.objectName,
      "WHERE contaId__c = '" + filterParams.clientId + "'",
        (filterParams.isLastCheckin ? "AND Categoria__c = '" + this.checkInCategory + "'" : ""),
        (filterParams.startDate ? "AND DataDaVisita__c >= " + filterParams.startDate.toISOString().substring(0,10) : ""),
        (filterParams.endDate ? "AND DataDaVisita__c < " + filterParams.endDate.toISOString().substring(0,10) : "AND DataDaVisita__c <= " + new Date().toISOString().substring(0,10)),
      "ORDER BY CreatedDate desc"
    ].filter(function (str) { return str.length }).join(" ").trim();
  }

  this.loadList = SalesforceModelUtils.loadList.bind(this);
  this.loadPage = SalesforceModelUtils.loadPage.bind(this);

  this.lastCheckin = function (clientId) {
    return SalesforceModelUtils.executeQuery.call(this, this.buildListQuery({ clientId: clientId, isLastCheckin: true }))
  }

  this.getCategories = function () {
    return SalesforceService.getPicklist({ objectName: this.objectName, field: 'Categoria__c' })
  }
}])

cartaFabrilFactories.factory('VisitRegistration', ['ProxyDecorator',  function (ProxyDecorator) {
  return ProxyDecorator(function VisitRegistration(attributes) {
    this.id           = attributes.Name
    this.category     = attributes.Categoria__c
    this.observations = attributes.obsVisita__c
    this.createdDate  = attributes.CreatedDate || Date.now()
  })
}])
