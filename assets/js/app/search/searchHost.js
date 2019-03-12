'use strict';

module.exports = SearchHostsController;

SearchHostsController.$inject = ['$rootScope', '$scope', '$state', '$stateParams', 'HostsService', 'toaster', '$timeout', '$http', 'currency_translateFilter'];

function SearchHostsController($rootScope, $scope, $state, $stateParams, HostsService, toaster, $timeout, $http, currency_translateFilter) {

    var vm = this;
    vm.today = moment().format("YYYY-MM-DD");
    vm.searchobject = {};
    vm.searchobject.distance = "50";
    vm.lat = 0;
    vm.lng = 0;
    vm.markers = [];
    vm.hostsList = [];
    vm.date = null;
    vm.currency = '';
    var listLoaded = false;
    vm.location = "";
    vm.changeMarker = changeMarker;
    vm.retrieveMarker = retrieveMarker;
    //Filters
    vm.searchobject.guests = "1";
    vm.searchobject.seats = "1";
    vm.searchobject.price = "10";
    vm.searchobject.min_guests = "1";
    vm.searchobject.max_guests = "1";
    vm.searchobject.min_price = "1";
    vm.searchobject.max_price = "1";
    vm.searchobject.experiences = [];
    vm.experiencesOptions = ["Aperitif", "Breakfast", "Brunch", "Cooking classes", "Dinner", "Food walk", "Lunch", "Tea time", "Picnic"];
    vm.searchobject.diets = [];
    vm.dietOptions = ["Vegetarian", "Vegan", "Halal", "Gluten free", "Organic", "Diabetes", "Lactose intolerance", "No Pork", "Kosher", "No Alcohol", "Allergic to Nuts", "Allergic to Sesame", "Allergic to Beans", "Allergic to Eggs", "Allergic to Fish", "Allergic to Shellfish", "Allergic to Gluten"];
    vm.searchobject.accommodations = [];
    vm.accommodationOptions = ["Family friendly- Kids are welcome", "Wheelchair accessible", "Pets in the house", "Air conditioning", "Elevator in the building", "Free parking", "Smoking allowed in the house", "Street parking", "Nearby public transport", "Possibility to pick up the guests", "Possibility to take the guests home after"];
    vm.multiSelectSettings = {
        template: '{{option}}',
        enableSearch: true,
        styleActive: true
    };

    vm.isLoading = false;
    vm.showMap = true;
    vm.showFilters = false;
    vm.isMobile = false;
   
    var map = null;
    vm.searchobject.displayCloseDates = false;
    vm.defaultUserImg = baseURL + "assets/images/search/default-user.jpg";

    vm.goToHost = goToHost;
    vm.displayMap = displayMap;
    vm.displayFilters = displayFilter;
    vm.cityChanged = cityChanged;
    vm.getFormatedDate = getFormatedDate;
    vm.getDisplayDate = getDisplayDate;
  

    /**
     * @name updatePrice
     * @description Updates events prices
     * @returns {undefined}
     */
    function updatePrice() {
        getNearestHosts($stateParams.lat, $stateParams.lng, vm.searchobject.distance, vm.searchobject.date);
    }

    function init() {
        vm.currency = !!$rootScope ? $rootScope.globalSettings.currency : 'USD';
        if (!!$stateParams.lat || !!$stateParams.lng) {
            window.lat = $stateParams.lat;
            window.lng = $stateParams.lng;
            vm.searchobject.lat = $stateParams.lat;
            vm.searchobject.lng = $stateParams.lng;
            vm.searchobject.location = $stateParams.city;
            vm.searchobject.date = !!$stateParams.date ? $stateParams.date : 'When?';
            vm.searchobject.distance = !!$stateParams.distance ? $stateParams.distance : "50";
            getNearestHosts($stateParams.lat, $stateParams.lng, vm.searchobject.distance, vm.searchobject.date);
        } else {
            initGeolocation();
        }
        listLoaded = true;
    }

    function initGeolocation() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(_success, _fail);
        } else {
            toaster.pop('error', "Error", "Sorry, your browser does not support geolocation services.", 4000);
        }

        /**
         * @name _success
         * @param position
         * @private
         */
        function _success(position) {
            angular.element(document).trigger('init_map');
            $http({
                headers: {'Content-Type': 'application/x-www-form-urlencoded'},
                url: 'http://maps.googleapis.com/maps/api/geocode/json?latlng=' + position.coords.latitude + ',' + position.coords.longitude + '&sensor=true',
                method: 'GET'
            }).then(function (data) {
                var city = data.data.results[0].formatted_address;
                $state.go("search_hosts", {
                    city: city,
                    lat: position.coords.latitude,
                    lng: position.coords.longitude,
                    date: moment().format("DD-MM-YYYY"),
                });
            }, function (msg) {
                toaster.pop('error', "Error", msg, 4000);
            });
        }
        function _fail() {
            toaster.pop('error', "Error", "Something went wrong, please try again.", 4000);
        }
    }

 
    /**
     * @name newFindClosest
     * @description Get the closest dates of a given date
     * @param {type} dates
     * @param {type} testDate
     * @returns {Object}
     */
    function newFindClosest(dates, testDate) {
        var before = [];
        var after = [];
        var arrDate = null;
        testDate = testDate.split('-');
        testDate = new Date(testDate[0], testDate[1] - 1, testDate[2]);

        dates.forEach(function (date, i) {
            var tar = date.event_date;
            tar = tar.split('-');
            arrDate = new Date(tar[0], tar[1] - 1, tar[2]);
            var diff = (arrDate - testDate) / (3600 * 24 * 1000);
            if (diff > 0) {
                before.push({diff: diff, index: i, date: date});
            } else {
                after.push({diff: diff, index: i, date: date});
            }
        });

        before.sort(function (a, b) {
            if (a.diff < b.diff) {
                return -1;
            }
            if (a.diff > b.diff) {
                return 1;
            }
            return 0;
        });

        after.sort(function (a, b) {
            if (a.diff > b.diff) {
                return -1;
            }
            if (a.diff < b.diff) {
                return 1;
            }
            return 0;
        });
        return {datesBefore: before, datesAfter: after};
    }

    /**
     * @name filterByDateAvailability
     * @description checks if the event is available for a given date
     * @param _events
     * @param date
     */
    function filterByDateAvailability(_events, date) {
        var currentDate = moment(date, 'DD-MM-YYYY').format('YYYY-MM-DD');
        var isAvailable = false;
        var filteredArray = [];
        var start = null;
        var end = null;
        _events.forEach(function (_event) {
            _event.displayClass = '';
            _event.dates.forEach(function (_date, i) {
                if (vm.searchobject.displayCloseDates) {
                    start = moment(_date.event_date).subtract(3, 'days').startOf('day').format('YYYY-MM-DD');
                    end = moment(_date.event_date).add(3, 'days').endOf('day').format('YYYY-MM-DD');
                    if ((currentDate == _date.event_date || moment(currentDate).isBetween(start, end)))
                        isAvailable = true;
                } else {
                    if (currentDate == _date.event_date)
                        isAvailable = true;
                }
                if (i == _event.dates.length - 1) {
                    if (isAvailable) {
                        var closestDates = newFindClosest(_event.dates, currentDate);
                        if (!!closestDates.datesBefore.length) {
                            _event.displayDate = closestDates.datesBefore[0].date.event_date;
                        } else if (!!closestDates.datesAfter.length) {
                            _event.displayDate = closestDates.datesAfter[0].date.event_date;
                        } else {
                            _event.displayDate = date;
                        }
                        filteredArray.push(_event);
                    }
                    isAvailable = false;
                }
            });
        });
        return filteredArray;
    }
    function filterEmpty(_events) {
        var currentDate = vm.today;
        var filteredArray = [];
        _events.forEach(function (_event) {
            _event.displayClass = '';
            _event.dates.forEach(function (_date, i) {
                if (i == _event.dates.length - 1) {
                    var closestDates = newFindClosest(_event.dates, currentDate);
                    if (!!closestDates.datesBefore.length) {
                        _event.displayDate = closestDates.datesBefore[0].date.event_date;
                    } else if (!!closestDates.datesAfter.length) {
                        _event.displayDate = closestDates.datesAfter[0].date.event_date;
                    } else {
                        _event.displayDate = currentDate;
                    }
                    _event.hideDate = true;
                    filteredArray.push(_event);
                }
            });
        });
        return filteredArray;
    }
    
    function changeMarker(index) {
        vm.markers[index].setIcon(highlightedIcon());
        function highlightedIcon() {
            return {
                url: baseURL + 'assets/images/search/map-marker_hover.png'
            };
        }


    }

    function retrieveMarker(index) {
        vm.markers[index].setIcon(normalIcon());
        function normalIcon() {
            return {
                url: baseURL + 'assets/images/search/map-marker.png'
            };
        }
    }
    /**
     * @name getNearestHosts
     * @description Get the nearest hosts
     * @param {type} lat
     * @param {type} lng
     * @param {type} distance
     * @param {type} date
     */
    function getNearestHosts(lat, lng, distance, date, zoom) {
        if (vm.isLoading)
            return;
        vm.isLoading = true;
        vm.hostsList = [];
        var location = vm.searchobject.location;
        vm.isMobile = $(window).width() <= 767;
        HostsService.getHostsByLocation(lat, lng, distance, date, location).then(_setHostsResults);
        function _setHostsResults(response) {
            angular.element(document).trigger('init_map');
            $timeout(function () {
                var mapZoom = 0;
                switch (vm.searchobject.distance) {
                    case "400":
                        mapZoom = 8;
                        break;
                    case "150":
                        mapZoom = 9;
                        break;
                    case "50":
                        mapZoom = 10;
                        break;
                    case "20":
                        mapZoom = 11;
                        break;
                    case "5":
                        mapZoom = 13;
                        break;
                    default:
                        mapZoom = 11;
                }
                var array = $.map(response.data.data.hosts, function (value, index) {
                    return [value];
                });
                if (date != 'When?') {
                    vm.hostsList = filterByDateAvailability(array, date);
                } else {
                    vm.hostsList = filterEmpty(array);
                }

                if (!!vm.hostsList.length) {
                    vm.showFilters = false;
                    var mapOptions = {
                        mapTypeId: google.maps.MapTypeId.terrain,
                        mapTypeControl: false,
                        disableDoubleClickZoom: false,
                        zoomControlOptions: false,
                        streetViewControl: false,
                        zoom: !!zoom ? zoom : mapZoom,
                        maxZoom: 15,
                        center: new google.maps.LatLng(lat, lng)
                    };
                    vm.markers = [];
                    var bounds = new google.maps.LatLngBounds();
                    map = new google.maps.Map(document.getElementById('map'), mapOptions);
                    var infowindow = new google.maps.InfoWindow();
                    var marker, i;
                    var TEMPLATE = '<div class="map-preview"><a href="{{path}}" target="_blank"><div class="header"><img width="200" src="{{image}}" class="event-preview-img img-responsive"><span class="price">{{currency}}{{price}}</span></div><h4 class="title">{{title}}</h4></a></div>';
                    var eventHTML = "";
                    vm.hostsList.forEach(function (_event) {
                        _event.accommodations = JSON.parse(_event.accommodations);
                        _event.cuisine = JSON.parse(_event.cuisine);
                        _event.drinks = JSON.parse(_event.drinks);
                        _event.experience = JSON.parse(_event.experience);
                        _event.diets = !!_event.diets ? JSON.parse(_event.diets) : [];
                        _event.displayEvent = true;
                        _event.reviews_qty = !!_event.reviews.length ? _event.reviews.length : 0;
                        _event.reviews_average = !!_event.reviews.length ? _getReviewsAverage(_event.reviews) : null;
                        _event.current_city = _event.current_city;
                        _event.soldout = _event.soldout == 1 ? true : false;

                        marker = new google.maps.Marker({
                            position: new google.maps.LatLng(_event.lat, _event.lng),
                            animation: google.maps.Animation.BOUNCE,
                            title: _event.title,
                            icon: normalIcon()
                        });

                        bounds.extend(marker.getPosition());
                        if (_event.free == 1) {
                            var TEMPLATE1 = '<div class="map-preview"><a href="{{path}}" target="_blank"><div class="header"><img width="200" src="{{image}}" class="event-preview-img img-responsive"><span class="label text-capitalize label-success freeprice">FREE</span></div><h4 class="title">{{title}}</h4></a></div>';
                            eventHTML = TEMPLATE1
                                    .replace('{{path}}', baseURL + 'event/' + _event.id + '/' + vm.searchobject.date)
                                    .replace('{{date}}', vm.searchobject.date)
                                    .replace('{{image}}', baseURL + _event.images[0].image_path)
                                    .replace('{{title}}', _event.title);
                        } else {
                            eventHTML = TEMPLATE
                                    .replace('{{path}}', baseURL + 'event/' + _event.id + '/' + vm.searchobject.date)
                                    .replace('{{date}}', vm.searchobject.date)
                                    .replace('{{image}}', baseURL + _event.images[0].image_path)
                                    .replace('{{currency}}', currency_translateFilter(vm.currency))
                                    .replace('{{price}}', _event.price)
                                    .replace('{{title}}', _event.title);
                        }


                        bindInfoWindow(marker, map, infowindow, eventHTML, _event.id);
                        marker.setMap(map);
                        vm.markers.push(marker);
                    });
                    map.setCenter(bounds.getCenter());
                    map.fitBounds(bounds);
                    if (vm.markers.length > 1) {
                        map.setZoom(map.getZoom());
                    } else {
                        map.setZoom(10);
                    }
                    var max_guests = _.maxBy(vm.hostsList, _.property('max_guests'));
                    var min_price = _.minBy(vm.hostsList, _.property('price'));
                    var max_price = _.maxBy(vm.hostsList, _.property('price'));

                    vm.searchobject.seats = 1;
                    vm.searchobject.price = parseInt(max_price.price, 10);

                    vm.searchobject.min_guests = 1;
                    vm.searchobject.max_guests = max_guests.max_guests;

                    vm.searchobject.min_price = parseInt(min_price.price, 10);
                    vm.searchobject.max_price = parseInt(max_price.price, 10);

                    function _getReviewsAverage(_reviews) {
                        var sum = 0;
                        for (var i = 0; i < _reviews.length; i++) {
                            sum += parseInt(_reviews[i].stars, 10); //don't forget to add the base
                        }
                        return Math.round(sum / _reviews.length);
                    }

                    function normalIcon() {
                        return {
                            url: baseURL + 'assets/images/search/map-marker.png'
                        };
                    }

                    google.maps.event.addListener(map, "click", function (event) {
                        infowindow.close();
                    });

                    function bindInfoWindow(marker, map, infowindow, html, id) {
                        google.maps.event.addListener(marker, 'mouseover', function () {
                            infowindow.setContent(html);
                            infowindow.open(map, marker);
                        });
                        google.maps.event.addListener(marker, 'mouseout', function () {
                            infowindow.close();

                        });
                        google.maps.event.addListener(marker, 'click', function (e) {
                            infowindow.setContent(html);
                            infowindow.open(map, marker);
                        });


                    }

                    var resultsCards = angular.element('#events-results').find('.result');
                    if (!!resultsCards.length) {
                        angular.element('#events-results').find('.result').hover(
                                function () {
                                    var index = angular.element('#events-results .result').index(this);
                                    vm.markers[index].setIcon(highlightedIcon());
                                },
                                function () {
                                    var index = angular.element('#events-results .result').index(this);
                                    vm.markers[index].setIcon(normalIcon());
                                }
                        );
                        var mapHeight = angular.element('#events-results').height();
                        if (!vm.isMobile && mapHeight > 600) {
                            angular.element('#map').css({'height': mapHeight + 'px'});
                        }
                    }
                    vm.isLoading = false;
                } else {
                    var mapOptions = {
                        mapTypeId: google.maps.MapTypeId.terrain,
                        mapTypeControl: false,
                        disableDoubleClickZoom: true,
                        zoomControlOptions: false,
                        streetViewControl: false,
                        zoom: mapZoom,
                        center: new google.maps.LatLng(lat, lng)
                    };
                    vm.markers = [];
                    map = new google.maps.Map(document.getElementById('map'), mapOptions);
                    vm.isLoading = false;
                }
            }, 100);
        }
    }

    /**
     * @name getDisplayDate
     * @description Formats a given date
     * @param {type} _date
     * @returns {unresolved}
     */
    function getDisplayDate(_date) {
        var date = moment(_date, 'YYYY-MM-DD');
        return moment(date).format('LL');
    }

    /**
     * @name getFormatedDate
     * @description Returns the date with legible format
     * @param {type} _date
     * @returns {unresolved}
     */
    function getFormatedDate(_date) {
        var date = moment(_date, 'DD-MM-YYYY');
        return moment(date).format('LL');
    }

    /**
     * @name applyFilters
     * @description applies the dynamic filters
     */
    function applyFilters() {
        vm.isLoading = true;
        var passSeats = false;
        var passPrice = false;
        for (var i = 0; i < vm.hostsList.length; i++) {
            passSeats = vm.searchobject.seats >= vm.hostsList[i].min_guests && vm.searchobject.seats <= vm.hostsList[i].max_guests;
            if (vm.hostsList[i].free == 1) {
                passPrice = true;
            } else {
                passPrice = parseInt(vm.hostsList[i].price, 10) <= vm.searchobject.price;
            }
            vm.hostsList[i].displayEvent = passSeats && passPrice && _checkSelection(vm.hostsList[i].accommodations, vm.searchobject.accommodations) && _checkSelection(vm.hostsList[i].experience, vm.searchobject.experiences) && _checkSelection(vm.hostsList[i].diets, vm.searchobject.diets);
        }

        /**
         * @name _checkSelection
         * description filters the selected array according the received criterian
         * @param {type} _collection
         * @param {type} _filters
         * @returns {Boolean}
         */
        function _checkSelection(_collection, _filters) {
            if (!_filters.length)
                return true;
            var matches = [];
            for (var i = 0; i < _filters.length; i++) {
                for (var j = 0; j < _collection.length; j++) {
                    if (_filters[i] === _collection[j]) {
                        matches.push(_collection[j]);
                    }
                }
            }
            return _filters.length === matches.length;
        }
        vm.isLoading = false;
    }

    /**
     * @name goToHost
     * @description redirects the user to the event page
     * @param host
     */
    function goToHost(host) {
        var searchDate = moment(host.displayDate, 'YYYY-MM-DD').format('DD-MM-YYYY');
        $state.go("view_event", {
            event: host.id,
            date: searchDate
        });
    }

    /**
     *
     */
    function displayMap() {
        vm.showMap = !vm.showMap;
    }

    function displayFilter() {
        vm.showFilters = !vm.showFilters;
    }

    function cityChanged() {
        setTimeout(function () {
            $state.go("search_hosts", {
                city: vm.searchobject.location,
                lat: vm.searchobject.lat,
                lng: vm.searchobject.lng,
                date: vm.searchobject.date
            });
        }, 500);
    }

    $scope.$watch(function watch(scope) {
        return vm.searchobject;
    }, function handle(newV, oldV) {
        if (newV && newV.distance && newV.distance !== oldV.distance) {
            getNearestHosts(vm.searchobject.lat, vm.searchobject.lng, vm.searchobject.distance, vm.searchobject.date);
        } else if (newV && newV.date && newV.date !== oldV.date) {
            getNearestHosts(vm.searchobject.lat, vm.searchobject.lng, vm.searchobject.distance, vm.searchobject.date);
        } else if (newV.displayCloseDates !== oldV.displayCloseDates) {
            getNearestHosts(vm.searchobject.lat, vm.searchobject.lng, vm.searchobject.distance, vm.searchobject.date);
        } else if ((newV && newV.seats) && newV.seats !== oldV.seats && vm.showFilters) {
            applyFilters();
        } else if ((newV && newV.price) && newV.price !== oldV.price && vm.showFilters) {
            applyFilters();
        } else if ((newV && newV.accommodations) && newV.accommodations !== oldV.accommodations && vm.showFilters) {
            applyFilters();
        }
    }, true);

    $rootScope.$watch('globalSettings', function () {
        if (!!$rootScope.globalSettings) {
            vm.selectedLanguage = $rootScope.globalSettings.language;
            vm.currency = $rootScope.globalSettings.currency;
            if (vm.isLoading || listLoaded)
                return;
            init();
        }
    }, true);

    $rootScope.$on('currencyChanged', updatePrice);
}