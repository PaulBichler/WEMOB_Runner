let enumCharState = cc.Enum({
    Idle: 0,
    Run: 1,
    Dead: 2
});

cc.Class({
    extends: cc.Component,

    //properties will be set in the inspector (GUI)
    properties: {
        // scene camera
        camera: {
            default: null,
            type: cc.Node
        },

        // sound that plays while the player is running
        runningSound: {
            default: null,
            type: cc.AudioClip
        },

        // sound that plays when the player jumps
        jumpSound: {
            default: null,
            type: cc.AudioClip
        },

        // sound that plays when the player dies
        deathSound: {
            default: null,
            type: cc.AudioClip
        },

        // jump height
        jumpHeight: 0,

        // jump duration
        jumpDuration: 0,

        // maximal movement speed
        speed: 0,

        // acceleration
        accel: 0,

        // determines how often the game can receive input from the keyboard
        inputCheckTimer: 0,
    },

    onLoad: function () {
        // Animation Component Reference
        this.animator = this.getComponent(cc.Animation);
        // Stores a reference to a sound effect when it is played
        this.currentSoundEffect;

        // Rigid-Body Component Reference
        this.body = this.getComponent(cc.RigidBody);
        // GameMode Script Reference
        this.gameMode = cc.director.getScene().getChildByName("Canvas").getComponent("GameMode");
        // initialize character state to "idle"
        this.charState = enumCharState.Idle;

        // current speed of the player
        this.xVelocity = 0;
        // keeps track of whether the Character has reached the maximum speed
        this.reachedMaxSpeed = false;
        // is the player on the ground?
        this.isGrounded = false;
        // current value of the input check time
        this.currentInputCheckTime = this.inputCheckTimer;

        // Initialize the keyboard input listener
        cc.systemEvent.on(cc.SystemEvent.EventType.KEY_DOWN, this.onKeyDown, this);
    },

    onKeyDown (event) {
        // set a flag when key pressed
        if(event.keyCode === cc.macro.KEY.space) {
            if(this.charState === enumCharState.Run) {
                if(this.isGrounded === true && this.currentInputCheckTime <= 0) {
                    //char needs to be in running state and on the ground to be able to jump
                    this.node.runAction(this.jump());
                    this.isGrounded = false;
                    this.currentInputCheckTime = this.inputCheckTimer;
                }
            }
        }
    },

    onBeginContact: function (contact, selfCollider, otherCollider) {
        // tag 1 -> can not kill player (ground for example)
        if(otherCollider.tag === 1) {
            if (selfCollider.node.y > otherCollider.node.y + otherCollider.size.height) {
                //checks if the player is "on" the platform and not next to or under it
                if(this.isGrounded === false) {
                    //player hit the platform from above
                    this.animator.play("character_anim_run");
                    this.playSoundEffect(this.runningSound, true);
                    this.isGrounded = true;
                }
            } else {
                //player hit the platform from the side or bottom
                this.die();
            }
        // tag 2 -> obstacles, can kill player
        } else if (otherCollider.tag === 2) {
            this.die();
        }
    },

    update (dt) {
        //switch on Character States
        switch(this.charState) {
            case enumCharState.Idle:
                this.body.linearVelocity = cc.v2(0, 0);
                break;

            case enumCharState.Run:
                if(this.body.linearVelocity.x != this.speed) {
                    if ( this.xVelocity > this.speed) {
                        // if acceleration finished, use max speed
                        this.body.linearVelocity = new cc.Vec2(this.xVelocity = this.speed, this.body.linearVelocity.y);
                    } else {
                        // acceleration
                        this.body.linearVelocity = new cc.Vec2(this.xVelocity += this.accel * dt, this.body.linearVelocity.y);
                    }
                }
                break;

            //after the player dies
            case enumCharState.Dead:
                this.animator.play("character_anim_fall");
                //physics are disabled to prevent the char from falling
                cc.director.getPhysicsManager().enabled = false;
                //plays a dying animation (similar to Mario death animation)
                this.node.runAction(this.playDeathAnimation());
                break;
        }

        // updates the input check timer (determines how often the game can receive input from the keyboard)
        this.currentInputCheckTime = this.currentInputCheckTime - dt;
    },

    setCharState: function(state) {
        //this function can be used by other scripts to change the character state
        switch (state) {
            case "Idle":
                this.charState = enumCharState.Idle;
                break;
            case "Run":
                this.charState = enumCharState.Run;
                break;
            case "Dead":
                this.charState = enumCharState.Dead;
        }
    },

    jump: function() {
        // jump up action
        let jumpUp = cc.moveBy(this.jumpDuration, cc.v2(0, this.jumpHeight)).easing(cc.easeCubicActionOut());
        // plays the jump animation
        this.animator.play("character_anim_jump");
        //plays the jump sound
        this.playSoundEffect(this.jumpSound, false);
        // return the jumpUp action
        return jumpUp;
    },

    playSoundEffect: function(soundEffect, loop) {
        //stops the current sound effect
        cc.audioEngine.stopEffect(this.currentSoundEffect);
        //plays the new sound effect and stores a reference to it
        this.currentSoundEffect = cc.audioEngine.playEffect(soundEffect, loop);
    },

    die: function() {
        //shake the camera and play death sound
        this.camera.getComponent(cc.Animation).play("shake");
        this.playSoundEffect(this.deathSound, false);
        //set the game and char state to the appropriate values
        this.charState = enumCharState.Dead;
        this.gameMode.setGameState("GameOver");
    },

    playDeathAnimation: function() {
        //move up action
        let moveUp = cc.moveBy(0.2, cc.v2(0, 15)).easing(cc.easeCubicActionOut());
        //fall action
        let moveDown = cc.moveBy(0.3, cc.v2(0, -30)).easing(cc.easeCubicActionOut());

        //returns a sequence of actions
        return cc.sequence(moveUp, moveDown);
    }
});
