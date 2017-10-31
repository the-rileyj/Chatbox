$(document).ready(function () {
    function now() {
        var t = new Date();
        return t.getMonth() + "/" + t.getDate() + "-" + t.getHours() + ":" + t.getMinutes() + ":" + t.getSeconds();
    }

    function makeMessage(str){
        return "<" + now() + ">" + str + "\n";
    }

    function sendMessage() {
        if (text.val().localeCompare("")) {
            if (user.val().localeCompare("")) {
                if (user.val().length < 15) {
                    var obj = JSON.stringify({
                        "msg": "<" + id + "><" + user.val() + ">: " + text.val(),
                        "chan": channel.val(),
                        "name": user.val()
                    });
                    ws.send(obj);
                    text.val("");
                } else {
                    chat.innerText = makeMessage("<ERROR>: Username is too long!") + chat.innerText;;
                }
            } else {
                chat.innerText = makeMessage("<ERROR>: Need a username to send a message!") + chat.innerText;
            }
        }
    }

    //Helper function for adding cookies
    function setCookie(cname, cvalue, exdays) {
        var d = new Date();
        d.setTime(d.getTime() + (exdays*24*60*60*1000));
        var expires = "expires="+ d.toUTCString();
        document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
    }

    //Helper function to get the value of a cookie
    function getCookie(cname) {
        var name = cname + "=";
        var decodedCookie = decodeURIComponent(document.cookie);
        var ca = decodedCookie.split(';');
        for(var i = 0; i <ca.length; i++) {
            var c = ca[i];
            while (c.charAt(0) == ' ') {
                c = c.substring(1);
            }
            if (c.indexOf(name) == 0) {
                return c.substring(name.length, c.length);
            }
        }
        return "";
    }

    //Check that the username in the username text box is the same as the username cookie
    function assureCookie() {
        if (getCookie("username").localeCompare(user.val())) {
            user.val(getCookie("username"));
        }
    }

    //Declaration of vars to hold various DOM objects for later use
    var chat = document.getElementById("chat"), chatter = $("#chat"), sound = document.getElementById("sound"),
    user = $("#user"), text = $("#text"), channel = $("#channel"), send = $("#send");

    //Will play notification sound if it's enabled
    function playSound() {
        if(sound)
            sound.play();
    }

    chat.innerText += "\n\nThis is the following structure of messages:\n\"<TIME><CHANNEL><ID><USERNAME> MESSAGE\"\n" +
        "TIME - Time the message was sent\n" +
        "CHANNEL - Displays if not empty, channel the message was recieved from\n" +
        "ID - Unique ID of the sender\n" +
        "USERNAME - Username of the user\n" +
        "MESSAGE - Message of the user\n" +
        "Alternatively, for error's:\n\"<TIME><ERROR> MESSAGE\"\n" +
        "Where MESSAGE display's the error message";
    if (!getCookie("id").localeCompare("")) {
        var id = String(Math.floor(Math.random() * 10)) + String(Math.floor(Math.random() * 10)) + String(Math.floor(Math.random() * 10)) + String(Math.floor(Math.random() * 10)) + String(Math.floor(Math.random() * 10)) + String(Math.floor(Math.random() * 10)) + String(Math.floor(Math.random() * 10));
        setCookie("id", id, 7);
    } else {
        id = getCookie("id");
    }
    function getWS() {
        var socket = new WebSocket("ws://" + window.location.host + "/wschat");
        socket.onmessage = function (msg) {
            obj = JSON.parse(msg.data);
            if (!channel.val().localeCompare(obj.chan)){
                chat.innerText = makeMessage((obj.chan.localeCompare("") ? ("<" + obj.chan + ">") : "") + obj.msg) + chat.innerText;
                if (user.val().localeCompare(obj.name)) {
                    playSound();
                }
                if(parseInt(chatter.css("padding-top")) > 15)
                    chatter.css("padding-top", (parseInt(chatter.css("padding-top")) - 15) + "px");
            }
        };
        return socket;
    }
    if (getCookie("username").localeCompare(""))
        user.val(getCookie("username"));
    var ws = getWS();
    text.keydown(function (e) {
        if (e.keyCode === 13){
            sendMessage();
        }
        assureCookie();
    });
    send.click(function () {
        sendMessage();
    });
    channel.keydown(function (e) {
        if (e.keyCode === 13){
            sendMessage();
        }
        assureCookie();
    });
    user.keydown(function (e) {
        if (e.keyCode === 13){
            sendMessage();
        }
    });
    user.click(function () {
        assureCookie()
    });
    user.keyup(function (e) {
        setCookie("username", user.val(), 7)
    });
});