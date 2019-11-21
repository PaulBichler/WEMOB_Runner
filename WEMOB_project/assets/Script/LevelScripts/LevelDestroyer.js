cc.Class({
    extends: cc.Component,

    properties: {
        //the target this node follows (the character in this case)
        followTarget: {
            default: null,
            type: cc.Node
        },
    },

    onBeginContact: function (contact, selfCollider, otherCollider) {
        //destroys every node it touches
        otherCollider.node.destroy();
    },
    
    onLoad: function () {
        //Rigid-Body component of this node
        this.rb = this.getComponent(cc.RigidBody);
        //Rigid-Body component of the followTarget node
        this.targetRb = this.followTarget.getComponent(cc.RigidBody);
    },

    lateUpdate: function (dt) {
        if(this.rb.linearVelocity.x != this.targetRb.linearVelocity.x) {
            //matches the speed to the followTarget speed
            this.rb.linearVelocity = this.targetRb.linearVelocity;
        }
    },
});
