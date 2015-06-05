function Bot() {
    this.run = function (control) {
        var enemies = control.getEnemies();
        if (Cols.isEmpty(enemies)) {
            control.stand();  // Relax, no one around
            return;
        }

        // Find the nearest enemy
        var nearestEnemy = Cols.findMin(enemies, function(enemy) {
            return Distance.between(control.position, enemy.position);
        });

        // Check the distance
        if (Distance.between(control.position, nearestEnemy.position) < 50) {
            // Too near, should run

            // Turn face away from enemy
            control.direction = Vectors.toVector( Vectors.subtractPos(control.position, nearestEnemy.position)).direction;

            // Randomize the direction a little bit
            control.direction += (Math.PI/4 * Math.random() - Math.PI/8);

            // Start running
            control.goForward();
        } else {
            // Still quite far, stand and see
            control.setDirection(nearestEnemy.position);
            control.stand();
        }
    };
}