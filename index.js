const express = require('express')
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
const { promisify } = require('util')
const OAuth2Server = require('oauth2-server')
const Request = OAuth2Server.Request
const Response = OAuth2Server.Response;
const MithVaultSDK = require('./mith-vault-sdk.min.js')
const models = require('./model')
const userModel = require('./mongo/model/user');



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
var mongoUri = 'mongodb://localhost/dapp'

mongoose.connect(mongoUri, {
	useCreateIndex: true,
	useNewUrlParser: true
}, function(err, res) {
	if (err) {
		return console.error('Error connecting to "%s":', mongoUri, err);
	}
	console.log('Connected successfully to "%s"', mongoUri);
});

app.oauth = new OAuth2Server({
		model: require('./model.js'),
		accessTokenLifetime: 60 * 60,
		allowBearerTokensInQueryString: true
});

app.all('/oauth/grant', obtainGrantCode);
app.post('/oauth/token', obtainToken);
app.get('/', function(req, res) {
	res.send('hello world');
});
app.get('/users/:id', getUser);

const startServer = async () => {
	  const port = process.env.SERVER_PORT || 8080
	  await promisify(app.listen).bind(app)(port)
	  console.log(`Listening on port ${port}`)
}

startServer()

function obtainToken(req, res) {
	console.log(req.body);
	
	var grantCode = req.body.grantCode;
	var state = req.body.state;
	var address = req.body.address;
	const sdk = new MithVaultSDK({ clientId, clientSecret, miningKey })
	sdk.getAccessToken({ grantCode, state }).then(data => {
		console.log(data)
		models.getUser(address)
		.then(u => {
			if (!u) {
				user = new userModel({
					username: address,
					accessTokenMith: data.token
				});
				user.save()
			} else {
				u.accessTokenMith = data.token
				user.save()
				
			}
			
		})
		res.json({
			errorCode:0,
			token: data.token
		});
	}).catch(err => {
		res.status(err.code || 500).json(err);
	})
}


function obtainGrantCode(req, res) {
	const sdk = new MithVaultSDK({ clientId, clientSecret, miningKey })
	const uri = sdk.getBindURI()

	res.json({
		errorCode:0,
		uri: uri
	});
}

function getUser(req, res) {
	let id = req.params.id;
	models.getUser(id)
	.then(u => {
		if (!u) {
			res.status(400).json({msg:"user not found"})
		} else {
			res.json(u);
		}
	})
}
