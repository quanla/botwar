function Bot(unitType) {
    var startFightFrom = unitType == "archer" ? 200 : 40;

    this.run = function (control) {
        // Find the nearest enemy
        var nearestEnemy = control.getNearestEnemy();

        if (nearestEnemy == null) {
            control.stand();
            return; // Relax, we won
        }

        // Turn face toward enemy
        control.turnToward(nearestEnemy.position);

        if (Distance.between(control.position, nearestEnemy.position) > startFightFrom) {
            // Check the distance, if too far then go forward
            control.goForward();
        } else {
            // Check the distance, if close enough then fight
            control.fight();
        }
    };
}