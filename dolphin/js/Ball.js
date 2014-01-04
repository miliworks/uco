
(function(){

var Ball = game.Ball = function(props)
{
	props = props || {};
	this.type = props.type;
	Ball.superClass.constructor.call(this, this.type);
	this.id = props.id || Q.UIDUtil.createUID("Ball");
	
	this.reset(this.type);
};
Q.inherit(Ball, Q.MovieClip);

Ball.prototype.init = function()
{
	
};

Ball.prototype.update = function(timeInfo)
{
	this.rotation += 0.5;
};

Ball.prototype.reset = function(type)
{
	this.setType(type);
	this.currentScore = this.type.score;
	this.alpha = 1;
	this.fading = false;
	this.bouncing = false;
	this.currentSpeedY = this.speedY;
	this.currentSpeedX = 0;
	this.delay = Math.floor(Math.random()*50);
	
	this.setRandomPosition();
}

Ball.prototype.setRandomPosition = function()
{
	var minX = 100, maxX = game.width-100, minY = -100, maxY = 0;
	this.x = Math.floor(Math.random()*(maxX-minX)+minX);
	//this.y = Math.floor(Math.random()*(maxY-minY)+minY);
	this.y = -50;
}

Ball.prototype.setType = function(type)
{
	this.type = type;
	this._frames.length = 0;
	this.addFrame(type.frames);
	this.currentFrame = 0;
}

Ball.getRandomType = function()
{
	var list = this.TypeList;
	var r = Math.floor(Math.random()*list.length);
	return list[r];
};

Ball.prototype.getCollide = function()
{
	this.currentScore += this.type.scoreStep;
	if(this.currentScore > this.type.maxScore) this.currentScore = this.type.maxScore;
	this.currentSpeedY = -10;
	this.bouncing = true;
}

Ball.prototype.stopBounce = function()
{
	//this.currentSpeedY = this.speedY;
	this.bouncing = false;
}

Ball.init = function() 
{
	this.Type = {};
	this.Type.small = 
	{
		image:game.getImage("ball"),
		regX: 94,
		regY: 92,
		width: 188,
		height: 184,
		score: 0,
		scoreStep: 1,
		maxScore: 3,
		speedY: 0,
		frames:[
			{rect:[0,0,188,184]}
			]
	};
	
	this.Type.medium =
	{
		image:game.getImage("ball"),
		regX: 94,
		regY: 92,
		width: 188,
		height: 184,
		score: 1,
		scoreStep: 1,
		maxScore: 5,
		speedY: 0.5,
		frames:[
			{rect:[188,0,188,184]}
			]
	};

	this.Type.big = 
	{
		image:game.getImage("ball"),
		regX: 94,
		regY: 92,
		width: 188,
		height: 184,
		score: 2,
		scoreStep: 1,
		maxScore: 8,
		speedY: 1,
		frames:[
			{rect:[0,184,188,184]}
			]
	};

	this.TypeList = [this.Type.small, this.Type.medium, this.Type.big];
};

})();