
angular.module('DndWithD3App', ['layout.service']);

function Thing1Ctrl($rootScope, $scope, $element, layoutService) {

    $scope.person = {
        name:'Fred',
        height:0
    };

    $scope.sizeInfo = null;


    function onSizeChange(info)
    {
        $scope.$apply(function() {
            $scope.sizeInfo = info;
        });
    }

    layoutService.addSizeListener($element.context.id, onSizeChange);
    $scope.sizeInfo = layoutService.getSize($element.context.id);
}
