'use strict';

module.exports = HostsController;

HostsController.$inject = ['FileUploader', '$scope', 'HostsService', '$state', 'toaster', '$stateParams', '$rootScope'];

function HostsController(FileUploader, $scope, HostsService, $state, toaster, $stateParams, $rootScope) {
    /************************************************
     * VARIABLES
     ************************************************/
    var vm = this;
    var UPLOAD_URL = baseURL + 'Hosts/saveImage/';
    var uploader = $scope.uploader = new FileUploader({
        url: UPLOAD_URL
    });
    var isEditing = false;
    var map = null;
    var marker = null;
    var mapInit = false;
    vm.imagesQty = 0;
    vm.today = moment();
    vm.lat = 0;
    vm.lng = 0;
    vm.limitDay = moment("2018-04-10T00:00:00").format('YYYY-MM-DD');
    vm.originalHost = {};
    vm.hostobject = vm.hostobject || {};
    vm.hostobject.lat = null;
    vm.hostobject.lng = null;
    vm.hostobject.activeDate = moment().format("DD-MM-YYYY");
    vm.hostobject.selectedDates = [];
    vm.hostobject.eventdDates = [];
    vm.hostobject.venue_type = "House";
    vm.hostobject.images = [];
    vm.hostobject.after_activityOptions = [];   
    vm.hostobject.status = '';
    vm.hostobject.freeEvent = false;
    vm.hostobject.menu = '';
    vm.hostobject.description = '';
    vm.hostobject.canModify = true;
    vm.description_placeholder = 'Example: This food experience is a perfect combination of Tunisian and Italian cuisine. All the ingredients are organic and km0 cause they come directly from my own vegetable garden!';
    vm.menu_placeholder = '* STARTER * --- * MAIN COURSE * --- * DESSERT * --- * DRINKS *';
    vm.after_activity_placeholder = 'After dinner we can go for a nice walk so I can show you the beauty of my city';

    vm.activeNav = 'tab-1';
    vm.saveText = 'Submit for review';

    vm.hostList = [];
    vm.guestExperienceList = [];
    vm.isCollapsed = true;
    vm.allowStep2 = false;
    vm.allowStep3 = false;
    vm.allowSave = false;
    vm.whyhoststep = false;
    vm.displayStep1 = true;
    vm.displayStep2 = false;
    vm.displayStep3 = false;

    vm.send = false;
    vm.hostID = null;
    vm.hoursOptions = [];
    
    vm.filterStatus = "all";
    vm.filterGuestStatus = "all";
    vm.checkPrice = checkPrice;

    vm.optionsSettings = {
        template: '{{option}}',
        enableSearch: true,
        styleActive: true
    };

    vm.accommodationsFilter = '';
    vm.hostobject.accommodations = [];
    vm.accommodationOptions = ["Family friendly- Kids are welcome", "Wheelchair accessible", "Pets in the house", "Air conditioning", "Elevator in the building", "Free parking", "Smoking allowed in the house", "Street parking", "Nearby public transport", "Possibility to pick up the guests", "Possibility to take the guests home after"];

    vm.drinksFilter = '';
    vm.hostobject.drinks = [];
    vm.drinksOptions = ["Tea", "Juice", "Water", "Soda", "Beer", "Cocktails", "Digestif", "Red Wine", "White Wine", "Sparkling Wine", "Wine", "No Alcohol", "Aperitif", "Spirits", "Coffee"];

    vm.cuisineFilter = '';
    vm.hostobject.cuisines = [];
    vm.cuisineOptions = ["Tunisian", "Maroccan", "Algerian", "Egyptian", "African", "American", "Asian", "Basque", "Catalan", "Chinese", "Creole", "Eastern Europe", "French", "Fusion", "German", "Greek", "Indian", "Italian", "Japanese", "Mexican", "Persian", "North African", "Portuguese", "Russian", "South American", "Spanish", "Thai", "Turkish", "Vietnamese", "Scandinavian", "Barbecue", "Danish", "Dutch", "Chilean", "English", "Irish", "Cajun", "Jamaican", "Hawaiian", "Hungarian", "Icelandic", "Nepalese", "Antique", "Brazilian", "Belgian", "Cambodian", "Carrabean", "European", "Kurdish", "Other", "Peruvian", "Philippines", "Malay", "Latin American", "Malaysian", "Mediterranean", "Middle Eastern", "Sami", "Seafood", "Singaporean", "Sri Lankan"];

    vm.experiencesFilter = '';
    vm.hostobject.experiences = [];
    vm.experiencesOptions = ["Aperitif", "Breakfast", "Brunch", "Cooking class", "Dinner", "Food walk", "Lunch", "Tea time", "Picnic"];

    vm.dietFilter = '';
    vm.hostobject.diets = [];
    vm.dietOptions = ["Vegetarian", "Vegan", "Halal", "Gluten free", "Organic", "Diabetes", "Lactose intolerance", "No Pork", "Kosher", "No Alcohol", "Allergic to Nuts", "Allergic to Sesame", "Allergic to Beans", "Allergic to Eggs", "Allergic to Fish", "Allergic to Shellfish", "Allergic to Gluten"];

    vm.hostobject.title = '';
    vm.hostobject.openHour = '';
    vm.hostobject.closeHour = '';
    vm.hostobject.min_guests = '1';
    vm.hostobject.max_guests = '6';
    vm.hostobject.openHour = '06:00';
    vm.hostobject.closeHour = '19:00';
    vm.hostobject.dishes = [];
    vm.dish = {};
    /************************************************
     * METHODS
     ************************************************/
    vm.saveHost = saveHost;
    vm.viewHost = viewHost;
    vm.getEventById = getEventById;
    vm.getHostUser = getHostUser;
    vm.step1 = step1;
    vm.step2 = step2;
    vm.goToStep1 = goToStep1;
    vm.goToStep2 = goToStep2;
    vm.goToStep3 = goToStep3;
    vm.cityChanged = cityChanged;
    vm.removeImage = removeImage;
    vm.clickedDay = clickedDay;
    vm.removeFromQueue = removeFromQueue;
    vm.setView = setView;
    vm.goToExperience = goToExperience;
    vm.goHome = goHome;
    vm.passwhyHost = passwhyHost;
    $(window).on('beforeunload', function () {
        if (vm.displayStep2 == true) {
            return "are you sure want to leave?";
        }
        if (vm.displayStep3 == true) {
            return "are you sure want to leave?";
        }

    });
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
        vm.imagesQty = vm.imagesQty + 1;
        checkAllowSave();
    };
    uploader.onAfterAddingAll = function (addedFileItems) {
        //console.info('onAfterAddingAll', addedFileItems);
    };
    uploader.onBeforeUploadItem = function (item) {

        item.formData.push({'id_host': vm.hostID});
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
        vm.imagesQty = vm.imagesQty - 1;
        checkAllowSave();
    };
    uploader.onCompleteItem = function (fileItem, response, status, headers) {
        //console.info('onCompleteItem', fileItem, response, status, headers);
    };
    uploader.onCompleteAll = function () {
        toaster.pop("success", "Host created", "Your event has been saved successfully.", 4000);
        $state.transitionTo('your_listings');
    };

    /*
     *  change event price input
     * 
     *  return alert dialog
     */
    function checkPrice() {
        var currencydata = {
            'amount': vm.hostobject.price,
            'fromcurrency': $rootScope.globalSettings.currency,
            'tocurrency': "USD"
        };
        HostsService.getCurrencyAmount(currencydata).then(
                function (response) {
                    if (response.data.data.amount > 40) {
                        toaster.error("FOODIIZ RECCOMEND", "Foodiiz help people to socialize and share the passion for food, so keeping the price at a decent level will help more people to have a great experience. Furthermore, we’ll have a special page where we promote the event below 40usd.", 30000);
                    }
                },
                function (err) {
                    toaster.pop('error', "Error", "Something went wrong, please try again.", 1000);
                }
        );
    }

    /**
     * @name saveHost
     * @description saves a host in the database
     * @param {type} _status
     * @returns {undefined}
     */
    function saveHost(_status) {
        if (vm.send)
            return;
        if (_status === 'draft') {
            vm.hostobject.status = _status;
        } else {
            if (!!vm.hostobject.id && (_status === 'draft' || vm.hostobject.status === 'draft' || vm.hostobject.status === 'disabled')) {
                vm.hostobject.status = 'revision';
            } else if (!!vm.hostobject.id && vm.hostobject.status === 'rejected') {
                vm.hostobject.status = 'revision';
            } else if (!vm.hostobject.id && !vm.hostobject.status) {
                vm.hostobject.status = 'revision';
            } else if (!!vm.hostobject.id && (vm.hostobject.status === 'approved' || vm.hostobject.status === 'disabled')) {
                var isSame = angular.equals(vm.originalHost, vm.hostobject);
                if (!isSame)
                    vm.hostobject.status = 'revision';
            }
        }
        vm.send = true;   
        HostsService.saveHosts(vm.hostobject).then(
                function (response) {
                    if (response.data.data.response === 'success') {
                        vm.hostID = !!vm.hostID ? vm.hostID : response.data.data.id_host;
                        if (!!uploader.queue.length) {
                            uploader.uploadAll();
                        } else {
                            toaster.pop("success", "Event saved", "Your event has been saved successfully.", 4000);
                            $state.transitionTo('your_listings');
                        }
                    }
                },
                function (err) {
                    toaster.pop('error', "Error", "Something went wrong, please try again.", 4000);
                }
        );
    }

    function getHostUser() {
        HostsService.getHostUser().then(function (response) {
            vm.hostList = response.data.data.hosts;
        });
    }

    /**
     * @name clickedDay
     * @description handles the click event
     * @param {type} x
     * @param {type} y
     * @returns {undefined}
     */
    function clickedDay(e, day) {
        e.preventDefault();
        var formatedDay = moment(day.date).format('YYYY-MM-DD');
        if (_dayBelongsTo(formatedDay, vm.hostobject.eventdDates) && vm.hostobject.status != 'draft')
            return;
        if (_dayBelongsTo(formatedDay, vm.hostobject.selectedDates)) {
            var index = null;
            for (var i = 0; i < vm.hostobject.selectedDates.length; i++) {
                if (moment(vm.hostobject.selectedDates[i]).isSame(formatedDay))
                    index = i;
            }
            if (typeof index !== 'null') {
                vm.hostobject.selectedDates.splice(index, 1);
                checkAllowSave();
                43
            }
        } else {
            vm.hostobject.selectedDates.push(day.date);
            checkAllowSave();
        }

        /**
         * @name _dayBelongsTo
         * @description checks if a day exist in a given array
         * @param {type} _day
         * @param {type} _datesArray
         * @returns boolean
         */
        function _dayBelongsTo(_day, _datesArray) {
            var dayExist = false;
            for (var i = 0; i < _datesArray.length; i++) {
                if (moment(_datesArray[i]).isSame(_day))
                    dayExist = true;
            }
            return dayExist;
        }
    }

    function getEventById($id) {
        HostsService.getHostIdUser($id.data).then(function (response) {
            isEditing = true;
            var event = response.data.data.hosts[0];
            vm.hostID = event.id;
            vm.hostobject.id = event.id;
            vm.hostobject.title = event.title;
            vm.hostobject.openHour = event.open_hour;
            vm.hostobject.closeHour = event.close_hour;
            vm.hostobject.lat = event.lat;
            vm.hostobject.lng = event.lng;
            vm.hostobject.menu = event.menu;
            vm.hostobject.description = event.description;
            vm.hostobject.after_activity = !!event.after_activity ? event.after_activity : '';
            vm.hostobject.currency = event.currency;
            vm.hostobject.active = event.address;
            vm.hostobject.address = event.address;
            vm.hostobject.city_name = event.city_name;
            vm.hostobject.id = event.id;
            vm.hostobject.images = event.images;
            vm.hostobject.min_guests = event.min_guests;
            vm.hostobject.max_guests = event.max_guests;
            vm.hostobject.price = parseFloat(event.price);
            vm.hostobject.venue_type = event.venue_type;
            vm.hostobject.place = event.current_city;
            vm.hostobject.status = event.status;
            vm.hostobject.free = event.free === '1' ? true : false;
            vm.hostobject.hide_guests = event.hide_guests === '1' ? true : false;
            vm.hostobject.last_minute = event.last_minute === '1' ? true : false;
            vm.hostobject.canModify = event.canModify;

            //Parsed properties
            vm.hostobject.cuisines = !!event.cuisine ? JSON.parse(event.cuisine) : [];
            vm.hostobject.drinks = !!event.drinks ? JSON.parse(event.drinks) : [];
            vm.hostobject.experiences = !!event.experience ? JSON.parse(event.experience) : [];
            vm.hostobject.accommodations = !!event.accommodations ? JSON.parse(event.accommodations) : [];
            vm.hostobject.diets = !!event.diets ? JSON.parse(event.diets) : [];
            vm.imagesQty = vm.hostobject.images.length;

            vm.saveText = '';
            switch (vm.hostobject.status) {
                case '':
                    vm.saveText = 'Submit for review';
                    break;
                case 'draft':
                    vm.saveText = 'Submit for review';
                    break;
                case 'rejected':
                    vm.saveText = 'Submit for new approval';
                    break;
                case 'approved':
                    vm.saveText = 'Submit for new approval';
                    break;
                case 'disabled':
                    vm.saveText = 'Submit for new approval';
                    break;
                case 'revision':
                    vm.saveText = 'Reviewing';
                    break;
            }

            for (var i = 0; i < event.dates.length; i++) {
                vm.hostobject.selectedDates.push(moment(event.dates[i].event_date));
                vm.hostobject.eventdDates.push(moment(event.dates[i].event_date));
            }
            vm.allowStep2 = true;
            vm.allowStep3 = true;
            checkAllowSave();
            vm.originalHost = angular.copy(vm.hostobject);
            if(vm.hostobject.status === 'revision') {
                toaster.pop('warning', "Information", "You can't update an event under revision.", 4000);
            }
        });
    }

    function viewHost(host) {
        $state.go('hosts_new', {data: host});
    }

    function init() {
        if (!!$stateParams.data)
            getEventById($stateParams);
        vm.getHostUser();
        getGuestExperiences();
        _setHours();
    }

    function getGuestExperiences() {
        HostsService.getGuestExperiences().then(function (response) {
            vm.guestExperienceList = response.data.data.experiences;
        });
    }

    function goHome() {
        $state.go('home');
    }

    /**
     * @name _setHours
     * @description set the hours for time pickers
     * @private
     */
    function _setHours() {
        var hour = {};
        for (var i = 0; i <= 23; i++) {
            hour = (i < 10) ? ('0' + i) : i;
            vm.hoursOptions.push({
                'id': hour + ':00',
                'hour': hour + ':00'
            });
            vm.hoursOptions.push({
                'id': hour + ':30',
                'hour': hour + ':30'
            });
            hour = "";
        }
    }

    /**
     * @name initGeolocation
     * @description gets user localization
     */
    function initGeolocation() {
        var defaultPosition = {
            coords: {
                latitude: 0,
                longitude: 0
            }
        };
        var options = {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 60000
        };
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(_success, _fail, options);
        } else {
            _initMap(defaultPosition);
        }

        /**
         * @name _success
         * @param position
         * @private
         */
        function _success(position) {
            _initMap(position);
        }

        /**
         *
         * @private
         */
        function _fail() {
            _initMap(defaultPosition);
        }

        /**
         * @name _initMap
         * @description initializes the map
         * @param position
         * @private
         */
        function _initMap(position) {
            vm.hostobject.lat = !!vm.hostobject.lat ? vm.hostobject.lat : (position.coords.latitude || 0);
            vm.hostobject.lng = !!vm.hostobject.lng ? vm.hostobject.lng : (position.coords.longitude || 0);
            var mapOptions = {
                mapTypeId: google.maps.MapTypeId.terrain,
                mapTypeControl: false,
                disableDoubleClickZoom: true,
                zoomControlOptions: true,
                streetViewControl: false,
                zoom: 14,
                center: new google.maps.LatLng(vm.hostobject.lat, vm.hostobject.lng)
            };
            map = new google.maps.Map(document.getElementById('map'), mapOptions);
            marker = new google.maps.Marker({
                position: new google.maps.LatLng(vm.hostobject.lat, vm.hostobject.lng),
                animation: google.maps.Animation.BOUNCE,
                title: "Event location",
                icon: normalIcon(),
                draggable: true
            });
            marker.setMap(map);

            function normalIcon() {
                return {
                    url: baseURL + 'assets/images/search/map-marker.png'
                };
            }

            google.maps.event.addListener(marker, 'dragend', function (event) {
                vm.hostobject.lat = marker.position.lat();
                vm.hostobject.lng = marker.position.lng();
                map.setCenter(marker.getPosition());
            });
        }
    }

    function passwhyHost() {
        vm.whyhoststep = true;
    }
    function goToStep1() {
        vm.displayStep2 = false;
        vm.displayStep1 = true;

    }

    function goToStep2() {       
        if (vm.hostobject.karoke) {
            vm.hostobject.after_activityOptions.push("Karoke");
        }
        if (vm.hostobject.city_tour) {
            vm.hostobject.after_activityOptions.push("City Tour");
        }
        if (vm.hostobject.board_games) {
            vm.hostobject.after_activityOptions.push("Board Games");
        }
        if (vm.hostobject.movie) {
            vm.hostobject.after_activityOptions.push("Movie/Cinema");
        }
        if (vm.hostobject.nightout) {
            vm.hostobject.after_activityOptions.push("Night Out");
        }
        if (vm.hostobject.other) {
            vm.hostobject.after_activityOptions.push("Other");
        }
        var experiencetype = false, drink = false, cuisine = false, amenities = false,
            price = false, title = false, description = false, menu = false;
        if (!vm.hostobject.experiences.length) {
            experiencetype = true;
        }
        if (!vm.hostobject.drinks.length) {
            drink = true;
        }
        if (!vm.hostobject.accommodations.length) {
            amenities = true;
        }
        if (!vm.hostobject.cuisines.length) {
            cuisine = true;
        }
        if (!vm.hostobject.title.length) {
            title = true;
        }
        if (vm.hostobject.price == null) {
            price = true;
        }
        if (vm.hostobject.menu == '') {
            menu = true;
        }        
        if (experiencetype == true || drink == true || cuisine == true || amenities == true || price == true || title == true || menu == true ) {
            var errort = 'The following fields are missing:<br>';
            if (experiencetype == true)
                errort = errort + '- Experience Type <br>';
            if (drink == true)
                errort = errort + '- Drinks<br>';
            if (cuisine == true)
                errort = errort + '- Cuisine<br>';
            if (amenities == true)
                errort = errort + '- General amenities<br>';
            if (price == true)
                errort = errort + '- Price<br>';
            if (title == true)
                errort = errort + '- Experience Title<br>';
            if (menu == true)
                errort = errort + '- Menu<br>';         
            toaster.error('Failed', errort, 4000, 'trustedHtml');
        } else {
            vm.displayStep3 = false;
            vm.displayStep1 = false;
            vm.displayStep2 = true;
            if (!mapInit) {
                mapInit = true;
                window.dispatchEvent(new Event('resize'));
                initGeolocation();
            }
            if (isEditing) {
                vm.allowStep3 = true;
            }
            localStorage.setItem('step2', 'true');
        }


    }
    function goToStep3() {

        var venue_address = false, city_name = false;
        if (vm.hostobject.place == undefined) {
            venue_address = true;
        }
        if (vm.hostobject.city_name == undefined) {
            city_name = true;
        }
        if (venue_address == true || city_name == true) {
            var errort = 'The following fields are missing:<br>';
            if (venue_address == true)
                errort = errort + '- Venue address<br>';
            if (city_name == true)
                errort = errort + '- City name<br>';
            toaster.error('Failed', errort, 4000, 'trustedHtml');
        } else {
            vm.displayStep2 = false;
            vm.displayStep3 = true;
        }
    }

    /**
     * @name step1
     */
    function step1() {
        if (isEditing) {
            vm.allowStep2 = true;
        } else {
            if (!!vm.hostobject.experiences.length && !!vm.hostobject.drinks.length && !!vm.hostobject.cuisines.length && !!vm.hostobject.min_guests && !!vm.hostobject.max_guests && (vm.hostobject.title.length > 10 && vm.hostobject.title.length < 50) && !!vm.hostobject.openHour && !!vm.hostobject.closeHour && vm.hostobject.price != null) {

                vm.allowStep2 = true;
            } else {
                vm.allowStep2 = false;
            }
        }
    }

    /**
     * @name step2
     */
    function step2() {
        if (isEditing) {
            vm.allowStep3 = true;
        } else {
            if (!!vm.hostobject.venue_type && !!vm.hostobject.place && !!vm.hostobject.city_name) {
                vm.allowStep3 = true;
            } else {
                vm.allowStep3 = false;
            }
        }
    }

    /**
     * @name cityChanged
     * @description sets the map centered
     */
    function cityChanged() {
        var myLatlng = new google.maps.LatLng(vm.hostobject.lat, vm.hostobject.lng);
        marker.setPosition(myLatlng);
        map.setCenter(myLatlng);
        step2();
    }
    function wait(second) {
        var start = new Date().getTime();
        var end = start;
        while (end < start + second) {
            end = new Date().getTime();
        }
    }

    function removeImage(e, _path) {
        HostsService.removeImage(_path).then(function (response) {
            if (response.data.data.response === 'success') {
                vm.imagesQty = vm.imagesQty - 1;
                checkAllowSave();
                toaster.pop("success", "Image removed", "The event image has been removed successfully.", 4000);
                var element = angular.element(e.target).closest('.event-image');
                element.remove();
            }
        });
    }

    function removeFromQueue(item) {
        item.remove();
        vm.imagesQty = vm.imagesQty - 1;
        checkAllowSave();
    }

    function setView(_nav) {
        vm.activeNav = _nav;
    }

    function goToExperience(_token) {
        if (!!_token)
            $state.go("view_itinerary", {token: _token});
    }

    function checkAllowSave() {
        vm.allowSave = vm.imagesQty > 3 && vm.hostobject.selectedDates.length > 0;
    }

    $rootScope.$watch('currentUser', function () {
        if (!$rootScope.currentUser)
            return;
        if (!vm.hostobject.id)
            vm.hostobject.currency = $rootScope.currentUser.currency;
    }, true);

    $scope.$watch(function watch(scope) {
        return vm.hostobject;
    }, function handle(newV, oldV) {
        if (newV.free !== oldV.free) {
            if (newV.free) {
                vm.hostobject.price = 0;
            }
        }
    }, true);

    init();
}