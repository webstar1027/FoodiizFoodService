/**
 * Created by katat on 10/6/2017.
 */
module.exports = NotificationService;

NotificationService.$inject = ['$rootScope', '$http', '$log', '$q'];

function NotificationService($rootScope, $http, $log, $q) {

    _.extend(this, {
        saveNotification: saveNotification,
        getNotificationAll: getNotificationAll,
        getNotification: getNotification,
        getNotificationComments: getNotificationComments,
        saveNotificationComments: saveNotificationComments,
        updateNotification: updateNotification
    });


    function saveNotification(notification) {
        var deferred = $q.defer();
        $params = $.param({
            'message': notification.message,
            'host': notification.host
        });
        $http({
            headers: {'Content-Type': 'application/x-www-form-urlencoded'},
            url: baseURL + 'Notification/save/',
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

    function getNotificationAll() {
        var deferred = $q.defer();
        $params = $.param({});
        $http({
            headers: {'Content-Type': 'application/x-www-form-urlencoded'},
            url: baseURL + 'Notification/getall/',
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

    function getNotification(id) {
        var deferred = $q.defer();
        $params = $.param({
            id: id
        });
        $http({
            headers: {'Content-Type': 'application/x-www-form-urlencoded'},
            url: baseURL + 'Notification/get/',
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

    function getNotificationComments(id) {
        var deferred = $q.defer();
        $params = $.param({
            id: id
        });
        $http({
            headers: {'Content-Type': 'application/x-www-form-urlencoded'},
            url: baseURL + 'Notification/getcomments/',
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

    function saveNotificationComments(comments) {
        var deferred = $q.defer();
        $params = $.param({
            'id_notification': comments.id,
            'comment': comments.comment

        });
        $http({
            headers: {'Content-Type': 'application/x-www-form-urlencoded'},
            url: baseURL + 'Notification/savecomments/',
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

    function updateNotification(id, status) {
        var deferred = $q.defer();
        $params = $.param({
            'id': id,
            'status': status
        });
        $http({
            headers: {'Content-Type': 'application/x-www-form-urlencoded'},
            url: baseURL + 'Notification/updatenotification/',
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