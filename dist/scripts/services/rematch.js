define(['angular'], function (angular) {
  'user strict';

  return angular.module('PvP.services.rematch', [])
    .factory('Rematch', function ($location, Game, Games, UserSession, GameStates, $modal, pvpSync) {
      var modalInstance = null

      return {
        listen: function (game) {
          function rematchHandler(rematchRequests) {
            var currentUser = UserSession.currentUser()
            if (game.raw().state >= GameStates.finished) {
              rematchRequests.$getIndex().forEach(function (key) {
                var request = rematchRequests[key]
                if (request.from == currentUser.uid && 
                      request.to == game.opponentOf(currentUser.uid).uid && 
                      request.response && 
                      !request.gameId) {
                  if (request.response == 'accept') {
                    var opponent = game.opponentOf(currentUser.uid)
                    Games.create({
                      host: currentUser.uid,
                      title: 'A Rematch from ' + currentUser.name + ' to ' + opponent.name,
                      description: 'Best game ever',
                    }).then(function (newGame) {
                      // Has to invite host itself too
                      newGame.$invite([currentUser, opponent]).then(function () {
                        newGame.$redeem(currentUser).then(function () {
                          request.gameId = newGame.raw().$id
                          rematchRequests.$save().then(function () {
                            $location.path('/game/' + newGame.raw().$id);
                            //$window.location.href = '/#/game/' + newGame.raw().$id
                          })
                        }, function (reason) {
                          alert(reason);
                        })
                      }, function (reason) {
                        alert(reason);
                      })
                    }, function (reason) {
                      alert(reason)
                    });
                  } else if (request.response == 'reject') {
                    delete rematchRequests[key]
                    rematchRequests.$save()
                  }
                } else if (request.to == currentUser.uid && 
                      request.from == game.opponentOf(currentUser.uid).uid &&
                      !_.has(request, 'response')) {
                  console.log('Received a rematch request!')
                  if (modalInstance == null) {
                    modalInstance = $modal.open({
                      backdrop: 'static',
                      keyboard: false,
                      templateUrl: 'views/game/modal/requestRematch.html',
                      controller: function ($scope, $modalInstance) {
                        $scope.requester = game.player(request.from)

                        $scope.accept = function () {
                          console.log('[MODAL] accepting request', request)
                          request.response = 'accept'
                          rematchRequests.$save()
                          modalInstance = null
                          $modalInstance.close()
                        }

                        $scope.reject = function () {
                          console.log('[MODAL] rejecting request', request)
                          request.response = 'reject'
                          rematchRequests.$save()
                          modalInstance = null
                          $modalInstance.close()
                        }
                      }
                    })
                  }
                } else if (request.to == currentUser.uid && 
                      request.from == game.opponentOf(currentUser.uid).uid &&
                      _.has(request, 'response') && 
                      request.response == 'accept' && 
                      _.has(request, 'gameId')) {
                  // Listening on gameId
                  delete rematchRequests[key]
                  rematchRequests.$save().then(function () {
                    Games.get(request.gameId).then(function (game) {
                      game.$redeem(currentUser).then(function (game) {
                        $location.path('/game/' + game.raw().$id);
                        //$window.location.href = '/#/game/' + game.raw().$id
                      }, function (reason) {
                        alert(reason);
                      });
                    })
                  })
                }
              })
            }
          }

          pvpSync('/rematchRequests').$promise.then(function (rematchRequests) {
            rematchRequests.$onChange('', rematchHandler)
            rematchHandler(rematchRequests)
          })
        },
        listenAll: function () {
          var self = this
          Games.all().$promise.then(function (games) {
            games.$getIndex().forEach(function (index) {
              self.listen(new Game(games[index]))
            })
          })
        },
      }
    });
});
