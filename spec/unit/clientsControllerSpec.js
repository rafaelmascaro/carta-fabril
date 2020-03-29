describe("ClientsController", function () {
  var clientsController, $q, $controller, $rootScope, $scope, $state, ClientsService

  beforeEach(module('cartaFabril'))

  beforeEach(inject(function (_$q_, _$rootScope_, _$controller_, _$state_, _ClientsService_) {
    $controller    = _$controller_
    $q             = _$q_
    $rootScope     = _$rootScope_
    $state         = _$state_
    ClientsService = _ClientsService_

    $scope            = $rootScope.$new()
    clientsController = $controller('ClientsController', { $scope: $scope, $rootScope: $rootScope, clients: [{ nomeFantasia__c: "Test" }] })
  }))

  it("have a controller", function () {
    expect(clientsController).toBeDefined()
  })

  it("have a route to clients", function () {
    expect($state.href('clients')).toEqual('#/clients')
  })

  describe("with configured route", function () {
    var state

    beforeEach(function () {
      state = $state.get('clients')
    })

    it("have an url", function () {
      expect(state.url).toEqual('/clients')
    })

    it("have a template", function () {
      expect(state.templateUrl).toEqual('templates/clients.html')
    })

    it("have a controller", function () {
      expect(state.controller).toEqual('ClientsController')
    })
  })

  describe("#clearQuery", function () {
    var term = "term"

    beforeEach(function () {
      $scope.query.term = term
    })

    it("clears the term from filter", function () {
      expect($scope.query.term).toEqual(term)

      $scope.clearQuery()

      expect($scope.query.term).toEqual("")
    })
  })

  describe("#goToClient", function () {
    var stateGoSpy,
        clientId = "123456"

    beforeEach(function () {
      stateGoSpy = spyOn($state, 'go')
    })

    it("calls state to go to client page", function () {
      $scope.goToClient(clientId)
      expect(stateGoSpy).toHaveBeenCalledWith("client.overview", { clientId: clientId })
    })
  })
})
