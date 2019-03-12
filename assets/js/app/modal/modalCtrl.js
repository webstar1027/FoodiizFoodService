module.exports = ModalInstanceCtrl;

ModalInstanceCtrl.$inject = ['$scope', '$rootScope','$uibModalInstance', 'data'];

function ModalInstanceCtrl($scope, $rootScope, $uibModalInstance, data) {

    $scope.mailExists = false;
    $scope.formData = angular.copy(data);
    $scope.displayForgotPassword = false;
    $scope.loading = false;

    $scope.ok = ok;
    $scope.cancel = cancel;
    $scope.login = login;
    $scope.forgotPassword = forgotPassword;
    $scope.linkSignUp = linkSignUp;
    $scope.linkLogin = linkLogin;

    function cancel() {
        $scope.loading = true;
        $uibModalInstance.dismiss('cancel');
    }

    function ok() {
        $scope.loading = true;
        $uibModalInstance.close($scope.formData);
    }

    function linkSignUp() {
        $rootScope.$broadcast('linkSignUp');
    }

    function linkLogin() {
        $rootScope.$broadcast('linkLogin');
    }

    function login() {
        $scope.loading = true;
        //FB.logout(function(){document.location.reload();});
        FB.login(function (response) {
            if (response.authResponse) {
                getUserInfo();
            } else {
                console.log('User canceled login or did not fully authorize.');
            }
        }, {scope: 'email,user_photos,user_videos'});
    }

    function getUserInfo() {
        $scope.loading = true;
        FB.api('/me',
                {fields: "email,first_name,last_name,gender"},
                function (response) {
                    response.cover_url = "http://graph.facebook.com/" + response.id + "/picture?type=normal";
                    $uibModalInstance.close(response);
                });
    }
    
    function forgotPassword(){
        $scope.displayForgotPassword = true;
    }
}