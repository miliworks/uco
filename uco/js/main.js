
(function(){

window.onload = function()
{
	game.init();
};

window.onresize = function()
{
    //game.resize();
}
	
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
    {id:"progress_mask", size:411, src:"images/progress_mask.png"},
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
    gametime: 0, // 当前游戏进行时长
    movetime: 0, // 等待移动

    // 全局参数
	GAMETIME_TOTAL: 30, // 每局时长
    MOVETIME_TOTAL: 5, // 多久角色移动一次
    GIFT_NUM: 3, // 奖品总数
    GIFT_WIDTH: 34, //

    dummy:null
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

};

//加载完成
game.onLoadComplete = function(e)
{
	e.target.removeAllEventListeners();
	Q.getDOM("container").removeChild(this.loader);
	this.loader = null;
	
	this.images = e.images;

	//启动游戏
	this.startup();
};

//获取图片资源
game.getImage = function(id)
{
	return this.images[id].image;
};

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
                    game.audio.play();

                    game.addGift(0);

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
    this.movetime = 0;
    this.gametime = 0;

    //背景
	if(this.bg == null)
	{
		var bg = new Q.Bitmap({id:"bg", image:this.getImage("bg")});
        this.bg = bg;
    }
    this.bg.x = 0;
    this.bg.y = 0;
    this.bg.width = this.width;
    this.bg.height = this.height;

    // 进度bar
    if(this.progressbar == null )
    {
        var progressbar = new ns.ProgressBar({id:"progressbar"});
        this.progressbar = progressbar;
    }

    // 奖品bar
    if(this.giftbar == null )
    {
        var giftbar = new ns.GiftBar({id:"giftbar"});
        this.giftbar = giftbar;
    }

    //创建avatar
    if(this.avatar == null )
    {
        var avatar = new ns.Avatar({id:"avatar"});
        this.avatar = avatar;
    }


    //每s游戏逻辑更新
    var delay = function()
    {
        me.timer.delay(function()
        {
            // 角色移动
            game.movetime++;
            if( game.movetime >= game.MOVETIME_TOTAL-1 )
            {
                game.avatar.move();
                game.movetime = 0;
            }

            // 游戏时间
            game.gametime++;
            game.progressbar.setProgress(Math.floor(game.gametime/game.GAMETIME_TOTAL*100));

            if( game.gametime >= game.GAMETIME_TOTAL )
                game.gameOver();
            else
                delay();
        }, 1000);
    }
    delay();
	
	//初始化avatar
	this.avatar.move();
	
	//添加所有对象到舞台
	this.stage.addChild(this.bg, this.progressbar, this.giftbar, this.avatar);
	
	//显示倒计时
	//this.showTimer();
	//显示得分
	//this.updateScore();
};

game.addGift = function(type)
{
    var giftid = Math.floor(Math.random() * game.GIFT_NUM);
    var gift = new Q.Bitmap({id:"gift", image:game.getImage("gift"), rect:[giftid*game.GIFT_WIDTH,0,game.GIFT_WIDTH,game.GIFT_WIDTH]});

    this.giftbar.addGift(gift);
}

game.resize = function()
{
    this.container = Q.getDOM("container");
    this.width = this.container.clientWidth;
    this.height = this.container.clientHeight;

    if(this.bg != null)
    {
        this.bg.width = this.width;
        this.bg.height = this.height;
    }

    if( this.stage != null )
    {
        this.stage.width = this.width;
        this.stage.height = this.height;
    }

    if( this.context != null )
    {
        this.context.width = this.width;
        this.context.height = this.height;
    }
};

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

    var txt = new Q.Text({font: Q.isMobile ?  'bold 48px 黑体' : 'bold 48px 宋体', color: "#000", textShadow: Q.isAndroid ? "0 2px 2px #111" : "0 2px 2px #ccc", text:"游戏结束", width:game.width, height:100, lineWidth:game.width, lineSpacing:0, textAlign:"center"});
    txt.x = 0;
    txt.y = (game.height-100)/2;
    game.stage.addChild(txt);
	
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