let enumGameState = cc.Enum({
        Init: 1,
        Start: 2,
        GameOver: 3
});

cc.Class({
    extends: cc.Component,

    properties: {
        //starting game state
        gameState: {
            default: enumGameState.Init,
            type: enumGameState
        },

        //reference to the main camera
        playerCamera: {
            default: null,
            type: cc.Node
        },

        //background music
        gameMusic: {
            default: null,
            type: cc.AudioClip
        },

        //References to UI widget elements:
        startCDLabel: cc.Label,
        scoreLabel: cc.Label,
        endScreen: cc.Node,
        endScreenScore: cc.Label,

        //countdown to start the game
        startCD: 3,
        //amount of time the scripts waits before updating the score of the player
        widgetUpdateCD: 0.1,
        
    },

    onLoad () {
        //enable the physics engine
        cc.director.getPhysicsManager().enabled = true;
        //enable the usage of a fixed timestep (this is needed to assure that the character movement is fluid and framerate independant)
        cc.director.getPhysicsManager().enabledAccumulator = true;

        //initialize the game state to "init"
        this.gameState = enumGameState.Init;
        //initialize start countdown
        this.currentStartCD = this.startCD;
        //initialize the uodate cooldown of the widgets
        this.currentWidgetUpdateCD = this.widgetUpdateCD;
        //reference to the player controller script (to get the character state)
        this.charReference = cc.director.getScene().getChildByName("Character").getComponent("PlayerController");
        //initialize player score
        this.playerScore = 0;
        //can the game be paused? (the game should not be pausable in the game over screen)
        this.isPausable = true;

        //stops the Menu music and starts the main game music
        cc.audioEngine.stopAll();
        this.currentMusic = cc.audioEngine.playMusic(this.gameMusic, true);
    },
    
    update (dt) {
        //switch on the game states
        switch (this.gameState) {
            //game state "Init"
            case enumGameState.Init:
                if(this.updateStartCD(dt) <= 0) {
                    //if the start countdown is finished

                    //hides the countdown widget
                    this.startCDLabel.node.active = false;
                    //enables the in-game physics
                    cc.director.getPhysicsManager().enabled = true;
                    //starts the game
                    this.gameState = enumGameState.Start;
                    this.charReference.setCharState("Run");
                    //reset the countdown
                    this.currentStartCD = this.startCD;
                } else {
                    //character state remains idle until the game starts
                    this.charReference.setCharState("Idle");
                }
                break;
            
            //game state "Start"
            case enumGameState.Start:
                //updates the score widget
                if(this.currentWidgetUpdateCD <= 0) {
                    this.updateScoreLabel(this.charReference.node.x);
                    //reset widget update countdown
                    this.currentWidgetUpdateCD = this.widgetUpdateCD;
                }

                this.currentWidgetUpdateCD -= dt;
                break;

            //game state "GaneOver"
            case enumGameState.GameOver:
                //displays the game over screen
                this.displayEndScreen();
                break;
        }
    },

    setGameState: function(state) {
        //this function is used by other scripts to set the game state
        switch(state) {
            case "Init":
                this.gameState = enumGameState.Init;
                break;
            case "Start":
                this.gameState = enumGameState.Start;
                break;
            case "GameOver":
                this.gameState = enumGameState.GameOver;
        }
    },

    updateStartCD: function(DeltaTime) {
        //update the starting countdown
        if(this.startCDLabel) {
            this.startCDLabel.node.active = true;
            this.startCDLabel.string = parseInt(this.currentStartCD);
        }

        return this.currentStartCD -= DeltaTime;
    },

    updateScoreLabel: function(charPosition) {
        //updates the score widget

        //score is based on the characters x-position. It is divided by 10 to make the number smaller
        this.playerScore = Math.floor(charPosition / 10); 
        if(this.scoreLabel) {
            this.scoreLabel.string = "Score: " + this.playerScore + "m";
        }
    },

    displayEndScreen: function() {
        //stop all in-game effects (running sound)
        cc.audioEngine.stopAllEffects();
        //hide the score widget
        this.scoreLabel.node.active = false;
        //game is not pausable in the game over screen
        this.isPausable = false;
        //display the end score
        this.endScreenScore.string = this.playerScore + "m";
        //add the game over screen to the viewport
        this.endScreen.active = true;
    }
});
