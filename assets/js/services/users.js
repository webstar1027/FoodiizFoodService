module.exports = UsersService;

UsersService.$inject = ['$rootScope', '$http', '$log', '$q'];

function UsersService($rootScope, $http, $log, $q) {

    $rootScope.currentUser = null;

    _.extend(this, {
        signUp: signUp,
        isVerified:isVerified,
        signUpFacebook: signUpFacebook,
        login: login,
        sendResetToken: sendResetToken,
        getUserInfo: getUserInfo,
        saveUser: saveUser,
        confirmEmail: confirmEmail,
        validateResetToken: validateResetToken,
        resetPassword: resetPassword,
        saveImage: saveImage,
        getUserInfobyId: getUserInfobyId,
        showUserbyId: showUserbyId,
        getCountriesPayout: getCountriesPayout,
        saveStripeAccount: saveStripeAccount,
        savePayPalAccount: savePayPalAccount,
        saveBankAccount: saveBankAccount,
        updateCurrency: updateCurrency,
        updateLanguage: updateLanguage,
        updatePassword: updatePassword,
        getStripePermissions: getStripePermissions,
        becomePremium: becomePremium
    });

    /**
     * @name signUp
     * @description attempts to register the user
     * @param {Object} user
     */
    function signUp(user) {
        var deferred = $q.defer();
        var newsLetter = !!user.newsLetter ? 1 : 0;
        $params = $.param({
            'first_name': user.first_name,
            'last_name': user.last_name,
            'email': user.email,
            'password': user.password,
            'news': newsLetter
        });
        $http({
            headers: {'Content-Type': 'application/x-www-form-urlencoded'},
            url: baseURL + 'Users/register/',
            method: 'POST',
            data: $params
        }).then(function (data) {
            deferred.resolve({data: data});
        }, function (msg, code) {
            deferred.reject(msg);
            $log.error(msg, code);
        });
        return deferred.promise;
    }

    /**
     * @name signUpFacebook
     * @description registers a new user
     * @param {type} user
     * @returns {.$q@call;defer.promise}
     */
    function signUpFacebook(user) {
        var deferred = $q.defer();
        $params = $.param({
            'first_name': user.first_name,
            'last_name': user.last_name,
            'email': user.email,
            'gender': user.gender,
            'cover_url': user.cover_url
        });
        $http({
            headers: {'Content-Type': 'application/x-www-form-urlencoded'},
            url: baseURL + 'Users/registerFacebook/',
            method: 'POST',
            data: $params
        }).then(function (data) {
            deferred.resolve({data: data});
        }, function (msg, code) {
            deferred.reject(msg);
            $log.error(msg, code);
        });
        return deferred.promise;
    }

    function isVerified(user) {
        var deferred = $q.defer();
        $params = $.param({
            'email': user.email,
            'password': user.password
        });        
        console.log($params);
        $http({
            headers: {'Content-Type': 'application/x-www-form-urlencoded'},
            url: baseURL + 'Users/isVerified/',
            method: 'POST',
            data: $params
        }).then(function (data) {
            deferred.resolve({data: data});
        }, function (msg, code) {
            deferred.reject(msg);
            $log.error(msg, code);
        });
        return deferred.promise;

    }

    /**
     * @name login
     * @description attempts to login the user
     * @param {Object} user
     */
    function login(user) {
        var deferred = $q.defer();
        $params = $.param({
            'email': user.email,
            'password': user.password
        });
        
        $http({
            headers: {'Content-Type': 'application/x-www-form-urlencoded'},
            url: baseURL + 'Users/login/',
            method: 'POST',
            data: $params
        }).then(function (data) {
            deferred.resolve({data: data});
        }, function (msg, code) {
            deferred.reject(msg);
            $log.error(msg, code);
        });
        return deferred.promise;
    }

    /**
     * @name getUserinfo
     * @description gets the user info
     * @returns {deferred.promise|{then, catch, finally}}
     */
    function getUserInfo() {
        var deferred = $q.defer();
        $http({
            headers: {'Content-Type': 'application/x-www-form-urlencoded'},
            url: baseURL + 'Users/getUserInfo/',
            method: 'GET'
        }).then(function (data) {
            deferred.resolve({data: data});
        }, function (msg, code) {
            deferred.reject(msg);
            $log.error(msg, code);
        });
        return deferred.promise;
    }
    /**
     * @name getUserinfo by id
     * @description gets the user info by id
     * @returns {deferred.promise|{then, catch, finally}}
     */
    function getUserInfobyId(id) {
        var deferred = $q.defer();
        $params = $.param({
            'id': id
        });
        $http({
            headers: {'Content-Type': 'application/x-www-form-urlencoded'},
            url: baseURL + 'Users/getUserInfoId/',
            method: 'POST',
            data: $params
        }).then(function (data) {
            deferred.resolve({data: data});
        }, function (msg, code) {
            deferred.reject(msg);
            $log.error(msg, code);
        });
        return deferred.promise;
    }

    /**
     * @name getUserinfo by id
     * @description gets the user info by id
     * @returns {deferred.promise|{then, catch, finally}}
     */
    function showUserbyId(id) {
        var deferred = $q.defer();
        $params = $.param({
            'id': id
        });
        $http({
            headers: {'Content-Type': 'application/x-www-form-urlencoded'},
            url: baseURL + 'Users/showUserById/',
            method: 'POST',
            data: $params
        }).then(function (data) {
            deferred.resolve({data: data});
        }, function (msg, code) {
            deferred.reject(msg);
            $log.error(msg, code);
        });
        return deferred.promise;
    }

    /**
     * @name saveuser
     * @description Saves the user
     * @param user
     * @returns {deferred.promise|{then, catch, finally}}
     */
    function saveUser(user) {
        var deferred = $q.defer();
        $params = $.param({
            'first_name': user.first_name,
            'last_name': user.last_name,
            'username': user.username,
            'address': user.address,
            'birthdate': moment(user.birthdate, 'DD/MM/YYYY').format('YYYY-MM-DD'),
            'currency': user.currency,
            'description': user.description,
            'genre': user.genre,
            'language': user.language,
            'phone_number': user.phone_number,
            'country_code': user.country_code,
            'preferences': user.preferences,
            'school': user.school,
            'time_zone': user.time_zone,
            'work': user.work,
            'languages': user.languages
        });

        $http({
            headers: {'Content-Type': 'application/x-www-form-urlencoded'},
            url: baseURL + 'Users/save/',
            method: 'POST',
            data: $params
        }).then(function (data) {
            deferred.resolve({data: data});
        }, function (msg, code) {
            deferred.reject(msg);
            $log.error(msg, code);
        });
        return deferred.promise;
    }

    function confirmEmail(token) {
        var deferred = $q.defer();
        $params = $.param({
            'token': token
        });
        $http({
            headers: {'Content-Type': 'application/x-www-form-urlencoded'},
            url: baseURL + 'Users/confirmEmail/',
            method: 'POST',
            data: $params
        }).then(function (data) {
            deferred.resolve({data: data});
        }, function (msg, code) {
            deferred.reject(msg);
            $log.error(msg, code);
        });
        return deferred.promise;
    }

    function validateResetToken(token) {
        var deferred = $q.defer();
        $params = $.param({
            'token': token
        });
        $http({
            headers: {'Content-Type': 'application/x-www-form-urlencoded'},
            url: baseURL + 'Users/validateResetToken/',
            method: 'POST',
            data: $params
        }).then(function (data) {
            deferred.resolve({data: data});
        }, function (msg, code) {
            deferred.reject(msg);
            $log.error(msg, code);
        });
        return deferred.promise;
    }

    function saveImage(image) {
        var deferred = $q.defer();
        $http({
            method: 'POST',
            url: baseURL + 'Users/saveImage/',
            secureuri: false,
            headers: {'Content-Type': 'multipart/form-data'},
            dataType: 'json',
            data: {
                file: image
            },
            transformRequest: function (data, headersGetter) {
                var formData = new FormData();
                angular.forEach(data, function (value, key) {
                    formData.append(key, value);
                });
                var headers = headersGetter();
                delete headers['Content-Type'];
                return formData;
            }
        }).then(function (data) {
            deferred.resolve({data: data});
        }, function (msg, code) {
            deferred.reject(msg);
            $log.error(msg, code);
        });
        return deferred.promise;
    }

    function sendResetToken(email) {
        var deferred = $q.defer();
        $params = $.param({
            'email': email
        });
        $http({
            headers: {'Content-Type': 'application/x-www-form-urlencoded'},
            url: baseURL + 'Users/sendResetToken/',
            method: 'POST',
            data: $params
        }).then(function (data) {
            deferred.resolve({data: data});
        }, function (msg, code) {
            deferred.reject(msg);
            $log.error(msg, code);
        });
        return deferred.promise;
    }

    function resetPassword(email, password) {
        var deferred = $q.defer();
        $params = $.param({
            'email': email,
            'password': password
        });
        $http({
            headers: {'Content-Type': 'application/x-www-form-urlencoded'},
            url: baseURL + 'Users/resetPassword/',
            method: 'POST',
            data: $params
        }).then(function (data) {
            deferred.resolve({data: data});
        }, function (msg, code) {
            deferred.reject(msg);
            $log.error(msg, code);
        });
        return deferred.promise;
    }

    function getCountriesPayout() {
        var deferred = $q.defer();
        $http({
            headers: {'Content-Type': 'application/x-www-form-urlencoded'},
            url: baseURL + 'Stripe/Payment/getCountries',
            method: 'GET'
        }).then(function (data) {
            deferred.resolve({data: data});
        }, function (msg, code) {
            deferred.reject(msg);
            $log.error(msg, code);
        });
        return deferred.promise;
    }

    function saveStripeAccount(account, country) {
        var deferred = $q.defer();
        $params = $.param({
            'id': account.id,
            'stripe_account': account.account_id
        });
        $http({
            headers: {'Content-Type': 'application/x-www-form-urlencoded'},
            url: baseURL + 'Users/saveStripeAccount/',
            method: 'POST',
            data: $params
        }).then(function (data) {
            deferred.resolve({data: data});
        }, function (msg, code) {
            deferred.reject(msg);
            $log.error(msg, code);
        });
        return deferred.promise;
    }

    function getStripePermissions(code) {
        var deferred = $q.defer();
        $params = $.param({
            'code': code
        });
        $http({
            headers: {'Content-Type': 'application/x-www-form-urlencoded'},
            url: baseURL + 'Stripe/Payment/getStripePermissions',
            method: 'POST',
            data: $params
        }).then(function (data) {
            deferred.resolve({data: data});
        }, function (msg, code) {
            deferred.reject(msg);
            $log.error(msg, code);
        });
        return deferred.promise;
    }

    function becomePremium() {
        var deferred = $q.defer();
        $http({
            headers: {'Content-Type': 'application/x-www-form-urlencoded'},
            url: baseURL + 'Users/becomePremium',
            method: 'POST'
        }).then(function (data) {
            deferred.resolve({data: data});
        }, function (msg, code) {
            deferred.reject(msg);
            $log.error(msg, code);
        });
        return deferred.promise;
    }

    function savePayPalAccount(account) {
        var deferred = $q.defer();
        $params = $.param({
            'id': account.id,
            'paypal_email': account.paypal_email
        });
        $http({
            headers: {'Content-Type': 'application/x-www-form-urlencoded'},
            url: baseURL + 'Users/savePaypalAccount/',
            method: 'POST',
            data: $params
        }).then(function (data) {
            deferred.resolve({data: data});
        }, function (msg, code) {
            deferred.reject(msg);
            $log.error(msg, code);
        });
        return deferred.promise;
    }

    function saveBankAccount(account) {
        var deferred = $q.defer();
        $params = $.param({
            'id': account.id,
            'currency': account.currency,
            'username': account.user_name,
            'bankname': account.bank_name,
            'banknumber': account.bank_number,
            'bankswift': account.bank_swift,
            'extrainfo': account.extra_info
        });
        $http({
            headers: {'Content-Type': 'application/x-www-form-urlencoded'},
            url: baseURL + 'Users/saveBankAccount/',
            method: 'POST',
            data: $params
        }).then(function (data) {
            deferred.resolve({data: data});
        }, function (msg, code) {
            deferred.reject(msg);
            $log.error(msg, code);
        });
        return deferred.promise;
    }

    function updateCurrency(_currency) {
        var deferred = $q.defer();
        $params = $.param({
            'currency': _currency
        });
        $http({
            headers: {'Content-Type': 'application/x-www-form-urlencoded'},
            url: baseURL + 'Users/updateCurrency/',
            method: 'POST',
            data: $params
        }).then(function (data) {
            deferred.resolve({data: data});
        }, function (msg, code) {
            deferred.reject(msg);
            $log.error(msg, code);
        });
        return deferred.promise;
    }

    function updateLanguage(_language) {
        var deferred = $q.defer();
        $params = $.param({
            'language': _language
        });
        $http({
            headers: {'Content-Type': 'application/x-www-form-urlencoded'},
            url: baseURL + 'Users/updateLanguage/',
            method: 'POST',
            data: $params
        }).then(function (data) {
            deferred.resolve({data: data});
        }, function (msg, code) {
            deferred.reject(msg);
            $log.error(msg, code);
        });
        return deferred.promise;
    }

    function updatePassword(password) {
        var deferred = $q.defer();
        $params = $.param({
            'password': password
        });
        $http({
            headers: {'Content-Type': 'application/x-www-form-urlencoded'},
            url: baseURL + 'Users/updatePassword/',
            method: 'POST',
            data: $params
        }).then(function (data) {
            deferred.resolve({data: data});
        }, function (msg, code) {
            deferred.reject(msg);
            $log.error(msg, code);
        });
        return deferred.promise;
    }
}