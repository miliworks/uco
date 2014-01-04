
(function(){

var Dolphin = game.Dolphin = function(props)
{
	props = props || {};
	Dolphin.superClass.constructor.call(this, props);
	this.id = props.id || Q.UIDUtil.createUID("Dolphin");
	
	this.avatar = null;	
	this.jumping = false;
	this.moving = false;
	
	this.init();
}
Q.inherit(Dolphin, Q.DisplayObjectContainer);

Dolphin.prototype.init = function()
{
	var avatar = new Q.MovieClip({id:"dolphin", image:game.getImage("dolphin"), interval:120});
	avatar.addFrame([
	{rect:[0,0,223,337], label:"idle"},
	{rect:[223,0,223,337]},
	{rect:[0,337,223,337]},	
	{rect:[223,0,223,337], jump:"idle"},
	{rect:[223,337,189,329], label:"jump"},
	]);
	
	this.width = 223;
	this.height = 337;
	this.currentSpeedX = this.speedX = 5;
	this.currentSpeedY = this.speedY = 10;
	this.dirX = 0;
	this.dirY = 0;
	this.oldY = 0;
	
	this.avatar = avatar;
	this.addChild(avatar);
};

Dolphin.prototype.move = function(dir)
{
	if(this.moving) return;
	this.dirX = dir;
	this.currentSpeedX = this.speedX;
	this.moving = true;
}

Dolphin.prototype.stopMove = function()
{
	this.dirX = 0;
	this.currentSpeedX = this.speedX;
	this.moving = false;
}

Dolphin.prototype.jump = function()
{
	if(this.jumping) return;
	this.oldY = this.y;
	this.dirY = 1;
	this.currentSpeedY = this.speedY;
	this.jumping = true;
	this.avatar.gotoAndStop("jump");
}

Dolphin.prototype.stopJump = function()
{
	this.y = this.oldY;
	this.dirY = 0;
	this.jumping = false;
	this.avatar.gotoAndPlay("idle");
}

})();