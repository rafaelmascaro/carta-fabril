cartaFabrilServices.service('OrderService', [
  '$rootScope',
  '$ionicPopup',
  'SalesforceService',
  'ClientsService',
  function OrderService(
    $rootScope,
    $ionicPopup,
    SalesforceService,
    ClientsService
  ) {
    var self = this;

    function round(x) {
      return +(Math.round(x + 'e+2') / 100).toFixed(2);
    }

    this.exceptionsMessages = {
      paymentOption: {
        name: 'Condição de pagamento',
        message: 'Condição de pagamento não permitida'
      },
      finDiscount: {
        name: 'Desconto financeiro',
        message: 'Desconto financeiro acima do permitido'
      },
      deliveryDate: {
        name: 'Data de entrega',
        message: 'Data de entrega acima do permitido'
      },
      minOrderValue: {
        name: 'Valor mínimo do pedido',
        message: 'Valor do pedido abaixo do mínimo permitido'
      },
      minDuplValue: {
        name: 'Valor de duplicata mínima',
        message: 'Valor de duplicata abaixo do mínimo permitido'
      },
      itemDiscount: {
        name: 'Itens com desconto acima do permitido',
        message:
          'Existem itens no pedido com desconto maior do que o permitido na tabela regional'
      },
      bonusOnly: {
        name: 'Pedido somente de bônus',
        message: 'Existem itens no pedido apenas com quantidade bonificada'
      }
    };

    this.initialize = function(
      clientId,
      orderId,
      clone,
      productsIds,
      orderType
    ) {
      clone = Number(clone) || 0;
      productsIds = _.compact((productsIds || '').split(';'));

      this.exceptions = [];
      this.selectedProducts = [];
      this.orderId = clone ? null : orderId || null;

      this.order = {
        deliveryDate: undefined,
        nfMsg: '',
        customerOrderNumber: '',
        customerOrderBonification: '',
        observation: '',
        ruleExceptionNote: ''
      };

      return SalesforceService.loadOrderData(clientId, orderId).then(
        function(result) {
          var orderData = result.orderData;

          self.client = orderData.client;
          self.orderParams = orderData.orderParams;

          self.regionalTables = orderData.regionalTables;

          
          self.defaultOrderValue =
            orderData.client.tabelaRegionalId__r.valorMinPedido__c;
          self.defaultDuplValue =
            orderData.client.tabelaRegionalId__r.duplicataMinimaPedido__c;

          self.limitDateMinOrderValue = orderData.limitDateMinOrderValue;
          self.limitDateMinDuplValue = orderData.limitDateMinDuplValue;
          self.limitDateCondPgto = orderData.limitDateCondPgto;

          self.minSpecialOrderValue = orderData.minSpecialOrderValue;
          self.minSpecialDuplValue = orderData.minSpecialDuplValue;

          self.SpecialConditions = orderData.SpecialConditions;
          self.SpecialPaymentOptions = orderData.SpecialPaymentOptions;
          self.defaultPaymentOptions = orderData.paymentOptions;

          self.Palletizations = orderData.palletization;

          self.prodsSpecialConditions = orderData.prodsSpecialConditions;

          self.pFamilia = orderData.pFamilia;
          
          if (self.client.tipoFrete__c == 'FOB') {
            self.minOrderValue = orderData.minOrderValueFob;
            self.minDuplValue = orderData.minDuplValueFob;
            self.itemDiscountField = 'percDescontoFob__c';
          } else {
            self.minOrderValue = orderData.minOrderValue;
            self.minDuplValue = orderData.minDuplValue;
            self.itemDiscountField = 'percDesconto__c';
          }

          self.client.percTotalContrato__c =
            self.client.percTotalContrato__c || 0;
          self.client.custoTotalAjudantes__c =
            self.client.custoTotalAjudantes__c || 0;
          self.client.vlrDescargaPFardoCaixa__c =
            self.client.vlrDescargaPFardoCaixa__c || 0;
          self.client.percOutrosCustosLog__c =
            self.client.percOutrosCustosLog__c || 0;

          self.hasMinOrderConditions = orderData.hasMinOrderSpecialCondition;

          self.minimumOrderValues = {
            minValue: orderData.minOrderValue,
            minFobValue: orderData.minOrderValueFob
          };

          self.dischargeDiff = Math.max(
            0,
            self.client.vlrDescargaPFardoCaixa__c -
              (self.orderParams.custoDescargaCartaFabril__c || 0)
          );

          self.hasMinDuplConditions = orderData.hasMinDuplSpecialCondition;
          self.minimumDuplValues = {
            minValue: orderData.minDuplValue,
            minFobValue: orderData.minDuplValueFob
          };

          self.order.pricebookId = orderData.products[0].TabelaNacionalId__c;

          self.paymentOptions = _.sortBy(
            orderData.paymentOptions,
            'Ordenacao__c'
          );

          if (!_.isEmpty(orderData.defaultPaymentOption)) {
            self.order.paymentOption = _.find(self.paymentOptions, {
              Id: orderData.defaultPaymentOption
            });
          }

          if (orderData.order) {
          	
            self.order.finDiscount = orderData.order.percDescFinanceiro__c;
            self.order.shipping = orderData.order.tipoFrete__c;
            self.order.paymentOption = _.find(self.paymentOptions, {
              Id: orderData.order.condicaoPgto__c
            });

            if (!clone) {
              self.mountOrder(orderData.order);
            }
          }

          var combos = [
            { id: 'ComboBemEstar', value: 'Combo bem estar' },
            { id: 'Combolooping', value: 'Combo looping' },
            { id: 'ComboBitJumbinho', value: 'Combo Blt Jumbinho' },
            { id: 'ComboLoopingPack', value: 'Looping pack' },
            { id: 'ComboCotton', value: 'Combo Cotton' },
            { id: 'ComboAbs', value: 'Combo Abs' },
            { id: 'ComboToalha', value: 'Combo toalha' }
          ];

          var valores = [];

          if (
            orderData.order != null &&
            orderData.order.combos__c != undefined
          ) {
            combos.forEach(function(v, i) {
              if (orderData.order.combos__c.indexOf(v.id) != -1)
                valores.push(v.id);
            });
          }

          self.order.allCombos = combos;
          self.order.valueCombos = valores;

          self.mountExceptions(_.get(orderData, 'order.tipoBloqueio__c', ''));

          self.mountShipping(self.client.tipoFrete__c);

          self.mountProducts(orderData.products, orderData.standardPrices);

          self.mountItems(orderData.orderItems, clone, productsIds, orderType);

          self.ufDelays = _.reduce(
            orderData.ufDelays,
            function(acc, ufDelay) {
              acc[ufDelay.unidade__r.Name] = ufDelay.delay__c;

              return acc;
            },
            {}
          );

          self.holidays = _.map(orderData.holidays, function(holiday) {
            return moment(holiday);
          });
        },
        function(err) {
          console.log(err);
        }
      );
    };

    this.deliveryDateDelay = function() {
      if (_.isEmpty(this.selectedProducts)) {
        return this.ufDelays[this.client.codUnFatVigente__c];
      }

      var ufDelays = this.ufDelays,
        delays = _(this.selectedProducts)
          .map(function(selectedProduct) {
            return ufDelays[selectedProduct.codUnidadeFaturamento__c];
          })
          .uniq()
          .value();

      return Math.max.apply(this, delays);
    };

    this.minDeliveryDate = function() {
      var remaining = this.deliveryDateDelay(),
        minDate = moment().startOf('day');

      while (remaining) {
        minDate.add(1, 'day');

        if (
          minDate.day() % 6 > 0 &&
          !_.find(self.holidays, { _d: minDate._d })
        ) {
          remaining -= 1;
        }
      }

      return minDate;
    };

    this.mountOrder = function(order) {
      self.order.deliveryDate = moment(
        order.dataEntrega__c,
        'YYYY-MM-DD'
      ).toDate();
      self.order.nfMsg = order.mensagemNf__c;
      self.order.customerOrderNumber = order.numeroPedidoCliente__c;
      self.order.customerOrderBonification = order.numeroPedidoClienteBon__c;
      self.order.observation = order.obsPedido__c;
      self.order.ruleExceptionNote = order.expTransgressaoRegra__c;
      self.order.possuiCombo = order.possuiCombo__c;
      self.order.allCombos = order.combos__c;
      self.order.PodeAnteciparEntrega = order.PodeAnteciparEntrega__c;
    };

    this.mountItems = function(items, clone, productsIds, orderType) {
      if (!(items && items.length)) {
        return;
      }

      _.each(items, function(item) {
        var product = _.find(self.products, {
          Id: item.idItemTabelaRegional__c
        });

        if (product && (clone !== 2 || _.includes(productsIds, product.Id))) {
          self.selectProduct(product.Id);

          if (orderType) {
            product.saleQtd = orderType === 'Venda' ? item.qtdVenda__c : 0;
            product.bonusQtd =
              orderType === 'Bonificação' ? item.qtdBonificada__c : 0;
          } else {
            product.saleQtd = item.qtdVenda__c;
            product.bonusQtd = item.qtdBonificada__c;
          }

          product.discount = item.valorDesconto__c;
        }
      });
    };

    this.mountExceptions = function(blockType) {
      self.exceptions = _(blockType)
        .split(';')
        .compact()
        .map(function(name) {
          return _.findKey(self.exceptionsMessages, { name: name });
        })
        .compact()
        .value();
    };

    this.mountShipping = function(clientShipping) {
      if (clientShipping != null) {
        self.shippingOptions = clientShipping.split(' / ');

        if (self.shippingOptions.length == 1) {
          self.order.shipping = self.shippingOptions[0];
        }
      }
    };

    this.mountProducts = function(products, standardPrices) {
      this.products = _.map(products, function(product) {
        var standardPrice = _.find(standardPrices, {
          Product2Id: product.produtoId__c
        });

        return _.extend(
          {
            discount: 0,
            liquidPrice: 0,
            price: 0,
            saleQtd: 0,
            discountPercent: 0,
            bonusQtd: 0,
            bonusPerc: 0,
            averageDiscount: 0,
            finalPrice: 0,
            selected: false,
            standardPrice: _.get(standardPrice, 'UnitPrice', 0)
          },
          product
        );
      });

      /*
       #13143
       Na busca de itens para inserção no pedido, 
       mostrar apenas os que tem paletização cadastrada 
       SE o campo Padrão de Paletização na conta for "Tipo cliente", 
       caso contrário manter a regra atual
      */
     
      if (self.client.padraoPaletizacao__c === 'Cliente') {
        this.products = this.products
        .filter(product => self.Palletizations
          .some(pallet => pallet.Produto__c === product.produtoId__c))
      } 
      
      this.sortedProducts = _(this.products)
        .sortBy('ordenacaoProduto__c')
        .groupBy('categoriaProduto__c')
        .entries()
        .sortBy(function(group) {
          return group[1][0].ordenacaoCategoria__c;
        })
        .value();
    };

    this.selectProduct = function(id) {
      var product = _.find(self.products, { Id: id, selected: false });

      if (product) {
        product.selected = true;

        self.nullifyFields(product);
        self.selectedProducts.push(product);
      }
    };

    this.nullifyFields = function(product) {
      _.each(['saleQtd', 'price', 'discount', 'bonusQtd'], function(field) {
        product[field] = product[field] === 0 ? null : product[field];
      });

      return product;
    };

    this.unselectProduct = function(id) {
      var product = _.find(self.products, { Id: id, selected: true });

      if (product) {
        _.pull(self.selectedProducts, product);

        product.selected = false;
        product.saleQtd = "";
        product.price = "";
        product.discount = "";
        product.bonusQtd = "";
      }
    };

    this.toggleEdition = function(id) {
      var product = _.find(self.products, { Id: id });
      product.editing = !product.editing;
    };

    this.orderTotal = function() {
      var sum = _.sumBy(self.selectedProducts, function(product) {
        return product.price ? product.saleTotal : 0;
      });

      self.validateBonusOnly();

      _.pull(self.exceptions, 'minOrderValue', 'minDuplValue');

      if (self.orderQuantity()) {
        self.validateMinOrderValue(sum);
        self.validateMinDuplValue(sum);
      }

      return sum;
    };

    this.orderTotalWithTax = function() {
      return _.sumBy(self.selectedProducts, 'saleTotalWithTax');
    };

    this.orderBonusTotal = function() {
      return _.sumBy(self.selectedProducts, 'bonusTotal');
    };

    this.orderBonusTotalWithTax = function() {
      return _.sumBy(self.selectedProducts, 'bonusTotalWithTax');
    };

    this.orderQuantity = function() {
      return _.sumBy(self.selectedProducts, function(product) {
        return product.saleQtd || 0;
      });
    };

    this.bonusQuantity = function() {
      return _.sumBy(self.selectedProducts, function(product) {
        return product.bonusQtd || 0;
      });
    };

    this.totalQuantity = function() {
      return self.orderQuantity() + self.bonusQuantity();
    };

    this.totalVolume = function() {
      return _.sumBy(self.selectedProducts, function(product) {
        return (
          ((product.saleQtd || 0) + (product.bonusQtd || 0)) *
          (product.cubagemProduto__c || 1)
        );
      });
    };

    this.orderBonusPercent = function() {
      var totalBonus = self.orderBonusTotal();
      var totalSale = self.orderTotal();

      if (totalBonus <= 0 || totalSale <= 0) return 0;

      return round(100 * (totalBonus / totalSale));
    };

    this.orderLogisticsCost = function() {
      return _.sumBy(self.selectedProducts, 'logisticsCost');
    };

    this.canBeSaved = function() {
      var haveQuantities,
        havePrices,
        attributesFilled,
        haveItens,
        haveCombos,
        accountNotBlocked,
        errors = {};

      var productsErrors = this.canSaveProducts(this.selectedProducts);

      haveItens = true;
      haveCombos = true;
      accountNotBlocked = true;
      qtdCombo = 0;

      self.order.allCombos.forEach(function(v, i) {
        if (v.checked == true) {
          qtdCombo += 1;
        }
      });

      if(self.client && (self.client.bloqueado__c == 'Sim' || self.client.statusCliente__c == 'Inativo' || self.client.suspenso__c)){
        errors['client'] = 'está bloqueado inativo ou suspenso';
        accountNotBlocked = false;
      }

      if (self.order.possuiCombo == true && qtdCombo == 0) {
        errors['combos'] = 'não selecionados';
        haveCombos = false;
      }

      if (!this.selectedProducts || this.selectedProducts.length <= 0) {
        errors['order'] = 'não possui itens';
        haveItens = false;
      }

      haveQuantities = _(productsErrors)
        .map(function(productError) {
          return _.isNil(productError.quantity);
        })
        .every();

      havePrices = _(productsErrors)
        .map(function(productError) {
          return _.isNil(productError.price);
        })
        .every();

      if (!(haveQuantities && havePrices)) {
        errors.products = productsErrors;
      }

      attributesFilled = _(['deliveryDate', 'shipping', 'paymentOption'])
        .map(function(item) {
          var isNil = _.isNil(self.order[item]);

          if (isNil) {
            errors[item] = 'está vazio';
          }

          return !isNil;
        })
        .every();

      this.errors = errors;

      return (
        haveQuantities &&
        havePrices &&
        attributesFilled &&
        haveItens &&
        haveCombos &&
        accountNotBlocked
      );
    };

    this.exceptionsAreJustified = function() {
      return (
        _.isEmpty(this.exceptions) || !_.isEmpty(this.order.ruleExceptionNote)
      );
    };

    this.canSaveProducts = function(selectedProducts) {
      function canSaveProduct(product) {
        var zeroQuantity = !(product.saleQtd > 0 || product.bonusQtd > 0),
          zeroPrice = product.price <= 0;
        productError = {
          name: product.descProdutoNf__c,
          code: product.CodigoProduto__c
        };

        if (zeroQuantity) {
          productError.quantity = 'não pode ser zero';
        }

        if (zeroPrice) {
          productError.price = 'não pode ser zero';
        }

        return productError;
      }

      return _.map(selectedProducts, canSaveProduct);
    };

    this.fullErrorMessages = function() {
      var humanNames = {
        deliveryDate: 'Data de entrega',
        shipping: 'Frete',
        paymentOption: 'Cond. pagamento'
      };

      var errorMessages = _(humanNames)
        .keys()
        .map(function(field) {
          if (self.errors[field]) {
            return ['Campo', humanNames[field], self.errors[field]].join(' ');
          }
        })
        .compact()
        .value();

      if (self.errors['order']) {
        errorMessages.push(['- Pedido', self.errors['order']].join(' '));
      }

      if (self.errors['combos']) {
        errorMessages.push(['- Combos', self.errors['combos']].join(' '));
      }

      if (self.errors['client']) {
        errorMessages.push(['- Cliente', self.errors['client']].join(' '));
      }

      _.each(this.errors.products, function(product) {
        if (product.quantity) {
          errorMessages.push(
            [
              'Quantidade do produto',
              product.name,
              product.code,
              product.quantity
            ].join(' ')
          );
        }

        if (product.price) {
          errorMessages.push(
            [
              'Preço do produto',
              product.name,
              product.code,
              product.price
            ].join(' ')
          );
        }
      });

      return errorMessages;
    };

    this.validatePaymentOption = function() {
      _.pull(self.exceptions, 'paymentOption');

      if (self.order.paymentOption.bloqueiaPedido__c) {
        self.exceptions.push('paymentOption');
      }
    };

    this.validateFinDiscount = function() {
      _.pull(self.exceptions, 'finDiscount');

      if (
        self.order.paymentOption &&
        self.order.finDiscount > self.order.paymentOption.maxDescFinanceiro__c
      ) {
        self.exceptions.push('finDiscount');
      }
    };

    this.validateDeliveryDate = function() {
      _.pull(self.exceptions, 'deliveryDate');

      var day = self.client.diaMesEntrega__c,
        monthToValidade = self.client.mesEntregaSubsequente__c,
        now = new Date(),
        baseDate = moment(now)
          .add(monthToValidade, 'months')
          .date(day),
        deliveryDate = moment(self.order.deliveryDate, 'DD/MM/YYYY');

      if (deliveryDate.diff(baseDate) > 0) {
        self.exceptions.push('deliveryDate');
      }

      this.validateSpecialConditionDate(deliveryDate);
    };

    this.validateSpecialConditionDate = function(deliveryDate = '2018-01-01') {
      newDate = moment(deliveryDate).format('YYYY-MM-DD');

      this.validateSpecialOrderValueDate(newDate);
      this.validateSpecialPaymentConditionDate(newDate);
    };


    this.validateSpecialPaymentConditionDate = function(deliveryDate = '2018-01-01') {
      var {
        defaultPaymentOptions,
        paymentOptions,
        SpecialPaymentOptions,
        SpecialConditions
      } = self;

      const validSpecialConditionsIds = SpecialConditions
      .filter(cond => !moment(cond.dataLimiteUtilizacao__c)
      .isBefore(deliveryDate))
      .map(cond => cond.id);

      validSpecialPaymentOptions = SpecialPaymentOptions
      .filter(option => validSpecialConditionsIds
        .includes(option.id)
      );

      paymentOptions = [
        ...defaultPaymentOptions,
        ...validSpecialPaymentOptions
      ];

      self.paymentOptions = _.sortBy(paymentOptions, 'Ordenacao__c');
    };

    this.validateSpecialOrderValueDate = function(deliveryDate = '2018-01-01') {
      var {
        defaultDuplValue,
        defaultOrderValue,
        limitDateCondPgto,
        limitDateMinDuplValue: limitDateDupl,
        limitDateMinOrderValue: limitDateValue,
        minSpecialDuplValue: SpecialDuplValue,
        minSpecialOrderValue: SpecialOrderValue
      } = self;

      limitDateValue = moment(limitDateValue).format('YYYY-MM-DD');

      limitDateDupl = moment(limitDateDupl).format('YYYY-MM-DD');

      limitDateCondPgto = moment(limitDateCondPgto).format('YYYY-MM-DD');

      self.minOrderValue = moment(limitDateValue).isBefore(deliveryDate)
        ? defaultOrderValue
        : SpecialOrderValue;

      self.minDuplValue = moment(limitDateDupl).isBefore(deliveryDate)
        ? defaultDuplValue
        : SpecialDuplValue;

        self.minOrderValue = (self.minOrderValue) ? self.minOrderValue : defaultOrderValue
        self.minDuplValue = (self.minDuplValue) ? self.minDuplValue : defaultDuplValue
    };

    this.validateMinOrderValue = function(orderValue) {
      _.pull(self.exceptions, 'minOrderValue');

      if (orderValue < self.minOrderValue) {
        self.exceptions.push('minOrderValue');
      }
    };

    this.validateMinDuplValue = function(orderValue) {
      _.pull(self.exceptions, 'minDuplValue');

      var portion = self.order.paymentOption
        ? self.order.paymentOption.quebraValorMinPedido__c
        : 1;
      var minDuplValue = orderValue / portion;

      if (minDuplValue < self.minDuplValue) {
        self.exceptions.push('minDuplValue');
      }
    };

    this.clearRuleExceptionNote = function() {
      if (self.exceptions.length == 0) {
        self.order.ruleExceptionNote = '';
      }
    };

    this.validateAverageDiscount = function(product) {
      var desc = 0;
      deliveryDate = moment(self.order.deliveryDate, 'DD/MM/YYYY');
      newDate = moment(deliveryDate).format('YYYY-MM-DD');

      let produtoDaCondEspecial = self.prodsSpecialConditions.find(v => {
        return v.codigoProduto__c == product.CodigoProduto__c;
      });
 
      //Referente ao projeto Paletizacao
      if(produtoDaCondEspecial && (newDate >= produtoDaCondEspecial.CondicaoEspecial__r.dataInicial__c && newDate <= produtoDaCondEspecial.CondicaoEspecial__r.dataLimiteUtilizacao__c)) {
        desc = produtoDaCondEspecial.Desconto__c ? produtoDaCondEspecial.Desconto__c : 0;
      }

      return product.averageDiscount > (product[self.itemDiscountField] + desc || 0); //Comentado pois agora está vindo desconto especial embutido no desconto do produto.
    };

    this.validateItems = function() {
      var ret = _.some(self.selectedProducts, self.validateAverageDiscount);

      if (ret) {
        if (!_.includes(self.exceptions, 'itemDiscount')) {
          self.exceptions.push('itemDiscount');
        }
      } else {
        _.pull(self.exceptions, 'itemDiscount');
      }
    };

    this.validateBonusOnly = function() {
      var ret = _.some(self.selectedProducts, function(product) {
        return (product.saleQtd || 0) <= 0 && (product.bonusQtd || 0) > 0;
      });

      if (ret) {
        if (!_.includes(self.exceptions, 'bonusOnly')) {
          self.exceptions.push('bonusOnly');
        }
      } else {
        _.pull(self.exceptions, 'bonusOnly');
      }
    };

    this.buildOrderStatus = function(draft) {
      self.orderStatus = draft ? 'Rascunho' : 'Pronto';
    };

    self.regionalTable = function() {
      return self.regionalTables[self.order.shipping];
    };

    this.buildHeader = function() {
      var wholeToday = new Date().toISOString(),
        today = wholeToday.split('T')[0],
        formattedDeliveryDate = (
          _.invoke(self, 'order.deliveryDate.toISOString') || ''
        ).split('T')[0];

      return {
        attributes: {
          type: 'Order'
        },
        EffectiveDate: today,
        Status: self.orderStatus,
        accountId: self.client.Id,
        PriceBook2Id: self.order.pricebookId,
        percDescFinanceiro__c: self.order.finDiscount,
        condicaoPgto__c: self.order.paymentOption
          ? self.order.paymentOption.Id
          : '',
        dataEmissao__c: today,
        DataEnvio__c: wholeToday,
        dataEntrega__c: formattedDeliveryDate,
        mensagemNf__c: self.order.nfMsg,
        numeroPedidoCliente__c: self.order.customerOrderNumber,
        numeroPedidoClienteBon__c: self.order.customerOrderBonification,
        obsPedido__c: self.order.observation,
        tipoFrete__c: self.order.shipping,
        tipoPedido__c: 'Normal',
        tabelaRegional__c: self.regionalTable(),
        QuantidadeTotal__c: self.orderQuantity(),
        QuantidadeTotalBonificada__c: self.bonusQuantity(),
        tipoBloqueio__c: _.map(self.exceptions, function(key) {
          return self.exceptionsMessages[key].name;
        }).join(';'), //select multiplo
        expTransgressaoRegra__c: self.order.ruleExceptionNote,
        valorPedidoMinimo__c: self.minOrderValue,
        valorDuplicataMinima__c: self.minDuplValue,
        aceitaEntregaParcial__c: self.order.deliveryFractions,
        possuiCombo__c: self.order.possuiCombo,
        combos__c: self.order.allCombos,
        PodeAnteciparEntrega__c: self.order.PodeAnteciparEntrega,
        percBonus__c: self.orderBonusPercent(),
        custoLogistica__c: self.orderLogisticsCost(),
        gerenciaRegional__c: self.client.gerenciaRegional__c
      };
    };

    self.buildItems = function() {
      return self.selectedProducts.map(function(product) {
        return {
          attributes: {
            type: 'OrderItem'
          },
          PricebookEntryId: product.PricebookentryId__c,
          Quantity: (product.saleQtd || 0) + (product.bonusQtd || 0),
          qtdVenda__c: product.saleQtd || 0,
          valorDesconto__c: product.discount,
          UnitPrice: product.liquidPrice || product.precoLista__c,
          qtdBonificada__c: product.bonusQtd || 0,
          percBonificado__c: product.bonusPerc,
          filial__c: product.codUnidadeFaturamento__c,
          DescFilial__c: product.DescricaoUnidadeFaturamento__c,
          percDescontoNf__c: product.discountPercent,
          percDescontoTotal__c: product.averageDiscount,
          percPoliticaCliente__c: product[self.itemDiscountField],
          percDesconto__c: product.discountPercent,
          idItemTabelaRegional__c: product.Id,
          valorTotalComImpostos__c: product.saleTotalWithTax,
          valorTotalSemImpostos__c: product.saleTotal,
          valorTotalBonus__c: product.bonusTotal,
          valorTotalBonusImpostos__c: product.bonusTotalWithTax,
          descontoMedio__c: product.averageDiscount,
          valorTotalItemSemImposto__c: product.finalPrice,
          family: product.family,
          cubature: product.cubature,
          bloqueiaPedido__c: self.validateAverageDiscount(product),
          cubagemTotal__c: product.cubagemTotal__c
        };
      });
    };

    self.buildBody = function() {
      var body = {
        order: [self.buildHeader()]
      };

      body.order[0].OrderItems = { records: self.buildItems() };

      return body;
    };

    self.saveOrder = function() {
      if(self.client && self.client.tipoDeCarga__c == 'Batida'){
        $ionicPopup
          .alert({
            title: 'Tipo de Carga inválida!',
            template: 'Não foi possível enviar o pedido, pois a conta possui um tipo de carga batida.'
          })
      }else{
        self.orderStatus = 'Pronto';
        var body = self.buildBody();
        return SalesforceService.placeOrder(body);
      }
    };

    self.saveDraftOrder = function() {
      if(self.client && self.client.tipoDeCarga__c == 'Batida'){
        $ionicPopup
          .alert({
            title: 'Tipo de Carga inválida!',
            template: 'Não foi possível enviar o pedido, pois a conta possui um tipo de carga batida.'
          })
      }else{
        self.orderStatus = 'Rascunho';
        var body = self.buildBody();
        return SalesforceService.placeOrder(body);
      }
    };

    self.updateOrder = function(draft) {
      var canBeSend = self.order.tipoCargaCliente__c == self.client.tipoDeCarga__c? false : true; 

      if(self.client && self.client.tipoDeCarga__c == 'Batida' && canBeSend) {
        $ionicPopup
          .alert({
            title: 'Tipo de Carga inválida!',
            template: 'Não foi possível enviar o pedido, pois a conta possui um tipo de carga batida.'
          })
      } else {

        self.orderStatus = draft ? 'Rascunho' : 'Pronto';

        var header = self.buildHeader();
        header.Id = self.orderId;

        var body = { order: header, items: self.buildItems() };

        return SalesforceService.updateOrder(body);
      }
    };

    self.sendOrder = function(draft) {
      return self.orderId
        ? self.updateOrder(draft)
        : draft
        ? self.saveDraftOrder()
        : self.saveOrder();
    };

    self.setRealDiscount = function(product) {
      product.realDiscount = 100 * (1 - product.price / product.precoLista__c);
      //product.discount = round(product.realDiscount)
      product.discount = product.realDiscount;
    };

    self.calculateDiscount = function(product) {
      if (product.price > product.precoLista__c) {
        $ionicPopup
          .alert({
            title: 'Preço inválido',
            template: 'Preço líquido acima do preço de lista.'
          })
          .then(function(response) {
            if (response) {
              product.price = null;
              product.discount = null;
            } else {
              self.setRealDiscount(product);
            }

            self.calculateLiquidPrice(product);
          });
      } else {
        this.setRealDiscount(product);
        this.calculateLiquidPrice(product);
      }
    };

    self.automationOfPrices = function(productChanged, orderService) {
      this.alertAutomationOfPrices(productChanged, orderService);
    };

    self.alertAutomationOfPrices = function(productChanged, orderService) {

      alter = false;
      var cont = 0;

      let pFamilias = self.pFamilia.NomeFamilia__c.split('\r\n');

      for (var i = 0; i < orderService.selectedProducts.length; i++) {
        if (
          productChanged.Family__c != null &&
          productChanged.Family__c ==
          orderService.selectedProducts[i].Family__c &&
          pFamilias.indexOf(productChanged.Family__c) >= 0
        ) {
          cont++;
          if (cont > 1) {
            alter = true;
            break;
          }
        }
      }

      if (
        alter &&
        productChanged.price >= productChanged.standardPrice &&
        productChanged.price < productChanged.precoLista__c
      ) {
        $ionicPopup
          .confirm({
            title: 'Confirmação',
            template:
              'Deseja atribuir o mesmo preço para os produtos da mesma família?',
            cancelText: 'Não',
            cancelType: 'button-default',
            okText: 'Confirma',
            okType: 'button-positive'
          })
          .then(function(response) {
            if (response) {
              for (var i = 0; i < orderService.selectedProducts.length; i++) {
                if (
                  productChanged.Family__c ==
                  orderService.selectedProducts[i].Family__c
                ) {
                  if (orderService.selectedProducts[i].price == null) {
                    orderService.selectedProducts[i].price = 0;
                  }
                  orderService.selectedProducts[i].price = productChanged.price;
                  self.calculateDiscount(orderService.selectedProducts[i]);
                }
              }
            }
          });
      }
    };

    self.check = function(element) {
      if (element != true) {
        show: true;
      }
    };

    self.calculatePrice = function(product) {
      product.discount =
        product.discount && Math.max(Math.min(product.discount, 100), 0);
      product.realDiscount = product.discount;
      product.price = round(
        product.precoLista__c * (1 - product.realDiscount / 100)
      );
      this.calculateLiquidPrice(product);
    };

    self.calculateLiquidPrice = function(product) {
      var finDiscountValue =
        (product.price * (self.order.finDiscount || 0)) / 100;

      product.liquidPrice = round(product.price - finDiscountValue);
      product.discountPercent = round(
        100 * (1 - product.liquidPrice / product.precoLista__c)
      );

      self.calculateAverageDiscounts();
      self.calculateTax(product);
      self.calculateCubagem(product);
    };

    self.calculateBonusDiscount = function(product) {
      var bonusQtt = product.bonusQtd || 0,
        saleQtt = product.saleQtd || bonusQtt || 1;

      product.bonusPerc = round(100 * (bonusQtt / saleQtt));

      self.calculateLiquidPrice(product);
    };

    this.calculateAverageDiscounts = function() {
      this.selectedProducts.forEach(this.calculateAverageDiscount);
    };

    this.calculateAverageDiscount = function(product) {
      var client = self.client;

      var productVolume = (product.saleQtd || 0) + (product.bonusQtd || 0);

      var dischargeCost =
        (client.vlrDescargaPFardoCaixa__c || 0) +
        (client.custoTotalAjudantes__c || 0) / self.totalQuantity();

      var clientCost = Math.max(0, dischargeCost - product.custoDescargaCF__c);

      var logisticsCost = productVolume * clientCost;

      var discount = 100 * (1 - product.price / product.precoLista__c) || 0;

      var avgDiscount =
        (1 - (100 - discount) / (100 + (product.bonusPerc || 0))) * 100;

      var liquidPrice1 = product.saleQtd
        ? ((100 - avgDiscount) * product.precoLista__c) / 100
        : 0;

      var liquidPrice2 =
        ((100 - (client.percTotalContrato__c || 0)) * liquidPrice1) / 100;

      var liquidPrice3 = liquidPrice2 - clientCost;

      var otherCosts =
        liquidPrice3 * ((client.percOutrosCustosLog__c || 0) / 100);

      var finalPrice = liquidPrice3 - Math.abs(otherCosts);

      product.finalPrice = round(finalPrice);
      product.otherCosts = round(otherCosts);
      product.logisticsCost = round(logisticsCost);

      // product.averageDiscount = Math.trunc(10000 * (1 - (finalPrice / product.precoLista__c))) / 100
      product.averageDiscount = round(
        100 * (1 - finalPrice / product.precoLista__c)
      );

      $rootScope.$broadcast('calculate:averageDiscount:finish');
    };

    self.calculateTax = function(product) {
      var price = product.liquidPrice || product.precoLista__c,
        saleQtt = product.saleQtd || 0,
        bonusQtt = product.bonusQtd || 0,
        totalQtt = saleQtt + bonusQtt,
        saleTotal = price * saleQtt,
        bonusTotal = bonusQtt * price,
        productTax = product.aliquotaImposto__c / 100;

      product.liquidPriceWithTax = price + price * productTax;

      product.bonusTax = bonusTotal * productTax;
      product.saleTax = saleTotal * productTax;
      product.totalTax = product.bonusTax + product.saleTax;

      product.saleTotalWithTax = saleTotal + product.saleTax;
      product.saleTotal = saleTotal;

      product.realValuePerItem = saleTotal / totalQtt;

      product.bonusTotalWithTax = bonusTotal + product.bonusTax;
      product.bonusTotal = bonusTotal;
    };

    this.calculateValuesForSelectedProducts = function() {
      _.each(this.selectedProducts, function(product) {
        if (product.discount || product.price) {
          if (product.discount == null) {
            self.calculateDiscount(product);
          }

          if (product.price == null) {
            self.calculatePrice(product);
          }
        }

        self.calculateBonusDiscount(product);
      });
    };

    self.calculateCubagem = function(product){
      if(self.client && product){
        product.cubagemTotal__c = 0;
        if(self.client.padraoPaletizacao__c == 'Cliente'){
          let paletizacao = self.Palletizations.find((palletization) => {
            return palletization.Produto__c == product.produtoId__c;
          });
          if(paletizacao){
            product.cubagemTotal__c = paletizacao.Base__c * paletizacao.Altura__c * product.saleQtd;
          }
        }else if(self.client.padraoPaletizacao__c == 'Carta Fabril'){
          product.cubagemTotal__c = product.basePaletizacao__c * product.alturaPaletizacao__c * product.saleQtd;
        }
      }
    }
  }
]);
