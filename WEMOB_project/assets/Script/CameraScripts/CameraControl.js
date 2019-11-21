cc.Class({
    extends: cc.Component,

    properties: {
        // target that the camera follows
        target: {
            default: null,
            type: cc.Node
        },
        
        //Main scene camera
        camera: cc.Camera,
        //Animation component of the camera
        anim: cc.Animation,

        //top margin of the camera position (when it focueses on the target)
        topMargin: 250,
        //right margin of the camera position (when it focueses on the target)
        rightMargin: 550,
    },

    // use this for initialization
    onLoad: function () {
        // Rigid-Body component of this node
        this.rb = this.getComponent(cc.RigidBody);
        // Rigid-Body component of the target node
        this.targetRb = this.target.getComponent(cc.RigidBody);
        // Y-value of the target
        this.posY = this.target.y;

        //initialise the position of the camera (focus on the target)
        this.setCameraPosition(this.target.x, this.posY, this.rightMargin, this.topMargin);
    },


    // called every frame, after the update method
    lateUpdate: function (dt) {
        if(this.rb.linearVelocity.x != this.targetRb.linearVelocity.x) {
            //updates the velocity of the camera according to the target
            this.rb.linearVelocity = new cc.Vec2(this.targetRb.linearVelocity.x, this.rb.linearVelocity.y);
        }
    },

    setCameraPosition: function(posX, posY, rightMargin, topMargin) {
        //set the position of the camera according to its target
        let targetPosX = posX + rightMargin;
        let targetPosY = posY + topMargin;
        this.node.position = this.target.parent.convertToWorldSpaceAR(cc.v2(targetPosX, targetPosY));
    }
});
