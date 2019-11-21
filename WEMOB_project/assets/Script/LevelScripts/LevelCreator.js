cc.Class({
    extends: cc.Component,

    properties: {

        //vector that "moves" with the camera
        levelGenerationPoint: {
            default: null,
            type: cc.Node
        },

        //reference to the last platform in the scene
        lastPlatform: {
            default: null,
            type: cc.Node
        },

        //parent node in which the platforms will be spawned
        platformParentNode: {
            default: null,
            type: cc.Node
        },
    },

    onLoad: function () {
        //count of the available platforms
        this.platformCount;
        //is true while an asset is being loaded from the cache
        this.isLoading = true;

        //every asset that is located in assets/resources will be loaded in the cache when the game starts
        //loadResDir will load every asset from a subfolder and place it in an array (asynchronous)
        cc.loader.loadResDir('Platforms', (err, assets) => { //callback
            //in this case loadResDir is only used to get the amount of platforms available
            this.platformCount = assets.length;
            //the callback indicates that the asset is finished loading
            this.isLoading = false;
            //updates the position of this node
            this.updatePosition();
        });
    },

    update (dt) {
        if(!this.isLoading && cc.isValid(this.levelGenerationPoint)) {
            if(this.node.x < this.levelGenerationPoint.convertToWorldSpace(this.levelGenerationPoint.position).x) {
                //only spawns a new platform if the x-position of this node is smaller then the x-position of the generation point
                //since the levelGenerationPoint is "moving" with the camera, the script will continously generate platforms.
                this.newPlatform(this.platformParentNode, this.node.position);
            }
        }   
    },

    updatePosition: function() {
        //updates the position of this node to the end of the last platform in the scene

        //new position
        let lastPlatformWidth = this.lastPlatform.getComponent(cc.PhysicsBoxCollider).size.width;

        //set the position
        this.node.x = this.lastPlatform.x + lastPlatformWidth - 1;
        this.node.y = this.lastPlatform.y;
    },

    newPlatform: function(parent, position) {
        //spawns a random platform at the position of this node

        //gets a random platform url (from the resources folder)
        let randomPlat = "Platforms/plat" + Math.ceil(Math.random()*this.platformCount);
        //loadRes is asyncronous
        this.isLoading = true;

        //loads the new platform asset
        cc.loader.loadRes(randomPlat, (err, prefab) => { //callback:
            //creates an instance from the loaded platform asset
            var newPlatform = cc.instantiate(prefab);
            //sets the position of the instance to the position of this node
            newPlatform.position = position;
            //adds the the instance to the parent node
            parent.addChild(newPlatform);
            //new platform is now the last platform in the scene
            this.lastPlatform = newPlatform;
            //updates the position of this node
            this.updatePosition();
            //asset loaded
            this.isLoading = false;
        });
    },
});
