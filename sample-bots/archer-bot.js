function Bot() {
    this.run = function (control) {
        // Find the nearest enemy
        var nearestEnemy = control.getNearestEnemy();

        if (nearestEnemy == null) {
            control.stand();
            return; // Relax, we won
        }

        // Turn face toward enemy
        var predictPosition = control.predictPosition(nearestEnemy, 40);

        if (Distance.between(control.position, predictPosition) > 200) {
            // Check the distance, if too far then go forward
            control.turnToward(nearestEnemy.position);
            control.goForward();
        } else {
            // Check the distance, if close enough then fight
            control.turnToward(predictPosition);
            control.fight();
        }
    };
}