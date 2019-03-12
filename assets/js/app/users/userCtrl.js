'use strict';

module.exports = UserController;

UserController.$inject = ['UsersService', 'toaster', 'FileUploader', '$scope', '$rootScope', '$stateParams', '$location', '$state', '$sce'];

function UserController(UsersService, toaster, FileUploader, $scope, $rootScope, $stateParams, $location, $state, $sce) {

    /******************
     * VARIABLES
     ******************/
    var vm = this;
    vm.user = null;
    vm.isCollapsed = true;
    vm.token = null;
    vm.files = [];
    vm.currentDate = moment().format("DD-MM-YYYY");
    vm.today = moment();
    vm.user = {};
    var UPLOAD_URL = baseURL + 'Users/saveImage/';
    var uploader = $scope.uploader = new FileUploader({
        url: UPLOAD_URL
    });
    vm.userLoaded = false;
    vm.savingData = false;
    vm.send = false;
    vm.activeNav = 'tab-1';
    vm.paymentOption = '';
    vm.selectCountry = false;
    vm.paymentCountry = '';
    vm.bankSettings = {};
    vm.stripeAccount = {};
    vm.paypalaccount = {};
    vm.resetPayment = false;
    vm.checkobject = {};
    vm.languageSettings = {
        template: '{{option}}',
        enableSearch: false,
        styleActive: true
    };

    vm.user.languages = [];
    vm.user.password = "";
    vm.user.confirm_password = "";
    vm.user.country_code = 'USA(+1)';
    vm.passwordError = false;

    vm.languages = ["English", "French", "Italian", "German", "Portuguese", "Spanish"];

    // FILTERS
    uploader.filters.push({
        name: 'imageFilter',
        fn: function (item, options) {
            var type = '|' + item.type.slice(item.type.lastIndexOf('/') + 1) + '|';
            return '|jpg|png|jpeg|bmp|gif|'.indexOf(type) !== -1;
        }
    });
    // CALLBACKS
    uploader.onWhenAddingFileFailed = function (item /*{File|FileLikeObject}*/, filter, options) {
        //console.info('onWhenAddingFileFailed', item, filter, options);
    };
    uploader.onAfterAddingFile = function (fileItem) {
        //console.info('onAfterAddingFile', fileItem);
    };
    uploader.onAfterAddingAll = function (addedFileItems) {
        //console.info('onAfterAddingAll', addedFileItems);
    };
    uploader.onBeforeUploadItem = function (item) {
        //console.info('onBeforeUploadItem', item);
    };
    uploader.onProgressItem = function (fileItem, progress) {
        //console.info('onProgressItem', fileItem, progress);
    };
    uploader.onProgressAll = function (progress) {
        //console.info('onProgressAll', progress);
    };
    uploader.onSuccessItem = function (fileItem, response, status, headers) {
        //console.info('onSuccessItem', fileItem, response, status, headers);
    };
    uploader.onErrorItem = function (fileItem, response, status, headers) {
        //console.info('onErrorItem', fileItem, response, status, headers);
    };
    uploader.onCancelItem = function (fileItem, response, status, headers) {
        //console.info('onCancelItem', fileItem, response, status, headers);
    };
    uploader.onCompleteItem = function (fileItem, response, status, headers) {
        //console.info('onCompleteItem', fileItem, response, status, headers);
    };
    uploader.onCompleteAll = function () {
        toaster.pop("success", "User updated", "Your profile image has been updated.", 4000);
        init();
    };
    /******************
     * METHODS
     ******************/
    vm.saveUser = saveUser;
    vm.goToHost = goToHost;
    vm.goToUser = goToUser;
    vm.setView = setView;
    vm.selectCountryPayout = selectCountryPayout;
    vm.verifyCountry = verifyCountry;
    vm.saveStripeAccount = saveStripeAccount;
    vm.saveBankAccount = saveBankAccount;
    vm.savePayPalAccount = savePayPalAccount;
    vm.changePaymentMethod = changePaymentMethod;
    vm.updatePassword = updatePassword;
    vm.checkPassword = checkPassword;
    vm.renderHtml = renderHtml;
    /**
     * @name init
     * @description initializes the controller
     */
    function init() {
        if (!!$stateParams.id) {
            UsersService.showUserbyId($stateParams.id).then(_getUserInfo);
        } else {
            UsersService.getUserInfo().then(_setUserInfo);
            getParams();
        }


        /**
         * @name _setUserInfo
         * @description gets the user info
         * @param response
         * @private
         */
        function _setUserInfo(response) {
            vm.user = response.data.data.user;
            vm.user.languages = !!vm.user.languages ? JSON.parse(vm.user.languages) : [];
            $rootScope.currentUser = response.data.data.user;
            if (!!vm.user.stripeaccount) {
                vm.paymentOption = 'Stripe';
                vm.user.stripeaccount = vm.user.stripeaccount[0];
            } else if (!!vm.user.bankaccount) {
                vm.paymentOption = 'Bank';
                vm.user.bankaccount = vm.user.bankaccount[0];
            } else if (!!vm.user.paypalaccount) {
                vm.paymentOption = 'PayPal';
                vm.user.paypalaccount = vm.user.paypalaccount[0];
            } else {
                vm.paymentOption = '';
            }
            vm.user.image_path = (!!response.data.data.user.image_path) ? response.data.data.user.image_path : baseURL + 'assets/images/dashboard/no_avatar-xlarge.jpg';
            vm.user.birthdate = moment(vm.user.birthdate, 'YYYY-MM-DD').format('DD/MM/YYYY');
            vm.user.lat = 0;
            vm.user.lng = 0;
            vm.userLoaded = true;
        }
        /**
         * @name _getUserInfo
         * @description gets the user info
         * @param response
         * @private
         */
        function _getUserInfo(response) {
            if (!response.data.data.user) {
                $state.go("home");
            } else {
                vm.user = response.data.data.user;
                vm.user.languages = !!vm.user.languages ? JSON.parse(vm.user.languages) : [];
                vm.userLoaded = true;
            }
        }
    }

    function getParams() {
        var params = $location.search();
        if (_.isEmpty(params))
            return;
        if (!!params.code) {
            UsersService.getStripePermissions(params.code).then(_success);
            function _success(response) {
                if (!!response.data.data.stripe_details.error) {
                    toaster.pop("warning", "Error", response.data.data.stripe_details.error_description, 4000);
                } else if (!!response.data.data.stripe_details.stripe_user_id) {
                    vm.user.stripeaccount = {
                        'id': '',
                        'account_id': response.data.data.stripe_details.stripe_user_id
                    };
                    UsersService.saveStripeAccount(vm.user.stripeaccount).then(_success, _error);
                    function _success(response) {
                        if (response.data.data.response === 'success') {
                            toaster.pop("success", "User updated", "Your Stripe account has been saved.", 2000);
                            setTimeout(function () {
                                var newUrl = baseURL + 'users/settings';
                                window.location.href = newUrl;
                            }, 2000);
                        }
                    }
                    function _error(err) {
                        console.log(err);
                    }
                } else {
                    toaster.pop("warning", "Error", "Something went wrong, please try again.", 4000);
                }
            }
        } else {
            toaster.pop("warning", "Error", "The user has denied the request.", 4000);
        }

    }
    /**
     * @saveuser
     * @description saves the user info
     */
    function saveUser() {
       
        var first_name = false, last_name = false, genre = false, birthdate = false, email = false, country_code = false, phone_number = false,
                languages = false, address = false, description = false, errort = '';
        if (vm.user.first_name == '') {
            first_name = true;
        }
        if (vm.user.last_name == '') {
            last_name = true;
        }
        if (vm.user.genre == undefined) {
            genre = true;
        }
        if (vm.user.birthdate == '') {
            birthdate = true;
        }
        if (vm.user.email == '') {
            email = true;
        }
        if (vm.user.country_code == undefined) {
            country_code = true;
        }
        if (vm.user.phone_number == '') {
            phone_number = true;
        }
        if (!vm.user.languages.length) {
            languages = true;
        }
        if (vm.user.address == '') {
            address = true;
        }
        if (vm.user.description == '') {
            description = true;
        }       
        if (first_name == true || last_name == true || genre == true || birthdate == true || email == true || country_code == true || phone_number == true || languages == true || address == true || description == true) {
            var errort = 'The following fields are missing:<br>';
            if (first_name == true)
                errort = errort + '- First name <br>';
            if (last_name == true)
                errort = errort + '- Last name<br>';
            if (genre == true)
                errort = errort + '- Gender<br>';
            if (birthdate == true)
                errort = errort + '- Birthdate<br>';
            if (email == true)
                errort = errort + '- Email<br>';
            if (country_code == true)
                errort = errort + '- Country code<br>';
            if (phone_number == true)
                errort = errort + '- Phone number<br>';
            if (languages == true)
                errort = errort + '- Languages<br>';
            if (address == true)
                errort = errort + '- Address<br>';
            if (description == true)
                errort = errort + '- Description<br>';
            toaster.error('Failed', errort, 4000, 'trustedHtml');
        } else {

            UsersService.saveUser(vm.user).then(
                    function (response) {
                        if (response.data.data.response === 'success' && vm.checkobject != vm.user) {
                            toaster.pop("success", "User updated", "Your account info has been updated.", 4000);
                            vm.checkobject = vm.user;
                        }

                    },
                    function (err) {
                        toaster.pop('error', "Error", "Something went wrong, please try again.", 4000);
                    }
            );
        }
    }

    /**
     * @name goToHost
     * @description redirects the user to the event page
     * @param host
     */
    function goToHost(host) {
        $state.go("view_event", {
            event: host.id,
            date: vm.currentDate
        });
    }

    function goToUser(id) {
        $state.go("view_user", {
            id: id
        });
    }

    /**
     * 
     * @param {type} _nav
     * @returns {undefined}
     */
    function setView(_nav) {
        vm.activeNav = _nav;
    }

    /**
     * 
     * @returns {undefined}
     */
    function selectCountryPayout() {
        vm.selectCountry = true;
    }

    /**
     * 
     * @returns {undefined}
     */
    function verifyCountry() {
        vm.loadingCountries = true;
        UsersService.getCountriesPayout().then(_success, _error);
        function _success(response) {
            var availableCountries = response.data.data.countries;
            var stripeAllowed = false;
            for (var i = 0; i < availableCountries.length; i++) {
                if (availableCountries[i] === vm.paymentCountry)
                    stripeAllowed = true;
            }
            vm.paymentOption = stripeAllowed ? 'Stripe' : 'PayPal';
            vm.loadingCountries = false;
        }

        function _error(err) {
            vm.loadingCountries = false;
            console.log(err);
        }
    }

    function saveStripeAccount() {
        vm.savingData = true;
        vm.user.stripeaccount.account_id = !!vm.user.stripeaccount.id ? vm.user.stripeaccount.id : '';
        UsersService.saveStripeAccount(vm.user.stripeaccount, vm.paymentCountry).then(_success, _error);
        function _success(response) {
            if (response.data.data.response === 'success') {
                toaster.pop("success", "User updated", "Your Stripe account has been saved.", 1000);
                setTimeout(function () {
                    location.reload();
                }, 1000);
            }
        }

        function _error(err) {
            console.log(err);
        }
    }

    function savePayPalAccount() {
        vm.savingData = true;
        vm.user.paypalaccount.id = !!vm.user.paypalaccount.id ? vm.user.paypalaccount.id : '';
        UsersService.savePayPalAccount(vm.user.paypalaccount).then(_success, _error);
        function _success(response) {
            if (response.data.data.response === 'success') {
                toaster.pop("success", "User updated", "Your PayPal account has been saved.", 1000);
                setTimeout(function () {
                    location.reload();
                }, 1000);
            }
        }

        function _error(err) {
            console.log(err);
        }
    }

    function saveBankAccount() {
        vm.savingData = true;
        vm.user.bankaccount.id = !!vm.user.bankaccount.id ? vm.user.bankaccount.id : '';
        vm.user.bankaccount.extra_info = !!vm.user.bankaccount.extra_info ? vm.user.bankaccount.extra_info : '';
        UsersService.saveBankAccount(vm.user.bankaccount).then(_success, _error);
        function _success(response) {
            console.log(response);
            if (response.data.data.response === 'success') {
                toaster.pop("success", "User updated", "Your bank account has been saved.", 1000);
                if (!vm.user.bankaccount.id) {
                    setTimeout(function () {
                        location.reload();
                    }, 1000);
                } else {
                    vm.savingData = false;
                }
            }
        }

        function _error(err) {
            console.log(err);
        }
    }

    function updatePassword() {
        vm.savingData = true;
        UsersService.updatePassword(vm.user.password).then(_success, _error);
        function _success(response) {
            console.log(response);
            if (response.data.data.response === 'success') {
                toaster.pop("success", "User updated", "Your password has been updated successfully.", 1000);
            } else {
                toaster.pop("warning", "Error", "Your password can't be the current password.", 1000);
            }
            vm.savingData = false;
            setTimeout(function () {
                location.reload();
            }, 1000);
        }

        function _error(err) {
            console.log(err);
        }
    }

    function checkPassword() {
        if (!vm.user.password || !vm.user.confirm_password)
            return;
        if (vm.user.password !== vm.user.confirm_password) {
            vm.passwordError = true;
        } else {
            vm.passwordError = false;
        }
    }

    function renderHtml(html_code) {
        return $sce.trustAsHtml(html_code);
    }

    function changePaymentMethod() {
        vm.paymentOption = '';
        vm.resetPayment = true;
    }

    init();
}