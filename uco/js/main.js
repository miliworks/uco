
(function(){

window.onload = function()
{
	game.init();
};
	
var game = 
{
	res: [
    {id:"bar", size:372, src:"images/bar.jpg"},
	{id:"bg", size:372, src:"images/bg.jpg"},
	{id:"gift", size:69, src:"images/gift.jpg"},
	{id:"girl", size:77, src:"images/girl.png"},
    {id:"loading", size:77, src:"images/loading.jpg"},
	{id:"notice", size:186, src:"images/notice.jpg"},
	{id:"progress", size:411, src:"images/progress.png"},
	{id:"progress_bg", size:411, src:"images/progress_bg.png"},
    {id:"top", size:85, src:"images/top.jpg"}
	],
	
	container: null,
	width: 0,
	height: 0,
	params: null,
	frames: 0,
	
	fps: 30,
	timer: null,
	eventTarget: null,
	state: null,
	
	girl: null,
    gifts: [],
	
	time: {total:30, current:30}
};

var STATE = 
{
	MAIN: 1,
	OVER: 2
};

var ns = window.game = game;

game.init = function()
{
    //初始化容器设置
    var colors = ["#00c2eb", "#cbfeff"];
    this.container = Q.getDOM("container");
    this.container.style.overflow = "hidden";
    this.container.style.background = "-moz-linear-gradient(top, "+ colors[0] +", "+ colors[1] +")";
    this.container.style.background = "-webkit-gradient(linear, 0 0, 0 bottom, from("+ colors[0] +"), to("+ colors[1] +"))";
    this.container.style.background = "-o-linear-gradient(top, "+ colors[0] +", "+ colors[1] +")";
    this.container.style.filter = "progid:DXImageTransform.Microsoft.gradient(startColorstr="+ colors[0] +", endColorstr="+ colors[1] +")";
    this.width = this.container.clientWidth;
    this.height = this.container.clientHeight;

	//加载进度信息
	var div = document.createElement("div");
//	div.style.position = "absolute";
//	div.style.width = container.clientWidth + "px";
//	div.style.left = "0px";
//	div.style.top = (container.clientHeight >> 1) + "px";
//	div.style.textAlign = "center";
//	div.style.color = "#fff";
//	div.style.font = Q.isMobile ?  'bold 16px 黑体' : 'bold 16px 宋体';
//	div.style.textShadow = Q.isAndroid ? "0 2px 2px #111" : "0 2px 2px #ccc";
    var img = document.createElement("img");
    img.src = "images/loading.jpg";
    img.width = this.width;
    img.height = this.height;
    div.appendChild(img);
	this.container.appendChild(div);
	this.loader = div;
    
    //隐藏浏览器顶部导航
    setTimeout(game.hideNavBar, 10);
    if(Q.supportOrient)
    {
        window.onorientationchange = function(e)
        {
            game.hideNavBar();
            game.calcStagePosition();
        };
    }    
	
    //加载图片素材
	var loader = new Q.ImageLoader();
	loader.addEventListener("loaded", Q.delegate(this.onLoadLoaded, this));
	loader.addEventListener("complete", Q.delegate(this.onLoadComplete, this));
	loader.load(this.res);
};

//加载进度条
game.onLoadLoaded = function(e)
{

}

//加载完成
game.onLoadComplete = function(e)
{
	e.target.removeAllEventListeners();
	Q.getDOM("container").removeChild(this.loader);
	this.loader = null;
	
	this.images = e.images;

	//启动游戏
	this.startup();
}

//获取图片资源
game.getImage = function(id)
{
	return this.images[id].image;
}

//启动游戏
game.startup = function()
{
	//手持设备的特殊webkit设置
	if(Q.isWebKit && Q.supportTouch)
	{
		document.body.style.webkitTouchCallout = "none";
		document.body.style.webkitUserSelect = "none";
		document.body.style.webkitTextSizeAdjust = "none";
		document.body.style.webkitTapHighlightColor = "rgba(0,0,0,0)";
	}

    //获取URL参数设置
	this.params = Q.getUrlParams();
    // TODO:加载附加参数
	
	//初始化context
	var context = null;
	if(this.params.canvas)
	{
		var canvas = Q.createDOM("canvas", {id:"canvas", width:this.width, height:this.height, style:{position:"absolute"}});
		this.container.appendChild(canvas);
		this.context = new Q.CanvasContext({canvas:canvas});
	}else
	{
		this.context = new Q.DOMContext({canvas:this.container});
	}
	
	//创建舞台
	this.stage = new Q.Stage({width:this.width, height:this.height, context:this.context, update:Q.delegate(this.update, this)});
	
	//初始化定时器
	var timer = new Q.Timer(1000 / this.fps);
	timer.addListener(this.stage);
	timer.addListener(Q.Tween);
	timer.start();
	this.timer = timer;
		
	//预加载背景音乐
	var audio = new Quark.Audio("sounds/click.wav", true, false, false);
	this.audio = audio;
	
	//注册事件
	var me = this;
	var em = new Q.EventManager();
	var events = Q.supportTouch ? ["touchstart", "touchmove", "touchend"] : ["mousedown", "mousemove", "mouseup"];
	em.register(this.context.canvas, events, function(e)
	{
		var ne = (e.touches && e.touches.length > 0) ? e.touches[0] : 
			(e.changedTouches && e.changedTouches.length > 0) ? e.changedTouches[0] : e;
		//确保touchend事件的类型正确
        if(Q.supportTouch) ne.type = e.type;

		if(me.state == STATE.MAIN)
		{
			if(ne.type == "touchend" || ne.type == "mouseup" )
			{
                var x = ne.pageX - me.stage.stageX, y = ne.pageY - me.stage.stageY;
                var obj = me.stage.getObjectUnderPoint(x, y);

                if(me.eventTarget != null && me.eventTarget != obj)
                {
                    if(me.eventTarget.onEvent != null) me.eventTarget.onEvent({type:"mouseout"});
                    me.eventTarget = null;
                }
                if(obj != null)
                {
                    me.eventTarget = obj;
                    if(obj.useHandCursor) me.context.canvas.style.cursor = "pointer";
                    if(obj.onEvent != null) obj.onEvent(ne);
                }

                if( obj.id == 'avatar' )
                {
                    // avatar被点击
				    game.avatar.move();
                }
			}
		}else if(me.state == STATE.OVER && ne.type != "mousemove" && ne.type != "touchmove")
		{
			//me.restart();
		}
	}, true, true);
	
	//进入游戏主场景
	this.showMain();
	
	//显示FPS
	this.showFPS();
};

//游戏主场景
game.showMain = function()
{
	var me = this;
	//设置当前状态
	this.state = STATE.MAIN;

	if(this.bg == null)
	{
		//背景
		var bg = new Q.Bitmap({id:"bg", image:this.getImage("bg")});
		bg.x = 0;
        bg.y = 0;
        bg.width = this.width;
        bg.height = this.height;
		this.bg = bg;

		//创建海豚
		var avatar = new ns.Avatar({id:"avatar"});
		this.avatar = avatar;

		//每隔一段时间重新调整avatar位置
		var delay = function()
		{
			me.timer.delay(function()
			{
                game.avatar.move();

				delay();
			}, 10000);
		}
		delay();

	}
	
	//初始化avatar
	this.avatar.move();
	
	//添加所有对象到舞台
	this.stage.addChild(this.bg, this.avatar);
	
	//显示倒计时
	//this.showTimer();
	//显示得分
	//this.updateScore();
}

//主更新方法
game.update = function(timeInfo)
{
	this.frames++;
	
	if(this.state == STATE.MAIN)
	{

	}
}

//avatar点击判定的碰撞检测
game.checkCollision = function()
{
	var me = this, balls = this.balls, dolphin = this.dolphin;
	//根据球的Y轴排序
	balls.sort(sortBallFunc);
	
	for(var i = 0; i < balls.length; i++)
	{
		var ball = balls[i];
		if(ball.fading || ball.bouncing) continue;
		var gapH = ball.getCurrentWidth()*0.5, gapV = ball.getCurrentHeight()*0.5;
		var dx = ball.x - dolphin.x, dy = dolphin.y - ball.y;		
		//trace(ball, dolphin.y, ball.y, gapV, ball.x, dolphin.x, gapH);
		
		if(dx <= dolphin.getCurrentWidth()+gapH && dx >= 0 && dy <= gapV && dy >= -gapV-100)
		{
			ball.getCollide();
			var ddx = dx - gapH;
			ball.currentSpeedX = Math.abs(ddx) > 20 ? ddx*0.1 : 0;
			this.collidedBall = ball;
			this.addScore(ball, ball.currentScore);
			return true;
		}
	}
	return false;
}

//得分
game.addScore = function(ball, score)
{
	if(this.addNum == null)
	{
		var container = new Q.DisplayObjectContainer({id:"addNum", width:100, height:65});
		var plus = new ns.Num({id:"plus", type:ns.Num.Type.num1});
		plus.setValue(11);
		container.addChild(plus);
		var num = new ns.Num({id:"num", type:ns.Num.Type.num1});
		num.x = plus.x + plus.width - 15;
		container.addChild(num);
		this.addNum = container;
	}	
	this.stage.addChild(this.addNum);
	this.addNum.getChildAt(1).setValue(score);
	this.addNum.x = ball.x - 50;
	this.addNum.y = ball.y - 100;
	this.addNum.alpha = 1;
	
	this.score += score;
	this.updateScore();
	
	Q.Tween.to(this.addNum, {y:this.addNum.y-100, alpha:0}, {time:1000});
}

//更新总得分
game.updateScore = function()
{
	if(this.scoreNum == null)
	{
		var container = new Q.DisplayObjectContainer({id:'score', width:200, height:65});
		var num0 = new ns.Num({id:"num0", type:ns.Num.Type.num2});
		var num1 = new ns.Num({id:"num1", type:ns.Num.Type.num2});
		var num2 = new ns.Num({id:"num2", type:ns.Num.Type.num2});
		var num3 = new ns.Num({id:"num3", type:ns.Num.Type.num2});
		num1.x = 50;
		num2.x = 100;
		num3.x = 150;
		container.addChild(num0, num1, num2, num3);
		container.scaleX = container.scaleY = 0.8;
		container.x = this.width - container.getCurrentWidth() - 15 >> 0;
		container.y = 15;
		this.scoreNum = container;
	}	
	this.stage.addChild(this.scoreNum);
	
	var str = this.score.toString(), len = str.length;
	str = len > 4 ? str.slice(len - 4) : str;
	while(str.length < 4) str = "0" + str;
	for(var i = 0; i < str.length; i++)
	{
		this.scoreNum.getChildAt(i).setValue(Number(str[i]));
	}
}

//显示倒计时
game.showTimer = function()
{	
	if(this.countdown == null)
	{
		//初始化倒计时
		var countdown = new Q.DisplayObjectContainer({id:'countdown', width:250, height:65});
		var num1 = new ns.Num({id:"min1", type:ns.Num.Type.num2});
		var num2 = new ns.Num({id:"min2", type:ns.Num.Type.num2});
		var sep = new ns.Num({id:"sep", type:ns.Num.Type.num2});
		var sec1 = new ns.Num({id:"sec1", type:ns.Num.Type.num2});
		var sec2 = new ns.Num({id:"sec2", type:ns.Num.Type.num2});
		num2.x = 45;
		sep.x = 80;
		sec1.x = 125;
		sec2.x = 170;
		sep.setValue(10);
		countdown.addChild(num1, num2, sep, sec1, sec2);
		countdown.scaleX = countdown.scaleY = 0.8;
		countdown.x = 90;
		countdown.y = 15;
		this.countdown = countdown;
	}	
	this.stage.addChild(this.countdown);
	this.time.current = this.time.total;
	this.updateTimer();
	
	//启动倒计时Tween
	Q.Tween.to(this.time, null, {time:1000, loop:true, 
	onComplete:function(tween)
	{
		game.updateTimer();
		if(game.time.current <= -1)
		{
			tween.stop();
			game.gameOver();
		}
	}});
}

//更新倒计时数值
game.updateTimer = function()
{	
	var me = this, time = this.time;
	var min = Math.floor(time.current / 60), sec = time.current % 60;
	me.countdown.getChildAt(0).setValue(min>=10?Math.floor(min/10) : 0);
	me.countdown.getChildAt(1).setValue(min>=10?(min%10) : min);
	me.countdown.getChildAt(3).setValue(sec>=10?Math.floor(sec/10) : 0);
	me.countdown.getChildAt(4).setValue(sec>=10?(sec%10) : sec);
	time.current--;
}

//游戏结束
game.gameOver = function()
{
	trace("game over:", this.score);
	this.timer.pause();

//		if(this.overlay == null)
//		{
//			this.overlay = Q.createDOM("div", {id:"overlay", style:
//			{
//				position: "absolute",
//				width: this.width + "px",
//				height: this.height + "px",
//				background: "#000",
//				opacity: 0.4
//			}});
//		}
//		this.container.appendChild(this.overlay);

	
	this.state = STATE.OVER;
	this.stage.step();
	
	//保存分数
	//this.saveScore(this.score);
}

//重新开始
game.restart = function()
{
	trace("game restart");
	this.overlay.parentNode.removeChild(this.overlay);
	this.stage.removeAllChildren();
	this.timer.paused = false;
	this.showMenu();
	
	this.score = 0;
	this.time.current = this.time.total;
}

//获取保存的分数
game.getScore = function()
{
	var key = "dolphin_score";
	if(Q.supportStorage && localStorage.hasOwnProperty(key))
	{
		var score = Number(localStorage.getItem("dolphin_score"));
		return score;
	}
	return 0;
}

//保存分数到localStorage
game.saveScore = function(score)
{
	var key = "dolphin_score";
	if(Q.supportStorage)
	{
		localStorage.removeItem(key);
		localStorage.setItem(key, score);
	}
}

//显示当前FPS值
game.showFPS = function()
{
	var me = this, fpsContainer = Quark.getDOM("fps");
	setInterval(function()
	{
		fpsContainer.innerHTML = "FPS:" + me.frames;
		me.frames = 0;
	}, 1000);
}

//隐藏浏览器顶部导航
game.hideNavBar = function()
{
    window.scrollTo(0, 1);
}

//重新计算舞台stage在页面中的偏移
game.calcStagePosition = function()
{
    if(game.stage) 
    {
        var offset = Q.getElementOffset(game.stage.context.canvas);
        game.stage.stageX = offset.left;
        game.stage.stageY = offset.top;
    }
}
	
})();