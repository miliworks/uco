
(function(){

var Avatar = game.Avatar = function(props)
{
	props = props || {};
    Avatar.superClass.constructor.call(this, props);
	this.id = props.id || Q.UIDUtil.createUID("Avatar");
	
	this.avatar = null;
	
	this.init();
}
Q.inherit(Avatar, Q.DisplayObjectContainer);

Avatar.prototype.init = function()
{
	var avatar = new Q.MovieClip({id:"avatar", image:game.getImage("girl"), interval:120});
	avatar.addFrame([
	{rect:[0,0,116,116], label:"idle"}
	]);
	
	this.width = 116;
	this.height = 116;
    this.regX = 116/2;
    this.regY = 116/2;
	
	this.avatar = avatar;
	this.addChild(avatar);
};

Avatar.prototype.move = function()
{
    this.x = Math.random()*(game.width-this.avatar.width)+this.avatar.width/2;
    this.y = Math.random()*(game.height-this.avatar.height-game.giftbar.height)+this.avatar.height/2;

    this.avatar.gotoAndStop("idle");
}


})();