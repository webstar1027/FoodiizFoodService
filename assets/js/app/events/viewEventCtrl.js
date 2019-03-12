'use strict';
module.exports = ViewEventController;
ViewEventController.$inject = ['$stateParams', 'toaster', 'HostsService', '$state', '$rootScope', '$uibModal', 'UsersService', '$scope', 'NotificationService', 'stripe', '$http', '$sce'];
function ViewEventController($stateParams, toaster, HostsService, $state, $rootScope, $uibModal, UsersService, $scope, NotificationService, stripe, $http, $sce) {

    var vm = this;
    vm.interval = 3000;
    var id = "";
    var map = null;
    var marker = null;
    vm.details = {};
    vm.details.soldout = false;
    vm.details.hide_guest = false;
    vm.today = moment();
    vm.date = !!$stateParams.date ? moment($stateParams.date, 'DD-MM-YYYY').toDate() : vm.today;
    vm.calendarMonth = !!$stateParams.date ? moment($stateParams.date, 'DD-MM-YYYY').format('YYYY-MM-DD') : vm.today;
    vm.calendarMonth = moment(vm.calendarMonth);
    vm.isAuthenticated = false;
    vm.dateOptions = {
        minDate: new Date()
    };
    vm.availableDates = [];
    vm.singleDate = new Date();
    vm.opened = false;
    vm.format = 'dd-MM-yyyy';
    vm.selectedDates = [];
    vm.selectedDateFormated = null;
    vm.guests = 1;
    vm.checkEvent = false;
    vm.showPayment = false;
    vm.showSummary = false;
    vm.no_last_minute = false;
    vm.finalPrice = null;
    vm.card = {
        'number': null,
        'exp_month': null,
        'exp_year': null,
        'cvc': null
    };
    vm.cardName = null;
    vm.duration = "";
    vm.guest = {};
    vm.isMobile = false;
    vm.notes = "";
    vm.phone = "";
    vm.country_code = "1";

    vm.isLoading = false;
    vm.selectedLanguage = 'en';
    vm.currency = 'EUR';
    vm.eventLoaded = false;
    vm.originalFinalPrice = 0;

    vm.goToUser = goToUser;
    vm.contactHost = contactHost;
    vm.login = login;
    vm.oneDaySelectionOnly = oneDaySelectionOnly;
    vm.openImage = openImage;
    vm.bookNow = bookNow;
    vm.displayEventInfo = displayEventInfo;
    vm.displayPayment = displayPayment;
    vm.goToMap = goToMap;
    vm.applyPayment = applyPayment;
    vm.applyFreeReservation = applyFreeReservation;
    vm.renderHtml = renderHtml;
    vm.getSlides = getSlides;
    vm.showPicker = showPicker;
    vm.getFeed = getFeed;
    vm.getSubtotal = getSubtotal;
    vm.whoIsGoing = whoIsGoing;
    vm.displaySummary = displaySummary;
    vm.initShare = initShare;

    /**
     * @name displayEventInfo
     * @returns {undefined}
     */
    function displayEventInfo() {
        vm.checkEvent = false;
        angular.element("html, body").animate({scrollTop: 0}, 600);
    }

    /**
     * @name displayPayment
     * @description displays the payment form
     * @returns {undefined}
     */
    function displayPayment() {
        vm.showPayment = true;
        angular.element("html, body").animate({scrollTop: 0}, 600);
    }

    function applyPayment() {
        vm.isLoading = true;
        stripe.card.createToken(vm.card).then(function (response) {
            $params = $.param({
                'access_token': response.id,
                'amount': Math.round(vm.finalPrice),
                'last_four': response.card.last4,
                'title': vm.details.title,
                'first_name': vm.guest.first_name,
                'last_name': vm.guest.last_name,
                'address': vm.guest.address,
                'id_host': vm.details.id_user,
                'id_guest': vm.guest.id,
                'guests_qty': vm.guests,
                'event_date': moment(vm.selectedDates[0]).format('YYYY-MM-DD'),
                'event_id': vm.details.id,
                'host_name': vm.details.first_name,
                'host_email': vm.details.email,
                'formated_date': vm.selectedDateFormated,
                'price_person': vm.details.price,
                'guest_email': vm.guest.email,
                'currency': vm.currency,
                'original_currency': vm.details.currency,
                'original_price': vm.details.original_price,
                'original_final_price': Math.round(vm.originalFinalPrice),
                'notes': vm.notes,
                'phone': '+' + vm.country_code + vm.phone
            });
            return $http({
                headers: {'Content-Type': 'application/x-www-form-urlencoded'},
                url: baseURL + 'Stripe/Payment/process',
                method: 'POST',
                data: $params
            });
        }).then(function (response) {
            if (response.data.response === 'success') {
                $state.go("view_itinerary", {
                    token: response.data.token
                });
            }
            vm.isLoading = false;
        }).catch(function (err) {
            if (err.type && /^Stripe/.test(err.type)) {
                console.log('Stripe error: ', err.message);
            } else {
                console.log('Other error occurred, possibly with your API', err.message);
            }
            vm.isLoading = false;
        });
    }

    function applyFreeReservation() {
        vm.isLoading = true;
        var event = {};
        _.extend(event, {
            details: vm.details,
            guest: vm.guest,
            guests_qty: vm.guests,
            currency: vm.currency,
            formated_date: vm.selectedDateFormated,
            event_date: moment(vm.selectedDates[0]).format('YYYY-MM-DD'),
            notes: vm.notes,
            phone: '+' + vm.country_code + vm.phone
        });
        HostsService.eventFreeReservation(event).then(_setData, _error);
        function _setData(response) {
            if (response.data.data.response === 'success') {
                $state.go("view_itinerary", {
                    token: response.data.data.token
                });
            }
            vm.isLoading = false;
        }

        function _error(err) {
            toaster.pop('error', "Error", "Something went wrong, please try again.", 4000);
            vm.isLoading = false;
        }
    }

    function goToMap(e) {
        e.preventDefault();
        angular.element("#map").animate({scrollTop: 0}, 600);
    }

    function renderHtml(html_code) {
        return $sce.trustAsHtml(html_code);
    }

    /**
     * @name bookNow
     * @description Make a reservation
     */
    function bookNow() {
        if (!vm.isAuthenticated)
            login(null);
        else
            doReservation();
    }

    /**
     * @name doReservation
     * @description displays the reservation details page
     */
    function doReservation() {
        if (vm.selectedDates.length > 0) {
            angular.element("html, body").animate({scrollTop: 0}, 600);
            vm.checkEvent = true;
        } else {
            toaster.pop('warning', "Information", "There are not available dates for this event.", 4000);
        }

    }

    function displaySummary() {
        vm.showPayment = false;
        vm.checkEvent = true;
        angular.element("html, body").animate({scrollTop: 0}, 600);
    }

    /**
     * @name goToHost
     * @description redirects the user to the event page
     * @param host
     */
    function goToUser(id) {
        $state.go("view_user", {
            id: id
        });
    }

    function updatePrice() {
        vm.isLoading = true;
        id = $stateParams.event;
        var date = moment($stateParams.date, 'DD-MM-YYYY');
        date = date.format('YYYY-MM-DD');
        vm.currency = $rootScope.globalSettings.currency;
        HostsService.getHostbyIdAndDate(id, date).then(_setData, _error);
        function _setData(response) {
            var details = response.data.data.hosts[0];
            vm.details.price = details.price;
            vm.details.original_price = details.original_price;
            vm.details.initial_price = details.initial_price;
            vm.details.currency = details.currency;
            setFinalPrice(vm.guests);
            setOriginalFinalPrice(vm.guests);
            vm.currency = $rootScope.globalSettings.currency;
            vm.isLoading = false;
        }

        function _error(err) {
            toaster.pop('error', "Error", "Something went wrong, please try again.", 4000);
        }
    }

    /**
     * @name getEventData
     * @param {type} id
     * @param {type} date
     * @returns {undefined}
     */
    function getEventData(id, date, init) {
        vm.isLoading = true;
        vm.isMobile = $(window).width() <= 767;
        var queryDate = date;
        if (!init) {
            queryDate = moment(date).format('YYYY-MM-DD');
        }
        console.log(id);
        console.log(date);
        console.log(init);
        HostsService.getHostbyIdAndDate(id, queryDate).then(_setData, _error);
        /**
         * @name _setData
         * @param {type} response
         * @returns {undefined}
         */
        function _setData(response) {
            if (!response.data.data.hosts.length)
                $state.go("home");
            vm.details = response.data.data.hosts[0];
            //Parsed properties
            vm.details.cuisine = !!vm.details.cuisine ? JSON.parse(vm.details.cuisine) : [];
            vm.details.drinks = !!vm.details.drinks ? JSON.parse(vm.details.drinks) : [];
            vm.details.experience = !!vm.details.experience ? JSON.parse(vm.details.experience) : [];
            vm.details.accommodations = !!vm.details.accommodations ? JSON.parse(vm.details.accommodations) : [];
            vm.details.diets = !!vm.details.diets ? JSON.parse(vm.details.diets) : [];
            vm.options = [];
            vm.details.free = vm.details.free === '1' ? true : false;
            vm.details.hide_guests = vm.details.hide_guests === '1' ? true : false;
            vm.details.last_minute = vm.details.last_minute === '1' ? true : false;
            var reservations = !!vm.details.total_reservations ? parseInt(vm.details.total_reservations) : 0;
            var max_guests = vm.details.max_guests - reservations;
            vm.details.soldout = vm.details.soldout === '1' || max_guests === 0;
            for (var i = 1; i <= max_guests; i++) {
                vm.options.push(i);
            }
            var compareDate = null;
            var currentDate = null;
            //debugger;
            if (init) {
                for (var i = 0; i < vm.details.dates.length; i++) {
                    compareDate = moment(date, 'YYYY-MM-DD').toDate();
                    currentDate = moment(vm.details.dates[i].event_date, 'YYYY-MM-DD').toDate();
                    if (moment(currentDate).isSame(compareDate)) {
                        vm.selectedDates.push(compareDate);
                        vm.selectedDateFormated = moment(compareDate).format('LL');
                    }
                    vm.availableDates.push(moment(vm.details.dates[i].event_date));
                }
                compareDate = moment(date, 'YYYY-MM-DD').toDate();
                if (moment(currentDate).isSame(vm.today)) {
                    if (!vm.details.last_minute) {
                        vm.no_last_minute = true;
                    }
                }
            } else {
                vm.selectedDates = [];
                vm.selectedDates.push(date);
                vm.selectedDateFormated = moment(date).format('LL');
            }

            for (var i = 0; i < vm.details.event_reviews.length; i++) {
                vm.details.event_reviews[i].date = moment(vm.details.event_reviews[i].date).format('LL');
                vm.details.event_reviews[i].image_path = baseURL + vm.details.event_reviews[i].image_path;
            }
            vm.guests = 1;
            setFinalPrice(vm.guests);
            setOriginalFinalPrice(vm.guests);
            if (vm.selectedDates.length > 0) {
                var initTime = moment(moment(vm.selectedDates[0]).format('YYYY-MM-DD') + ' ' + vm.details.open_hour);
                var endTime = moment(moment(vm.selectedDates[0]).format('YYYY-MM-DD') + ' ' + vm.details.close_hour);
                vm.duration = endTime.diff(initTime, 'hours');
            }
            if (init)
                initMap(response.data.data.hosts[0].lat, response.data.data.hosts[0].lng);
            
            vm.isLoading = false;
            vm.eventLoaded = true;

            angular.element('.carousel-inner').on('click', function (event) {
                var clickImage = event.target.style.backgroundImage;
                var path = decodeURI(clickImage.substring(4, clickImage.length - 1));
                path = path.replace(/['"]+/g, '');
                openImage(path);
            });

            setTimeout(function () {
                $rootScope.$emit('eventLoaded');
            }, 100);
        }

        /**
         * @name _error
         * @param {type} err
         * @returns {undefined}
         */
        function _error(err) {
            toaster.pop('error', "Error", "Something went wrong, please try again.", 4000);
        }
        getUserInfo();
    }

    /**
     * @name init
     * @description Initialize the controller
     */
    function init() {
        id = $stateParams.event;
        var date = moment($stateParams.date, 'DD-MM-YYYY');
        date = date.format('YYYY-MM-DD');
        getEventData(id, date, true);
    }


    /*function getSlides(index) {
     console.log(index);
     if (index - vm.details.images.length >= 0)
     return index - vm.details.images.length;
     else
     return index;
     }*/

    function getSubtotal() {
        if (!vm.eventLoaded)
            return;
        var initial = vm.details.initial_price;
        var guests = vm.guests;
        return Number(initial) * Number(guests);
    }

    function getFeed() {
        if (!vm.eventLoaded)
            return;
        var initial = vm.details.initial_price;
        var guests = vm.guests;
        var final = vm.finalPrice;
        return Number(final) - (Number(initial) * Number(guests));
    }

    function whoIsGoing() {
        if (vm.isAuthenticated) {
            $scope.guestList = vm.details.guests;
            var modalInstance = $uibModal.open({
                animation: true,
                templateUrl: 'assets/js/app/modal/whoIsGoing.html',
                controller: 'ModalInstanceCtrl',
                scope: $scope,
                size: 1,
                resolve: {
                    data: function () {
                        return $scope.data;
                    }.bind(this)
                }
            });
            modalInstance.result.then(function () {});
        } else {
            toaster.pop("warning", "Unable to get guests list", "Please log into the system and try again.", 4000);
        }
    }

    function getSlides($index) {
        var images = '';
        if (vm.isMobile) {
            var first = vm.details.images[$index].image_path;
            images += "<div class='inline-carousel__view carousel-image' style='background-image: url(" + first + "); width: 100%; height: 247px; display: inline-block; vertical-align: top;'></div>";
        } else {
            var max = vm.details.images.length - 1;
            var first = vm.details.images[$index].image_path;
            var second, third, fourth;
            if ($index === max) {
                second = vm.details.images[0].image_path;
                third = vm.details.images[1].image_path;
                fourth = vm.details.images[2].image_path;
            } else if ($index === max - 1) {
                second = vm.details.images[max].image_path;
                third = vm.details.images[0].image_path;
                fourth = vm.details.images[1].image_path;
            } else if ($index === max - 2) {
                second = vm.details.images[$index + 1].image_path;
                third = vm.details.images[$index + 2].image_path;
                fourth = vm.details.images[0].image_path;
            } else {
                second = vm.details.images[$index + 1].image_path;
                third = vm.details.images[$index + 2].image_path;
                fourth = vm.details.images[$index + 3].image_path;
            }
            images += "<div class='inline-carousel__view carousel-image' style='background-image: url(" + first + "); width: 100%; display: inline-block; vertical-align: top;'></div>";
            images += "<div class='inline-carousel__view carousel-image' style='background-image: url(" + second + "); width: 100%; display: inline-block; vertical-align: top;'></div>";
            images += "<div class='inline-carousel__view carousel-image' style='background-image: url(" + third + "); width: 100%; display: inline-block; vertical-align: top;'></div>";
            images += "<div class='inline-carousel__view carousel-image' style='background-image: url(" + fourth + "); width: 100%; display: inline-block; vertical-align: top;'></div>";
            //images = images.replace('/','&#47;');
        }
        return renderHtml(images);
    }



    /**
     * 
     * @param {type} guests
     * @returns {undefined}
     */
    function setFinalPrice(guests) {
        if (!vm.details || !vm.details.price || !guests)
            return;
        vm.pricePerPerson = vm.details.price;
        vm.finalPrice = Number(vm.pricePerPerson) * Number(guests);
    }

    function setOriginalFinalPrice(guests) {
        if (!vm.details || !vm.details.price || !guests)
            return;
        var perPerson = vm.details.original_price;
        vm.originalFinalPrice = parseFloat(perPerson) * Number(guests);
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
            vm.guest = !!response.data.data.user ? response.data.data.user : {};
        }
    }

    /**
     * @name initMap
     * @description initialize Google Map
     * @param lat
     * @param lng
     */
    function initMap(lat, lng) {
        var mapOptions = {
            mapTypeId: google.maps.MapTypeId.terrain,
            mapTypeControl: false,
            disableDoubleClickZoom: true,
            zoomControlOptions: true,
            streetViewControl: false,
            zoom: 14,
            maxZoom: 15,
            scrollwheel: false,
            navigationControl: false,
            scaleControl: false,
            center: new google.maps.LatLng(lat, lng)
        };
        map = new google.maps.Map(document.getElementById('map'), mapOptions);
        marker = new google.maps.Marker({
            position: new google.maps.LatLng(lat, lng),
            title: "Event location",
            icon: normalIcon(),
            draggable: false
        });
        marker.setMap(map);
        function normalIcon() {
            return {
                url: baseURL + 'assets/images/search/event-marker.png'
            };
        }
    }

    /**
     * @name contactHost
     * @description Shows the message popup
     */
    function contactHost() {
        $scope.hostName = vm.details.first_name;
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: 'assets/js/app/modal/sendMessageToHost.html',
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
            data.host = vm.details.id_user;
            NotificationService.saveNotification(data)
                    .then(
                            function (response) {
                                if (response.data.data.response === 'success') {
                                    toaster.pop("success", "Message sent!", "Your message has been sent to the host.", 4000);
                                }
                            },
                            function (err) {
                                toaster.pop('error', "Error", "Something went wrong, please try again.", 4000);
                            }
                    );
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
            UsersService.login(data)
                    .then(
                            function (response) {
                                if (response.data.data.response === 'success') {
                                    toaster.pop("success", "Logged in", "Welcome to Foodiiz.", 4000);
                                    UsersService.getUserInfo().then(_setUserInfo);
                                } else {
                                    toaster.pop("warning", "Incorrect info", "Please check you email and password and try again.", 4000);
                                }
                            },
                            function (err) {
                                toaster.pop('error', "Error", "Something went wrong, please try again.", 4000);
                            }
                    );
            /**
             * @name _setUserInfo
             * @description gets the user info
             * @param response
             * @private
             */
            function _setUserInfo(response) {
                $rootScope.currentUser = response.data.data.user;
            }
        });
    }

    /**
     * @name oneDaySelectionOnly
     * @description removes previous selected dates from selected dates array
     * @param {type} event
     * @param {type} date
     */
    function oneDaySelectionOnly(event, date) {
        event.preventDefault();
        var target = angular.element(event.target);
        if (target.hasClass('picker-off'))
            return;
        var days = angular.element('.picker-days-row').find('.picker-day');
        days.removeClass('picker-selected');
        target.addClass('picker-selected');
        var id = vm.details.id;
        var date = moment(date.date, 'YYYY-MM-DD').toDate();
        getEventData(id, date, false);
        if (moment(date).isSame(vm.today)) {
            if (!vm.details.last_minute) {
                vm.no_last_minute = true;
            } else {
                vm.no_last_minute = false;
            }
        }
    }

    /**
     * @name openImage
     * @param {type} size
     * @param {type} path
     */
    function openImage(path) {

        $scope.imagePath = path;
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: 'assets/js/app/modal/image-modal.html',
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

        });
    }

    function showPicker() {
        vm.opened = !vm.opened;
    }

    function initShare() {
        __sharethis__.initialize();
    }

    $rootScope.$watch('currentUser', function () {
        vm.isAuthenticated = !!$rootScope.currentUser;
    }, true);

    $scope.$watch(function watch(scope) {
        return vm.guests;
    }, function handle(newV) {
        if (!!newV)
            setFinalPrice(newV);
        setOriginalFinalPrice(newV);
    }, true);

    $scope.$on('change-chunk-size', function (event, data) {
        if (data !== vm.chunkSize) {
            vm.details.chunkedSlides = chunk(vm.details.images, data);
            vm.chunkSize = data;
        }
    });

    $(window).resize(function () {
        $scope.$apply(function () {
            vm.isMobile = $(window).width() <= 767;
        });
    });

    $rootScope.$watch('globalSettings', function () {
        if (!!$rootScope.globalSettings) {
            vm.selectedLanguage = $rootScope.globalSettings.language;
            vm.currency = $rootScope.globalSettings.currency;
            if (vm.isLoading)
                return;
            init();
        }
    }, true);

    $rootScope.$on('currencyChanged', updatePrice);
}