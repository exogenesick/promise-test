var Q = require('q');
var sinon = require('sinon');
var expect = require('chai').expect;

var api = {};
api.sendUser = function(user) {};
api.rejectCall = function() {};

var usersProvider = {};
usersProvider.findUserByUsername = function(username) {
    var deferred = Q.defer();

    if ('spider' !== username) {
        deferred.reject(new Error('Username not found'));
    } else {
        deferred.resolve({ id: 1, username: username });
    }

    return deferred.promise;
};

var usersService = {};
usersService.getUser = function(username) {
    usersProvider.findUserByUsername(username)
        .then(function(user) {
            api.sendUser(user);
        })
        .fail(function(err) {
            api.rejectCall();
        });
};

describe('usersService', function() {
    beforeEach(function () {
        sinon.stub(process, 'nextTick').yields();
    });

    afterEach(function () {
        process.nextTick.restore();
    });

    describe('#getUser', function() {
        it('should send user when user is found', function() {
            // given
            var user = { username: 'spider' };

            sinon.stub(usersProvider, 'findUserByUsername')
                .returns(Q.resolve(user));

            var spy = sinon.spy(api, 'sendUser');

            // when
            usersService.getUser(user.username);

            // then
            expect(spy.calledOnce)
                .to
                .be
                .true;

            usersProvider.findUserByUsername.restore();
        });

        it('should reject call when user is not found', function() {
            // given
            var user = { username: 'manbearpig' };

            sinon.stub(usersProvider, 'findUserByUsername')
                .returns(Q.reject('Error message'));

            var spy = sinon.spy(api, 'rejectCall');

            // when
            usersService.getUser(user.username);

            // then
            expect(spy.calledOnce)
                .to
                .be
                .true;

            usersProvider.findUserByUsername.restore();
        });          
    });
});
