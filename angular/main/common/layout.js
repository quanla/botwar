"use strict";

(function () {

    angular.module('bw.main.layout', [
    ])
        .factory("LayoutService", function() {
            var titleElem = $("title");
            var oriTitle = titleElem.text();

            var descElem = $("meta[name=description]");
            var oriDesc = descElem.attr("content");

            return {
                setTitle: function($scope, title) {
                    titleElem.text(title);
                    $scope.$on("$destroy", function() {
                        titleElem.text(oriTitle);
                    });
                },
                setDescription: function($scope, desc) {
                    descElem.text(desc);
                    $scope.$on("$destroy", function() {
                        descElem.text(oriDesc);
                    });
                }
            };
        })
    ;

})();