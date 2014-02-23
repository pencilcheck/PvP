'use strict';

angular.module('PvP')
  .controller('GameCtrl', function ($scope, $firebase, $routeParams, firebaseUrl, UserSession) {

    $scope.render = function(event, from, to) {
      console.log('render', from, to);
      if(to == 'selectMoves') {
        $scope.viewUrl = 'views/game/selectMoves.html';
      }

      if(to == 'waitingOnOthers') {
      }

      if(to == 'startingGame') {
        $scope.viewUrl = 'views/game/fightScene.html';
      }

      if(to == 'selectingAttack') {
      }

      if(to == 'endingRound') {
      }

      if(to == 'selectingAttack') {
      }

      if(to == 'showingResult') {
      }

      if(to == 'showingScoreBoard') {
        $scope.viewUrl = 'views/game/scoreBoard.html';
      }
    }


    $scope.fsm = StateMachine.create({
      initial: 'selectMoves',
      events: [
        { name: 'selectMovesFirst', from: 'selectMoves', to: 'waitingOnOthers' },
        { name: 'receiveSelectMoves', from: 'waitingOnOthers', to: 'startingGame' },
        { name: 'selectMovesSecond', from: 'selectMoves', to: 'startingGame' },

        { name: 'prepareGame', from: 'startingGame', to: 'selectingAttack' },
        { name: 'attackFirst', from: 'selectingAttack', to: 'waitingOnOthers' },
        { name: 'receiveAttack', from: 'waitingOnOthers', to: 'endingRound' },
        { name: 'attackSecond', from: 'selectingAttack', to: 'endingRound' },

        { name: 'prepareRound', from: 'endingRound', to: 'selectingAttack' },
        { name: 'endingGame', from: 'endingRound', to: 'showingResult' },
        { name: 'endGame', from: 'showingResult', to: 'showingScoreBoard' }
      ],
      callbacks: {
        onafterevent: function(event, from, to) {
          $scope.safeApply(function() {
            $scope.render(event, from, to);
          });
        },
        onenterwaitingOnOthers: function(event, from, to) {
          $scope.safeApply(function() {
            $scope.waitingOnOther = true;
          });
        },
        onleavewaitingOnOthers: function(event, from, to) {
          $scope.safeApply(function() {
            $scope.waitingOnOther = false;
          });
        }
      }
    });

    $scope.isSelected = function(moveKey) {
      if ($scope.selectedMoves) {
        var keys = $scope.selectedMoves.$getIndex();
        keys.forEach(function(key, i) {
          if(key == moveKey)
            return true;
        });
      }
      return false;
    };

    // In selectMoves state
    $scope.selectMove = function(key) {
      $scope.selectedMoves.$add(key);
    };

    $scope.removeMove = function(key) {
      $scope.selectedMoves.$remove(key);
    };

    $scope.setupOpponentMoves = function () {
      if ($scope.users) {
        $scope.users.forEach(function (key, user) {
            if (key != $scope.user.uid) {
              console.log($scope.game.moves);
              console.log($scope.game.users);
              $scope.opponent = $scope.users[key];
              $scope.opponentSelectedMoves = $scope.game.moves[key];
            }
        });
      }
    }

    // General setup
    $scope.setup = function(user) {
      var gameId = $routeParams.gameId,
          gameRef = $firebase(new Firebase(firebaseUrl + 'games/' + gameId)),
          gameMovesRef = gameRef.$child('moves'),
          usersRef = gameRef.$child('users'),
          movesRef = $firebase(new Firebase(firebaseUrl + 'moves')),
          statusRef = gameRef.$child('status');

      $scope.user = user;
      statusRef.$add({user: $scope.user.uid, status: 'joined', time: new Date()});
      movesRef.$bind($scope, 'moves');
      gameRef.$bind($scope, 'game').then(function () {
        usersRef.$bind($scope, 'users').then(function () {
          console.log($scope.users);
          if (!$scope.users) $scope.users = [{}];
          var u = {};
          u[$scope.user.uid] = $scope.user;
          $scope.users.push(u);

          gameMovesRef.$child($scope.user.uid).$bind($scope, 'selectedMoves').then(function () {
            $scope.setupOpponentMoves();
          });
        });
      });


      //$scope.status.$on('change', function () {
        //console.log('update because status change');
        //$scope.updateOpponentMoves();
      //})

      //$scope.moves.$on('change', function () {
        //console.log('update because moves change');
        //$scope.updateOpponentMoves();
      //});
      return user;
    };


    $scope.initScene = function(user) {
      console.log('initScene', user);

      $scope.render(null, null, 'selectMoves');

      return user;
    };

    UserSession.signIn().then($scope.setup).then($scope.initScene);



    $scope.playerA = {
      lastMove: '',
      moveHistory: [],
      health: 10,
      name: 'Left'
    };

    $scope.playerB = {
      lastMove: '',
      moveHistory: [],
      health: 10,
      name: 'Right'
    };

    $scope.fight = function() {
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

    $scope.damage = function(moveA, moveB) {
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
    }
  });
