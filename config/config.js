app.controller('DockerBuildController', ['$scope', function ($scope) {
  $scope.$watch('configs[branch.name].docker_build.config', function (value) {
    $scope.config = value;
  });
  $scope.saving = false;
  $scope.save = function () {
    console.log("saving")
    $scope.saving = true;
    $scope.pluginConfig('docker_build', $scope.config, function () {
      $scope.saving = false;
    });
  };
}]);
