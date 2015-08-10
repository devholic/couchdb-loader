var fs = require('fs');
var http = require('http');
var schedule = require('node-schedule');
var readline = require('readline');

// last_seq 변수 선언 : 중복 처리 위함
var last_seq = -1;
var pref;

loadPref();

function loadPref(){
	pref = JSON.parse(fs.readFileSync('./settings.pref','utf8'));
	if(pref.backup_address.slice(-1) != '/'){
		pref.backup_address += '/';
	}
	try{
		var appPref = fs.readFileSync('./app.pref','utf8');
		if(appPref){
			last_seq = data;
		}
	}catch(e){}
	initBackup();
}

function initBackup(){
	try{
		fs.mkdirSync('./backup');
	}catch(e){}
	var j = schedule.scheduleJob('30 * * * *', function(){
		uploadToGit();
	});
	load();
}

function uploadToGit(){
	// TODO
}

function load(){
	// GET Request를 서버로 보냄
	http.get('http://'+pref.id+':'+pref.password+'@'+pref.backup_address+'_changes?include_docs=true&feed=continuous', function(response) {
 		response.on('data', function (data) { // 데이터가 있는 경우
 			try{
				var json = JSON.parse(data);

				/*
					서버 Response는 크게 2가지로 나뉨
					1. 데이터(changelog)가 담겨있는 경우
					2. last_seq만 오는 경우 : connection이 끊어지는 경우인듯(?)
				*/

				if(!json.hasOwnProperty('last_seq')){ // last_seq이 없는 경우 (1번인 경우)
					if(json.seq>last_seq){ // 받아온 item의 seq이 가장 마지막에 업데이트했던 seq (last_seq)보다 높은 경우
						last_seq = json.seq;
						fs.writeFile('./app.pref', json.seq, function(err) { // 설정 파일 업데이트 (last_seq 업데이트)
  							if(err){ // 에러가 난 경우
 								console.log('Error : ' + err); // 에러 출력
  							}
						});
						fs.writeFile('./backup/seq-'+json.seq+'.json', JSON.stringify(json),function(err){ // 백업 파일 생성 (json)

							/*
								파일 이름은 다음 규칙에 의해 생성됩니다.
								seq-[response의 seq 값].json
							*/

							if(err){ // 에러가 난 경우
								console.log('Error : ' + err); // 에러 출력
								process.exit(0);
							}
						});
					}
				}
			}catch(e){
				// JSON 파싱에 실패한 경우
			}
		});
	}).on('error', function(e) { // 에러가 발생한 경우
  		console.log("Error : " + e.message); // 에러 메시지 출력
  		console.log("Reloading...");
  		load();
	}).on('close', function(e) { // Connection이 끊긴 경우
  		load();
	});
}