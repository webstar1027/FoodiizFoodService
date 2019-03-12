'use strict';

module.exports = FooterController;

FooterController.$inject = ['$scope', '$rootScope', 'UsersService', '$http'];

function FooterController($scope, $rootScope, UsersService, $http) {

    /************************************************
     * VARIABLES
     ************************************************/
    var vm = this;
    vm.selectedLanguage = null;
    vm.currency = null;
    /************************************************
     * METHODS
     ************************************************/

    $rootScope.$watch('currentUser', function () {
        if (!!$rootScope.currentUser) {
            //vm.selectedLanguage = $rootScope.currentUser.language;
            vm.selectedLanguage = "en";
            vm.currency = $rootScope.currentUser.currency;
        }
    }, true);

    $rootScope.$watch('globalSettings', function () {
        if (!!$rootScope.globalSettings) {
            //vm.selectedLanguage = $rootScope.globalSettings.language;
            vm.selectedLanguage = "en";
            vm.currency = $rootScope.globalSettings.currency;
        }
    }, true);


    $scope.$watch(function () {
        return vm.selectedLanguage;
    }, function (current, original) {
        if (current === original)
            return;
        /*setTimeout(function () {
         location.reload();
         }, 500);*/
    });

    $scope.$watch(function () {
        return vm.currency;
    }, function (current, original) {

        if (current === original || !current || !original)
            return;
        if (current === true)
            return;
        UsersService.updateCurrency(current).then(_success, _error);
        function _success() {
            if (!!$rootScope.currentUser)
                $rootScope.currentUser.currency = current;
            $rootScope.globalSettings.currency = current;
            $rootScope.$emit('currencyChanged');
        }
        function _error(err) {
            console.log(err);
        }
    });
}