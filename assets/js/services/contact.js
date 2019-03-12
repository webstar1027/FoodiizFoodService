module.exports = ContactService;

ContactService.$inject = ['$http', '$log', '$q'];

function ContactService($http, $log, $q) {
    _.extend(this, {
        sendEmail: sendEmail
    });

    /**
     * @name signUp
     * @description attempts to register the user
     * @param {Object} user
     */
    function sendEmail(data) {
        var deferred = $q.defer();
        $params = $.param({
            'name': data.name,
            'email': data.email,
            'message': data.message
        });
        $http({
            headers: {'Content-Type': 'application/x-www-form-urlencoded'},
            url: baseURL + 'Email/send_mail/',
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