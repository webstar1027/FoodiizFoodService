'use strict';

module.exports = HomeController;

HomeController.$inject = ['$state', '$http', 'toaster', 'HostsService', '$rootScope', 'currency_translateFilter', '$sce'];

function HomeController($state, $http, toaster, HostsService, $rootScope, currency_translateFilter, $sce) {

    /************************************************
     * VARIABLES
     ************************************************/
    var vm = this;
    vm.date = 'When?';
    vm.isMobile = false;
    vm.premium_hosts = [];
    vm.isLoading = false;
    vm.location = "";
    vm.active = 0;
    vm.currIndex = 0;
    vm.noWrapSlides = false;
    vm.myInterval = 5000;
    vm.selectedLanguage = null;
    vm.currency = null;
    vm.slides = [
        {
            image: baseURL + 'assets/images/more-cities/las-vegas.jpg',
            title: "Las Vegas"
        },
        {
            image: baseURL + 'assets/images/more-cities/moscou.jpg',
            title: "Moscou"
        },
        {
            image: baseURL + 'assets/images/more-cities/vancouver.jpg',
            title: "Vancouver"
        }
    ];
    vm.searchobject = {};
    vm.defaultUserImg = baseURL + "assets/images/search/default-user.jpg";
    /************************************************
     * METHODS
     ************************************************/
    vm.search = search;
    vm.getDisplayDate = getDisplayDate;
    vm.goToHost = goToHost;
    vm.getSlides = getSlides;
    vm.renderHtml = renderHtml;

    function search() {
        if (!vm.searchobject.lat || !vm.searchobject.lng)
            return;
        if (vm.date == 'When?')
            vm.date = null;
        $state.go("search_hosts", {
            city: vm.location,
            lat: vm.searchobject.lat,
            lng: vm.searchobject.lng,
            date: vm.date
        });
    }

    /**
     * @name initGeolocation
     * @description Tries to get client location
     */
    function initGeolocation() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(_success, _fail);
        }

        /**
         * @name _success
         * @param position
         * @private
         */
        function _success(position) {
            $(document).trigger('init_map');
            $http({
                headers: {'Content-Type': 'application/x-www-form-urlencoded'},
                url: 'https://maps.googleapis.com/maps/api/geocode/json?latlng=' + position.coords.latitude + ',' + position.coords.longitude + '&sensor=true&key=AIzaSyAlBKh12s_s1g4VKZa5NDaXjIZt_ecCvIA',
                method: 'GET'
            }).then(function (data) {
                vm.location = data.data.results[0].formatted_address;
                data.data.results[0].address_components.forEach(function (_component) {
                    _component.types.forEach(function (_type) {
                        if (_type === 'country') {
                            localStorage.setItem('country_name', _component.long_name);
                        }
                    });
                });
                vm.searchobject.lat = position.coords.latitude;
                vm.searchobject.lng = position.coords.longitude;
            }, function (msg) {
                console.log("Sorry, your browser does not support geolocation services: " + msg);
            });
        }
        function _fail() {
            console.log("Sorry, your browser does not support geolocation services.");
        }
    }

    function getReviewsAverage(_reviews) {
        var sum = 0;
        for (var i = 0; i < _reviews.length; i++) {
            sum += parseInt(_reviews[i].stars, 10); //don't forget to add the base
        }
        return Math.round(sum / _reviews.length);
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
        var filteredArray = [];
        _events.forEach(function (_event) {
            _event.displayClass = '';
            _event.dates.forEach(function (_date, i) {
                if (i === _event.dates.length - 1) {
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
            });
        });
        return filteredArray;
    }

    function getPremiumHosts() {
        vm.isLoading = true;
        HostsService.getPremiumHosts().then(_setHosts);

        /**
         * @name _setHosts
         * @description gets premium hosts
         * @param {type} response
         * @returns {undefined}
         */
        function _setHosts(response) {
            var array = $.map(response.data.data.premium_hosts, function (value) {
                return [value];
            });
            vm.premium_hosts = filterByDateAvailability(array, vm.date);
            vm.premium_hosts.forEach(function (_event) {
                _event.experience = JSON.parse(_event.experience);
                _event.displayEvent = true;
                _event.reviews_qty = !!_event.reviews.length ? _event.reviews.length : 0;
                _event.reviews_average = !!_event.reviews.length ? getReviewsAverage(_event.reviews) : null;
                _event.soldout = _event.soldout === '1' ? true : false;
                _event.free = _event.free === '1' ? true : false;
            });
            angular.element('#events-results').on('click', '.host-result', getHostData);
            vm.isLoading = false;
        }
    }

    /**
     * @name getHostData
     * @description gets the host data and redirects the user to the event
     * @param {type} e
     * @returns {undefined}
     */
    function getHostData(e) {
        e.preventDefault();
        var target = $(e.currentTarget);
        var id = $(target).attr('id');
        var date = $(target).attr('date');
        var searchDate = moment(date, 'YYYY-MM-DD').format('DD-MM-YYYY');
        $state.go("view_event", {event: id, date: searchDate});
    }

    /**
     * @name goToHost
     * @description redirects the user to the event page
     * @param host
     */
    function goToHost(host) {
        var searchDate = moment(host.displayDate, 'YYYY-MM-DD').format('DD-MM-YYYY');
        $state.go("view_event", {
            event: host.id_event,
            date: searchDate
        });
    }

    function renderHtml(html_code) {
        return $sce.trustAsHtml(html_code);
    }

    /**
     * @name getDisplayDate
     * @param {type} _date
     * @returns {unresolved}
     */
    function getDisplayDate(_date) {
        var date = moment(_date, 'YYYY-MM-DD');
        return moment(date).format('LL');
    }

    function getSlides($index) {
        var hosts = '';
        if (vm.isMobile) {
            var first = vm.premium_hosts[$index];
            hosts += getHostTemplate(first);
        } else {
            var max = vm.premium_hosts.length - 1;
            var first = vm.premium_hosts[$index];
            var second, third, fourth;
            if ($index === max) {
                second = vm.premium_hosts[0];
                third = vm.premium_hosts[1];
                fourth = vm.premium_hosts[2];
            } else if ($index === max - 1) {
                second = vm.premium_hosts[max];
                third = vm.premium_hosts[0];
                fourth = vm.premium_hosts[1];
            } else if ($index === max - 2) {
                second = vm.premium_hosts[$index + 1];
                third = vm.premium_hosts[$index + 2];
                fourth = vm.premium_hosts[0];
            } else {
                second = vm.premium_hosts[$index + 1];
                third = vm.premium_hosts[$index + 2];
                fourth = vm.premium_hosts[$index + 3];
            }
            hosts += getHostTemplate(first);
            hosts += getHostTemplate(second);
            hosts += getHostTemplate(third);
            hosts += getHostTemplate(fourth);
        }
        return renderHtml(hosts);
    }

    function getHostTemplate(host) {
        var hostTemplate = '';
        hostTemplate += '<div class="col-xs-12 col-sm-3 col-md-3 host-result" id="' + host.id_event + '" date="' + host.displayDate + '">';
        hostTemplate += '<div class="result">';
        hostTemplate += '<div class="card-header summary-card-cover" style="background-image: url(' + host.image + ')">';
        if (host.free) {
            hostTemplate += '<span class="label text-capitalize label-success price">FREE</span>';
        } else {
            hostTemplate += '<span class="price">' + currency_translateFilter(vm.currency) + ' ' + host.price + '</span>';
        }
        if (host.soldout) {
            hostTemplate += '<span class="label text-capitalize label-papaya price">SOLD OUT</span>';
        }
        hostTemplate += '<span class="date">' + vm.getDisplayDate(host.displayDate) + ' | ' + host.open_hour + '<br />' + host.city_name + '</span></div>';
        hostTemplate += '<div class="card-host"><img src="' + (!!host.host_image ? host.host_image : vm.defaultUserImg) + '" class="img-rounded img-thumbnail img-responsive" /><span class="host-name">Hosted by <span style="text-transform: capitalize;">' + host.first_name + '</span></span></div>';
        hostTemplate += '<div class="card-info"><h4 class="title">' + host.title + '</h4></div>';
        hostTemplate += '<div class="card-experience"><h4 style="overflow: hidden;">';
        host.experience.forEach(function (exp, i) {
            if (i < 3)
                hostTemplate += '<span class="label label-default">' + exp + '</span>';
        });
        hostTemplate += '</h4></div>';
        hostTemplate += '<div class="card-reviews col-xs-12 col-sm-12 col-md-12">';
        if (!!host.reviews.length) {
            var classStar1, classStar2, classStar3, classStar4, classStar5, classAverage;
            classAverage = 'star' + host.reviews_average;
            classStar1 = host.reviews_average >= 1 ? 'glyphicon-star' : '';
            classStar2 = host.reviews_average >= 2 ? 'glyphicon-star' : '';
            classStar3 = host.reviews_average >= 3 ? 'glyphicon-star' : '';
            classStar4 = host.reviews_average >= 4 ? 'glyphicon-star' : '';
            classStar5 = host.reviews_average >= 5 ? 'glyphicon-star' : '';
            hostTemplate += '<span class="glyphicon ' + classStar1 + ' ' + classAverage + '" aria-hidden="true"></span>';
            hostTemplate += '<span class="glyphicon ' + classStar2 + ' ' + classAverage + '" aria-hidden="true"></span>';
            hostTemplate += '<span class="glyphicon ' + classStar3 + ' ' + classAverage + '" aria-hidden="true"></span>';
            hostTemplate += '<span class="glyphicon ' + classStar4 + ' ' + classAverage + '" aria-hidden="true"></span>';
            hostTemplate += '<span class="glyphicon ' + classStar5 + ' ' + classAverage + '" aria-hidden="true"></span>';
        } else {
            hostTemplate += '<p><span>0 Reviews</span></p>';
        }
        hostTemplate += '</div>';
        hostTemplate += '</div></div>';
        return hostTemplate;
    }

    function init() {
        initGeolocation();
        angular.element('input').focusin(function () {
            var input = $(this);
            input.data('place-holder-text', input.attr('placeholder'));
            input.attr('placeholder', '');
        });
        angular.element('input').focusout(function () {
            var input = $(this);
            input.attr('placeholder', input.data('place-holder-text'));
        });
        vm.isMobile = $(window).width() <= 767;
    }

    $(window).resize(function () {
        vm.isMobile = $(window).width() <= 767;
    });

    $rootScope.$watch('globalSettings', function () {
        if (!!$rootScope.globalSettings) {
            vm.selectedLanguage = $rootScope.globalSettings.language;
            vm.currency = $rootScope.globalSettings.currency;
            getPremiumHosts();
        }
    }, true);

    init();
}