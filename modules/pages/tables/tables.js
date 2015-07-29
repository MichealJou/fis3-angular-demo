require('common/widget/widget');

module.exports = {
    url: '/tables',
    template: __inline('./tables.html'),
    controller : function($scope, $injector) {
        //支持异步加载controller
        require.async('/modules/pages/tables/tableCtrl.async.js', function(ctrl) {
            $injector.invoke(ctrl, this, {'$scope': $scope});
        });
    }
};