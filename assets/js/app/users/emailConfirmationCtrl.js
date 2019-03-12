'use strict';

module.exports = EmailConfirmationController;

EmailConfirmationController.$inject = ['UsersService', '$stateParams','$state', '$rootScope'];

function EmailConfirmationController(UsersService, $stateParams, $state, $rootScope) {

    var vm = this;
    vm.token = null;
    vm.confirmation = "loading";
    vm.loading = true;
    vm.user = '';

    function init() {
        vm.token = $stateParams.token;
        if (!vm.token)
            $state.go("home");
        UsersService.confirmEmail(vm.token).then(_success);
        function _success(response) {
            vm.confirmation = response.data.data.response;            
            vm.loading = false;      
            vm.user = response.data.data.login_data;      
            UsersService.login(vm.user).then(
                function (response) {
                    if (response.data.data.response === 'success' || response.data.data.response === 'login') {
                        // setTimeout(function () {
                        //     window.location.href = baseURL;
                        // }, 500);

                        $state.go("edit_user");
                    } else {
                        toaster.pop("warning", "Incorrect info", "Please check you email and password and try again.", 4000);
                    }
                },
                function (err) {
                    toaster.pop('error', "Error", "Something went wrong, please try again.", 4000);
                }
            ); 
       
        }
        
   
    }

    init();
}