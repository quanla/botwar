function Bot() {
    this.run = function (control) {
        var enemies = control.getEnemies();
        if (Cols.isEmpty(enemies)) {
            control.stand();
            return; // Relax, we won
        }

        // Find the nearest enemy
        var nearestEnemy = Cols.findMin(enemies, function(enemy) {
            return Distance.between(control.position, enemy.position);
        });


        // Turn face toward enemy
        control.setDirection(nearestEnemy.position);

        if (Distance.between(control.position, nearestEnemy.position) > 270) {
            // Check the distance, if too far then go forward
            control.stand();
        } else {
            // Check the distance, if close enough then fight
            control.fight();
        }
    };
}