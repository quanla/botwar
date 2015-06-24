function Bot(unitType) {
    var rendervous = unitType == "knight" ? {x: 100, y: 50}: {x: 200, y: 400};

    function checkReady(friends) {

        for (var i = 0; i < friends.length; i++) {
            var friend = friends[i];
            if (!friend.ready) {
                return false;
            }
        }
        return true;
    }

    this.run = function (control) {
        for (var i = 0; control.messages && i < control.messages.length; i++) {
            var message = control.messages[i];
            if (message == "attack") {
                rendervous = null;
                control.self.ready = false;
            }
        }

        if (rendervous != null) {
            control.turnToward(rendervous);
            if (Distance.between(control.position, rendervous) < 80) {
                control.self.ready = true;

                if (Distance.between(control.position, rendervous) < 50) {
                    control.stand();
                }

                if (checkReady(control.getFriends())) {
                    control.sendToAll("attack");
                    rendervous = null;
                    control.self.ready = false;
                }
            } else {
                control.goForward();
            }
        } else {

            var nearestEnemy = control.getNearestEnemy();
            if (nearestEnemy == null) {
                control.stand();
                return; // Relax, we won
            }

            // Turn face toward enemy
            control.turnToward(nearestEnemy.position);

            if (Distance.between(control.position, nearestEnemy.position) > 40) {
                // Check the distance, if too far then go forward
                control.goForward();
            } else {
                // Check the distance, if close enough then fight
                control.fight();
            }
        }
    };
}