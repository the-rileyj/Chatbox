$(document).ready(function () {
    //Helper function to return the time right now in a string format
    function now() {
        var t = new Date();
        return t.getMonth() + "/" + t.getDate() + "-" + t.getHours() + ":" + t.getMinutes() + ":" + t.getSeconds();
    }

    //Helper function for formating a message with the current time
    function makeMessage(str) {
        return "<" + now() + ">" + str + "\n";
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

    //Declaration of vars to hold various DOM objects for later use
    var chat = document.getElementById("chat"), chatter = $("#chat"), sound = document.getElementById("sound"),
    user = $("#user"), text = $("#text"), channel = $("#channel"), send = $("#send");

    //Will play notification sound if it's enabled
    function playSound() {
        if (sound)
            sound.play();
    }

    //Adds preliminary text to the inner html of the 'pre'
    chat.innerText += "This is the following structure of messages:\n\"<TIME><CHANNEL><ID><USERNAME> MESSAGE\"\n" +
        "TIME - Time the message was sent\n" +
        "CHANNEL - Displays if not empty, channel the message was recieved from\n" +
        "ID - Unique ID of the sender\n" +
        "USERNAME - Username of the user\n" +
        "MESSAGE - Message of the user\n" +
        "Alternatively, for error's:\n\"<TIME><ERROR> MESSAGE\"\n" +
        "Where MESSAGE display's the error message\n\n";

    //Makes ID and sets the id cookie to that value if one doesn't already exist,
    //otherwise the cookie is derived from the already existing id cookie
    if (!getCookie("id").localeCompare("")) {
        var id = String(Math.floor(Math.random() * 10)) + String(Math.floor(Math.random() * 10)) + String(Math.floor(Math.random() * 10)) + String(Math.floor(Math.random() * 10)) + String(Math.floor(Math.random() * 10)) + String(Math.floor(Math.random() * 10)) + String(Math.floor(Math.random() * 10));
        setCookie("id", id, 7);
    } else {
        id = getCookie("id");
    }

    //Websocket creation function
    function getWS() {
        //Creates websocket connection on ws://{CURRENT URL}/wschat
        var socket = new WebSocket("ws://" + window.location.host + "/wschat");
        socket.onmessage = function (msg) {
            //Parses recieved message into JSON object,
            //JSON is in format {"msg":"MESSAGE TEXT", "chan":"CHANNEL NAME", "name":"USERNAME"}
            obj = JSON.parse(msg.data);
            if (!channel.val().localeCompare(obj.chan)) { //Checks to see whether or not the recieved message is for the current channel
                chat.innerText += makeMessage((obj.chan.localeCompare("") ? ("<" + obj.chan + ">") : "") + obj.msg);
                if (!user.val().localeCompare(obj.name)) { //Checks that the username isn't the current one
                    playSound(); //Plays sound if it's enabled
                }
                if (parseInt(chatter.css("padding-top")) > 15) //Removes the padding until it's less than 15px
                    chatter.css("padding-top", (parseInt(chatter.css("padding-top")) - 15) + "px");
            }
        };
        return socket;
    }

    //Checks whether or not a username exists on the system already and sets it if it does
    if (getCookie("username").localeCompare(""))
        user.val(getCookie("username"));

    //var ws = getWS(); //Initialization of the websocket object

    //Sends message on enter key press in the message textbox
    text.keydown(function (e) {
        if (e.keyCode === 13) {
            sendMessage();
        }
    });

    //Sends message on send button click
    send.click(function () {
        sendMessage();
    });

    //Sends message on enter key press in the channel textbox
    channel.keydown(function (e) {
        if (e.keyCode === 13) {
            sendMessage();
        }
    });

    //Sends message on enter key press in the message textbox
    user.keydown(function (e) {
        if (e.keyCode === 13) {
            sendMessage();
        }
    });

    //Changes username cookie on keyup
    user.keyup(function (e) {
        setCookie("username", user.val(), 7)
    });
    
    //Function for sending a message
    function sendMessage() {
        if (!getCookie("username").localeCompare(user.val())) { //Assures that the username is the same as the one stored in the cookie
            user.val(getCookie("username"));
        }
        if (text.val()) { //Checking that the message textbox isn't blank
            if (user.val()) { //Checking that the username textbox isn't empty
                if (user.val().length < 15) { //Assuring username length isn't too long
                    var obj = JSON.stringify({
                        "msg": "<" + id + "><" + user.val() + ">: " + text.val(),
                        "chan": channel.val(),
                        "name": user.val()
                    });
                    ws.send(obj); //Sends JSON in format {"msg":"MESSAGE TEXT", "chan":"CHANNEL NAME", "name":"USERNAME"}
                    text.val(""); //Clears the message text box
                } else {
                    chat.innerText += makeMessage("<ERROR>: Username is too long!");
                }
            } else {
                chat.innerText += makeMessage("<ERROR>: Need a username to send a message!");
            }
        }
    }
});