'use strict';

module.exports = GiftCardController;
GiftCardController.$inject = ['$scope', '$rootScope', '$uibModal', 'UsersService', 'toaster', '$state', '$http', '$timeout', '$translate'];
function GiftCardController($scope, $rootScope, $uibModal, UsersService, toaster, $state, $http, $timeout, $translate) { 
	console.log('okok');

	var vm = this;

	// variables
	vm.cardselection = false;




	// methods
	vm.giftcard = giftcard;
  	vm.goToPayment = goToPayment;
    vm.backCard = backCard;


    function giftcard() {
    	$state.go("giftcard");
    }

    function goToPayment() {
    	vm.cardselection = true;
    }

    function backCard() {
    	vm.cardselection = false;
    }

}