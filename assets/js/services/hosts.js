module.exports = HostsService;

HostsService.$inject = ['$rootScope', '$http', '$log', '$q'];

function HostsService($rootScope, $http, $log, $q) {

    $rootScope.currentHosts = null;

    _.extend(this, {
        saveHosts: saveHosts,
        getHostUser: getHostUser,
        getGuestExperiences: getGuestExperiences,
        getHostIdUser: getHostIdUser,
        getHostsByLocation: getHostsByLocation,
        getCurrencyAmount: getCurrencyAmount,
        getHostbyId: getHostbyId,
        getHostbyIdAndDate: getHostbyIdAndDate,
        getInineraryByToken: getInineraryByToken,
        getHostEventsDates: getHostEventsDates,
        updateEvent: updateEvent,
        addRate: addRate,
        removeImage: removeImage,
        guestEventCancelation: guestEventCancelation,
        guestEventCancelationNoRefund: guestEventCancelationNoRefund,
        hostEventCancelation: hostEventCancelation,
        hostCancelFreeEvent: hostCancelFreeEvent,
        eventFreeReservation: eventFreeReservation,
        guestFreeEventCancelation: guestFreeEventCancelation,
        getPremiumHosts: getPremiumHosts
    });

    function getCurrencyAmount(currencydata) {
        var deferred = $q.defer();
        $params = $.param({
            'amount': currencydata.amount,
            'fromcurrency': currencydata.fromcurrency,
            'tocurrency': currencydata.tocurrency
        });
        $http({
            headers: {'Content-Type': 'application/x-www-form-urlencoded'},
            url: baseURL + 'Hosts/getCurrencyAmount/',
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

    function saveHosts(host) {
        var deferred = $q.defer();

        _.each(host.selectedDates, function (newDate, i) {
            host.selectedDates[i] = newDate.format('YYYY-MM-DD');
        });
        $params = $.param({
            'id': host.id,
            'experiences': host.experiences,
            'cuisines': host.cuisines,
            'diets': host.diets,
            'min_guests': host.min_guests,
            'max_guests': host.max_guests,
            'title': host.title,
            'description': host.description,
            'menu': host.menu,
            'after_activity': host.after_activity,
            'current_city': host.place,
            'venue_type': host.venue_type,
            'address': host.address,
            'city_name': host.city_name,
            'lng': host.lng,
            'lat': host.lat,
            'currency': host.currency,
            'price': host.price,
            'open_hour': host.openHour,
            'close_hour': host.closeHour,
            'accommodations': host.accommodations,
            'drinks': host.drinks,
            'status': host.status,
            'dates': host.selectedDates,
            'free': host.free ? 1 : 0,
            'hide_guests': host.hide_guests ? 1 : 0,
            'last_minute': host.last_minute ? 1 : 0
        });
        $http({
            headers: {'Content-Type': 'application/x-www-form-urlencoded'},
            url: baseURL + 'Hosts/save/',
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

    function removeImage(_path) {
        var deferred = $q.defer();
        $params = $.param({
            'path': _path
        });
        $http({
            headers: {'Content-Type': 'application/x-www-form-urlencoded'},
            url: baseURL + 'Hosts/removeEventImage/',
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

    function getHostUser() {
        var deferred = $q.defer();
        $http({
            headers: {'Content-Type': 'application/x-www-form-urlencoded'},
            url: baseURL + 'Hosts/getHostUser/',
            method: 'POST'
        }).then(function (data) {
            deferred.resolve({data: data});
        }, function (msg, code) {
            deferred.reject(msg);
            $log.error(msg, code);
        });
        return deferred.promise;
    }

    function getGuestExperiences() {
        var deferred = $q.defer();
        $http({
            headers: {'Content-Type': 'application/x-www-form-urlencoded'},
            url: baseURL + 'Hosts/getGuestExperiences/',
            method: 'POST'
        }).then(function (data) {
            deferred.resolve({data: data});
        }, function (msg, code) {
            deferred.reject(msg);
            $log.error(msg, code);
        });
        return deferred.promise;
    }

    function getHostIdUser($id) {
        var deferred = $q.defer();
        $params = $.param({
            'id': $id
        });
        $http({
            headers: {'Content-Type': 'application/x-www-form-urlencoded'},
            url: baseURL + 'Hosts/getHostbyUserId/',
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

    function getHostbyId($id) {
        var deferred = $q.defer();
        $params = $.param({
            'id': $id
        });
        $http({
            headers: {'Content-Type': 'application/x-www-form-urlencoded'},
            url: baseURL + 'Hosts/getHostbyId/',
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

    function getHostbyIdAndDate($id, $date) {
        var deferred = $q.defer();
        $params = $.param({
            'id': $id,
            'date': $date
        });
        $http({
            headers: {'Content-Type': 'application/x-www-form-urlencoded'},
            url: baseURL + 'Hosts/getHostbyIdAndDate/',
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

    function getHostsByLocation(lat, lng, distance, date, location) {
        var deferred = $q.defer();
        $params = $.param({
            'lat': lat,
            'lng': lng,
            'distance': distance,
            'date': date,
            'location': location
        });

        $http({
            headers: {'Content-Type': 'application/x-www-form-urlencoded'},
            url: baseURL + 'Hosts/getHostsByLocation/',
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

    function getInineraryByToken($token) {
        var deferred = $q.defer();
        $params = $.param({
            'token': $token
        });
        $http({
            headers: {'Content-Type': 'application/x-www-form-urlencoded'},
            url: baseURL + 'Hosts/getInineraryByToken/',
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

    function getPremiumHosts() {
        var deferred = $q.defer();
        $http({
            headers: {'Content-Type': 'application/x-www-form-urlencoded'},
            url: baseURL + 'Hosts/getPremiumHosts/',
            method: 'GET'
        }).then(function (data) {
            deferred.resolve({data: data});
        }, function (msg, code) {
            deferred.reject(msg);
            $log.error(msg, code);
        });
        return deferred.promise;
    }

    function getHostEventsDates() {
        var deferred = $q.defer();
        $http({
            headers: {'Content-Type': 'application/x-www-form-urlencoded'},
            url: baseURL + 'Hosts/getEventsDates/',
            method: 'GET'
        }).then(function (data) {
            deferred.resolve({data: data});
        }, function (msg, code) {
            deferred.reject(msg);
            $log.error(msg, code);
        });
        return deferred.promise;
    }

    function updateEvent(id, date, formatedDate, status) {
        var deferred = $q.defer();
        $params = $.param({
            'id': id,
            'date': date,
            'formateddate': formatedDate,
            'status': status
        });
        $http({
            headers: {'Content-Type': 'application/x-www-form-urlencoded'},
            url: baseURL + 'Hosts/updateEvent/',
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

    function hostCancelFreeEvent(id, date, formatedDate, status) {
        var deferred = $q.defer();
        $params = $.param({
            'id': id,
            'date': date,
            'formateddate': formatedDate,
            'status': status
        });
        $http({
            headers: {'Content-Type': 'application/x-www-form-urlencoded'},
            url: baseURL + 'Hosts/cancelFreeEvent/',
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

    function addRate(review) {
        var deferred = $q.defer();
        $params = $.param({
            'event_id': review.event_id,
            'stars': review.stars,
            'comment': review.review,
            'review_to': review.review_to,
            'reservation_token': review.reservation_token,
            'date': review.date
        });
        $http({
            headers: {'Content-Type': 'application/x-www-form-urlencoded'},
            url: baseURL + 'Hosts/addRate/',
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

    function guestEventCancelation(token, message) {
        var deferred = $q.defer();
        $params = $.param({
            'token': token,
            'message': message
        });
        $http({
            headers: {'Content-Type': 'application/x-www-form-urlencoded'},
            url: baseURL + 'Stripe/Payment/guestEventCancelation',
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

    function hostEventCancelation(token) {
        var deferred = $q.defer();
        $params = $.param({
            'token': token
        });
        $http({
            headers: {'Content-Type': 'application/x-www-form-urlencoded'},
            url: baseURL + 'Stripe/Payment/hostEventCancelation',
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

    function eventFreeReservation(event) {
        var deferred = $q.defer();
        $params = $.param({
            'amount': '0',
            'last_four': '0000',
            'title': event.details.title,
            'first_name': event.guest.first_name,
            'last_name': event.guest.last_name,
            'address': event.guest.address,
            'id_host': event.details.id_user,
            'id_guest': event.guest.id,
            'guests_qty': event.guests_qty,
            'event_date': event.event_date,
            'event_id': event.details.id,
            'host_name': event.details.first_name,
            'host_email': event.details.email,
            'formated_date': event.selectedDateFormated,
            'price_person': event.details.price,
            'guest_email': event.guest.email,
            'currency': event.currency,
            'original_currency': event.details.currency,
            'original_price': '0',
            'original_final_price': '0',
            'notes': event.notes,
            'phone': event.phone
        });
        $http({
            headers: {'Content-Type': 'application/x-www-form-urlencoded'},
            url: baseURL + 'Hosts/eventFreeReservation',
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

    function guestEventCancelationNoRefund(token, message) {
        var deferred = $q.defer();
        $params = $.param({
            'token': token,
            'message': message
        });
        $http({
            headers: {'Content-Type': 'application/x-www-form-urlencoded'},
            url: baseURL + 'Stripe/Payment/guestEventCancelationNoRefund',
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

    function guestFreeEventCancelation(token) {
        var deferred = $q.defer();
        $params = $.param({
            'token': token
        });
        $http({
            headers: {'Content-Type': 'application/x-www-form-urlencoded'},
            url: baseURL + 'Stripe/Payment/guestFreeEventCancelation',
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