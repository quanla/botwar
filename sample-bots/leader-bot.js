function Bot() {
    var myLeader = null;
    var iamLeader = false;

    var iGoHere;

    this.run = function (control) {
        for (var i = 0; control.messages != null && i < control.messages.length; i++) {
            var message = control.messages[i];
            if (message.content == "bow") {
                if (control.self != message.to) {
                    myLeader = message.to;
                } else {
                    myLeader = null;
                    iamLeader = true;
                }
            }
        }

        if (myLeader == null && !iamLeader) {
            // Claim to be leader, send message to all friends
            control.sendToAll({content: "bow", to: control.self});
            console.log(control.type + ": I claim myself to be leader");
            iamLeader = true;
        }

        if (iamLeader) {
            // Leader will go wherever he want
            if (iGoHere == null) {
                iGoHere = {x: Math.random() * control.battlefield.width, y: Math.random() * control.battlefield.height};
            }

            if (Distance.between(iGoHere, control.position) < 50) {
                iGoHere = {x: Math.random() * control.battlefield.width, y: Math.random() * control.battlefield.height};
            } else {
                control.setDirection(iGoHere);
                control.goForward();
            }
        } else {
            // I'm not leader, let's follow the great leader
            control.setDirection(myLeader.position);

            if (Distance.between(myLeader.position, control.position) < 100) {
                control.stand(); // Don't come too near, I am a humble servant
            } else {
                control.goForward();
            }
        }

        // New guys are spawned, let's tell them who is the leader
        for (var i = 0; iamLeader && control.newFriends != null && i < control.newFriends.length; i++) {
            var newFriend = control.newFriends[i];
            console.log(control.type + ": Tell new friend I am leader");
            newFriend.sendMessage({content: "bow", to: control.self});
        }

        // If I'm dying, somebody else should take the lead
        if (iamLeader && (control.state != null && control.state.name == "die")) {
            var nextLeader = control.getNearestFriend();
            if (nextLeader != null) {
                // All bow to the next leader
                control.sendToAll({content: "bow", to: nextLeader});
                console.log(control.type + ": bow to next leader: " + nextLeader.type);
                // ... I can rest in peace now ...
            } else {
                console.log(control.type + ": No next leader...");

            }
        }
    };
}