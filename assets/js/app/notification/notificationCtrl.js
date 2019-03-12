'use strict';

module.exports = NotificationController;

NotificationController.$inject = ['NotificationService', 'UsersService', '$uibModal', '$scope', 'toaster'];

function NotificationController(NotificationService, UsersService, $uibModal, $scope, toaster) {

    /************************************************
     * VARIABLES
     ************************************************/
    var vm = this;
    vm.messages = [];
    vm.user = null;
    vm.messagesState = "1";
    vm.inboxMessages = [];
    vm.archivedMessages = [];
    vm.isCollapsed = true;

    /************************************************
     * METHODS
     ************************************************/
    vm.getNotification = getNotification;
    vm.viewNotification = viewNotification;
    vm.archiveMessage = archiveMessage;
    vm.unarchiveMessage = unarchiveMessage;

    function init() {
        getNotification();
        getUserInfo();
    }

    /**
     * @name getNotification
     * @description gets the notifications
     */
    function getNotification() {
        vm.inboxMessages = [];
        vm.archivedMessages = [];
        NotificationService.getNotificationAll().then(function (response) {
            var notificationList = response.data.data.notifications;
            for (var i = 0; i < notificationList.length; i++) {
                if (notificationList[i].status == 0 || notificationList[i].status == 1) vm.inboxMessages.push(notificationList[i]);
                else vm.archivedMessages.push(notificationList[i]);
            }
        });
    }

    function viewNotification(_notification, status) {
        $scope.user = vm.user;
        NotificationService.getNotificationComments(_notification.id).then(function (response) {
            $scope.comments = response.data.data.comments;
        });
        NotificationService.updateNotification(_notification.id, status).then(function (response) {
            getNotification();
        });
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: 'assets/js/app/modal/notification.html',
            controller: 'ModalInstanceCtrl',
            scope: $scope,
            size: 1,
            resolve: {
                data: function () {
                    return $scope.data;
                }.bind(this)
            }
        });

        modalInstance.result.then(function (data) {
            var comment = {'id': _notification.id, 'comment': data.message};
            NotificationService.saveNotificationComments(comment).then(
                function (response) {
                    if (response.data.data.response === 'success') toaster.pop("success", "Comment sent", "Your comment has been sent.", 4000);
                },
                function (err) {
                    toaster.pop('error', "Error", "Something went wrong, please try again.", 4000);
                }
            );
        });
    }

    /**
     * @name archiveMessage
     * @description change the state of a message to archived
     * @param _notification
     */
    function archiveMessage(_notification) {
        NotificationService.updateNotification(_notification.id, 2).then(function () {
            getNotification();
        });
    }

    /**
     * @name archiveMessage
     * @description change the state of a message to archived
     * @param _notification
     */
    function unarchiveMessage(_notification) {
        NotificationService.updateNotification(_notification.id, 1).then(function () {
            getNotification();
        });
    }

    /**
     * @name getUserInfo
     * @description Gets user info
     */
    function getUserInfo() {
        UsersService.getUserInfo().then(_setUserInfo);

        /**
         * @name _setUserInfo
         * @description gets the user info
         * @param response
         * @private
         */
        function _setUserInfo(response) {
            vm.user = response.data.data.user;
        }
    }

    init();

}