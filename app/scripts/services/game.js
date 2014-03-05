'user strict';

angular.module('PvP')
  .factory('Game', function ($rootScope, $q, Games, Moves, Channel, $firebase) {
    var meta = Games.get(),
        log = [];

    var determineStatus = function (state, userId) {
      switch (state.name) {
      case 'waiting_join':
        return 'Waiting for opponent to join...';
        break;
      case 'waiting_pick':
        if (state.detail == userId)
          return 'Waiting on other to pick moves...';
        else if (state.detail == 'both')
          return 'Pick your moves...';
        else
          return 'Waiting on you to pick moves...';
        break;
      case 'waiting_move':
        if (state.detail == userId)
          return 'Waiting on other to pick an attack...';
        else
          return 'Waiting on you to pick an attack...';
        break;
      case 'not_seen_animation':
        if (state.detail == userId) {
        } else {
        }
        break;
      case 'game_ended':
        return 'Game ended';
        break;
      default:
        return 'Cowabunga!';
        break;
      }
    };

    var fight = function() {
      if ($scope.playerA.lastMove && $scope.playerB.lastMove) {
        $scope.playerA.moveHistory.push($scope.playerA.lastMove);
        $scope.playerB.moveHistory.push($scope.playerB.lastMove);

        var damageM = $scope.damage($scope.playerA.lastMove, $scope.playerB.lastMove);
        $scope.playerA.health -= damageM[0];
        $scope.playerB.health -= damageM[1];

        $scope.result = 'Player '+$scope.playerA.name+' used '+$scope.playerA.lastMove+', Player '+$scope.playerB.name+' used '+$scope.playerB.lastMove+'!';
      } else {
        alert('Each player has to select a move');
      }
    };

    var damage = function(moveA, moveB) {
      if ( moveA == 'volcano' ) {
        if ( moveB == 'volcano' ) {
          $scope.explanation = 'Both player are damaged by fire';
          return [ 2, 2 ];
        } else if ( moveB == 'water' ) {
          $scope.explanation = 'The attack both cancelled each other';
          return [ 0, 0 ];
        } else if ( moveB == 'light' ) {
          $scope.explanation = '';
          return [ 1, 2 ];
        } else if ( moveB == 'magnetic' ) {
          var chance = Math.floor(Math.random()*3);
          if ( chance == 0 ) {
            $scope.explanation = 'Magnetic field reflected the attack';
            return [ 2, 0 ];
          } else if ( chance == 1 ) {
            $scope.explanation = 'Magnetic field cancelled the attack';
            return [ 0, 0 ];
          } else if ( chance == 2 ) {
            $scope.explanation = 'Magnetic field failed';
            return [ 0, 2 ];
          }
        }
      } else if ( moveA == 'water' ) {
        if ( moveB == 'volcano' ) {
          $scope.explanation = 'Water vaporates the heat';
          return [ 1, 2 ];
        } else if ( moveB == 'water' ) {
          $scope.explanation = '';
          return [ 1, 1 ];
        } else if ( moveB == 'light' ) {
          $scope.explanation = '';
          return [ 2, 1 ];
        } else if ( moveB == 'magnetic' ) {
          var chance = Math.floor(Math.random()*3);
          if ( chance == 0 ) {
            $scope.explanation = 'Magnetic field reflected the attack';
            return [ 2, 0 ];
          } else if ( chance == 1 ) {
            $scope.explanation = 'Magnetic field cancelled the attack';
            return [ 0, 0 ];
          } else if ( chance == 2 ) {
            $scope.explanation = 'Magnetic field failed';
            return [ 0, 2 ];
          }
        }
      } else if ( moveA == 'light' ) {
        if ( moveB == 'volcano' )
          return [ 2, 1 ];
        else if ( moveB == 'water' )
          return [ 1, 2 ];
        else if ( moveB == 'light' ) {
          var chance = Math.floor(Math.random()*2);
          if ( chance == 0 ) {
            side = Math.floor(Math.random()*2);
            if ( side == 0 )
              return [ 3, 0 ];
            else if ( side == 1 )
              return [ 0, 3 ];
          } else if ( chance == 1 )
            return [ 2, 2 ];
        } else if ( moveB == 'magnetic' ) {
          var chance = Math.floor(Math.random()*3);
          if ( chance == 0 ) {
            $scope.explanation = 'Magnetic field reflected the attack';
            return [ 2, 0 ];
          } else if ( chance == 1 ) {
            $scope.explanation = 'Magnetic field cancelled the attack';
            return [ 0, 0 ];
          } else if ( chance == 2 ) {
            $scope.explanation = 'Magnetic field failed';
            return [ 0, 2 ];
          }
        }
      } else if ( moveA == 'magnetic' ) {
        if ( moveB == 'volcano' ) {
          var chance = Math.floor(Math.random()*3);
          if ( chance == 0 ) {
            $scope.explanation = 'Magnetic field reflected the attack';
            return [ 0, 2 ];
          } else if ( chance == 1 ) {
            $scope.explanation = 'Magnetic field cancelled the attack';
            return [ 0, 0 ];
          } else if ( chance == 2 ) {
            $scope.explanation = 'Magnetic field failed';
            return [ 2, 0 ];
          }
        } else if ( moveB == 'water' ) {
          var chance = Math.floor(Math.random()*3);
          if ( chance == 0 )
            return [ 0, 2 ];
          else if ( chance == 1 )
            return [ 0, 0 ];
          else if ( chance == 2 )
            return [ 2, 0 ];
        } else if ( moveB == 'light' ) {
          var chance = Math.floor(Math.random()*3);
          if ( chance == 0 )
            return [ 0, 2 ];
          else if ( chance == 1 )
            return [ 0, 0 ];
          else if ( chance == 2 )
            return [ 2, 0 ];
        } else if ( moveB == 'magnetic' ) {
          $scope.explanation = 'Has no effect on each other...';
          return [ 0, 0 ];
        }
      }

      return [ 0, 0 ];
    };

    return function (gameId, userId) {
      var meta = Games.get(gameId),
          o = {
            moves: Moves.all(),
            meta: meta,
            player: meta.players[playerId],
            opponent: meta.players[opponentId],
            status: function () {
              return determineStatus(meta.state, playerId);
            },
            log: log
          };

      o.watch('meta', function (id, oldVal, newVal) {
        // Update to server
        Games.g.$save(gameId);
      });

      o.watch('player', function (id, oldVal, newVal) {
        // Update to server
        Games.g.$save(gameId);
      });

      return o;
    };
  });
