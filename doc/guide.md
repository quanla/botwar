## Tutorial

### How to write a robot:

A robot is the brain of your soldier, it control every movement and attack

Here is a sample code:

	function Bot(unitType) {
	
	    this.run = function (control) {
			control.goForward();
	    };
	}

Explanation:
 
 - `Bot`: The constructor function of your robot. It has to take the name `Bot` or Botwar can not recognize and initialize your robot. With every soldier, Botwar will run this function once to construct a new robot and attach that robot to the soldier.
 - `unitType`: Botwar will pass the unit type of the soldier to this parameter, so you can choose an appropriate strategy for your robot. `unitType` can take these values: "footman", "archer" and "knight".
 - `this.run`: Every robot has to define a `run` function. Botwar will invoke this function once at the beginning of every round, to let your robot what to do in that round. **Note that** most actions will block your robot from being run for some rounds, only stand and small change in direction will not.
 - A round: Botwar will run 100 rounds in every second.

### Robot control

Here are functions and attributes of the control object:

 - `control.round`: Give the current round of the game.
 - `control.type`: Give the unit type. Can be either: "footman", "knight" or "archer".
 - `control.hitpoint`: Give the current hitpoint of the unit (soldier).
 - `control.position`: Give the current position of this unit (soldier).
 - `control.direction`: Get and set the current direction of this unit (soldier).
 - `control.state`: Get the current state of this unit, useful to check if this unit is already dead (dead unit's bot is run 1 last time, but all actions except messaging are not applied)
 - `control.battlefield`: Get the battlefield info: control.battlefield.width and control.battlefield.height
 - `control.turnToward(position)`: Command the unit to turn its head toward that position.
 - `control.turnAway(position)`: Command the unit to turn its head the opposite way to that position.
 - `control.goForward()`: Command the unit to go forward in the current direction.
 - `control.fight()`: Command the unit to initiate a fight action.
 - `control.stand()`: Command the unit to stand, this will cancel the `goForward` action.
 - `control.sendMessage(message, to)`: Send any message to an ally. If to is not defined, the message will be sent to all friendly units.
 - `control.sendToAll(message)`: Send any message to all friendly units.
 - `control.getEnemies()`: Return the list of all enemies in the battle field.
 - `control.getNearestEnemy()`: Return nearest enemy to the unit's current position.
 - `control.getFriends()`: Return the list of all friends in the battle field.
 - `control.predictPosition(unit, roundNum)`: Predict the position of unit after `roundNum` number of rounds. Prediction is based on unit's current position and current velocity.
 - `control.messages`: Get all messages that friendly units sent to this unit (soldier).
 - `control.self`: Give the unit reference - this reference's value will be updated each round, base on your unit's actual state. This is convenience to be used to send as message to allies.
 - `control.setFact(name, value)`: Set a fact value for all units of same side. Once set, the value is accessible by all other units through control.getFact(name) method.
 - `control.getFact(name)`: Get the fact value for all units of same side.

### Robot blocking

Most actions will block your robot from being run for some rounds, only stand and small change in direction will not. This will help prevent the soldier from being "flickered" caused by changing moves so rapidly.

 - **Fight**: After calling to `control.fight`, robot will be blocked until soldier has finished the fight move, it usually takes 40 rounds which is 0.4 second. ("footman", "archer", "knight" and "grunt") 
 - **Walk**: After calling to `control.goForward`, robot will be blocked for 10 rounds, note that after 10 rounds the soldier will keep walking in the same direction if no other order is issued
 - **Direction**: After changing direction, if the change is larger than PI/30 then robot will be blocked for 10 rounds. This will help prevent the soldier from spinning like crazy until his brain is flushed out of his head.
 - **Die**: A dead soldier will have a dead robot, and a dead robot can't run.

## Advanced Guide

### Keeping and reusing references
 - It's ok to keep the reference to an enemy unit or friendly unit in memory and reuse it for the next rounds. These reference will not be invalidated, instead, new unit state values will be updated into the very same object that you are referencing to. This will help a lot in simplifying coding logic, and robot communication.
 - All these unit references are shared among robots of same side, so if you try to update values (like position, or state of an unit), then other robots of your side will be affected, but the real unit or robots of other sides will not be. In short, if you want to screw things up, you are only hurting yourself.

 