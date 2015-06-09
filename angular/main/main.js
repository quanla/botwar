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

        .config(function (ApiProvider) {

            if (window.location.href.indexOf("http://localhost:") == 0) {
                ApiProvider.setHost("http://192.168.1.70:1006");
                //ApiProvider.setHost("http://54.254.246.157:1006");
            } else {
                ApiProvider.setHost("http://54.254.246.157:1006");
            }
        })
    ;
})();
