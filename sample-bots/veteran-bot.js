function Bot() {
    this.run = function (control) {
        var enemies = control.getEnemies();
        if (Cols.isEmpty(enemies)) {
            return; // Relax, no one around
        }

        // Find the nearest enemy
        var nearestEnemy = Cols.findMin(enemies, function(enemy) {
            return Distance.between(control.position, enemy.position);
        });

        // Turn face toward enemy
        control.setDirection(nearestEnemy.position);

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