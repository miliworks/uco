
(function(){

var GiftBar = game.GiftBar = function(props)
{
	props = props || {};
	GiftBar.superClass.constructor.call(this, props);
	this.id = props.id || Q.UIDUtil.createUID("GiftBar");
	
	this.init();
}
Q.inherit(GiftBar, Q.DisplayObjectContainer);

GiftBar.prototype.init = function()
{
    // 成员变量初始化
    this.gifts = [];

    // 背景
	var bg = new Q.Bitmap({id:"GiftBar-bg", image:game.getImage("bar")});
    bg.width = game.width;
    this.bg = bg;

    this.x = 0;
    this.y = game.height - bg.height;
	this.width = bg.width;
	this.height = bg.height;

	this.addChild(bg);
};

GiftBar.prototype.addGift = function(gift)
{
    // 添加奖品
    gift.x = 10+this.gifts.length * (gift.width+10);
    gift.y = (this.height-gift.height)/2;
    this.gifts.push(gift);

    this.addChild(gift);
};

GiftBar.prototype.reset = function()
{
    this.gifts.clear();
    this.removeAllChildren();
    this.addChild(this.bg);
}

})();