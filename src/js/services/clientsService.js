cartaFabrilServices.service('ClientsService', ['$q', 'SalesforceService',  function ($q, SalesforceService) {

  this.loadList = function () {
    var query = [
      "SELECT",
        "Id, nomeFantasia__c, Name, cnpjCpf__c, codigoCliente__c, loja__c,",
        "lojaCliente__c, suspenso__c, bloqueado__c, statusCliente__c, naoPodeFazerPedido__c,",
        "vendedorRepresentante__r.codigo__c, vendedorRepresentante__r.Name",
      "FROM Account",
      "WHERE",
        "nomeFantasia__c != null",
      "ORDER BY nomeFantasia__c, codClienteELoja__c asc"
    ].join(" ")

    return SalesforceService.loadData(query)
  }

  this.loadClient = function (clientId) {
    var query = "select Id, nomeFantasia__c, Name, cnpjCpf__c, codigoCliente__c, loja__c, lojaCliente__c, "
              + "inscricaoEstadual__c, TelefoneCliente1__c, NomeTabelaRegional__c, suspenso__c, obsSuspensao__c, "
              + "bcoCobSimp__c, descDuplic__c, exigeAgendamentoPrevio__c, exigeCodBarras__c, "
              + "vlrDescargaPFardoCaixa__c, vlrDescargaPPalete__c, email__c, textoMensagem__c, descSufr__c, "
              + "descricaoContrato__c, percTotalContrato__c, percDescDuplicata__c, condicaoPgto__r.Name, statusCliente__c, "
              + "vigenciaRegimeEspecial__c, Rede__r.Name, bloqueado__c, obsFinanceira__c, limiteCredito__c, saldoLimiteCredito__c, "
              + "cep__c, endereco__c, bairro__c, Municipio__c, estado__c, ShippingAddress, naoPodeFazerPedido__c, "
              + "vendedorRepresentante__r.codigo__c, vendedorRepresentante__r.Name, tipoCadastro__c, owner.IsActive, tipoDeCarga__c "
              + "from Account where Id = '" + clientId + "'"

    return SalesforceService.loadData(query)
  }

  this.searchClients = function (term, userId) {
    var query = [
      "SELECT",
        "Id, nomeFantasia__c, Name, cnpjCpf__c, codigoCliente__c, loja__c,",
        "lojaCliente__c, suspenso__c, bloqueado__c, statusCliente__c, naoPodeFazerPedido__c,",
        "vendedorRepresentante__r.codigo__c, vendedorRepresentante__r.Name,",
        "DataUltimaPositivacao__c, ClientePositivado__c, tipoCadastro__c",        
      "FROM Account",
      "WHERE",
        "nomeFantasia__c != null",
        "AND  RecordType.Name = 'Default' AND (",
          "nomeFantasia__c LIKE '%" + term + "%'",
          "OR Name LIKE '%" + term + "%'",
          "OR cnpjCpf__c LIKE '%" + term + "%'",
          "OR cnpjCpfNumeros__c LIKE '%" + term + "%'",
          "OR codClienteELoja__c LIKE '%" + term + "%'",
        ")",
        userId == null ? "" : " AND vendedorRepresentante__c = '" + userId + "'",
      "ORDER BY nomeFantasia__c, codClienteELoja__c asc"
    ].join(" ")

    return SalesforceService.loadData(query).then(function(res) {
      if (!res.length) {
        throw new Error('NO_RESULTS')
      }

      if (res.length > 100) {
        throw new Error('MANY_RESULTS')
      }

      return res
    })
  }


  this.searchNotPositivatedClients = function (term) {
    var query = [
      "SELECT",
        "Id, nomeFantasia__c, Name, cnpjCpf__c, codigoCliente__c, loja__c,",
        "lojaCliente__c, suspenso__c, bloqueado__c, statusCliente__c, naoPodeFazerPedido__c,",
        "vendedorRepresentante__r.codigo__c, vendedorRepresentante__r.Name, tipoCadastro__c",
      "FROM Account",
      "WHERE",
        "nomeFantasia__c != null",
        "AND (",
          "nomeFantasia__c LIKE '%" + term + "%'",
          "OR Name LIKE '%" + term + "%'",
          "OR cnpjCpf__c LIKE '%" + term + "%'",
          "OR cnpjCpfNumeros__c LIKE '%" + term + "%'",
          "OR codClienteELoja__c LIKE '%" + term + "%'",
        ")",
      "ORDER BY nomeFantasia__c, codClienteELoja__c asc"
    ].join(" ")

    return SalesforceService.loadData(query).then(function(res) {
      if (!res.length) {
        throw new Error('NO_RESULTS')
      }

      if (res.length > 100) {
        throw new Error('MANY_RESULTS')
      }

      return res
    })
  }  

}])
