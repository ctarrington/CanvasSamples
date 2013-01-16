
angular.module('DndWithD3App', ['layout.service']);

function Thing1Ctrl($rootScope, $scope, $element, layoutService) {

    $scope.person = {
        name:'Fred',
        height:0
    };

    $scope.state = 'meh';


    function onSmall()
    {
        $scope.$apply(function() {
            $scope.state = 'small';
        });
    }

    function onBig()
    {
        $scope.$apply(function() {
            $scope.state = 'big';
        });
    }

    layoutService.addSizeListeners($element.context.id, onSmall, onBig);
}
