function Bot() {
    this.run = function (control) {
        // Find the nearest enemy
        var nearestEnemy = control.getNearestEnemy();

        if (nearestEnemy == null) {
            control.stand();
            return; // Relax, no one is around
        }

        // Check the distance
        if (Distance.between(control.position, nearestEnemy.position) < 50) {
            // Too near, should run

            // Turn face away from enemy
            control.turnAway(nearestEnemy.position);

            // Randomize the direction a little bit
            control.direction += (Math.PI/4 * Math.random() - Math.PI/8);

            // Start running
            control.goForward();
        } else {
            // Still quite far, stand and see
            control.turnToward(nearestEnemy.position);
            control.stand();
        }
    };
}