module.exports = checkStrength;

checkStrength.$inject = [];

function checkStrength() {
    return {
        replace: false,
        restrict: 'A',
        link: function (scope, element, attr, ngModelCtrl) {
            var strength = {
                mesureStrength: function (p) {
                    var _force = isSatisfied(p && p.length >= 8) +
                            isSatisfied(p && /[A-z]/.test(p)) +
                            isSatisfied(p && /(?=.*\W)/.test(p)) +
                            isSatisfied(p && /\d/.test(p));
                    function isSatisfied(criteria) {
                        return criteria ? 1 : 0;
                    }
                    return _force;
                },
                getStrength: function (s) {
                    var idx = "";
                    if (s <= 1) {
                        scope.passwordWorks = false;
                        updateMeter("20%", "#ffa0a0", "very weak");
                        idx = "Very Weak";
                    } else if (s <= 2) {
                        scope.passwordWorks = false;
                        updateMeter("60%", "#ffec8b", "medium");
                        idx = "Weak";
                    } else if (s <= 3) {
                        scope.passwordWorks = false;
                        updateMeter("80%", "#c3ff88", "strong");
                        idx = "Can Be Better";
                    } else if (s <= 4) {
                        scope.passwordWorks = true;
                        updateMeter("100%", "#ACE872", "very strong");
                        idx = "Strong";
                    } else {
                        idx = 0;
                    }
                    return  idx;
                }
            };

            var updateMeter = function (width, background, text) {
                $('.password-background').css({"width": width, "background-color": background});
                $('.strength').css('color', background);
            };

            element.on('propertychange change keyup paste input', function () {
                var pass = element.val();
                if (!!pass) {
                    var feedback = strength.getStrength(strength.mesureStrength(pass));
                    angular.element('#strength').text(feedback);
                } else {
                    scope.passwordWorks = false;
                    updateMeter("0%", "#ffa0a0", "none");
                }
            });

            angular.element('.show-password').on('click', function (event) {
                event.preventDefault();
                if (angular.element('#password').attr('type') === 'password') {
                    angular.element('#password').attr('type', 'text');
                    angular.element('.show-password').text('Hide password');
                } else {
                    angular.element('#password').attr('type', 'password');
                    angular.element('.show-password').text('Show password');
                }
            });
        },
        template: '{{feedback}}'
    };
}