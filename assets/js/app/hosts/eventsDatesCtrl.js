'use strict';

module.exports = EventDatesController;

EventDatesController.$inject = ['HostsService', '$sce', '$uibModal', '$http', '$scope', 'toaster', 'stripe'];

function EventDatesController(HostsService, $sce, $uibModal, $http, $scope, toaster, stripe) {

    //Variables
    var vm = this;
    vm.eventsList = [];
    vm.isCollapsed = true;
    vm.limit = "10";
    vm.filterDate = "all";
    vm.eventDetails = false;
    vm.currentEvent = null;
    vm.allowCancel = true;
    vm.allowFinish = false;
    vm.today = moment().format("YYYY-MM-DD");
    var currentEventDate = {};

    //Methods
    vm.seeDetals = seeDetals;
    vm.renderHtml = renderHtml;
    vm.hideDetails = hideDetails;
    vm.finishEvent = finishEvent;
    vm.cancelEvent = cancelEvent;
    vm.showCancelGuest = showCancelGuest;
    vm.showAddFeedback = showAddFeedback;

    function init() {
        HostsService.getHostEventsDates().then(_success, _error);

        /**
         * @name _success
         * @param {type} response
         * @returns {undefined}
         */
        function _success(response) {
            vm.eventsList = !!response.data.data.dates.length ? response.data.data.dates : [];
            var sumMoney = 0;
            var sumGuests = 0;
            for (var i = 0; i < vm.eventsList.length; i++) {
                if (!!vm.eventsList[i].details.length) {
                    for (var j = 0; j < vm.eventsList[i].details.length; j++) {
                        sumMoney += parseInt(vm.eventsList[i].details[j].amount);
                        sumGuests += parseInt(vm.eventsList[i].details[j].guests);
                    }
                    vm.eventsList[i].raised = sumGuests > 0 ? sumGuests * parseInt(vm.eventsList[i].price) : 0;
                    vm.eventsList[i].guests = sumGuests;
                    sumMoney = 0;
                    sumGuests = 0;
                }
                vm.eventsList[i].show_date = moment(vm.eventsList[i].event_date, 'YYYY-MM-DD').format('DD-MM-YYYY');
            }
        }

        /**
         * @name _error
         * @param {type} err
         * @returns {undefined}
         */
        function _error(err) {
            console.log(err);
        }
    }

    function showCancelGuest(token) {
        $scope.title = "Cancel Reservation";
        $scope.modal_message = "Do you want to cancel the Food Experience reservation for this client? The client will be 100% reimbursed, please click Confirm to proceed.";
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: 'assets/js/app/modal/confirmation-modal.html',
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
            HostsService.guestEventCancelation(token).then(function (response) {
                if (response.data.data.response === 'success') {
                    vm.event.reservation_status = 'canceled';
                    toaster.pop("success", "Reservation canceled", "The reservation was canceled successfully.", 4000);
                } else {
                    toaster.pop("warning", "Error", "Something went wrong, please try again.", 4000);
                }
            }, function (err) {
                toaster.pop('error', "Error", "Something went wrong, please try again.", 4000);
            });
        }).catch(function (res) {
            modalInstance.close();
        });
    }

    function showAddFeedback(guest) {
        $scope.stars = 5;
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: 'assets/js/app/modal/rate-host.html',
            controller: 'ratingCtrl',
            scope: $scope,
            size: 1,
            resolve: {
                data: function () {
                    return $scope.data;
                }.bind(this)
            }
        });

        modalInstance.result.then(function (data) {
            _.extend(data, {'event_id': currentEventDate.id, 'review_to': guest.id_user, 'reservation_token': guest.reservation_token, 'date': currentEventDate.date});
            HostsService.addRate(data).then(function (response) {
                if (response.data.data.response === 'success') {
                    guest.allow_review = 1;
                    toaster.pop("success", "Thanks for rate this guest", "You have rate this guest.", 4000);
                } else {
                    toaster.pop("warning", "Error", "Something went wrong, please try again.", 4000);
                }
            }, function (err) {
                toaster.pop('error', "Error", "Something went wrong, please try again.", 4000);
            });
        }, function () {
            modalInstance.close();
        });
    }

    /**
     * @name seeDetals
     * @param {type} event
     * @returns {undefined}
     */
    function seeDetals(event) {
        vm.eventDetails = true;
        vm.selectedDate = moment(event.event_date).format('LL');
        var isSame = moment(event.event_date).isSame(vm.today);
        var isAfter = moment(vm.today).isAfter(event.event_date);
        currentEventDate = {
            'id': event.id,
            'date': event.event_date
        };
        HostsService.getHostbyIdAndDate(event.id, event.event_date).then(_success, _error);

        /**
         * @name _success
         * @param {type} response
         * @returns {undefined}
         */
        function _success(response) {
            vm.currentEvent = response.data.data.hosts[0];
            vm.allowFinish = vm.currentEvent.date_status === 'open' && (isSame || isAfter);
            vm.allowCancel = vm.currentEvent.date_status === 'open';
        }

        /**
         * @name _error
         * @param {type} err
         * @returns {undefined}
         */
        function _error(err) {
            console.log(err);
        }
    }

    function hideDetails() {
        vm.eventDetails = false;
    }

    function renderHtml(html_code) {
        return $sce.trustAsHtml(html_code);
    }

    /**
     * @name finishEvent
     * @description finishes the event
     */
    function finishEvent() {
        $scope.title = 'Do you want to finish the event?';
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: 'assets/js/app/modal/confirmation-modal.html',
            controller: 'ModalInstanceCtrl',
            scope: $scope,
            size: 1,
            resolve: {
                data: function () {
                    return $scope.data;
                }.bind(this)
            }
        });

        modalInstance.result.then(function () {
            var formatedDate = moment(currentEventDate.date).format('LL');
            HostsService.updateEvent(currentEventDate.id, currentEventDate.date, formatedDate, 'finished')
                    .then(
                            function (response) {
                                if (response.data.data.response === 'success') {
                                    vm.allowFinish = false;
                                    vm.allowCancel = false;
                                    vm.currentEvent.date_status = 'finished';
                                    toaster.pop("success", "Event finished", "All your guests for this event were notified.", 4000);
                                    init();
                                } else {
                                    toaster.pop("warning", "Error finishing the event", "There was an error updating the event, please try again.", 4000);
                                }
                            },
                            function (err) {
                                toaster.pop('error', "Error", "Something went wrong, please try again.", 4000);
                            }
                    );
        }, function () {
            modalInstance.close();
        });
    }

    function cancelEvent() {
        var freeEvent = vm.currentEvent.free === '1' ? true : false;
        if (freeEvent) {
            $scope.title = 'Do you want to cancel the event?';
            var modalInstance = $uibModal.open({
                animation: true,
                templateUrl: 'assets/js/app/modal/confirmation-modal.html',
                controller: 'ModalInstanceCtrl',
                scope: $scope,
                size: 1,
                resolve: {
                    data: function () {
                        return $scope.data;
                    }.bind(this)
                }
            });
            modalInstance.result.then(function () {
                var formatedDate = moment(currentEventDate.date).format('LL');
                HostsService.hostCancelFreeEvent(currentEventDate.id, currentEventDate.date, formatedDate, 'canceled').then(function (response) {
                    if (response.data.data.response === 'success') {
                        vm.allowFinish = false;
                        vm.allowCancel = false;
                        vm.currentEvent.date_status = 'canceled';
                        toaster.pop("success", "Event caneled", "This event has been canceled.", 4000);
                        init();
                    } else {
                        toaster.pop("warning", "Error canceling the event", "There was an error updating the event, please try again.", 4000);
                    }
                }, function (err) {
                    toaster.pop('error', "Error", "Something went wrong, please try again.", 4000);
                });
            }, function () {
                modalInstance.close();
            });
        } else {
            if (!!vm.currentEvent.guests.length) {
                var totalRaised = vm.currentEvent.total_reservations * vm.currentEvent.price;
                var guests = 0;
                for (var i = 0; i < vm.currentEvent.guests.length; i++) {
                    guests += parseInt(vm.currentEvent.guests[i].guests_qty);
                }
                var totalToPay = ((vm.currentEvent.price * 0.20) * guests).toFixed(2);
                $scope.title = 'In order to cancel the event, you have to pay 2% from $' + totalRaised + ' (raised money), then you must pay  $' + totalToPay + ' to cancel this event.';
                var modalInstance = $uibModal.open({
                    animation: true,
                    templateUrl: 'assets/js/app/modal/pay-to-foodiiz-modal.html',
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
                    var formatedDate = moment(currentEventDate.date).format('LL');
                    var card = {
                        'number': data.number,
                        'exp_month': data.exp_month,
                        'exp_year': data.exp_year,
                        'cvc': data.cvc
                    };
                    stripe.card.createToken(card).then(function (response) {
                        $params = $.param({
                            'access_token': response.id,
                            'amount': Math.round(totalToPay * 100),
                            'last_four': response.card.last4,
                            'detail': vm.currentEvent.title,
                            'event_id': vm.currentEvent.id,
                            'event_date': currentEventDate.date,
                            'formatedDate': formatedDate
                        });
                        return $http({
                            headers: {'Content-Type': 'application/x-www-form-urlencoded'},
                            url: baseURL + 'Stripe/Payment/eventCancelation',
                            method: 'POST',
                            data: $params
                        });
                    }).then(function (response) {
                        if (response.data.response === 'success') {
                            vm.allowFinish = false;
                            vm.allowCancel = false;
                            vm.currentEvent.date_status = 'canceled';
                            toaster.pop("success", "Event canceled", "All your guests for this event were notified.", 4000);
                        }
                    }).catch(function (err) {
                        if (err.type && /^Stripe/.test(err.type)) {
                            console.log('Stripe error: ', err.message);
                        } else {
                            console.log('Other error occurred, possibly with your API', err.message);
                        }
                    });
                }, function () {
                    modalInstance.close();
                });

            } else {
                $scope.title = 'Do you want to cancel the event?';
                var modalInstance = $uibModal.open({
                    animation: true,
                    templateUrl: 'assets/js/app/modal/confirmation-modal.html',
                    controller: 'ModalInstanceCtrl',
                    scope: $scope,
                    size: 1,
                    resolve: {
                        data: function () {
                            return $scope.data;
                        }.bind(this)
                    }
                });

                modalInstance.result.then(function () {
                    var formatedDate = moment(currentEventDate.date).format('LL');
                    HostsService.updateEvent(currentEventDate.id, currentEventDate.date, formatedDate, 'canceled')
                            .then(
                                    function (response) {
                                        if (response.data.data.response === 'success') {
                                            vm.allowFinish = false;
                                            vm.allowCancel = false;
                                            vm.currentEvent.date_status = 'canceled';
                                            toaster.pop("success", "Event caneled", "This event has been canceled.", 4000);
                                            init();
                                        } else {
                                            toaster.pop("warning", "Error canceling the event", "There was an error updating the event, please try again.", 4000);
                                        }
                                    },
                                    function (err) {
                                        toaster.pop('error', "Error", "Something went wrong, please try again.", 4000);
                                    }
                            );
                }, function () {
                    modalInstance.close();
                });
            }
        }
    }

    init();
}