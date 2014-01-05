
(function(){

var ProgressBar = game.ProgressBar = function(props)
{
	props = props || {};
	ProgressBar.superClass.constructor.call(this, props);
	this.id = props.id || Q.UIDUtil.createUID("ProgressBar");
	
	this.init();
}
Q.inherit(ProgressBar, Q.DisplayObjectContainer);

ProgressBar.prototype.init = function()
{
    // 成员变量初始化
    this.x = 50;
    this.y = 10;
    this.width = game.width - 100;
    this.height = 20;

    // 背景
	var bg = new Q.Bitmap({id:"ProgressBar-bg", image:game.getImage("progress_bg")});
    bg.width = this.width;
    bg.height = this.height;
    this.bg = bg;

    // 进度前景
    var fv = new Q.Bitmap({id:"ProgressBar-fv", image:game.getImage("progress")});
    fv.width = this.width;
    fv.height = this.height;
    this.progress = fv;

    var fvMask = new Q.Bitmap({id:"ProgressBar-mask", image:game.getImage("progress_mask")});
    fv.mask = fvMask;

    this.addChild(bg,fv);
    //this.addChild(fvMask);
};

ProgressBar.prototype.setProgress = function(percent)
{
    // 调整mask宽度
    var width = this.width * percent / 100;
    trace("progress:", percent);
    this.progress.mask.width = width;
};

})();