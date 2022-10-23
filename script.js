let nodeServer = 'http://localhost:3000/'

searchListener = document.getElementById("search")
serverListener = document.getElementById("serverSelect")

/* search function that allows searching of a username. This uses an API created in NodeJS to make calls to other APIs and do data parsing.
The function here uses several parameters, which are grabbed from the search bar and drop down menu on the website in order to make unique calls
depending on the users needs */

function searchFunction() {
	let nameInput = searchListener.value
	let regionInput = serverListener.value

	var para = new URLSearchParams()
	para.append("summoner",searchListener.value)
	para.append("server",serverListener.value)
	document.location.href = "./userpage.htm?"+para.toString()

}

/* building the summoner page of the selected summoner onload of the new page */
async function summonerBuild() {
	var params = new URLSearchParams(window.location.search)
	var summonerName = params.get("summoner")
	var serverSelect = params.get("server")

	let response = await fetch(nodeServer+'getSummoner?summonerName='+summonerName+'&region='+serverSelect)
	let data = await response.json()
	console.log(data)

	document.getElementById("summonerIcon").src = 'http://ddragon.leagueoflegends.com/cdn/12.19.1/img/profileicon/'+data.profileIconId+'.png'
	document.getElementById("testlbl").innerText = data.name
	matchHistoryBuild(data.puuid, serverSelect)
}

async function matchHistoryBuild(puuid, region) {

	let response = await fetch(nodeServer+'getMatches?puuid='+puuid+'&region='+region)
	let data = await response.json()
	console.log(data)
	document.getElementById('game1p').src = 'http://ddragon.leagueoflegends.com/cdn/12.20.1/img/champion/'+data.info['champion']+'.png'
	document.getElementById('game1a').src = 'http://ddragon.leagueoflegends.com/cdn/12.20.1/img/champion/'+data.info['enemyChamp']+'.png'
	document.getElementById('outcome').innerText = data.metadata['outcome']
	if(data.metadata['outcome'] == 'LOSS') {
		document.getElementById('game1').classList.add('gameLoss')
	}
	if(data.metadata['outcome'] == 'WIN') {
		document.getElementById('game1').classList.add('gameWin')
	}
	document.getElementById('duration').innerText = data.metadata['duration']
	document.getElementById('queue').innerText = data.metadata['queue']
}