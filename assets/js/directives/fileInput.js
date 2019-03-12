module.exports = fileInput;

fileInput.$inject = [];

function fileInput() {
    return {
        link: function (scope, element, attrs) {
            element.one('change', function(event) {
                debugger;
                var file = event.target.files[0];
                scope.file = file ? file : undefined;
                //scope.file_changed(file);
                scope.$apply();
            });
        }
    };
}