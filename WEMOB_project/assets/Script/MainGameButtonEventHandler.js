cc.Class({
    extends: cc.Component,

    properties: {
        ajax_post_url: "bicpa/Bichler_Paul_Website_WEMOB/WEMOB2_Game/action_save_score.php",

        ClickSound: {
           type: cc.AudioClip, 
           default: null
        },

        PauseLayout: cc.Layout,
        SettingsLayout: cc.Node,
        ResumeButton: cc.Button,
        HomeButton: cc.Button,
        SettingsButton: cc.Button,
        SettingsBackButton: cc.Button,
        SettingsVolumeSlider: cc.Slider,
        SettingsEffectVolSlider: cc.Slider,

        ESUserTextbox: cc.EditBox,
        ESSubmitButton: cc.Button,
        ESSubmitFeedback: cc.Label,
        ESHomeButton: cc.Button,
        ESRetryButton: cc.Button
    },
  
    onLoad: function () {
        this.gameMode = cc.director.getScene().getChildByName("Canvas").getComponent("GameMode");

        //sets buttons and slider events:
        this.ResumeButton.node.on('click', this.resumeGame, this);
        this.HomeButton.node.on('click', this.returnToMainMenu, this);
        this.SettingsButton.node.on('click', this.showSettings, this);
        this.SettingsBackButton.node.on('click', this.goBack, this);
        this.SettingsVolumeSlider.node.on('slide', this.setMusicVolume, this);
        this.SettingsEffectVolSlider.node.on('slide', this.setEffectVolume, this);
        this.SettingsEffectVolSlider.node.on('mouseup', this.playClickSound, this);

        this.ESSubmitButton.node.on('click', this.submitScore, this);
        this.ESHomeButton.node.on('click', this.returnToMainMenu, this);
        this.ESRetryButton.node.on('click', this.reloadGame, this);
        this.isScoreSubmitted = false;
        
        //set the sliders to the current volume value
        this.SettingsVolumeSlider.progress = cc.audioEngine.getMusicVolume();
        this.SettingsEffectVolSlider.progress = cc.audioEngine.getEffectsVolume();

        // Initialize the keyboard input listener
        cc.systemEvent.on(cc.SystemEvent.EventType.KEY_DOWN, this.onKeyDown, this);
    },

    onKeyDown (event) {
        // pause / resume toggle event
        if(event.keyCode === cc.macro.KEY.escape && this.gameMode.isPausable) {
            if(cc.director.isPaused()) {
                //resume game
                cc.director.resume();
                cc.audioEngine.resumeAllEffects();
                this.PauseLayout.node.active = false;
                this.gameMode.setGameState("Init");
            } else {
                //pause game
                cc.audioEngine.stopAllEffects();
                this.PauseLayout.node.active = true;
                cc.director.pause();
                cc.director.getPhysicsManager().enabled = false;
            }
        }
    },
  
    playClickSound: function() {
        cc.audioEngine.playEffect(this.ClickSound, false);
    },
   
    resumeGame: function () {
        this.playClickSound();
        cc.director.resume();
        cc.audioEngine.resumeAllEffects();
        this.PauseLayout.node.active = false;
        this.gameMode.setGameState("Init");
    },
  
    returnToMainMenu: function() {
        this.playClickSound();

        let confirmMsg = (this.gameMode.gameState === 3) ? 
                            "Score not submitted!\nAre you sure you want to go back to the Main Menu?" :
                            "Are you sure you want to go back to the Main Menu?";

        if(this.isScoreSubmitted) {
            cc.director.loadScene("MainMenu");
        } else if(window.confirm(confirmMsg)) {
            cc.director.loadScene("MainMenu");
        }
    },
  
    showSettings: function() {
        this.playClickSound();
        this.PauseLayout.node.active = false;
        this.SettingsLayout.active = true;
    },
  
    goBack: function() {
        this.playClickSound();
        this.SettingsLayout.active = false;
        this.PauseLayout.node.active = true;
    },
  
    setMusicVolume: function() {
        cc.audioEngine.setMusicVolume(this.SettingsVolumeSlider.progress);
    },
  
    setEffectVolume: function() {
        cc.audioEngine.setEffectsVolume(this.SettingsEffectVolSlider.progress);
    },

    submitScore: function() {
        if(this.ESUserTextbox.string === "") {
            this.ESSubmitFeedback.node.color = new cc.Color(255, 255, 255);
            this.ESSubmitFeedback.string = "Failed to submit! Username must not be empty!";
        } else if(this.isScoreSubmitted) {
            this.ESSubmitFeedback.node.color = new cc.Color(255, 255, 255);
            this.ESSubmitFeedback.string = "Score already submitted!";
        } else {
            this.ESSubmitFeedback.node.color = new cc.Color(0, 255, 0);
            this.saveScore();
        }
    },

    reloadGame: function() {
        if(this.isScoreSubmitted) {
            cc.director.loadScene("Game");
        } else {
            if(window.confirm("Score not submitted!\nAre you sure you want to retry?")) {
                cc.director.loadScene("Game");
            }
        }
    },

    saveScore: function() {
        let http = new XMLHttpRequest();

        let url = this.ajax_post_url;
        let user = this.ESUserTextbox.string;
        let score = this.gameMode.playerScore;
        let data = "username="+user+"&score="+score;

        http.open("POST", url, true);
        http.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");

        http.onreadystatechange = () => {
            if(http.readyState == 4 && http.status === 200) {
                this.ESSubmitFeedback.string = http.responseText;
                this.isScoreSubmitted = true;
            } else if(http.status === 404) {
                this.ESSubmitFeedback.string = "Failed to submit score! Action page not found!";
            }
        }

        http.send(data);
    }
});
