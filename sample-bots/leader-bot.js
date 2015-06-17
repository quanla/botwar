function Bot() {

    var iGoHere;

    this.run = function (control) {

        var leader = control.getFact("leader");

        if (leader == null) {
            // Claim to be leader
            control.setFact("leader", control.self);
            leader = control.self;
        }

        if (leader == control.self) {
            // I am leader, I will go wherever he want
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
            control.setDirection(leader.position);

            if (Distance.between(leader.position, control.position) < 100) {
                control.stand(); // Don't come too near, I am a humble servant
            } else {
                control.goForward();
            }
        }

        // If I'm dying, somebody else should be the leader
        if (leader == control.self && control.state.name == "die") {
            var nextLeader = control.getNearestFriend();

            // All bow to the next leader
            control.setFact("leader", nextLeader);
            // ... I can rest in peace now ...
        }
    };
}