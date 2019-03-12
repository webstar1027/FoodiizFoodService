module.exports = ratingCtrl;

ratingCtrl.$inject = ['$scope', '$uibModalInstance', 'data'];

function ratingCtrl($scope, $uibModalInstance, data) {

    $scope.formData = angular.copy(data);
    $scope.stars = '5';
    $scope.loading = false;

    $scope.setRating = function (_value) {
        $scope.stars = _value;
        $scope.formData.stars = _value;
    };

    $scope.ok = function () {
        $scope.loading = true;
        $uibModalInstance.close($scope.formData);
    };
    $scope.cancel = function () {
        $scope.loading = true;
        $uibModalInstance.dismiss('cancel');
    };
}