var fs = require('fs');
var request = require('request');
var requestify = require('requestify');

var count = 0;
var dir = './backup';
var id = 0;
var ir = new Object();
var listsize = 0;
var pref;

loadPref();

function loadPref(){
	pref = JSON.parse(fs.readFileSync('./settings.pref','utf8'));
	if(pref.restore_address.slice(-1) != '/'){
		pref.restore_address += '/';
	}
	readBackup();
}

function readBackup(){
	fs.readdir(dir,function(err, list){
		listsize = list.length;
		loadDoc();
	});
}

function loadDoc(){
	if(count!=listsize){
		while(true){
			if(fs.existsSync(dir+'/seq-'+id+'.json')){
				break;
			}
			id+=1;
		}
		var f = JSON.parse(fs.readFileSync(dir+'/seq-'+id+'.json','utf8'));
		uploadDoc(f['doc'])
		count+=1;
	}
}

function uploadDoc(parsed){
	var o = parsed;
	var oid = o['_id'];
	var orev = o['_rev'];
	var deleted = false;
	delete o['_id'];
	delete o['_rev'];
	if(o['_deleted']){
		deleted = true;
		delete o['_deleted'];
	}
	if(deleted){
		console.log('delete');
		request({
			method: 'DELETE',
			uri: 'http://'+pref.restore_address+oid+'\?rev\='+ir[oid],
			'auth': {
				'username': pref.id,
				'password':pref.password
			}
		},
  		function (error, response, body) {
  			if (!error){
  				console.log(response.body);
  				id+=1;
   				loadDoc();
   			}else{
   				console.log(error);
  				id+=1;
   				loadDoc();
   			}
  		});
	}else if(ir[oid]){
		console.log('update');
		o['_rev'] = ir[oid];
		request({
			method: 'PUT',
			uri: 'http://'+pref.restore_address+oid,
			'auth': {
				'username': pref.id,
				'password':pref.password
			},
    		body: JSON.stringify(o)
    	},
  		function (error, response, body) {
  			if (!error){
  				console.log(response.body);
  				ir[oid] = orev;
  				id+=1;
   				loadDoc();
   			}else{
   				console.log(error);
   				ir[oid] = orev;
  				id+=1;
   				loadDoc();
   			}
  		});
	}
	else{
		console.log('create');
		request({
			method: 'PUT',
			uri: 'http://'+pref.restore_address+oid,
			'auth': {
				'username': pref.id,
				'password':pref.password
			},
			body: JSON.stringify(o)
		},
		function (error, response, body) {
			if (!error){
				console.log(response.body);
				ir[oid] = orev;
				id+=1;
				loadDoc();
			}else{
				console.log(error);
				ir[oid] = orev;
				id+=1;
				loadDoc();
			}
		});
	}
}