angular.module('conFusion.controllers', [])

  .controller('AppCtrl', function ($scope, $ionicModal,
                                   $timeout, $localStorage,$ionicPlatform,
                                   $cordovaCamera,$cordovaImagePicker
  ) {

    // With the new view caching in Ionic, Controllers are only called
    // when they are recreated or on app start, instead of every page change.
    // To listen for when this page is active (for example, to refresh data),
    // listen for the $ionicView.enter event:
    //$scope.$on('$ionicView.enter', function(e) {
    //});
    $scope.registration = {};


    if($localStorage.get('favorites')===undefined){

      $localStorage.storeObject('favorites',[]);
    }

    console.log('start');
    // Form data for the login modal
    $scope.loginData = $localStorage.getObject('userinfo', '{}');
    $scope.reservation = {};

    $ionicModal.fromTemplateUrl('templates/register.html',{
      scope : $scope
    }).then(function(modal){
      $scope.registerform =modal;
    });

    // Create the login modal that we will use later
    $ionicModal.fromTemplateUrl('templates/login.html', {
      scope: $scope
    }).then(function (modal) {
      $scope.modal = modal;
    });

    $ionicModal.fromTemplateUrl('templates/reserve.html', {scope: $scope})
      .then(function (modal) {
        $scope.reserveform = modal;
      });

    $scope.closeRegister = function(){
      $scope.registerform.hide();
    };

    $scope.register = function(){
      $scope.registerform.show();
    };

    $scope.doRegister = function(){
      $timeout(function(){
        $scope.closeRegister();
      },1000)
    };

    // Triggered in the login modal to close it
    $scope.closeLogin = function () {
      $scope.modal.hide();
    };

    $scope.closeReserve = function () {
      $scope.reserveform.hide();
    };

    // Open the login modal
    $scope.login = function () {
      $scope.modal.show();
    };

    $scope.reserve = function () {
      $scope.reserveform.show();
    };
    // Perform the login action when the user submits the login form
    $scope.doLogin = function () {
      console.log('Doing login', $scope.loginData);
      $localStorage.storeObject('userinfo', $scope.loginData);
      // Simulate a login delay. Remove this and replace with your login
      // code if using a login system
      $timeout(function () {
        $scope.closeLogin();
      }, 1000);
    };
    $scope.doReserve = function () {
      console.log('Reservation Send', $scope.reservation);

      $timeout(function () {
        $scope.closeReserve();
      }, 1000)
    }

    $ionicPlatform.ready(function() {
      var options = {
        quality: 50,
        destinationType: Camera.DestinationType.DATA_URL,
        sourceType: Camera.PictureSourceType.CAMERA,
        allowEdit: true,
        encodingType: Camera.EncodingType.JPEG,
        targetWidth: 100,
        targetHeight: 100,
        popoverOptions: CameraPopoverOptions,
        saveToPhotoAlbum: false
      };
      $scope.takePicture = function() {
        $cordovaCamera.getPicture(options).then(function(imageData) {
          $scope.registration.imgSrc = "data:image/jpeg;base64," + imageData;
        }, function(err) {
          console.log(err);
        });

        $scope.registerform.show();

      };

      var imagePickerOptions = {
        maximumImagesCount: 1,
        width: 100,
        height: 100,
        quality: 50
      };

      $scope.selectPicture = function() {
        $cordovaImagePicker.getPictures(imagePickerOptions).then(function (results) {

          if(results.length > 0)
            $scope.registration.imgSrc = results[0];
        }, function(err) {
          console.log(err);
        });

        $scope.registerform.show();
      }
    });

  }).controller('MenuController', ['$scope', 'dishes', 'favoriteFactory',
    'baseURL', '$ionicListDelegate','$ionicPlatform','$cordovaLocalNotification','$cordovaToast',
    function ($scope, dishes, favoriteFactory, baseURL, $ionicListDelegate,
              $ionicPlatform, $cordovaLocalNotification, $cordovaToast) {


      $scope.baseURL = baseURL;
      $scope.tab = 1;
      $scope.filtText = '';
      $scope.showDetails = false;
      $scope.showMenu = true;
      $scope.message = "Loading ...";
      $scope.dishes = dishes;

      $scope.select = function (setTab) {
        $scope.tab = setTab;

        if (setTab === 2) {
          $scope.filtText = "appetizer";
        }
        else if (setTab === 3) {
          $scope.filtText = "mains";
        }
        else if (setTab === 4) {
          $scope.filtText = "dessert";
        }
        else {
          $scope.filtText = "";
        }
      };

      $scope.isSelected = function (checkTab) {
        return ($scope.tab === checkTab);
      };

      $scope.addFavorite = function (index) {

        console.log('Index is ' + index);
        favoriteFactory.addToFavorites(index);
        $ionicListDelegate.closeOptionButtons();

        $ionicPlatform.ready(function(){
          $cordovaLocalNotification.schedule({
            id:1,
            title:'Added Favorite',
            text:$scope.dishes[index].name
          }).then(function(){
            console.log('Added to Favorites '+$scope.dishes[index].name);
          },function(){
            console.log('Failed to add to Notification. ');
          });
        });

        $cordovaToast.show('Added favorite '+$scope.dishes[index].name, 'long','center')
          .then(function(success){
            console.log('cordovaToast '+success);
          },function(err){
            console.log('cordovaToast'+err);
          });

      };

      $scope.toggleDetails = function () {
        $scope.showDetails = !$scope.showDetails;
      };
    }])

  .controller('ContactController', ['$scope', function ($scope) {

    $scope.feedback = {mychannel: "", firstName: "", lastName: "", agree: false, email: ""};

    var channels = [{value: "tel", label: "Tel."}, {value: "Email", label: "Email"}];

    $scope.channels = channels;
    $scope.invalidChannelSelection = false;

  }])

  .controller('FeedbackController', ['$scope', 'feedbackFactory', function ($scope, feedbackFactory) {

    $scope.sendFeedback = function () {

      console.log($scope.feedback);

      if ($scope.feedback.agree && ($scope.feedback.mychannel == "")) {
        $scope.invalidChannelSelection = true;
        console.log('incorrect');
      }
      else {
        $scope.invalidChannelSelection = false;
        feedbackFactory.save($scope.feedback);
        $scope.feedback = {mychannel: "", firstName: "", lastName: "", agree: false, email: ""};
        $scope.feedback.mychannel = "";
        // $scope.feedbackForm.$setPristine();
        console.log($scope.feedback);
      }
    };
  }])

  .controller('DishDetailController', ['$scope', '$stateParams', 'dish', 'menuFactory',
    'favoriteFactory', '$ionicListDelegate', 'baseURL',
    '$ionicPopover', '$ionicModal', '$timeout', '$ionicLoading',
    '$ionicPlatform', '$cordovaLocalNotification', '$cordovaToast',

    function ($scope, $stateParams, dish, menuFactory, favoriteFactory,
              $ionicListDelegate, baseURL, $ionicPopover,
              $ionicModal, $timeout, $ionicLoading,
              $ionicPlatform, $cordovaLocalNotification, $cordovaToast) {

      $scope.baseURL = baseURL;
      $scope.dish = {};
      $scope.showDish = false;
      $scope.message = "Loading ...";
      $scope.mycomment = {rating: 5, comment: "", author: "", date: ""};

      $ionicPopover.fromTemplateUrl('templates/dish-detail-popover.html', {
        scope: $scope
      }).then(function (popover) {
        $scope.popover = popover;
      });

      $ionicModal.fromTemplateUrl('templates/dish-comment.html', {
        scope: $scope
      }).then(function (modal) {
        $scope.dishModal = modal;
      });

      $scope.openPopover = function ($event) {
        $scope.popover.show($event);
      };

      $scope.closePopover = function ($event) {
        $scope.popover.hide($event);
      };


      $scope.closeDishModal = function () {
        $scope.dishModal.hide();
      };

      $scope.openDishModal = function () {

        $scope.dishModal.show();
      };

      $scope.dish = dish;


      $scope.submitCommentForm = function () {

        $timeout(function () {
          $scope.closeDishModal();
        }, 1000)
      };

      $scope.submitComment = function () {

        $scope.mycomment.date = new Date().toISOString();
        console.log($scope.mycomment);

        $scope.dish.comments.push($scope.mycomment);
        menuFactory.update({id: $scope.dish.id}, $scope.dish);
        $ionicLoading.show({
          template: '<ionic-spinner></ionic-spinner> Wait...'
        })
        $timeout(function () {
          $scope.closeDishModal();
          $scope.closePopover();
          $ionicLoading.hide();
        }, 1000);

        $scope.mycomment = {rating: 5, comment: "", author: "", date: ""};
      }
      $scope.addFavorite = function (index) {
        console.log('Index is ' + index);
        $ionicPlatform.ready(function () {
          $cordovaLocalNotification.schedule({
            id: 1,
            title: "Added Favorite",
            text: $scope.dish.name
          }).then(function () {
              console.log('Added Favorite '+$scope.dish.name);
            },
            function () {
              console.log('Failed to add Notification ');
            });

          $cordovaToast
            .show('Added Favorite '+$scope.dish.name, 'long', 'bottom')
            .then(function (success) {
              // success
            }, function (error) {
              // error
            });
        });
        favoriteFactory.addToFavorites(index);
        $scope.popover.hide();
        $ionicListDelegate.closeOptionButtons();
      }

    }])

  .controller('DishCommentController', ['$scope', 'menuFactory', function ($scope, menuFactory) {

    $scope.mycomment = {rating: 5, comment: "", author: "", date: ""};

    $scope.submitComment = function () {

      $scope.mycomment.date = new Date().toISOString();
      console.log($scope.mycomment);

      $scope.dish.comments.push($scope.mycomment);
      menuFactory.update({id: $scope.dish.id}, $scope.dish);

      $scope.commentForm.$setPristine();

      $scope.mycomment = {rating: 5, comment: "", author: "", date: ""};
    }
  }])

  // implement the IndexController and About Controller here

  .controller('IndexController', ['$scope', 'dish',
    'promotion', 'leader', 'baseURL',
    function ($scope, dish, promotion, leader, baseURL) {

      $scope.baseURL = baseURL;
      $scope.leader = leader;
      $scope.showDish = false;
      $scope.message = "Loading ...";
      $scope.dish = dish;
      $scope.promotion = promotion;
    }])

  .controller('AboutController', ['$scope', 'leaders', 'baseURL',
    function ($scope, leaders, baseURL) {

      $scope.baseURL = baseURL;
      $scope.leaders = leaders;
      console.log($scope.leaders);

    }])
  .controller('FavoritesController', ['$scope', 'dishes', 'favorites', 'favoriteFactory',
    'baseURL', '$ionicListDelegate', '$ionicPopup','$cordovaVibration', '$ionicLoading', '$timeout',
    function ($scope, dishes, favorites, favoriteFactory, baseURL, $ionicListDelegate,
              $ionicPopup,$cordovaVibration, $ionicLoading, $timeout) {

      $scope.baseURL = baseURL;
      $scope.shouldShowDelete = false;

      $scope.favorites = favorites;

      $scope.dishes = dishes;

      $scope.toggleDelete = function () {
        $scope.shouldShowDelete = !$scope.shouldShowDelete;
        console.log($scope.shouldShowDelete);
      };

      $scope.deleteFavorite = function (index) {

        var confirmPopup = $ionicPopup.confirm({
          title: 'Confirm Delete',
          content: 'Are you sure you want to delete this item?'
        });

        confirmPopup.then(function (res) {
          if (res) {
            favoriteFactory.deleteFromFavorites(index);
            $cordovaVibration.vibrate(1000);
            console.log('Item Deleted');
          }
          else {
            console.log('Item Cancel');
          }
        });
        $scope.shouldShowDelete = false;
      };

    }])
  .filter('favoriteFilter', function () {
    return function (dishes, favorites) {
      var out = [];
      for (var i = 0; i < favorites.length; i++) {
        for (var j = 0; j < dishes.length; j++) {
          if (dishes[j].id === favorites[i].id)
            out.push(dishes[j]);
        }
      }
      return out;
    }
  });
