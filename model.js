var mongoose = require('mongoose');

var userModel = require('./mongo/model/user');


var getAccessToken = function(token) {
	return userModel.findOne({
		accessTokenMith: token
	});
};

var getUser = function(username) {
	return userModel.findOne({
		username: username
	});
};


module.exports = {
	getAccessToken: getAccessToken,
//	getClient: getClient,
//	saveToken: saveToken,
	getUser: getUser,
//	getUserFromClient: getUserFromClient
};
