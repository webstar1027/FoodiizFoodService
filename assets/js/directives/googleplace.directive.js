module.exports = GooglePlace;

GooglePlace.$inject = [];

function GooglePlace() {
    return {
        require: 'ngModel',
        scope: {
            hostobject: '=?',
            callback: '&?'
        },
        link: function (scope, element, attrs, model) {
            var options = {
                types: []
            };
            scope.gPlace = new google.maps.places.Autocomplete(element[0], options);

            google.maps.event.addListener(scope.gPlace, 'place_changed', search);

            function search() {
                var place = scope.gPlace.getPlace();
                if (!!attrs.hostobject) {
                    var btnSearch = angular.element('#btnSearch');
                    scope.hostobject.lat = place.geometry.location.lat();
                    scope.hostobject.lng = place.geometry.location.lng();
                    scope.hostobject.city = place.address_components[0].long_name;
                    if (place.address_components.length === 1) {
                        scope.hostobject.state = place.address_components[0].long_name;
                    } else {
                        scope.hostobject.state = (place.address_components.length === 4) ? place.address_components[2].long_name : place.address_components[1].long_name;
                    }
                    if (scope.callback !== undefined) {
                        scope.callback();
                    }
                    if (btnSearch.length)
                        btnSearch.trigger('click');
                }
                scope.$apply(function () {                    
                    var place_name = place.address_components;
                    if( typeof place.address_components[1] == 'undefined') {
                        element.val(place_name[0].long_name);
                        model.$setViewValue( place.address_components[0].long_name);
                    } else {                         
                        model.$setViewValue(element.val());
                    }
                });
            }

            angular.element(document).on("location_changed", function (event, object) {
                if (!!attrs.lat && !!attrs.lng) {
                    scope.lat = angular.element(object).find('.gllpLatitude').val();
                    scope.lng = angular.element(object).find('.gllpLongitude').val();
                    scope.$apply();
                } else {
                    scope.hostobject.lat = angular.element(object).find('.gllpLatitude').val();
                    scope.hostobject.lng = angular.element(object).find('.gllpLongitude').val();
                    scope.$apply();
                }
            });
        }
    };
}