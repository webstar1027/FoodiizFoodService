'use strict';

module.exports = DashboardController;

DashboardController.$inject = ['UsersService', '$state'];

function DashboardController (UsersService, $state) {

    /************************************************
     * VARIABLES
     ************************************************/
    var vm = this;
    vm.user = {};
    vm.isCollapsed = true;
    
    vm.goToUser = goToUser;
    /************************************************
     * METHODS
     ************************************************/

    function init(){
        UsersService.getUserInfo().then(_setUserInfo);

        /**
         * @name _setUserInfo
         * @description gets the user info
         * @param response
         * @private
         */
        function _setUserInfo(response) {
            vm.user = response.data.data.user;
            vm.user.image_path = (!!response.data.data.user.image_path) ? response.data.data.user.image_path : baseURL + 'assets/images/dashboard/no_avatar-xlarge.jpg';
        }
    }
    
    function goToUser(_id){
        if(!_id) return;
        $state.go("view_user", {
            id: _id
        });
    }

    init();

}