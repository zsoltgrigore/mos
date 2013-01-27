if (!("WebSocket" in window)) {
	document.getElementById("login_form").innerHTML = "";
	alert("Websocket not supported :(");
}