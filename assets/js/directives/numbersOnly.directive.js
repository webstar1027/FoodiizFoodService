module.exports = numbersOnly;

numbersOnly.$inject = [];

function numbersOnly() {
    return {
        require: 'ngModel',
        scope: {
            max: '='
        },
        link: function (scope, element, attr, ngModelCtrl) {
            function fromUser(text) {
                if (text) {
                    text = text.replace(/\s/g, '');
                    var transformedInput = text.replace(/[^0-9]/g, '');
                    var previous = transformedInput + "";
                    previous = previous.substring(0, previous.length - 1);
                    var cropped = false;
                    var maxValue = scope.max == 2 ? 12 : 9999;
                    if ((text.length > scope.max || transformedInput > maxValue) && !!scope.max) {
                        cropped = true;
                        ngModelCtrl.$setViewValue(previous);
                        ngModelCtrl.$render();
                    }
                    if (transformedInput !== text) {
                        ngModelCtrl.$setViewValue(transformedInput);
                        ngModelCtrl.$render();
                    }
                    return cropped ? previous : transformedInput;
                }
                return undefined;
            }
            ngModelCtrl.$parsers.push(fromUser);
        }
    };
}