angular.module('conFusion.controllers', [])

  .controller('AppCtrl', function ($scope, $ionicModal, $timeout) {

    // With the new view caching in Ionic, Controllers are only called
    // when they are recreated or on app start, instead of every page change.
    // To listen for when this page is active (for example, to refresh data),
    // listen for the $ionicView.enter event:
    //$scope.$on('$ionicView.enter', function(e) {
    //});

    // Form data for the login modal
    $scope.loginData = {};
    $scope.reservation = {};
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
  }).controller('MenuController', ['$scope', 'menuFactory', 'favoriteFactory',
    'baseURL',
    function ($scope, menuFactory, favoriteFactory, baseURL) {

      $scope.baseURL = baseURL;
      $scope.tab = 1;
      $scope.filtText = '';
      $scope.showDetails = false;
      $scope.showMenu = false;
      $scope.message = "Loading ...";

      menuFactory.getDishes().query(
        function (response) {
          $scope.dishes = response;
          $scope.showMenu = true;
        },
        function (response) {
          $scope.message = "Error: " + response.status + " " + response.statusText;
        });


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
        $scope.feedbackForm.$setPristine();
        console.log($scope.feedback);
      }
    };
  }])

  .controller('DishDetailController', ['$scope', '$stateParams', 'menuFactory',
    'favoriteFactory', '$ionicListDelegate', 'baseURL',
    '$ionicPopover', '$ionicModal', '$timeout', '$ionicLoading',

    function ($scope, $stateParams, menuFactory, favoriteFactory,
              $ionicListDelegate, baseURL, $ionicPopover,
              $ionicModal, $timeout, $ionicLoading) {

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

      $scope.dish = menuFactory.getDishes().get({id: parseInt($stateParams.id, 10)})
        .$promise.then(
        function (response) {
          $scope.dish = response;
          $scope.showDish = true;
        },
        function (response) {
          $scope.message = "Error: " + response.status + " " + response.statusText;
        }
      );

      $scope.dishId = menuFactory.getDishes().get({id: parseInt($stateParams.id, 10)})
        .$promise.then(
        function (response) {
          $scope.dishId = response.id;
        },
        function (response) {
          $scope.message = "Error: " + response.status + " " + response.statusText;
        }
      );

      $scope.submitCommentForm = function () {

        $timeout(function () {
          $scope.closeDishModal();
        }, 1000)
      };

      $scope.submitComment = function () {

        $scope.mycomment.date = new Date().toISOString();
        console.log($scope.mycomment);

        $scope.dish.comments.push($scope.mycomment);
        menuFactory.getDishes().update({id: $scope.dish.id}, $scope.dish);
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
      menuFactory.getDishes().update({id: $scope.dish.id}, $scope.dish);

      $scope.commentForm.$setPristine();

      $scope.mycomment = {rating: 5, comment: "", author: "", date: ""};
    }
  }])

  // implement the IndexController and About Controller here

  .controller('IndexController', ['$scope', 'menuFactory', 'corporateFactory', 'baseURL',
    function ($scope, menuFactory, corporateFactory, baseURL) {

      $scope.baseURL = baseURL
      $scope.leader = corporateFactory.get({id: 3});
      $scope.showDish = false;
      $scope.message = "Loading ...";
      $scope.dish = menuFactory.getDishes().get({id: 0})
        .$promise.then(
        function (response) {
          $scope.dish = response;
          $scope.showDish = true;
        },
        function (response) {
          $scope.message = "Error: " + response.status + " " + response.statusText;
        }
      );
      $scope.promotion = menuFactory.getPromotion().get({id: 0});

    }])

  .controller('AboutController', ['$scope', 'corporateFactory', 'baseURL',
    function ($scope, corporateFactory, baseURL) {

      $scope.baseURL = baseURL;
      $scope.leaders = corporateFactory.query();
      console.log($scope.leaders);

    }])
  .controller('FavoritesController', ['$scope', 'menuFactory', 'favoriteFactory',
    'baseURL', '$ionicListDelegate', '$ionicPopup', '$ionicLoading', '$timeout',
    function ($scope, menuFactory, favoriteFactory, baseURL, $ionicListDelegate,
              $ionicPopup, $ionicLoading, $timeout) {

      $scope.baseURL = baseURL;
      $scope.shouldShowDelete = false;

      $ionicLoading.show({
        template: '<ionic-spinner></ionic-spinner> Loading...'
      })

      $scope.favorites = favoriteFactory.getFavorites();

      $scope.dishes = menuFactory.getDishes().query(
        function (respond) {
          $timeout(function () {
            $ionicLoading.hide();
          }, 1000)
          $scope.dishes = respond;

        }, function (respond) {
          $timeout(function () {
            $ionicLoading.hide();
          }, 1000)
          $scope.message = 'Favorite Controller Error: ' + respond.status + ' ' + respond.statusText;
        });

      //console.log($scope.dishes, $scope.favorites);

      $scope.toggleDelete = function () {
        $scope.shouldShowDelete = !$scope.shouldShowDelete;
        console.log($scope.shouldShowDelete);
        console.log($scope.favorites);
      };

      $scope.deleteFavorite = function (index) {

        var confirmPopup = $ionicPopup.confirm({
          title: 'Confirm Delete',
          content: 'Are you sure you want to delete this item?'
        });

        confirmPopup.then(function (res) {
          if (res) {
            favoriteFactory.deleteFromFavorites(index);
            console.log('Item Deleted');
          }
          else {
            console.log('Item Cancel');
          }
        })


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
