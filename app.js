const fetch = require('node-fetch')
const express = require('express')
const app = express()

/* API KEY */
let apiKey = 0

/* QUEUE DATA JSON */

let queueData = {
	'440': '5x5 Flex Queue',
	'420': '5x5 Solo Queue'
}

/* Allows usage of local host while testing */
app.use((req,res,next) => {
	res.header('Access-Control-Allow-Origin', '*')
	res.header("Access-Control-Allow-Methods", "GET, PUT, POST")
  	res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept")
	next()
})

/* API call that gets summoner user data */
app.get('/getSummoner', async function (req,res) {
	/* parameters */
	var summonerName = req.query.summonerName
	var region = req.query.region

	/* response that is sent to the script */
	res.send(await callData(summonerName, region))

})

/* API call to begin match history scouring */
app.get('/getMatches', async function(req, res) {
	
	var puuid = req.query.puuid
	var region = req.query.region

	res.send(await getMatchData(puuid, region))

})

app.get('/', function(req, res) {
	res.send('api reached')
})

app.listen(3000, () => console.log('Listening on port 3000'))



async function getMatchData(puuid, region) {
	let response = await fetch('https://europe.api.riotgames.com/lol/match/v5/matches/by-puuid/'+puuid+'/ids?start=0&count=1&type=ranked&api_key='+apiKey)
	let data = await response.json()
	
	let matchResponse = await fetch('https://europe.api.riotgames.com/lol/match/v5/matches/'+data[0]+'?api_key='+apiKey)
	let matchData = await matchResponse.json()

	/* game data */

	let gameTime = matchData['info']['gameDuration']
	var minutes = Math.floor(gameTime/60)
	var seconds = (gameTime-minutes * 60).toString()
	console.log(seconds.length)
	
	if (seconds.length == 1) {
		seconds = '0'+seconds.toString()
	}
	var duration = minutes+':'+seconds

	let queueNum = matchData['info']['queueId']
	let queueType = queueData[queueNum]

	var win

	/* individual data*/
	var participantChamp
	var participantRole
	var participantId
	var enemyChampion

	/* json to be returned from API call */
	var returnData = {'metadata':{}, 'info': {}}

	for(let i = 0; i < 10; i++) {
		if (matchData['metadata']['participants'][i] == puuid) {
			participantId = i
			participantChamp = matchData['info']['participants'][i]['championName']
			participantRole = matchData['info']['participants'][i]['individualPosition']
			win = matchData['info']['participants'][i]['win']

		} 
	}

	for(let i = 0; i < 10; i++) {
		if(participantRole == matchData['info']['participants'][i]['individualPosition'] && i!=participantId) {
			enemyChampion = matchData['info']['participants'][i]['championName']
		}
	}

	if (win == true) {
		win = 'WIN'
	}
	else {
		win = 'LOSS'
	}

	returnData['metadata'].outcome = win
	returnData['metadata'].duration = duration
	returnData['metadata'].queue = queueType
	returnData['info'].champion = participantChamp
	returnData['info'].role = participantRole
	returnData['info'].enemyChamp = enemyChampion


	return returnData
}


/* function that calls the Riot API and gets the specific user data asked for by the end user */
async function callData(name, region) {
	if (name.length< 3) {
		return {'error': 'invalid name'}
	}
	else {
		let response = await fetch('https://'+region+'1.api.riotgames.com/lol/summoner/v4/summoners/by-name/'+name+'?api_key='+apiKey)
		if(response.status == 200) {
			let data = await response.json()
			return data
		}
		else {
			return {'error': 'invalid name'}
		}
	}
}
