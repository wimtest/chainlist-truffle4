 var ChainList = artifacts.require('./ChainList.sol');

 contract('ChainList', function(accounts) {
   var chainListInstance;
   var seller = accounts[1];
   var buyer = accounts[2];
   var articleName = 'article 1';
   var articleDescription = 'Description for article 1';
   var articlePrice = 10;

   it('should throw an exception if you try to buy an article when there is no article for sale yet', function() {
     return ChainList.deployed().then(function(instance) {
       chainListInstance = instance;
       return chainListInstance.buyArticle(1, {
         from: buyer,
         value: web3.toWei(articlePrice, 'ether')
       });
     }).then(assert.fail)
     .catch(function(err) {
       assert(true);
     }).then(function() {
       return chainListInstance.getNumberOfArticles();
     }).then(function(data) {
       assert.equal(data.toNumber(), 0, 'Number of articles must be 0');
     });
   });

   it('should throw an exception if you try to buy an article that does not exist', function() {
     return ChainList.deployed().then(function(instance) {
       chainListInstance = instance;
       return chainListInstance.sellArticle(articleName, articleDescription, web3.toWei(articlePrice, 'ether'), {from: seller});
     }).then(function() {
       return chainListInstance.buyArticle(2, {
         from: buyer,
         value: web3.toWei(articlePrice, 'ether')
       });
     }).then(assert.fail)
     .catch(function(err) {
       assert(true);
     }).then(function() {
       return chainListInstance.articles(1);
     }).then(function(data) {
       assert.equal(data[0].toNumber(), 1, 'article id must be 1');
       assert.equal(data[1], seller, 'seller must be ' + seller);
       assert.equal(data[2], 0x0, 'buyer must be empty');
       assert.equal(data[3], articleName, 'article name must be ' + articleName);
       assert.equal(data[4], articleDescription, 'article description must be ' + articleDescription);
       assert.equal(data[5].toNumber(), web3.toWei(articlePrice, 'ether'), 'article price must be ' + web3.toWei(articlePrice, 'ether'));
     });
   });

   it('should throw an exception if you try to buy your own article', function() {
     return ChainList.deployed().then(function(instance) {
       chainListInstance = instance;

       return chainListInstance.buyArticle(1, {
         from: seller,
         value: web3.toWei(articlePrice, 'ether')
       });
     }).then(assert.fail)
     .catch(function(err) {
       assert(true);
     }).then(function() {
       return chainListInstance.articles(1);
     }).then(function(data) {
       assert.equal(data[0].toNumber(), 1, 'article id must be 1');
       assert.equal(data[1], seller, 'seller must be ' + seller);
       assert.equal(data[2], 0x0, 'buyer must be empty');
       assert.equal(data[3], articleName, 'article name must be ' + articleName);
       assert.equal(data[4], articleDescription, 'article description must be ' + articleDescription);
       assert.equal(data[5].toNumber(), web3.toWei(articlePrice, 'ether'), 'article price must be ' + web3.toWei(articlePrice, 'ether'));
     });
   });

   it('should throw an exception if you try to buy an article for a value different from its price', function() {
     return ChainList.deployed().then(function(instance) {
       chainListInstance = instance;
       return chainListInstance.buyArticle(1, {
         from: buyer,
         value: web3.toWei(articlePrice + 1, 'ether')
       });
     }).then(assert.fail)
     .catch(function(err) {
       assert(true);
     }).then(function() {
       return chainListInstance.articles(1);
     }).then(function(data) {
       assert.equal(data[0].toNumber(), 1, 'article id must be 1');
       assert.equal(data[1], seller, 'seller must be ' + seller);
       assert.equal(data[2], 0x0, 'buyer must be empty');
       assert.equal(data[3], articleName, 'article name must be ' + articleName);
       assert.equal(data[4], articleDescription, 'article description must be ' + articleDescription);
       assert.equal(data[5].toNumber(), web3.toWei(articlePrice, 'ether'), 'article price must be ' + web3.toWei(articlePrice, 'ether'));
     });
   });

   it('should throw an exception if you try to buy an article that has already been sold', function() {
     return ChainList.deployed().then(function(instance) {
       chainListInstance = instance;
       return chainListInstance.buyArticle(1, {
         from: buyer,
         value: web3.toWei(articlePrice, 'ether')
       });
     }).then(function() {
       return chainListInstance.buyArticle(1, {
         from: buyer,
         value: web3.toWei(articlePrice, 'ether')
       });
     })
     .then(assert.fail)
     .catch(function(err) {
       assert(true);
     }).then(function() {
       return chainListInstance.articles(1);
     }).then(function(data) {
       assert.equal(data[0].toNumber(), 1, 'article id must be 1');
       assert.equal(data[1], seller, 'Seller must be ' + seller);
       assert.equal(data[2], buyer, 'Buyer must be ' + buyer);
       assert.equal(data[3], articleName, 'Article name must be ' + articleName);
       assert.equal(data[4], articleDescription, 'Article description must be ' + articleDescription);
       assert.equal(data[5].toNumber(), web3.toWei(articlePrice, 'ether'), 'Article price must be ' + web3.toWei(articlePrice, 'ether'));
     });
   });
 });
