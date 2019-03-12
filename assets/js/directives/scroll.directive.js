module.exports = scroll;

scroll.$inject = ['$window', '$rootScope'];

function scroll($window, $rootScope) {
    return function (scope, element, attrs) {

        function init() {
            var init = false;
            var elementOffset = angular.element(element).offset().top;
            var elementRight = angular.element($window).width() - (angular.element(element).offset().left + angular.element(element).outerWidth());
            var footerOffsetTop = angular.element('#footer').offset().top;           
         
            if (!init) {
                init = true;
                setPosition();
            }
            function setPosition() {
               
                if (this.pageYOffset >= elementOffset && $(window).width() >= 768) { 
                    if ( $(window).scrollTop() + angular.element(element).height() >=  angular.element('#footer').offset().top) {
                        var top =  angular.element('#footer').offset().top - ( $(window).scrollTop() + angular.element(element).height()) - 20;
                        angular.element(element).css({'top': top + 'px'});
                    } else {
                         angular.element(element).css({'top': '0'});
                    }
                    
                    scope.boolChangeClass = true;
                    angular.element(element).css({'right': elementRight + 'px'});                       
                } else {
                    scope.boolChangeClass = false;
                    angular.element(element).css({'right': 0});
                }
                scope.$apply();
            }
            angular.element($window).bind("scroll", setPosition);
        }
        $rootScope.$on('eventLoaded', init);
    };
}