'user strict'

angular.module('PvP')
  .factory('GameStates', function () {
    return {
      opened: 0,
      invitesSent: 1,
      started: 2,
      movesPicked: 3,
      finished: 4
    }
  })

  .factory('Game', function ($q, GameStates) {

    var Game = function (game) {
      this._game = game
      this._limit = 2
    }

    Game.prototype.raw = function () {
      return this._game
    }

    Game.prototype.opponentOf = function (userId) {
      // We assume there are only two participants
      for (var id in this._game.participants) {
        if (this._game.participants.hasOwnProperty(id)) {
          if (id != userId)
            return this._game.participants[id]
        }
      }
    }

    Game.prototype.player = function (id) {
      return this._game.participants[id]
    }

    Game.prototype.$redeem = function (user) {
      var self = this

      this._game.participants = this._game.participants || {}

      if (this._game.participants && this._game.participants[user.uid] && 
            this._game.invitations && this._game.invitations.indexOf(user.uid) != -1) {
        // Already redeemed and is on the list
        return self
      }

      if (!this._game.invitations && this._game.state < GameStates.started) {
        // Open game, accept everyone
      } else if ((this._game.invitations && this._game.invitations.indexOf(user.uid) == -1) || this._game.state >= GameStates.started) {
        return $q.reject('Not invited or Game started')
      }

      this._game.participants[user.uid] = {
        selectedMoves: {},
        health: 10,
        name: user.displayName,
        uid: user.uid,
      }

      if (_.keys(this._game.participants).length == this._limit) {
        this._game.state = GameStates.started
      }
      
      return this._game.$save().then(function () {
        return self
      })
    }

    Game.prototype.$save = function () {
      return this._game.$save()
    }

    Game.prototype.$invite = function (users) {
      this._game.invitations = this._game.invitations || []

      if (users.length + this._game.invitations.length > this._limit) {
        return $q.reject("Can't invite over the limit (" + this._limit + ")")
      }

      if (users.length == 0) {
        return $q.reject("Has to invite users")
      }

      var self = this
      users.forEach(function (user) {
        console.log('inviting', user)
        if (self._game.invitations.indexOf(user.uid) == -1) {
          self._game.invitations.push(user.uid)
        }
      })

      this._game.state = GameStates.invitesSent

      return this._game.$save().then(function () {
        return self
      })
    }

    return Game
  })
