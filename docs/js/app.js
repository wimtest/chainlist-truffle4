App = {
     web3Provider: null,
     contracts: {},
     account: 0x0,
     loading: false,

     init: function() {
          return App.initWeb3();
     },

     initWeb3: function() {
          if(typeof web3 !== 'undefined') {
            App.web3Provider = web3.currentProvider;
          } else {
            App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
          }

          web3 = new Web3(App.web3Provider);

          App.displayAccountInfo();

          return App.initContract();
     },

     displayAccountInfo: function() {
       web3.eth.getCoinbase(function(err, account) {
         if(err === null) {
           App.account = account;
           $('#account').text(account);
           web3.eth.getBalance(account, function(err, balance) {
             if(err === null) {
               $('#accountBalance').text(web3.fromWei(balance, 'ether') + ' ETH');
             }
           });
         }
       });
     },

     initContract: function() {
       $.getJSON('ChainList.json', function(chainListArtifact) {
         App.contracts.ChainList = TruffleContract(chainListArtifact);
         App.contracts.ChainList.setProvider(App.web3Provider);
         App.listenToEvents();
         return App.reloadArticles();
       });
     },

     reloadArticles: function() {
       if(App.loading) {
         return;
       }
       App.loading = true;

       App.displayAccountInfo();

       var chainListInstance;

       App.contracts.ChainList.deployed().then(function(instance) {
         chainListInstance= instance;
         return chainListInstance.getArticlesForSale();
       }).then(function(articleIds) {
         $('#articlesRow').empty();

         for(var i = 0; i < articleIds.length; i++) {
           var articleId = articleIds[i];
           chainListInstance.articles(articleId.toNumber()).then(function(article) {
             App.displayArticle(article[0], article[1], article[3], article[4], article[5]);
           });
         }

         App.loading = false;
      }).catch(function(err) {
        console.error(err);
      });
    },

    sellArticle: function() {
      var _article_name = $('#article_name').val();
      var _description = $('#article_description').val();
      var _price = web3.toWei(parseFloat($('#article_price').val() || 0), 'ether');

      if(_article_name.trim() == '' || _price == 0) {
        return false;
      }

      App.contracts.ChainList.deployed().then(function(instance) {
        return instance.sellArticle(_article_name, _description, _price, {from: App.account, gas: 500000});
      }).catch(function(err) {
        console.error(err);
        App.loading = false;
      });
    },

    displayArticle: function(id, seller, name, description, price) {
      var articlesRow = $('#articlesRow');
      var etherPrice = web3.fromWei(price, 'ether');

      var articleTemplate = $('#articleTemplate');
      articleTemplate.find('.panel-title').text(name);
      articleTemplate.find('.article-description').text(description);
      articleTemplate.find('.article-price').text(etherPrice + ' ETH');
      articleTemplate.find('.btn-buy').attr('data-id', id);
      articleTemplate.find('.btn-buy').attr('data-value', etherPrice);

      if(seller == App.account) {
        articleTemplate.find('.article-seller').text('You');
        articleTemplate.find('.btn-buy').hide();
      } else {
        articleTemplate.find('.article-seller').text(seller);
        articleTemplate.find('.btn-buy').show();
      }

      articlesRow.append(articleTemplate.html());
    },

    listenToEvents: function() {
      App.contracts.ChainList.deployed().then(function(instance) {
        instance.LogSellArticle({}, {}).watch(function(err, event) {
          if(!err) {
            $('#events').append('<li class="list-group-item">' + event.args._name + ' is now for sale</li>');
          } else {
            console.error(err);
          }

          App.reloadArticles();
        });

        instance.LogBuyArticle({}, {}).watch(function(err, event) {
          if(!err) {
            $('#events').append('<li class="list-group-item">' + event.args._buyer + ' bought ' + event.args._name + '</li>');
          } else {
            console.error(err);
          }

          App.reloadArticles();
        });
      });
    },

    buyArticle: function() {
      event.preventDefault();

      var _articleId = $(event.target).data('id');
      var _price = parseFloat($(event.target).data('value'));

      App.contracts.ChainList.deployed().then(function(instance) {
        return instance.buyArticle(_articleId, {
          from: App.account,
          value: web3.toWei(_price, 'ether'),
          gas: 500000
        });
      }).catch(function(err) {
        console.error(err);
      });
    }
};

$(function() {
     $(window).load(function() {
          App.init();
     });
});
