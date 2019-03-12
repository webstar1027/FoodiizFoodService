'use strict';

module.exports = ContactController;

ContactController.$inject = ['toaster', 'ContactService'];

function ContactController(toaster, ContactService) {
    var vm = this;
    vm.formData = null;
    vm.sending = false;
    vm.send = send;

    /**
     * @name send
     * @description send information
     */
    function send() {
        vm.sending = true;
        ContactService.sendEmail(vm.formData).then(
                function (response) {
                    if (response.data.data.response === 'success') {
                        toaster.pop("success", "Message sending", "Your message was sent.", 3000);
                        setTimeout(function () {
                            location.reload();
                        }, 1000);
                    }

                },
                function (err) {
                    toaster.pop('error', "Error", "Something went wrong, please try again.", 4000);
                }
        );
    }
}