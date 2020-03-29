cartaFabrilServices.service('VisitPlanningService', ['$q','$ionicPopup', 'SalesforceService', '$injector', 'uiGmapGoogleMapApi', 'AuthService', 'ClientsService','appTarget',
function VisitPlanningService($q, $ionicPopup,SalesforceService, $injector, uiGmapGoogleMapApi, AuthService, ClientsService, appTarget) {

  var self = this
  self.objectName = 'registroVisita__c'  
  self.checkInCategory = 'Check In'

  function convertToDate(txtDate) {
    var arrDt = txtDate.split("-")
    return new Date(arrDt[0],arrDt[1] - 1,arrDt[2])
  }

  function addDays(date, days) {
    var result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  }

  this.loadPlanning = function () {

    PlanningView = function() {
      this.IdVendedor = ""
      this.NomeDoVendedor = ""
      this.DataDaVisita = ""
      this.QuantidadeClientes = 0
      this.VisitasRealizadas = 0
      this.VisitasNaoRealizadas = 0
      this.VisitasNaoPlanejadas = 0
    }

    JustifyView = function() {
      this.Id = ""
      this.NomeDoVendedor = ""
      this.DataDaVisita = ""
      this.NomeDoCliente = ""
      this.CodCliente = ""
      this.TipoVisita = ""
      this.JustificativaFaltaVisita__c = ""
      this.MotivoDaFaltaDaVisita__c = ""
      //this.MotivoDaFaltaDaVisita__c = "Cliente não visitado"
      
    }    

    DataReturn = function() {
      this.List = new Array()
      this.Justifications = new Array()
      this.PicklistMotivosJust = new Array()
    }

    var queryList = "SELECT contaId__r.vendedorRepresentante__c IdVendedor, " +
                "contaId__r.vendedorRepresentante__r.FirstName , " +
                "contaId__r.vendedorRepresentante__r.LastName, DataDaVisita__c, " +
                "IndicadorVisitaRealizada__c, IndicadorDeVisitaPlanejada__c, " +
                "Count(Id) TotalClientes " +
                "FROM registroVisita__c " +
                "Where DataDaVisita__c <> null And (DataDaVisita__c = LAST_N_MONTHS:3 " +
                "OR DataDaVisita__c >= YESTERDAY) And IndicadorSistemaPlanejamento__c = true " +
                "Group By contaId__r.vendedorRepresentante__c, " +
                "contaId__r.vendedorRepresentante__r.FirstName, " + 
                "contaId__r.vendedorRepresentante__r.LastName, " +
                "DataDaVisita__c, " +
                "IndicadorVisitaRealizada__c, " +
                "IndicadorDeVisitaPlanejada__c " +
                "ORDER BY DataDaVisita__c desc, " + 
                "contaId__r.vendedorRepresentante__c";

    var queryJustify = "SELECT Id, contaId__r.vendedorRepresentante__r.FirstName , " +
                "contaId__r.vendedorRepresentante__r.LastName, DataDaVisita__c, " +
                "contaId__r.Name, codigoCliente__c, " +
                "TipoDaVisita__c, contaId__r.tipoCadastro__c " +
                "FROM registroVisita__c " +
                "Where DataDaVisita__c <> null " +
                "And DataDaVisita__c < TODAY " +
                "And IndicadorVisitaRealizada__c = false " +
                "And IndicadorVisitaJustificada__c = false " + 
                "And IndicadorSistemaPlanejamento__c = true " +
                "And contaId__r.vendedorRepresentante__c = '" + AuthService.getUserData().user_id + "'" ;           

    var groupByDate = function(ret) {
      return _.groupBy(ret, function (plan) { return plan.DataDaVisita__c + plan.IdVendedor });
    }                

    var retur = new DataReturn();    

    return SalesforceService.loadNewPlanningData().then(function(res){
              self.newPlanningData = res.newPlanningData
              return SalesforceService.loadData(queryList)
          }).then(groupByDate).then(function (ret){

      var result = new Array();

      _.each(ret, function (r) {
        var doc = new PlanningView(); 

        doc.IdVendedor = _.first(r).IdVendedor
        doc.NomeDoVendedor = _.first(r).FirstName + " "+ _.first(r).LastName; 
        doc.DataDaVisita = _.first(r).DataDaVisita__c;
        doc.QuantidadeClientes = r.reduce((s, f) => { return f.TotalClientes + s; }, 0);
        doc.VisitasRealizadas = r.reduce((s, f) => { return f.IndicadorVisitaRealizada__c ? f.TotalClientes + s : s; }, 0);
        doc.VisitasNaoRealizadas = r.reduce((s, f) => { return !f.IndicadorVisitaRealizada__c && convertToDate(doc.DataDaVisita) < new Date() ? f.TotalClientes + s : s; }, 0);
        doc.VisitasNaoPlanejadas = r.reduce((s, f) => { return !f.IndicadorDeVisitaPlanejada__c ? f.TotalClientes + s : s; }, 0);

        result.push(doc);
      });

      return result
    }).then(function(list){
      retur.List = list;
    }).then(function (){
      return SalesforceService.getPicklist({ objectName: self.objectName, field: 'MotivoDaFaltaDaVisita__c' })
    })
    .then(function (picklist){
      retur.PicklistMotivosJust = picklist
    })
    .then(function() {
      return SalesforceService.loadData(queryJustify)
    }).then(function(just){
      var result = new Array();
      
      _.each(just, function (r) {
        var doc = new JustifyView(); 

        doc.Id = r.Id;
        doc.NomeDoVendedor = r.contaId__r.vendedorRepresentante__r.FirstName + " " + r.contaId__r.vendedorRepresentante__r.LastName; 
        doc.DataDaVisita = r.DataDaVisita__c;
        doc.NomeDoCliente = r.contaId__r.Name;
        doc.CodCliente = r.codigoCliente__c;
        doc.TipoVisita = r.TipoDaVisita__c;

        result.push(doc);
      });      

      retur.Justifications = result

      return retur
    })
  }  

  this.updateJustify = function (body) {
    var sfBody = {
      Id:   body.Id,
      JustificativaFaltaVisita__c: body.JustificativaFaltaVisita__c,
      MotivoDaFaltaDaVisita__c: body.MotivoDaFaltaDaVisita__c,
      IndicadorVisitaJustificada__c: true
    }

    if (body.id) { return $q.resolve(_.extend(sfBody, { id: body.id })) }

    return SalesforceService.updateCustomObject(self.objectName, sfBody)
  }  

  this.updateCheckin = function (acc) {
    var sfBody = {
      Id: acc.IdVisita,
      obsVisita__c : acc.observations,
      LocalCheckin__latitude__s : acc.latitudeIn,
      LocalCheckin__longitude__s : acc.longitudeIn,
      EnderecoCheckin__c : acc.endCheckin
    }

    return SalesforceService.updateCustomObject(self.objectName, sfBody)
  }    

  this.updateCheckout = function (acc) {
    var sfBody = {
      Id: acc.IdVisita,
      LocalCheckout__latitude__s : acc.latitudeOut,
      LocalCheckout__longitude__s : acc.longitudeOut,
      IndicadorVisitaRealizada__c : acc.visitaRealizada,
      EnderecoCheckout__c : acc.endCheckout
    }

    return SalesforceService.updateCustomObject(self.objectName, sfBody)
  }    

  this.createOrUpdatePlanningSelected = function() {
    var body = {  registros : this.buildBodySelected(), 
                  rvDate: self.planDate, 
                  userId: AuthService.getUserData().user_id,
                  plan: self.InPlanning
                }
    return SalesforceService.createOrUpdatePlanning(body)
  }

  this.buildBodySelected = function() {
    var returnBody = new Array()

    _.each(self.selectedAccounts, function(r) { 
      if (r.IndicadorDeVisitaPlanejada == self.InPlanning)
        returnBody.push(r)
    })

    return returnBody.map(function (acc) {
      return {
        attributes: {
          type: "registroVisita__c"
        },
        contaId__c : acc.Id,
        tipoCliente__c : acc.tipoCadastro__c,
        DataDaVisita__c : self.planDate,
        IndicadorDeVisitaPlanejada__c : self.InPlanning,
        Sequencia__c : !self.InPlanning ? 999 : acc.sequencia,
        TipoDaVisita__c : acc.tipoVisita,
        IndicadorSistemaPlanejamento__c : true,
        Categoria__c : self.checkInCategory,
        PlanejamentoFinalizado__c: !self.InPlanning ? true : false,
      }
    })    
  }

  this.loadNotPositivated = function() {
    var query = [
      "SELECT",
        "Id, nomeFantasia__c, Name, cnpjCpf__c, codigoCliente__c, loja__c,",
        "lojaCliente__c, suspenso__c, bloqueado__c, statusCliente__c, naoPodeFazerPedido__c,",
        "vendedorRepresentante__r.codigo__c, vendedorRepresentante__r.Name,",
        "DataUltimaPositivacao__c, ClientePositivado__c, bairro__c, tipoCadastro__c", 
      "FROM Account",
      "WHERE",
        "ClientePositivado__c = false AND",
        "suspenso__c = false AND",
        "NomeFantasia__c <> null AND",
        "vendedorRepresentante__c = '" + AuthService.getUserData().user_id + "'",
      "ORDER BY nomeFantasia__c, codClienteELoja__c asc LIMIT 50"
    ].join(" ")

    return SalesforceService.loadData(query).then(function(res) {
      _.each(res, function (r) {
        var acc = _.find(self.selectedAccounts, { Id: r.Id })
        r.selected = acc == null ? false : true
        r.tipoVisita = self.newPlanningData.defaultTypeOption
      })

      self.cacheListAccounts = _.groupBy(res, function (client) {
        return client.nomeFantasia__c == null ? client.Name[0] : client.nomeFantasia__c[0]
      })

      return self.cacheListAccounts
    })
  }

  this.loadDatePlanning = function(planDate, IdVendedor) {
    var query = [
      "SELECT",
        "Id, contaId__c, contaId__r.vendedorRepresentante__r.FirstName,",
        "contaId__r.vendedorRepresentante__r.LastName, DataDaVisita__c,",
        "contaId__r.Name, contaId__r.lojaCliente__c, Loja__c, codigoCliente__c,",
        "contaId__r.cnpjCpf__c, contaId__r.vendedorRepresentante__r.codigo__c,",
        "TipoDaVisita__c, Sequencia__c, IndicadorDeVisitaPlanejada__c,",
        "contaId__r.vendedorRepresentante__r.Name, contaId__r.DataUltimaPositivacao__c,",
        "contaId__r.nomeFantasia__c, PlanejamentoFinalizado__c, contaId__r.tipoCadastro__c",
      "FROM RegistroVisita__c",
      "WHERE",
        "DataDaVisita__c = " + planDate + " AND",
        "contaId__r.vendedorRepresentante__c = '" + IdVendedor + "' AND",
        "IndicadorSistemaPlanejamento__c = true",
      "ORDER BY Sequencia__c, contaId__r.Name"
    ].join(" ")

    return SalesforceService.loadData(query).then(function(res) {
      self.cacheViewPlanning = res
      self.planningFinished = false

      _.each(res, function (r) {
        if (r.IndicadorDeVisitaPlanejada__c && r.PlanejamentoFinalizado__c)
          self.planningFinished = true
      })

      return self.cacheViewPlanning
    })
  }  

  this.loadSelectedPlanning = function(planDate, inPlanning) {
    StdDataPlan = function(){
      this.Id = ""
      this.nomeFantasia__c = ""
      this.Name = ""
      this.cnpjCpf__c = ""
      this.codigoCliente__c = ""
      this.loja__c = ""
      this.lojaCliente__c = ""
      this.suspenso__c = false
      this.bloqueado__c = false
      this.statusCliente__c = ""
      this.naoPodeFazerPedido__c = false
      this.vendedorRepresentante__r = { codigo__c: "", Name : ""} 
      this.DataUltimaPositivacao__c = ""
      this.ClientePositivado__c = false
      this.IndicadorDeVisitaPlanejada = false
      this.IdVisita = ""
      this.sequencia = 0
      this.tipoVisita = ""
      this.selected = true
      this.bairro__c = ""
      this.tipoCadastro__c = ""
    }

    var query = [
      "SELECT",
      "contaId__c, contaId__r.nomeFantasia__c, contaId__r.Name,",
      "contaId__r.cnpjCpf__c, codigoCliente__c, Loja__c, contaId__r.lojaCliente__c,",
      "contaId__r.suspenso__c, contaId__r.bloqueado__c, contaId__r.statusCliente__c,",
      "contaId__r.naoPodeFazerPedido__c, contaId__r.vendedorRepresentante__r.codigo__c,",
      "contaId__r.vendedorRepresentante__r.Name, contaId__r.DataUltimaPositivacao__c,",
      "contaId__r.ClientePositivado__c, Id, Sequencia__c, TipoDaVisita__c,",
      "IndicadorDeVisitaPlanejada__c, contaId__r.bairro__c, contaId__r.tipoCadastro__c",
      "FROM RegistroVisita__c",
      "WHERE",
        "DataDaVisita__c = " + planDate + " AND",
        "contaId__r.vendedorRepresentante__c = '" + AuthService.getUserData().user_id + "' AND",
        "IndicadorSistemaPlanejamento__c = true",
      "ORDER BY Sequencia__c, contaId__r.Name"
    ].join(" ")

    return SalesforceService.loadData(query).then(function(res) {
      _.each(res, function (r) {
        var conv = new StdDataPlan()

        conv.Id = r.contaId__c
        conv.nomeFantasia__c = r.contaId__r.nomeFantasia__c
        conv.Name = r.contaId__r.Name
        conv.cnpjCpf__c = r.contaId__r.cnpjCpf__c
        conv.codigoCliente__c = r.codigoCliente__c
        conv.loja__c = r.Loja__c
        conv.lojaCliente__c = r.contaId__r.lojaCliente__c
        conv.suspenso__c = r.contaId__r.suspenso__c
        conv.bloqueado__c = r.contaId__r.bloqueado__c
        conv.statusCliente__c = r.contaId__r.statusCliente__c
        conv.naoPodeFazerPedido__c = r.contaId__r.naoPodeFazerPedido__c
        conv.vendedorRepresentante__r.codigo__c = r.contaId__r.vendedorRepresentante__r.codigo__c
        conv.vendedorRepresentante__r.Name = r.contaId__r.vendedorRepresentante__r.Name
        conv.DataUltimaPositivacao__c = r.contaId__r.DataUltimaPositivacao__c
        conv.ClientePositivado__c = r.contaId__r.ClientePositivado__c
        conv.IndicadorDeVisitaPlanejada = r.IndicadorDeVisitaPlanejada__c
        conv.IdVisita = r.Id
        conv.sequencia = r.Sequencia__c
        conv.tipoVisita = r.TipoDaVisita__c
        conv.selected = true
        conv.bairro__c = r.contaId__r.bairro__c
        conv.tipoCadastro__c = r.contaId__r.tipoCadastro__c

        self.selectedAccounts.push(conv)
      })
    })
  }
  
  this.searchClients = function(term) {

    if (term.length == 0)
      return this.loadNotPositivated();
    else 
      return ClientsService.searchClients(term, AuthService.getUserData().user_id).then(function(res) {
        if (!res.length) {
          throw new Error('NO_RESULTS')
        }
  
        _.each(res, function (r) {
          var acc = _.find(self.selectedAccounts, { Id: r.Id })
          r.selected = acc == null ? false : true
          r.tipoVisita = self.newPlanningData.defaultTypeOption          
        })

        self.cacheListAccounts = _.groupBy(res, function (client) {
          return client.nomeFantasia__c == null ? client.Name[0] : client.nomeFantasia__c[0]
        })
  
        return self.cacheListAccounts
      })
  }

  this.initialize = function (inPlanning, planDate) {
    self.cacheListAccounts = new Array()
    self.selectedAccounts = new Array()
    self.InPlanning = inPlanning
    self.planDate = planDate == '' ? self.newPlanningData.planningDate : planDate

    return self.loadSelectedPlanning(self.planDate, self.InPlanning).then(function() { self.loadNotPositivated() })
  }  

  this.initializeDate = function (planDate, idVendedor) {
    self.cacheListAccounts = new Array()
    self.selectedAccounts = new Array()
    self.cacheViewPlanning = new Array()
    self.planningEnabled = convertToDate(planDate) > new Date()
    self.newVisitEnabled = addDays(convertToDate(planDate),1) > new Date()

    if (idVendedor != AuthService.getUserData().user_id)
    {
      self.planningEnabled = false
      self.newVisitEnabled = false
    }

    return self.loadDatePlanning(planDate, idVendedor)
  }    

  this.finishPlanning = function(planDate) {
    var body = { planDate : planDate, userId : AuthService.getUserData().user_id }

    return SalesforceService.finishPlanning(body)
  }

  this.invertSelect = function (key, id) {
    var keySelected = self.cacheListAccounts[key]
    var accSelected = _.find(keySelected, { Id: id })
    var acc = _.find(self.selectedAccounts, { Id: accSelected.Id })      

    if (acc == null || acc.IndicadorDeVisitaPlanejada == self.InPlanning)
    {
      accSelected.selected = !accSelected.selected
    
      if (accSelected.selected == false && acc != null)
      {
        _.pull(self.selectedAccounts, acc);
      }
  
      if (accSelected.selected == true && acc == null)
      {
        accSelected.sequencia = self.selectedAccounts.length + 1
        accSelected.IndicadorDeVisitaPlanejada = self.InPlanning
        self.selectedAccounts.push(accSelected)
      }    
  
      self.reorderSelected() 
    }
  }

  this.invertSelectOnType = function (id) {
    var acc = _.find(self.selectedAccounts, { Id: id })      

    if (acc != null)
    {

      var keySelected = self.cacheListAccounts[acc.nomeFantasia__c[0]]
      var accSelected = _.find(keySelected, { Id: id })

      if (accSelected != null)
        accSelected.selected = false;

      _.pull(self.selectedAccounts, acc);
    }

    self.reorderSelected() 
  }  

  this.moveUpSelect = function (id) {
    var acc = _.find(self.selectedAccounts, { Id: id })      

    if (acc.sequencia > 1)
    {
      acc.sequencia--
      self.selectedAccounts.splice(acc.sequencia - 1, 0, self.selectedAccounts.splice(acc.sequencia, 1)[0] );
      self.reorderSelected()
    }
  }  

  this.moveDownSelect = function (id) {
    var acc = _.find(self.selectedAccounts, { Id: id })      

    if (acc.sequencia < self.selectedAccounts.length)
    {
      self.selectedAccounts.splice(acc.sequencia - 1, 0, self.selectedAccounts.splice(acc.sequencia, 1)[0] );
      self.reorderSelected()
    }
  }    

  this.reorderSelected = function () {
    var index = 0;      
    _.each(self.selectedAccounts, function (r) { r.sequencia = ++index })
    _.sortBy(self.selectedAccounts, function(itm){ return itm.sequencia; });
  }

  this.getVisitTodayClient = function (clientId) {

    StdDataPlan = function(){
      this.Id = ""
      this.nomeFantasia__c = ""
      this.Name = ""
      this.cnpjCpf__c = ""
      this.codigoCliente__c = ""
      this.loja__c = ""
      this.lojaCliente__c = ""
      this.suspenso__c = false
      this.bloqueado__c = false
      this.statusCliente__c = ""
      this.naoPodeFazerPedido__c = false
      this.vendedorRepresentante__r = { codigo__c: "", Name : ""} 
      this.DataUltimaPositivacao__c = ""
      this.ClientePositivado__c = false
      this.IndicadorDeVisitaPlanejada = false
      this.IdVisita = ""
      this.sequencia = 0
      this.tipoVisita = ""
      this.selected = true
      this.bairro__c = ""
      this.tipoCadastro__c = ""
    }

    var query = [
      "SELECT",
      "contaId__c, contaId__r.nomeFantasia__c, contaId__r.Name,",
      "contaId__r.cnpjCpf__c, codigoCliente__c, Loja__c, contaId__r.lojaCliente__c,",
      "contaId__r.suspenso__c, contaId__r.bloqueado__c, contaId__r.statusCliente__c,",
      "contaId__r.naoPodeFazerPedido__c, contaId__r.vendedorRepresentante__r.codigo__c,",
      "contaId__r.vendedorRepresentante__r.Name, contaId__r.DataUltimaPositivacao__c,",
      "contaId__r.ClientePositivado__c, Id, Sequencia__c, TipoDaVisita__c, IndicadorDeVisitaPlanejada__c,",
      "DataDaVisita__c, contaId__r.bairro__c, contaId__r.tipoCadastro__c",
      "FROM RegistroVisita__c",
      "WHERE",
        "DataDaVisita__c = TODAY AND",
        "IndicadorSistemaPlanejamento__c = true AND",
        "contaId__c = '" + clientId + "' AND",
        "contaId__r.vendedorRepresentante__c = '" + AuthService.getUserData().user_id + "'",
      "ORDER BY Sequencia__c, contaId__r.Name LIMIT 1"
    ].join(" ")

    self.cacheListAccounts = new Array()
    self.selectedAccounts = new Array()

    return SalesforceService.loadData(query).then(function(res) {
      _.each(res, function (r) {
        var conv = new StdDataPlan()

        self.InPlanning = r.IndicadorDeVisitaPlanejada__c
        self.planDate = r.DataDaVisita__c

        conv.Id = r.contaId__c
        conv.nomeFantasia__c = r.contaId__r.nomeFantasia__c
        conv.Name = r.contaId__r.Name
        conv.cnpjCpf__c = r.contaId__r.cnpjCpf__c
        conv.codigoCliente__c = r.codigoCliente__c
        conv.loja__c = r.Loja__c
        conv.lojaCliente__c = r.contaId__r.lojaCliente__c
        conv.suspenso__c = r.contaId__r.suspenso__c
        conv.bloqueado__c = r.contaId__r.bloqueado__c
        conv.statusCliente__c = r.contaId__r.statusCliente__c
        conv.naoPodeFazerPedido__c = r.contaId__r.naoPodeFazerPedido__c
        conv.vendedorRepresentante__r.codigo__c = r.contaId__r.vendedorRepresentante__r.codigo__c
        conv.vendedorRepresentante__r.Name = r.contaId__r.vendedorRepresentante__r.Name
        conv.DataUltimaPositivacao__c = r.contaId__r.DataUltimaPositivacao__c
        conv.ClientePositivado__c = r.contaId__r.ClientePositivado__c
        conv.IndicadorDeVisitaPlanejada = r.IndicadorDeVisitaPlanejada__c
        conv.IdVisita = r.Id
        conv.sequencia = r.Sequencia__c
        conv.tipoVisita = r.TipoDaVisita__c
        conv.selected = true
        conv.bairro__c = r.contaId__r.bairro__c
        conv.tipoCadastro__c = r.contaId__r.tipoCadastro__c

        self.selectedAccounts.push(conv)
      })
    })
  }

  this.checkIn = function (clientId) {
    if (appTarget != 'mobile') { return }

    var self = this,
        deferred = $q.defer()

    self.getVisitTodayClient(clientId).then(function (){
      return uiGmapGoogleMapApi
    }).then(function(maps) {

      if (self.selectedAccounts.length <= 0)
      {
        $ionicPopup.alert({
          title: 'Erro ao fazer Check In',
          template: 'Não há nenhuma visita planejada.'
        })
        deferred.reject(false)    
        
        return deferred.promise
      }

      var geocoder = new maps.Geocoder()

      $injector.get('$cordovaGeolocation').getCurrentPosition({ timeout: 5000 }).then(function (position) {
        geocoder.geocode({ location: { lat: position.coords.latitude, lng: position.coords.longitude } }, function (results, status) {
          var attributes = {
            clientId: clientId,
            category: { value: self.checkInCategory },
            observations: 'proximo à ' + results[0].formatted_address
          }

          if (status === google.maps.GeocoderStatus.OK) {
            
            self.selectedAccounts[0].observations = attributes.observations
            self.selectedAccounts[0].latitudeIn = position.coords.latitude
            self.selectedAccounts[0].longitudeIn = position.coords.longitude
            self.selectedAccounts[0].endCheckin = results[0].formatted_address

            self.updateCheckin(self.selectedAccounts[0]).then(function () {
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


  this.checkOut = function (clientId) {
    if (appTarget != 'mobile') { return }

    var self = this,
        deferred = $q.defer()

    self.getVisitTodayClient(clientId).then(function (){
      return uiGmapGoogleMapApi
    }).then(function(maps) {

      if (self.selectedAccounts.length <= 0)
      {
        $ionicPopup.alert({
          title: 'Erro ao fazer Check Out',
          template: 'Não há nenhuma visita planejada.'
        })
        deferred.reject(false)    
        
        return deferred.promise
      }

      var geocoder = new maps.Geocoder()

      $injector.get('$cordovaGeolocation').getCurrentPosition({ timeout: 5000 }).then(function (position) {
        geocoder.geocode({ location: { lat: position.coords.latitude, lng: position.coords.longitude } }, function (results, status) {
          var attributes = {
            clientId: clientId,
            category: { value: self.checkInCategory },
            observations: 'proximo à ' + results[0].formatted_address
          }

          if (status === google.maps.GeocoderStatus.OK) {
            
            self.selectedAccounts[0].latitudeOut = position.coords.latitude
            self.selectedAccounts[0].longitudeOut = position.coords.longitude,
            self.selectedAccounts[0].endCheckout = results[0].formatted_address
            self.selectedAccounts[0].visitaRealizada = true

            self.updateCheckout(self.selectedAccounts[0]).then(function () {
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

  this.todayPlan = function (clientId) {
    var query = [ "SELECT",
                  "Name, obsVisita__c, Categoria__c, CreatedDate, DataCheckin__c, DataCheckout__c",
                  "FROM " + this.objectName,
                  "WHERE contaId__c = '" + clientId + "'",
                  "AND Categoria__c = '" + self.checkInCategory + "'",
                  "AND IndicadorSistemaPlanejamento__c = true",
                  "AND DataDaVisita__c = TODAY LIMIT 1"
                ].filter(function (str) { return str.length }).join(" ").trim();

    return SalesforceService.loadData(query)
  }  

}])
