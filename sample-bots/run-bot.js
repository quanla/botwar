function Bot() {
    this.run = function (control) {
        var enemies = control.getEnemies();
        if (Cols.isEmpty(enemies)) {
            control.stand();  // Relax, no one around
            return;
        }

        // Find the nearest enemy
        var minDisE = Cols.findMin(enemies, function(enemy) {
            return Distance.between(control.position, enemy.position);
        });

        // Check the distance
        if (Distance.between(control.position, minDisE.position) < 50) {
            // Too near, should run

            // Turn face away from enemy
            control.direction = Vectors.toVector( Vectors.subtractPos(control.position, minDisE.position)).direction;

            // Randomize the direction a little bit
            control.direction += (Math.PI/4 * Math.random() - Math.PI/8);

            // Start running
            control.goForward();
        } else {
            // Still quite far, stand and see
            control.setDirection(minDisE.position);
            control.stand();
        }
    };
}