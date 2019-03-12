'use strict';

module.exports = SearchController;

SearchController.$inject = ['$scope', '$rootScope', '$uibModal', 'UsersService', 'toaster', '$state', '$http', '$timeout', '$translate'];

function SearchController($scope, $rootScope, $uibModal, UsersService, toaster, $state, $http, $timeout, $translate) {

    /************************************************
     * VARIABLES
     ************************************************/
    var vm = this;
    vm.isHome = false;
    vm.isAuthenticated = false;
    vm.user = {};
    vm.isCollapsed = true;
    vm.searchobject = {};
    vm.date = '';
    vm.location = '';
    $scope.data = {};
    vm.language = '';
    vm.modalInstance = null;
   
    /************************************************
     * METHODS
     ************************************************/
    vm.signUp = signUp;
    vm.login = login;
    vm.logout = logout;
   
  

    /**
     * @name init
     * @description Initialize the controller
     */
    function init() {
        vm.isHome = window.location.href == baseURL;
        vm.isAuthenticated = !!$rootScope.currentUser;
        if (vm.isAuthenticated)
            getUserInfo();
        vm.logoSrc = (vm.isHome || vm.isAuthenticated) ? 'logo.svg' : 'logo2.png';
        $timeout(displayOffer, 30000);
        //Dont delete this
        /*$translate('header_become_host').then(function(text){
            console.log('text', text)
        })*/
    }

    function displayOffer() {
        if (!!$rootScope.currentUser) {
            var is_premium = $rootScope.currentUser.is_premium;
            if (is_premium)
                return;
            var haveApplied = sessionStorage.getItem('have-applied');
            if (!!haveApplied)
                return;
            if ($rootScope.currentUser.show_premium) {
                if (!!vm.modalInstance)
                    vm.modalInstance.close();
                vm.modalInstance = $uibModal.open({
                    animation: true,
                    templateUrl: 'assets/js/app/modal/premium-host.html',
                    controller: 'ModalInstanceCtrl',
                    scope: $scope,
                    size: 1,
                    resolve: {
                        data: function () {
                            return $scope.data;
                        }.bind(this)
                    }
                });
                vm.modalInstance.result.then(function (data) {
                    UsersService.becomePremium().then(function (response) {
                        $state.go("whyhost");
                        sessionStorage.setItem('have-applied', true);
                    });
                }).catch(function (res) {
                    sessionStorage.setItem('have-applied', true);
                    vm.modalInstance.close();
                });
            }
        }
    }
    /**
     *
     * @param index
     */
    function signUp(index) {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: 'assets/js/app/modal/sign-up.html',
            controller: 'ModalInstanceCtrl',
            scope: $scope,
            size: 1,
            resolve: {
                data: function () {
                    return $scope.data;
                }.bind(this)
            }
        });

        modalInstance.result.then(function (data) {
            //If the attribute cover_url exists then the user was registered from Facebook
            var registerUser = !!data.cover_url ? UsersService.signUpFacebook : UsersService.signUp;
            registerUser(data).then(
                    function (response) {
                        if (response.data.data.response === 'success') {
                            toaster.pop("success", "Account created", "Your account was created successfully, please check your email.", 1000);
                        } else if (response.data.data.response === 'login') {
                            setTimeout(function () {
                                location.reload();
                            }, 500);
                        }
                    },
                    function (err) {
                        toaster.pop('error', "Error", "Something went wrong, please try again.", 4000);
                    }
            );
        }).catch(function (res) {
            modalInstance.close();
        });
    }

    /**
     * @name login
     * @description Shows the login modal
     * @param index
     */
    function login(index) {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: 'assets/js/app/modal/login.html',
            controller: 'ModalInstanceCtrl',
            scope: $scope,
            size: 1,
            resolve: {
                data: function () {
                    return $scope.data;
                }.bind(this)
            }
        });

        modalInstance.result.then(function (data) {
            if (!!data.recoveryEmail) {
                UsersService.sendResetToken(data.recoveryEmail).then(
                        function (response) {
                            toaster.pop("success", "Password Reset", "Instructions were sent successfully, please check your email.", 4000);
                        },
                        function (err) {
                            toaster.pop('error', "Error", "Something went wrong, please try again.", 4000);
                        }
                )
            } else {
                UsersService.isVerified(data).then(
                        function (response) {
                            if (response.data.data.response == 'confirmed') {
                                var loginUser = !!data.cover_url ? UsersService.signUpFacebook : UsersService.login;
                                loginUser(data).then(
                                        function (response) {
                                            if (response.data.data.response === 'success' || response.data.data.response === 'login') {
                                                setTimeout(function () {
                                                    location.reload();
                                                }, 500);
                                            } else {
                                                toaster.pop("warning", "Incorrect info", "Please check you email and password and try again.", 4000);
                                            }
                                        },
                                        function (err) {
                                            toaster.pop('error', "Error", "Something went wrong, please try again.", 4000);
                                        }
                                );
                            } else if (response.data.data.response == 'no_confirmed') {
                                toaster.pop('error', "Error", "Your email did not verified, please try email verification.", 4000);
                            } else {
                                toaster.pop('error', "Error", "Your email did not registered, please try sign up.", 4000);
                            }

                        }
                );
            }
        }).catch(function (res) {
            modalInstance.close();
        });
    }

    /**
     * @name logout
     * @description Destroys the user session
     * @returns {*}
     */
    function logout() {
        return $http.get(baseURL + 'Users/killSession/')
                .then(function (response) {
                    toaster.pop('success', "Logged out", "Your session has been closed.", 4000);
                    window.location.href = baseURL;
                })
                .catch(function (response) {
                    toaster.pop('error', "Error", "Something went wrong, please try again.", 4000);
                });
    }

    /**
     * @name getUserInfo
     * @description Gets user info
     */
    function getUserInfo() {
        UsersService.getUserInfo().then(_setUserInfo);

        /**
         * @name _setUserInfo
         * @description gets the user info
         * @param response
         * @private
         */
        function _setUserInfo(response) {
            vm.user = response.data.data.user;
            vm.user.image_path = (!!response.data.data.user.image_path) ? response.data.data.user.image_path : baseURL + 'assets/images/dashboard/no_avatar-xlarge.jpg';
        }
    }

    //Checking if current location is the homepage
    $rootScope.$on("$locationChangeStart", function (event, next, current) {
        vm.isAuthenticated = !!$rootScope.currentUser;
        vm.isCollapsed = true;
        if (vm.isAuthenticated)
            getUserInfo();
        vm.isHome = (baseURL === next.toString());
        vm.logoSrc = vm.isHome ? 'logo.svg' : 'logo2.png';
    });

    $rootScope.$watch('currentUser', function () {
        vm.isAuthenticated = !!$rootScope.currentUser;
        vm.isCollapsed = true;
        if (vm.isAuthenticated) {
            getUserInfo();
        }
    }, true);

    $rootScope.$on('non-authenticate', function () {
        vm.login(1);
    });

    $rootScope.$on('afterverification', function () {
        vm.afterEmailVerificationLogin();
    });
    $rootScope.$on('linkSignUp', function () {
        vm.signUp(1);
    });

    $rootScope.$on('linkLogin', function () {
        vm.login(1);
    });

    $scope.$watch(function watch(scope) {
        return vm.searchobject;
    }, function handle() {
        if (!vm.searchobject.lat || !vm.searchobject.lng)
            return;
        $state.go("search_hosts", {
            city: vm.location,
            date: vm.date,
            lat: vm.searchobject.lat,
            lng: vm.searchobject.lng
        });
    }, true);

    $rootScope.$watch('globalSettings', function () {
        if (!!$rootScope.globalSettings) {
            var language = $rootScope.globalSettings.language;
            /*$translate.use(language);
            $translate.refresh();*/
        }
    }, true);

    init();
}