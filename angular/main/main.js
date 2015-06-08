"use strict";

(function () {
    /* App Module */
    angular.module("bw.main", [
        'bw.main.header',
        'bw.main.security',
        'bw.main.campaign',
        'bw.main.challenge',
        'bw.main.hello',
        'bw.main.user',
        'bw.main.skirmish',
        'ui.bootstrap'
    ])

        .config(["ApiProvider", function (ApiProvider) {
            ApiProvider.setHost("http://192.168.1.70:1006"); // set in _layout.cshtml
        }])
    ;
})();
