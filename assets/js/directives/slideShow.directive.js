module.exports = slideShow;

slideShow.$inject = ['$window', '$timeout'];

function slideShow($window, $timeout) {
    return {
        link: function (scope, element, attr, ngModelCtrl) {
            var hasInit = false;

            function init() {
                if (hasInit)
                    return;
                var container = angular.element(document.querySelector('#carousel-container'));
                var track = container.find('.carousel-track');
                if (track.length === 0) {
                    $timeout(init, 100);
                    return;
                }

                var images = container.find('.carousel-image');
                if (images.length === 0) {
                    $timeout(init, 100);
                    return;
                }

                var windowWidth = $(window).width();
                if (windowWidth < 768) {
                    hasInit = true;
                    return;
                }
                var width = windowWidth / 4;
                images.css({'width': width + 'px', 'height': width + 'px'});
                track.css({'height': width + 'px'});
                hasInit = true;
            }


            $timeout(init, 100);
            angular.element($window).bind("resize", function () {
                hasInit = false;
                init();
                scope.$apply();
            });
            init();
        }
    };
}