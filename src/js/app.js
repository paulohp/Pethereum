App = {
  web3Provider: null,
  contracts: {},

  init: function() {
    // Load pets.
    $.getJSON('../pets.json', function(data) {
      var petsRow = $('#petsRow');
      var petTemplate = $('#petTemplate');

      for (i = 0; i < data.length; i ++) {
        petTemplate.find('.panel-title').text(data[i].name);
        petTemplate.find('img').attr('src', data[i].picture);
        petTemplate.find('.pet-breed').text(data[i].breed);
        petTemplate.find('.pet-age').text(data[i].age);
        petTemplate.find('.pet-location').text(data[i].location);
        petTemplate.find('.btn-adopt').attr('data-id', data[i].id);

        petsRow.append(petTemplate.html());
      }
    });

    return App.initWeb3();
  },

  initWeb3: function() {
    // Initialize web3 and set the provider to the testRPC.
    if(typeof web3 !== 'undefined') {
      App.web3Provider = web3.currentProvider;
      web3 = new Web3(web3.currentProvider);
    } else {
      // set the provider you want from Web3.providers
      App.web3Provider = new web3.providers.HttpProvider('http://localhost:8545');
      web3 = new Web3(App.web3Provider);
    }

    return App.initContract();
  },

  initContract: function() {
    $.getJSON('Adoption.json', function(data){
      const AdoptionArtifact = data;
      App.contracts.Adoption = TruffleContract(AdoptionArtifact);
      App.contracts.Adoption.setProvider(App.web3Provider);

      return App.markAdopted();
    })

    return App.bindEvents();
  },

  bindEvents: function() {
    $(document).on('click', '.btn-adopt', App.handleAdopt);
  },

  handleAdopt: function() {
    event.preventDefault();

    const petId = parseInt($(event.target).data('id'));

    const adoptionInstance;

    web3.eth.getAccounts((error, accounts) => {
      if(error) console.log(error)

      let [account, ] = accounts;
      App.contracts.Adoption.deployed()
        .then(instance => {
          adoptionInstance = instance;

          return adoptionInstance.adopt(petId, { from: account });
        })
        .then(result => {
          return App.markAdopted();
        })
        .catch(console.error);
    })
  },

  markAdopted: function(adopters, account) {
    var adoptionInstance;

    App.contracts.Adoption.deployed()
      .then(instance => {
        adoptionInstance = instance;
        return adoptionInstance.getAdopters.call();
      })
      .then(adopters => {
        for(i = 0; i < adopters.length; i++) {
          if(adopters[i] !== '0x0000000000000000000000000000000000000000') {
            $('.panel-pet').eq(i).find('button').text('Pending...').attr('disabled', true);
          }
        }
      })
      .catch(console.error)
  }

};

$(function() {
  $(window).load(function() {
    App.init();
  });
});
