var app = angular.module('Incognitive', []);
app.controller('ctr', function($scope, $http) {
    $scope.result = "";
    $scope.imgInput="Enter image URL";
    $scope.doMagic=function() {
        $http({
            url: 'http://incognitive.azurewebsites.net/trump/detect',
            method: "POST",
            data: { 'ur' : $scope.imgInput }
        })
        .then(function(response) {
            $http({
                url: 'http://incognitive.azurewebsites.net/trump/identify',
                method: "POST",
                data: { 'bdy' : response }
            })
            .then(function(dt) {
                if(dt.data[0].candidates.length == 0){
                    $scope.result="You are not Trump";
                } else {
                    $http({
                        url: 'http://incognitive.azurewebsites.net/trump/emo',
                        method: "POST",
                        data: { 'ur' : $scope.imgInput }
                    })
                    .then(function(response) {
                        var respo = response.data[0].scores;
                        var exp = "";
                        if (respo.anger > 0.45) {
                            exp = " angry";
                        } else if (respo.surprise > 0.4) {
                            exp = " surprised";
                        } else if (respo.happiness > 0.45) {
                            exp = " happy";
                        } else if (respo.sadness > 0.4) {
                            exp = " sad";
                        }
                        $scope.result="You are" + exp + " trump. (" + dt.data[0].candidates[0].confidence * 100 + "%)";
                    });
                }
            }, 
            function(dt) { // optional
                $scope.result = "err2";
            });
        }, 
        function(response) { // optional
            $scope.result = "err";
        });
    };

});



/////////////////////////////////////////////////////////////////////


var app2=angular.module('myapp', ['webcam'])
    app2.controller('mainController', function ($scope) {
        var _video = null,
            patData = null;

        $scope.patOpts = { x: 0, y: 0, w: 25, h: 25 };

        // Setup a channel to receive a video property
        // with a reference to the video element
        // See the HTML binding in main.html
        $scope.channel = {};

        $scope.webcamError = false;
        $scope.onError = function (err) {
            $scope.$apply(
                function () {
                    $scope.webcamError = err;
                }
            );
        };

        $scope.onSuccess = function () {
            // The video element contains the captured camera data
            _video = $scope.channel.video;
            $scope.$apply(function () {
                $scope.patOpts.w = _video.width;
                $scope.patOpts.h = _video.height;
                //$scope.showDemos = true;
            });
        };

        $scope.onStream = function (stream) {
            // You could do something manually with the stream.
        };

        $scope.makeSnapshot = function () {
            if (_video) {
                var patCanvas = document.querySelector('#snapshot');
                if (!patCanvas) return;

                patCanvas.width = _video.width;
                patCanvas.height = _video.height;
                var ctxPat = patCanvas.getContext('2d');

                var idata = getVideoData($scope.patOpts.x, $scope.patOpts.y, $scope.patOpts.w, $scope.patOpts.h);
                ctxPat.putImageData(idata, 0, 0);

                sendSnapshotToServer(patCanvas.toDataURL());

                patData = idata;
            }
        };

        /**
         * Redirect the browser to the URL given.
         * Used to download the image by passing a dataURL string
         */
        $scope.downloadSnapshot = function downloadSnapshot(dataURL) {
            window.location.href = dataURL;
        };

        var getVideoData = function getVideoData(x, y, w, h) {
            var hiddenCanvas = document.createElement('canvas');
            hiddenCanvas.width = _video.width;
            hiddenCanvas.height = _video.height;
            var ctx = hiddenCanvas.getContext('2d');
            ctx.drawImage(_video, 0, 0, _video.width, _video.height);
            return ctx.getImageData(x, y, w, h);
        };

        /**
         * This function could be used to send the image data
         * to a backend server that expects base64 encoded images.
         *
         * In this example, we simply store it in the scope for display.
         */
        var sendSnapshotToServer = function sendSnapshotToServer(imgBase64) {
            $scope.snapshotData = imgBase64;
        };
    });