'use strict';

module.exports = ViewEventItinerary;

ViewEventItinerary.$inject = ['$scope', '$stateParams', 'HostsService', '$state', '$uibModal', 'toaster'];

function ViewEventItinerary($scope, $stateParams, HostsService, $state, $uibModal, toaster) {
    //Variables
    var vm = this;
    vm.event = {};
    vm.isLoading = false;
    vm.selectedLanguage = 'en';
    vm.currency = 'EUR';

    //Methods
    vm.showInMap = showInMap;
    vm.showConfirm = showConfirm;
    vm.showCancel = showCancel;
    vm.initShare = initShare;
    vm.goToUser = goToUser;

    function init() {
        vm.isLoading = true;
        var token = $stateParams.token;
        if (!token)
            $state.go("home");
        HostsService.getInineraryByToken(token).then(_success, _error);

        function _success(response) {
            if (_.isEmpty(response.data.data.event[0]))
                $state.go("home");
            vm.event = response.data.data.event[0];
            var initTime = moment().format("YYYY-MM-DD HH:mm");
            var endTime = moment(moment(vm.event.event_date).format('YYYY-MM-DD') + ' ' + vm.event.start_time);
            vm.hours_before = endTime.diff(initTime, 'hours');
            vm.event.formated_date = moment(vm.event.event_date).format('LL');
            vm.shareDate = moment(vm.event.event_date, 'YYYY-MM-DD').format('DD-MM-YYYY');
            vm.event.per_person = (parseInt(vm.event.total) / parseInt(vm.event.guest_amonth)).toFixed(2);
            vm.event.free = vm.event.free === '1' ? true : false;
            vm.isLoading = false;
        }

        function _error(err) {
            console.log(err);
        }
    }

    function initShare() {
        __sharethis__.initialize();
    }

    function goToUser(id) {
        $state.go("view_user", {
            id: id
        });
    }

    function showCancel() {
        var freeEvent = vm.event.free === '1' ? true : false;
        if (freeEvent) {
            $scope.title = "Cancel Reservation";
            $scope.modal_message = "Do you want to cancel this reservation?";
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
                var token = vm.event.reservation_token;
                HostsService.guestFreeEventCancelation(token).then(function (response) {
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

        } else {
            var refundPayment = true;
            var initTime = moment().format("YYYY-MM-DD HH:mm");
            var endTime = moment(moment(vm.event.event_date).format('YYYY-MM-DD') + ' ' + vm.event.start_time);
            vm.hours_before = endTime.diff(initTime, 'hours');
            $scope.title = "Cancel Reservation";
            $scope.modal_message = "Since you are cancelling 48 hours prior to the applicable Food Experience date, you will be 100% reimbursed, please click Confirm to proceed.";
            if (vm.hours_before < 48) {
                refundPayment = false;
                $scope.modal_message = "If you cancel this reservation you are not entitled to any return, credit or reimbursement since the date is less than 48 hours before the applicable Food Experience. Please click Confirm to proceed. done";
            }
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
                var token = vm.event.reservation_token;
                var cancelReservation = refundPayment ? HostsService.guestEventCancelation : HostsService.guestEventCancelationNoRefund;
                cancelReservation(token, $scope.modal_message).then(function (response) {
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
    }

    /**
     * @name showInMap
     * @description redirects the user the map cordenades
     * @returns {undefined}
     */
    function showInMap() {
        //var url = 'http://maps.google.com/maps?&z=10&q=' + vm.event.lat + '+' + vm.event.lng + '&ll=' + vm.event.lat + '+' + vm.event.lng;
        var url = 'http://google.com/maps/place/' + vm.event.current_city;
        var win = window.open(url, '_blank');
        win.focus();
    }

    /**
     * @name showConfirm
     * @description Display the confirmation modal
     * @returns {undefined}
     */
    function showConfirm() {
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
            _.extend(data, {'event_id': vm.event.event_id, 'review_to': vm.event.id_host, 'reservation_token': vm.event.reservation_token, 'date': vm.event.event_date});
            HostsService.addRate(data).then(function (response) {
                if (response.data.data.response === 'success') {
                    vm.event.reservation_status = 'confirmed';
                    toaster.pop("success", "Event rated", "Thanks for your review.", 4000);
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

    init();
}