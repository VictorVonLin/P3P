var conf = {iceServers: [{urls: ["stun:relay.metered.ca:80","stun:stun1.l.google.com:19302", "stun:stun2.l.google.com:19305" ]}]};
var pc = new RTCPeerConnection(conf);
var	context, _chatChannel; 


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
		console.log('iceGatheringState complete',pc.localDescription.sdp);
		localOffer.value = JSON.stringify(pc.localDescription);
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

remoteOfferGot.onclick = function(){
	var _remoteOffer = new RTCSessionDescription(JSON.parse(remoteOffer.value));
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


localOfferSet.onclick = function(){
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
				}
			},2000);
			console.log('setLocalDescription ok');
		}).catch(errHandler);
		// For chat
	}).catch(errHandler);
}



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

//=======================================================================================================================================================
