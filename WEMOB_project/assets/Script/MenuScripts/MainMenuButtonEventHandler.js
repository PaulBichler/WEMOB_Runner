cc.Class({
   extends: cc.Component,

   properties: {
      //Url of the highscore file
      HighscoreFileUrl: "https://students.btsi.lu/bicpa/Bichler_Paul_Website_WEMOB/Games/highscores.json",

      //References to Highscore labels:
      RankLabel: cc.Label,
      UsernameLabel: cc.Label,
      ScoreLabel: cc.Label,

      //Menu Background Music
      BackgroundMusic: {
         type: cc.AudioClip, 
         default: null
      },

      //Mouse Click Sound
      ClickSound: {
         type: cc.AudioClip, 
         default: null
      },

      //References to UI widget elements:
      MainLayout: cc.Node,
      SettingsLayout: cc.Node,
      HighscoreLayout: cc.Node,
      PlayButton: cc.Button,
      HighscoreButton: cc.Button,
      HighscoreBackButton: cc.Button,
      SettingsButton: cc.Button,
      SettingsBackButton: cc.Button,
      SettingsVolumeSlider: cc.Slider,
      SettingsEffectVolSlider: cc.Slider
   },

   onLoad: function () {
      //sets buttons and slider events:
      this.PlayButton.node.on('click', this.startGame, this);
      this.HighscoreButton.node.on('click', this.showHighscores, this);
      this.HighscoreBackButton.node.on('click', this.goBack, this);
      this.SettingsButton.node.on('click', this.showSettings, this);
      this.SettingsBackButton.node.on('click', this.goBack, this);
      this.SettingsVolumeSlider.node.on('slide', this.setMusicVolume, this);
      this.SettingsEffectVolSlider.node.on('slide', this.setEffectVolume, this);
      this.SettingsEffectVolSlider.node.on('mouseup', this.playClickSound, this);
      
      //starts the background music
      this.currentMusic = cc.audioEngine.playMusic(this.BackgroundMusic, true);
      //sets the music volume slider to the current volume of the music
      this.SettingsVolumeSlider.progress = cc.audioEngine.getVolume(this.currentMusic);
      //sets the effects colume to the current audioEngine effects volume
      this.SettingsEffectVolSlider.progress = cc.audioEngine.getEffectsVolume();
   },

   playClickSound: function() {
      //plays the UI click sound (used when the user clicks on a button)
      cc.audioEngine.playEffect(this.ClickSound, false);
   },
 
   startGame: function () {
      this.playClickSound();
      //resumes the game (if it has been paused)
      cc.director.resume();
      //loads the main game scene
      cc.director.loadScene("Game");
   },

   showHighscores: function() {
      this.playClickSound();
      //hides the main menu
      this.MainLayout.active = false;
      //shows the highscores window
      this.HighscoreLayout.active = true;

      //updates the highscore table
      this.updateHighscores();
   },

   showSettings: function() {
      this.playClickSound();
      //hides the main menu
      this.MainLayout.active = false;
      //shows the settings window
      this.SettingsLayout.active = true;
   },

   goBack: function() {
      this.playClickSound();
      //hides the settings and highscores window
      this.SettingsLayout.active = false;
      this.HighscoreLayout.active = false;
      //shows the main menu
      this.MainLayout.active = true;
   },

   setMusicVolume: function() {
      //sets the music volume to the current value of the slider
      cc.audioEngine.setMusicVolume(this.SettingsVolumeSlider.progress);
   },

   setEffectVolume: function() {
      //sets the effects volume to the current value of the slider
      cc.audioEngine.setEffectsVolume(this.SettingsEffectVolSlider.progress);
   },

   updateHighscores: function() {
      let http = new XMLHttpRequest();
      let url = this.HighscoreFileUrl;

      http.open("GET", url, true);
      //file should not be cached by the browser
      http.setRequestHeader("Cache-Control", "max-age=0");

      http.onreadystatechange = () => {
         if(http.readyState == 4 && http.status == 200) {
            //if readyState -> finished and status -> OK
            let HighscoreArr = JSON.parse(http.responseText);
            HighscoreArr.sort((a, b) => parseInt(b.score) - parseInt(a.score));
            this.displayHighscores(HighscoreArr);
         
         } else if(http.status === 404) {
            //if status -> not found
            console.log("file not found!");
         }
      };

      //send the request
      http.send();
   },

   displayHighscores: function(arr) {
      //empty the table
      this.RankLabel.string = "";
      this.UsernameLabel.string = "";
      this.ScoreLabel.string = "";

      //populate the table
      if(typeof arr !== 'undefined' && arr.length > 0) {
         for (let i = 0; i < arr.length; i++) {
            this.RankLabel.string += (i+1) + "\n";
            this.UsernameLabel.string += arr[i].usr + "\n";
            this.ScoreLabel.string += arr[i].score + "m\n";
         }
      } else {
         console.log("highscore array undefined or empty!");
      }
   }
});
