describe("ClientShowController", function () {
  var clientShowController, $q, $controller, $rootScope, $scope, $ionicModal, $ionicPopover, $state, ClientsService, uiGmapGoogleMapApi, ContactService, VisitRegistrationService, lastCheckin

  beforeEach(module('cartaFabril'))

  beforeEach(inject(function (_$q_, _$rootScope_, _$controller_, _$ionicModal_, _$ionicPopover_, _$state_, _ClientsService_, _uiGmapGoogleMapApi_, _ContactService_, _VisitRegistrationService_) {
    $q             = _$q_
    $controller    = _$controller_
    $rootScope     = _$rootScope_
    $ionicModal    = _$ionicModal_
    $ionicPopover  = _$ionicPopover_
    $state         = _$state_
    ClientsService = _ClientsService_
    uiGmapGoogleMapApi = _uiGmapGoogleMapApi_
    ContactService = _ContactService_
    VisitRegistrationService =_VisitRegistrationService_

    spyOn(ClientsService, "loadClient").and.returnValue($q.when({ nomeFantasia__c: "Test" }))
    spyOn(ContactService, "loadList").and.returnValue($q.when([{}]))
    spyOn(VisitRegistrationService, "lastCheckin").and.returnValue($q.when({results:[{}]}))

    $scope               = $rootScope.$new()
    clientShowController = $controller('ClientShowController', { $scope: $scope, $rootScope: $rootScope, devolutions: {results:[{}], isLastPage:true}, delinquencies: {results:[{}], isLastPage:true}, lastCheckin: {results : [{}]} })
  }))

  it("have a controller", function () {
    expect(clientShowController).toBeDefined()
  })

  it("have a route to clients", function () {
    expect($state.href('client', { 'clientId': '999' })).toEqual('#/client/999')
  })

  describe("with configured route", function () {
    var state

    beforeEach(function () {
      state = $state.get('client')
    })

    it("have an url", function () {
      expect(state.url).toEqual('/client/:clientId')
    })

    it("have a template", function () {
      expect(state.templateUrl).toEqual('templates/client.html')
    })

    it("have a controller", function () {
      expect(state.controller).toEqual('ClientShowController')
    })
  })

  describe("#cannotOrder", function () {
    var client = { Id: "123", naoPodeFazerPedido__c : false }

    beforeEach(function () {
      $scope.client = client
    })

    describe("when the client has field 'naoPodeFazerPedido__c' equal 'false'", function () {
      it("returns false", function () {
        expect($scope.cannotOrder()).toBeFalsy()
      })
    })

    describe("when the client has field 'naoPodeFazerPedido__c' equal 'true'", function () {
      beforeEach(function () {
        client.naoPodeFazerPedido__c = true
      })

      it("returns true", function () {
        expect($scope.cannotOrder()).toBeTruthy()
      })
    })
  })

  describe("#newOrder", function () {
    var clientId = "123456"

    describe("when client can order", function () {
      var stateGoSpy

      beforeEach(function () {
        stateGoSpy = spyOn($state, "go")
        spyOn($scope, "cannotOrder").and.returnValue(false)
      })

      it("go to new order page", function () {
        $scope.newOrder(clientId)
        expect(stateGoSpy).toHaveBeenCalledWith("new_order.conditions", { clientId: clientId })
      })
    })

    describe("when client cannot order", function () {
      beforeEach(function () {
        spyOn($scope, "cannotOrder").and.returnValue(true)
        spyOn($scope, "openBlockWarning")
      })

      it("calls method to display warning", function () {
        $scope.newOrder(clientId)
        expect($scope.openBlockWarning).toHaveBeenCalled()
      })
    })
  })

  describe("#openBlockWarning", function () {
    var modal = { show: function () {} }

    beforeEach(function () {
      $scope.modal = modal
    })

    it("open modal", function () {
      var spy = spyOn(modal, "show")

      $scope.openBlockWarning()
      expect(spy).toHaveBeenCalled()
    })
  })

  describe("#dismissWarning", function () {
    var modal = { hide: function () {} }

    beforeEach(function () {
      $scope.modal = modal
    })

    it("hides modal", function () {
      var spy = spyOn(modal, "hide")

      $scope.dismissWarning()
      expect(spy).toHaveBeenCalled()
    })
  })
})
