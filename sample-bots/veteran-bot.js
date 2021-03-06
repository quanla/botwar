function Bot() {
    this.run = function (control) {
        // Find the nearest enemy
        var nearestEnemy = control.getNearestEnemy();

        if (nearestEnemy == null) {
            control.stand();
            return; // Relax, no one is around
        }

        // Turn face toward enemy
        control.turnToward(nearestEnemy.position);

        // Check the distance
        if (Distance.between(control.position, nearestEnemy.position) < 70) {
            // Close enough, attack.
            // The distance here is longer than the distance configured in Fighter bot
            control.fight();
        } else {
            // Still too far, be cool.

            // * Note that when in stand mode, bot will be run more often, this allow
            // closely check of the enemy status
            control.stand();
        }
    };
}