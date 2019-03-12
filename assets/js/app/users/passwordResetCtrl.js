'use strict';

module.exports = PasswordResetController;

PasswordResetController.$inject = ['UsersService', '$stateParams', '$state', 'toaster'];

function PasswordResetController(UsersService, $stateParams, $state, toaster) {

    var vm = this;
    vm.token = null;
    vm.confirmation = "loading";
    vm.loading = true;
    vm.password = "";
    vm.confirm = "";
    vm.notMatch = false;
    vm.sending = false;
    vm.resetPassword = resetPassword;
    vm.checkPasswords = checkPasswords;

    function init() {
        vm.token = $stateParams.token;
        if (!vm.token)
            $state.go("home");
        UsersService.validateResetToken(vm.token).then(_success);
        function _success(response) {
            if (response.data.data.response === 'success') {
                vm.confirmation = response.data.data.response;
                vm.email = response.data.data.email;
                vm.loading = false;
            } else {
                $state.go("home");
            }
            
        }
    }

    function resetPassword() {
        vm.loading = true;
        vm.sending = true;
        UsersService.resetPassword(vm.email, vm.password).then(_success, _error);
        function _success(response) {
            if (response.data.data.response === 'success') {
                toaster.pop("success", "User updated", "Your password has been restored.", 4000);
                setTimeout(function () {
                    $state.go("home");
                }, 4000);
            } else {
                toaster.pop('error', "Error", "Something went wrong, please try again.", 4000);
            }
            vm.loading = false;
        }
        function _error() {
            toaster.pop('error', "Error", "Something went wrong, please try again.", 4000);
        }
    }

    function checkPasswords() {
        if (!vm.password || !vm.confirm)
            return;
        if (vm.password === vm.confirm)
            vm.notMatch = false;
        else
            vm.notMatch = true;
    }

    init();
}