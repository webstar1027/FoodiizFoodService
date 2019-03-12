module.exports = AuthenticationService;

AuthenticationService.$inject = ['$http', '$rootScope'];

function AuthenticationService($http, $rootScope) {

    $rootScope.currentUser = null;

    _.extend(this, {
        RoutingError: RoutingError,
        isAuthenticated: isAuthenticated
    });

    /**
     * @name RoutingError
     * @description Returns error when a route is not resolved
     * @param msg
     * @param state
     * @param params
     * @returns {Error}
     * @constructor
     */
    function RoutingError(msg, state, params) {
        var err = new Error(msg);
        err.state = state;
        err.params = params;
        return err;
    }

    /**
     * @name isAuthenticated
     * @description Check if the user has a session
     */
    function isAuthenticated() {
        $rootScope.currentUser = null; 
        return $http.get(baseURL + 'Users/checkSession/');
    }
}
