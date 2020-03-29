describe("ClientsService", function () {
  var jsforceTest, $q, AuthService, ClientsService

  beforeEach(module('cartaFabril'))

  beforeEach(inject(function (_$q_, _AuthService_, _ClientsService_) {
    $q             = _$q_
    AuthService    = _AuthService_
    ClientsService = _ClientsService_
  }))
})