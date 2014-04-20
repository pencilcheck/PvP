'user strict';

angular.module('PvP')

.factory('pvpSync', function (firebaseUrl, $interval, $timeout, $q) {

  function _handleUndefined(obj) {
    if (typeof obj == 'object' && obj != null) {
      _.keys(obj).forEach(function (key) {
        if (typeof obj[key] == 'undefined' || obj[key] == null) {
          console.log('undefined property', key, obj[key])
          obj[key] = {}
        } else {
          obj[key] = _handleUndefined(obj[key])
        }
      })
      return obj
    } else {
      if (obj == null) {
        return {}
      }
      return obj
    }
  }

  function _clean(raw) {
    // Recusion (stack too long)
    //_.keys(raw).forEach(function (key) {
      //if (typeof raw[key] === 'object')
        //raw[key] = _clean(raw[key])
    //})

    console.log('_clean')
    var cleaned = _.omit(raw, Object.keys(raw).filter(function (key) {
      return key.startsWith('$')
    }))
    return _handleUndefined(cleaned)
  }

  var PvpSync = function (pathOrRef) {
    var firebaseRef,
        wrapper = {},
        dfd = $q.defer(),
        cbs = {},
        polls = {}

    if (typeof pathOrRef == 'string') {
      firebaseRef = new Firebase(firebaseUrl + pathOrRef)
    } else if (pathOrRef instanceof Firebase) {
      firebaseRef = pathOrRef
    }

    wrapper = _.extend(wrapper, {
      $id: firebaseRef.ref().name(),
      $ref: firebaseRef,
      $child: function (path) {
        return PvpSync(firebaseRef.child(path))
      },
      $set: function (obj) {
        var deferred = $q.defer()
        firebaseRef.set(_clean(obj), function () {
          deferred.resolve(this)
        }.bind(this))
        return deferred.promise
      },
      $push: function (obj) {
        var deferred = $q.defer()
        var ref = firebaseRef.push(_clean(obj), function () {
          PvpSync(ref).$promise.then(function (sync) {
            deferred.resolve(sync)
          })
        })
        return deferred.promise
      },
      $save: function () {
        var deferred = $q.defer()
        firebaseRef.set(_clean(this), function () {
          deferred.resolve(this)
        }.bind(this))
        return deferred.promise
      },
      $index: [],
      $getIndex: function () {
        return this.$index
      },
      $promise: dfd.promise,
      $onChange: function (prop, cb) {
        if (prop == '' || typeof prop === 'undefined') {
          cbs.$$itself = cbs.$$itself || []
          cbs.$$itself.push(cb)
        } else {
          cbs[prop] = cbs[prop] || []
          cbs[prop].push(cb)
        }
      },
      $onPoll: function (prop, cb) {
        polls[prop] = polls[prop] || []
        polls[prop].push(cb)
      }
    })

    $interval(function () {
      _.keys(polls).forEach(function (key) {
        polls[key].forEach(function (cb) {
          cb(wrapper[key])
        })
      })
    }, 1000)

    function _triggerCallbacks(prop, val) {
      if (cbs[prop]) {
        console.log('trigger callbacks for', prop)
        cbs[prop].forEach(function (cb) {
          cb(val)
        })
      }
    }

    function _processChild(snapshot, prevChildName) {
      // Trigger $apply, $digest
      $timeout(function () {
        if (wrapper.$index.indexOf(snapshot.name()) != -1)
          wrapper.$index.splice(wrapper.$index.indexOf(snapshot.name()), 1)

        if (snapshot.val() == null) {
          delete wrapper[snapshot.name()]
        } else {
          wrapper[snapshot.name()] = snapshot.val()
          if (wrapper.$index.indexOf(prevChildName) != -1)
            wrapper.$index.splice(wrapper.$index.indexOf(prevChildName)+1, 0, snapshot.name())
          else
            wrapper.$index.splice(0, 0, snapshot.name())
          _triggerCallbacks(snapshot.name(), snapshot.val())
        }
      })
    }

    firebaseRef.on('child_added', _processChild)
    firebaseRef.on('child_changed', _processChild)
    firebaseRef.on('child_moved', _processChild)
    firebaseRef.on('child_removed', function (snapshot) {
      $timeout(function () {
        if (wrapper.$index.indexOf(snapshot.name()) != -1)
          wrapper.$index.splice(wrapper.$index.indexOf(snapshot.name()), 1)
        delete wrapper[snapshot.name()]
      })
    })
    firebaseRef.on('value', function (snapshot) {
      $timeout(function () {
        //console.log('on value of', firebaseRef.toString(), snapshot.val())
        wrapper = _.extend(wrapper, snapshot.val())
        dfd.resolve(wrapper)
        _triggerCallbacks('$$itself', wrapper)
      })
    })

    return wrapper
  }

  return PvpSync
})
