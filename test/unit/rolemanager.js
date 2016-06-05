var chai = require('chai');
var expect = chai.expect;
var rolemanager = require('../../logic/rolemanager');

describe('Role manager: ', function () {
    it('There is no role with the specified name', function () {
        var role = rolemanager.getRole('zzzz');
        expect(typeof role).to.equal('undefined');
    });

    it('There should be a role with the specified name', function () {
        var role = rolemanager.getRole('Doctor');
        expect(typeof role).to.not.equal('undefined');
    });

    it('Roles array should return valid data', function () {
        var roles = rolemanager.getRoleNames();
        for (var i = 0; i < roles.length; i++) {
            var role = rolemanager.getRole(roles[i]);
            expect(typeof role).to.not.equal('undefined');
        }
    });

    it('Night action populates the array correctly', function () {
        var session = {};
        session.nightActions = [];
        var properties = {
            from: {
                id: 1,
                role: '',
                state: 'alive',
                name: ''
            },
            to: {
                id: 1,
                role: '',
                state: 'alive',
                name: ''
            },
            action: 'Doctor'
        }
        rolemanager.nightAction(session, properties);
        var id = rolemanager.getRole('Doctor').id;
        expect(typeof session.nightActions[id]).to.equal('function');
    });

    it('Every role should have an id, alliance, description, nightinfo, and action', function () {
        var roles = rolemanager.roles;
        for (var property in roles) {
            if (roles.hasOwnProperty(property)) {
                expect(typeof roles[property]['id']).to.equal('number');
                expect(typeof roles[property]['alliance']).to.equal('string');
                expect(typeof roles[property]['description']).to.equal('string');
                expect(typeof roles[property]['nightinfo']).to.equal('string');
                expect(typeof roles[property]['action']).to.equal('function');
            }
        }
    });

    it('All roles should have different ids', function () {
        var roles = rolemanager.roles;
        var idMap = {};
        for (var property in roles) {
            if (roles.hasOwnProperty(property)) {
                expect(typeof idMap[roles[property].id]).to.equal('undefined')
                idMap[roles[property].id] = true;
            }
        }
    });
});
