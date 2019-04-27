const express = require('express')
const bodyParser = require('body-parser')
const { promisify } = require('util')
const OAuth2Server = require('oauth2-server')
const Request = OAuth2Server.Request
const Response = OAuth2Server.Response;
const MithVaultSDK = require('./mith-vault-sdk.min.js')


const clientId = 'f435ce9da82d9960846192adb99d5a38'
const clientSecret = '1163f104e7d7ef2a01f62132c4b1494fc44e859318aaf494c379a97caaa2b34ca25854154ba29af80ee4e49adb12b1ebb99944da2fddf1ccce5fabba96c0c9a2'
const miningKey = 'mdp'
const userToken = '19e5abc521f14f2317712cb7725d8a9b0f670afe04ea61e091f1060e7845e16e55e300995cb79340782ce34ba683ec9e37e856ff95'

//sdk.getUserMiningAction({ token: userToken }).then(data => {
//	console.log(data)
//}).catch(error => {
//	console.log(error)
//})

const app = express()
app.use(bodyParser.json())

// add mongo connect

app.oauth = new OAuth2Server({
		model: require('./model.js'),
		accessTokenLifetime: 60 * 60,
		allowBearerTokensInQueryString: true
});


app.all('/oauth/token', obtainToken);
app.all('/oauth/token2', obtainToken2);

app.get('/', authenticateRequest, function(req, res) {

	res.send('Congratulations, you are in a secret area!');
});

const startServer = async () => {
	  const port = process.env.SERVER_PORT || 8080
	  await promisify(app.listen).bind(app)(port)
	  console.log(`Listening on port ${port}`)
}

startServer()

function obtainToken2(req, res) {
	grantCode = 'f291d5b57884db565135c677191934ac2a2c9d58d4b7a46e65fcb4e28f51ffb5e60a246010cd848e5692858ece3bcc5708e7a3bacff8ca02b4c3d2ffc5c6af29&state=9055eebc-aacf-46c6-b68a-1a4b984b7f08'
	grantCode = 'df166342407c70420bc9ae010f8a18edd67520bdb4d38d07a0d9b5890864e17e70412c46e63a4bded2d34222b4c15fbc75f4adf81acbde3af7187f6e965317c4&state=5223903a-7532-4486-9252-9a9abc6ed54e'
	state = '5223903a-7532-4486-9252-9a9abc6ed54'
	const sdk = new MithVaultSDK({ clientId, clientSecret, miningKey })
	sdk.getAccessToken({ grantCode, state }).then(data => {
		console.log(data)
	}).catch(error => {
		console.log(error)
	})
}
function obtainToken(req, res) {
	const sdk = new MithVaultSDK({ clientId, clientSecret, miningKey })
	const uri = sdk.getBindURI()

	res.json({
		errorCode:0,
		message: uri
	});
}

function authenticateRequest(req, res, next) {

	var request = new Request(req);
	var response = new Response(res);

	return app.oauth.authenticate(request, response)
		.then(function(token) {

			next();
		}).catch(function(err) {

			res.status(err.code || 500).json(err);
		});
}
