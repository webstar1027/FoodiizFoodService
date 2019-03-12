module.exports = emailExists;

emailExists.$inject = ['$http'];

function emailExists($http) {
    return {
        require: '?ngModel',
        scope: {
            exists: '='
        },
        link: function (scope, element, attrs, ngModelCtrl) {
            element.on('blur', function () {
                var email = element.val();
                if (email) {
                    var isValid = validateEmail(email);
                    if (isValid) {
                        $params = $.param({
                            'email': email
                        });
                        $http({
                            headers: {'Content-Type': 'application/x-www-form-urlencoded'},
                            url: baseURL + 'Users/checkEmailExists/',
                            method: 'POST',
                            data: $params
                        }).then(function (result) {
                            scope.exists = result.data.response === 'true' ? true : false;
                        });
                    }
                } else {
                    scope.mailexists = false;
                }
            });

            function validateEmail(email) {
                var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
                return re.test(email);
            }
        }
    };
}