angular.module('starter.controllers', ['firebase','ngCordova','ionic.service.core'])

.controller('DashCtrl', function($scope, $firebaseArray) {

	//$scope.ref = new Firebase("https://shining-inferno-7335.firebaseio.com/products");
  $scope.ref = new Firebase("https://sweltering-inferno-1375.firebaseio.com");
	$scope.products = $firebaseArray($scope.ref);


  $scope.addItems = function() {
    var product = {'name':'Iphone', 'sale_price': 78.10, 'img':'http://www.att.com/wireless/iphone/assets/207138-iPhone6-device2.jpg'};
    var product2 = {'name':'Android', 'sale_price': 78.10, 'img':'http://www.att.com/wireless/iphone/assets/207138-iPhone6-device2.jpg'};
    $scope.products.push(product);
    $scope.products.push(product2);

    $scope.$broadcast('scroll.infiniteScrollComplete')
  }

  $scope.doRefresh = function() {
    var product = {'name':'Iphone', 'sale_price': 78.10, 'img':'http://www.att.com/wireless/iphone/assets/207138-iPhone6-device2.jpg'};
    var product2 = {'name':'Android', 'sale_price': 78.10, 'img':'http://www.att.com/wireless/iphone/assets/207138-iPhone6-device2.jpg'};
    $scope.products.push(product);
    $scope.products.push(product2);

    //$scope.$broadcast('scroll.infiniteScrollComplete')
  }

})

.controller('DashFormCtrl', function($scope, $firebaseArray, $rootScope, $state, $cordovaCamera, $cordovaGeolocation) {
     
      if (!$rootScope.userSignedIn()){
        $state.go('sign-in');
      } 

      $scope.refire = new Firebase("https://sweltering-inferno-1375.firebaseio.com");

      //$scope.product = {name: '', sale_price: '', content: {description: ''}, photo: '', lat: -17.37, long: -66.15};

      //$scope.product = {city: '', description: '', houseId: '', houseType: '', leaseType: '', location: {latitude: -17.37, longitude: -66.15}, price: '', registerDate: '', status: 'Activo', surface: '', surfaceBuild: '', userId: '1', zone: ''};
      $scope.product = {city: '', description: '', houseId: '', houseType: '',image:{img1080x1440:[{height:'',url:'http://i.imgur.com/6u9VgMe.jpg',width:''}], img300x400:[{height:'',url:'http://i.imgur.com/6u9VgMe.jpg',width:''}]}, leaseType: '', location: {latitude: -17.37, longitude: -66.15}, price: '', registerDate: '', status: 'Activo', surface: '', surfaceBuild: '', userId: '1', zone: ''};

      var myLatlng = new google.maps.LatLng(-17.37, -66.15);
      var mapOptions = {
          center: myLatlng,
          zoom: 16,
          mapTypeId: google.maps.MapTypeId.ROADMAP
      };

      var map = new google.maps.Map(document.getElementById("map"), mapOptions);

      var marker = new google.maps.Marker({
              position: new google.maps.LatLng(-17.37, -66.15),
              map: map,
              title: "Mi locacion",
              options: { draggable: true }
      });

      var posOptions = {timeout: 10000, enableHighAccuracy: false};

      $cordovaGeolocation
      .getCurrentPosition(posOptions)
      .then(function (position) {
        console.log(position);
        $scope.product.location.latitude  = position.coords.latitude
        $scope.product.location.longitude = position.coords.longitude

      map.setCenter(new google.maps.LatLng(position.coords.latitude, position.coords.longitude));
          
      marker.setPosition(new google.maps.LatLng(position.coords.latitude, position.coords.longitude));

      }, function(err) {
          console.log(err);
      });

      var watchOptions = {
        frequency : 1000,
        timeout : 3000,
        enableHighAccuracy: false // may cause errors if true
      };

      var watch = $cordovaGeolocation.watchPosition(watchOptions);
      watch.then(
        null,
        function(err) {
          console.log(err);
        },
        function(position) {
          console.log(position);
          $scope.product.location.latitude  = position.coords.latitude;
          $scope.product.location.longitude = position.coords.longitude;

          marker.setPosition(new google.maps.LatLng(position.coords.latitude, position.coords.longitude));

    });

    google.maps.event.addListener(marker, 'dragend', function() {
        $scope.$apply(function(){
          //Stop listening changes
          watch.clearWatch();
          var pos = marker.getPosition();
          console.log(pos);
          $scope.product.location.latitude  = pos.A;
          $scope.product.location.longitude = pos.F;
        });
    });


    //document.addEventListener("deviceready", function () {
    $scope.takePicture = function() {
          var options = {
              quality : 75,
              destinationType : Camera.DestinationType.DATA_URL,
              sourceType : Camera.PictureSourceType.CAMERA,
              allowEdit : true,
              encodingType: Camera.EncodingType.JPEG,
              popoverOptions: CameraPopoverOptions,
              targetWidth: 500,
              targetHeight: 500,
              saveToPhotoAlbum: false
          };
          $cordovaCamera.getPicture(options).then(function(imageData) {
              //syncArray.$add({image: imageData}).then(function() {
              //    alert("Image has been uploaded");
              //});
              console.log(imageData);
              $scope.product.photo = imageData;

          }, function(error) {
              console.error(error);
          });
      }
    //}, false);

    $scope.uploadProduct = function() {

      var productRef =  $scope.refire.push($scope.product);
      console.log($scope.product.location.latitude);

      var productId = productRef.key();
      console.log(productId);
      $state.go('tab.dash');
    }
})


.controller('DashDetailCtrl', function($scope, $stateParams, $firebaseObject) {

  var ref = new Firebase("https://sweltering-inferno-1375.firebaseio.com/"+$stateParams.productId);
	$scope.product = $firebaseObject(ref);

  console.log($scope.product);  
  
})


.controller('SignInCtrl', ['$scope', '$rootScope', '$window', '$localstorage' , '$ionicUser', 
  function ($scope, $rootScope, $window, $localstorage, $ionicUser) {

     //$rootScope.checkSession();
     $scope.user = {
        email: "",
        password: ""
     };

     $scope.validateUser = function () {
        $rootScope.show('Please wait.. Authenticating');
        var email = this.user.email;
        var password = this.user.password;
        if (!email || !password) {
           $rootScope.notify("Please enter valid credentials");
           return false;
        }
        function authHandler(error, authData) {
          if (error) {
                $rootScope.hide();
                if (error.code == 'INVALID_EMAIL') {
                  $rootScope.notify('Invalid Email Address');
                }
                else if (error.code == 'INVALID_PASSWORD') {
                  $rootScope.notify('Invalid Password');
                }
                else if (error.code == 'INVALID_USER') {
                  $rootScope.notify('Invalid User');
                }
                else {
                  $rootScope.notify('Oops something went wrong. Please try again later');
                }
              }
            else {
              $rootScope.hide();
              console.log(authData);
              $rootScope.token = authData.token;
              $localstorage.set('token', authData.token);
              //console.log($localstorage.get('token', authData.token));
              //console.log($window.localStorage);

              $ionicUser.identify({
                user_id: authData.uid,
                email: email              
              }).then(function() {
                console.log("Success identify User");
              }, function(err) {
                  console.log("Error identify User");
                  console.log(err);
              });;
              $window.location.href = ('#/tab/account');
          }
        }
        $rootScope.refirebase.authWithPassword({
          email    : email,
          password : password
        }, authHandler);
     }
  }
])

 .controller('SignUpCtrl', [
    '$scope', '$rootScope',  '$window',
    function ($scope, $rootScope, $window) {
      
      $scope.user = {
        email: "",
        password: ""
      };

      $scope.createUser = function () {
  		var ref = new Firebase("https://shining-inferno-7335.firebaseio.com");

        if (!$scope.user.email || !$scope.user.password) {
          $rootScope.notify("Please enter valid credentials");
          return false;
        }
 
        $rootScope.show('Please wait.. Registering');

        $rootScope.refirebase.createUser($scope.user, function (error, user) {
          if (!error) {
          	console.log(user);
            $rootScope.hide();
            $rootScope.refirebase.child("users").child(user.uid).set({
              provider: 'password',
              email: $scope.user.email
            });
            //$rootScope.token = user.token;
            $window.location.href = ('#/');
          }
          else {
            $rootScope.hide();
            if (error.code == 'INVALID_EMAIL') {
              $rootScope.notify('Invalid Email Address');
            }
            else if (error.code == 'EMAIL_TAKEN') {
              $rootScope.notify('Email Address already taken');
            }
            else {
              $rootScope.notify('Oops something went wrong. Please try again later');
            }
          }
        });
      }
    }
  ])


.controller('MapCtrl', function($scope, $rootScope, $stateParams, $firebaseObject) {
  var ref = new Firebase("https://sweltering-inferno-1375.firebaseio.com/"+$stateParams.productId);
  $scope.product = $firebaseObject(ref);

  $scope.product.$loaded().then(function() {
    $scope.loadMap();
  });

  $scope.loadMap = function(){

    var myLatlng = new google.maps.LatLng($scope.product.location.latitude, $scope.product.location.longitude);

    console.log(myLatlng);

    var mapOptions = {
        center: myLatlng,
        zoom: 16,
        mapTypeId: google.maps.MapTypeId.ROADMAP
    };

    var map = new google.maps.Map(document.getElementById("map1"), mapOptions);

    console.log($scope.product.location.latitude);
    console.log($scope.product.location.longitude);

    var marker = new google.maps.Marker({
            position: new google.maps.LatLng($scope.product.location.latitude, $scope.product.location.longitude),
            map: map,
            title: $scope.product.zone
    });
  }

})


.controller('ContactCtrl', function($scope, $stateParams, $firebaseObject) {
  //$rootScope.notify($stateParams.productId);
  //$state.go('sign-in');
  var ref = new Firebase("https://sweltering-inferno-1375.firebaseio.com/"+$stateParams.productId);
  $scope.product = $firebaseObject(ref);
  console.log($scope.product);
})


.controller('ConfigCtrl', function($scope, $rootScope, $state) {
      if (!$rootScope.userSignedIn()){
        $state.go('sign-in');
      } 


})

