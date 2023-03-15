var url = "https://script.google.com/macros/s/AKfycbz2guCH2a52rLP2iTYDeUMwZXiwe09rasTzufLNH6Ijw6JkHMtPxFlSBODptB-EGlWn/exec?callback"
var conf = {iceServers: [{urls: ["stun:stun1.l.google.com:19302", "stun:stun2.l.google.com:19305" ]}]};
var pc = new RTCPeerConnection(conf);
var	context, _chatChannel; 
var protocol = true; //true for offer, false for answer

function errHandler(err){
	console.log(err);
}



pc.ondatachannel = function(e){
	if(e.channel.label == "chatChannel"){
		console.log('chatChannel Received -',e);
		_chatChannel = e.channel;
		chatChannel(e.channel);
	}
};

pc.onicecandidate = function(e){
	var cand = e.candidate;
	if(!cand){
		console.log('iceGatheringState complete ONICE*',pc.localDescription.sdp);
		localOffer.value = JSON.stringify(pc.localDescription);
		if(protocol){
			sendOffer(pc.localDescription)
		}else{
			sendAnswer(pc.localDescription)
		}
		
	}else{
		console.log('iceGatheringState gathering: ',cand.candidate);
	}
}

pc.oniceconnectionstatechange = function(){
	console.log('iceconnectionstatechange: ', pc.iceConnectionState);
}



pc.onconnection = function(e){
	console.log('onconnection ',e);
}

// remoteOfferGot.onclick = function(){
// 	var _remoteOffer = new RTCSessionDescription(JSON.parse(remoteOffer.value));
// 	console.log('remoteOffer \n',_remoteOffer);
// 	pc.setRemoteDescription(_remoteOffer).then(function() {
// 			console.log('setRemoteDescription ok');
// 			if(_remoteOffer.type == "offer"){
// 		        pc.createAnswer().then(function(description){
// 		        	console.log('createAnswer 200 ok \n',description);
// 				    pc.setLocalDescription(description).then(function() {
// 				    }).catch(errHandler);	            	
// 		        }).catch(errHandler);				
// 			}
// 	}).catch(errHandler);	
// }


// localOfferSet.onclick = function(){
// 		_chatChannel = pc.createDataChannel('chatChannel');
// 		chatChannel(_chatChannel);
	
// 	pc.createOffer().then(des=>{
// 		console.log('createOffer ok ');
// 		pc.setLocalDescription(des).then( ()=>{
// 			setTimeout(function(){
// 				if(pc.iceGatheringState == "complete"){
// 					return;
// 				}else{
// 					console.log('after GetherTimeout');
// 					localOffer.value = JSON.stringify(pc.localDescription);
// 				}
// 			},2000);
// 			console.log('setLocalDescription ok');
// 		}).catch(errHandler);
// 		// For chat
// 	}).catch(errHandler);
// }



function chatChannel(e){
	_chatChannel.onopen = function(e){
		console.log('chat channel is open',e);
	}
	_chatChannel.onmessage = function(e){
		chat.innerHTML = chat.innerHTML + "<pre>"+ e.data + "</pre>"
	}
	_chatChannel.onclose = function(){
		console.log('chat channel closed');
	}
}


function sendMsg(){
	var text = sendTxt.value;
	chat.innerHTML = chat.innerHTML + "<pre class=sent>" + text + "</pre>";
	_chatChannel.send(text);
	sendTxt.value="";
	return false;
}

// document.getElementById('sheets').src = "https://docs.google.com/spreadsheets/d/1T6B7ZnU1WhdX4po1tb_auyb3-B1CJ1bNd6byHPsZneE/edit?usp=sharing";

//=======================================================================================================================================================

function check(){
	var xhr = new XMLHttpRequest();
    xhr.open('GET',  url + '?callback&action=check');//
    xhr.onreadystatechange = function(e) {
      if (xhr.readyState === XMLHttpRequest.DONE &&
          xhr.status === 200) {
        var result = JSON.parse(e.target.response);
    	console.log(result)
    	if(result.data != 'None'){
    		protocol = false;
    		answer(result.data);
    	}else{
    		protocol = true;
    		offer();
    		detect();
    	}
      }
    }
    xhr.send();
}

function sendOffer(o){
	var xhr = new XMLHttpRequest();
    xhr.open('GET',  url + '?callback&action=offer&offer=' + encodeURIComponent(JSON.stringify(o)));
    xhr.onreadystatechange = function(e) {
      if (xhr.readyState === XMLHttpRequest.DONE &&
          xhr.status === 200) {
        var result = JSON.parse(e.target.response);
    	console.log(result)
      }
    }
    xhr.send();
}


function sendAnswer(a){
	var xhr = new XMLHttpRequest();
    xhr.open('GET',  url + '?callback&action=answer&answer=' + encodeURIComponent(JSON.stringify(a)));
    xhr.onreadystatechange = function(e) {
      if (xhr.readyState === XMLHttpRequest.DONE &&
          xhr.status === 200) {
        var result = JSON.parse(e.target.response);
    	console.log("SENDING ANSWER")
      }
    }
    xhr.send();
}

function detect(){
	var xhr = new XMLHttpRequest();
    xhr.open('GET',  url + '?callback&action=detect');
    xhr.onreadystatechange = function(e) {
      if (xhr.readyState === XMLHttpRequest.DONE &&
          xhr.status === 200) {
        var result = JSON.parse(e.target.response);

    	if (result.data == ''){
    		console.log("Extending Session...")
    		detect()
    	}else{ //ELSE REMOTE RECEIVED
    		console.log("COMPLETING HANDSHAKE!")
    		answer(result.data);
    	}

      }
    }
    xhr.send();
}

function offer(){
	_chatChannel = pc.createDataChannel('chatChannel');
	chatChannel(_chatChannel);
	
	pc.createOffer().then(des=>{
		console.log('createOffer ok ');
		pc.setLocalDescription(des).then( ()=>{
			setTimeout(function(){
				if(pc.iceGatheringState == "complete"){
					return;
				}else{
					console.log('after GetherTimeout');
					localOffer.value = JSON.stringify(pc.localDescription);
					sendOffer(pc.localDescription);

				}
			},2000);
			console.log('setLocalDescription ok');
		}).catch(errHandler);
		// For chat
	}).catch(errHandler);
}


function answer(a){ //remotes will always grabbed from GAS
	var _remoteOffer = new RTCSessionDescription(JSON.parse(a));
	console.log('remoteOffer \n',_remoteOffer);
	pc.setRemoteDescription(_remoteOffer).then(function() {
			console.log('setRemoteDescription ok');
			if(_remoteOffer.type == "offer"){
		        pc.createAnswer().then(function(description){
		        	console.log('createAnswer 200 ok \n',description);
				    pc.setLocalDescription(description).then(function() {
				    }).catch(errHandler);	            	
		        }).catch(errHandler);				
			}
	}).catch(errHandler);	
}

check()//RUN ON START
