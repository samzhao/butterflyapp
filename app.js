var stage;
var canvas;
var screen_width;
var screen_height;
var ss;
var hero;
var heroData;
var flower;
var touchX;
var touched = false;
var heroSprites = [
		"sprite.png",
		"sprite2.png",
		"sprite3.png",
		"sprite4.png",
		"sprite5.png"
	];
var flowerSprites = [
		"monsterflower.png"
	];
var img = new Image();
var img2 = new Image();

var rested;
var health = 100;

var numberOfImagesLoaded = 0;

var circle;

var touchSupport = 'ontouchstart' in window || 'onmsgesturechange' in window;

window.addEventListener('resize', resize, false);

function preload (imgs, callback) {
	var loaded = 0;
	$(imgs).each(function (){
		var image = new Image();
		image.src = this;
		image.onload = function() {
			if (++loaded == imgs.length && callback) {
				callback();
			}
		};
		image.onerror = function(e){
			alert("Error loading Image: " + e.target.src);
		};
	});
}

$(function(){
	preload(heroSprites.concat(flowerSprites), function(){
		$('.start').on('click', function(){
			$(this).fadeOut(500, function(){
				$('.cover').fadeOut(1000);
				init();
			});
		});
	});
});

// document.addEventListener("touchstart", function(){}, true);

function init() {
	canvas = document.getElementById("canvas");
	stage = new createjs.Stage(canvas);

	stage.snapToPixelEnabled = true;
	createjs.Touch.enabled = true;

	img.onload = handleImageLoad;
	img.src = heroSprites[Math.floor(Math.random()*heroSprites.length)];

	img2.onload = handleImageLoad;
	img2.src = flowerSprites[Math.floor(Math.random()*flowerSprites.length)];

	createjs.Ticker.addListener(this);

	resize();

	// canvas.width = $(window).attr('screen').width;
	// canvas.height = $(window).attr('screen').height;

	$('.life').html(health);
}

function resize () {
	stage.canvas.width = window.innerWidth - window.innerWidth/5;
	stage.canvas.height = window.innerHeight;
}

function reset () {
	stage.removeAllChildren();
	createjs.Ticker.removeAllListeners();
	stage.update();
}

function handleImageLoad (e) {
	numberOfImagesLoaded++;

	if (numberOfImagesLoaded == 2) {
		numberOfImagesLoaded = 0;
		startGame();
	}
}

function startGame () {
	screen_width = canvas.width;
	screen_height = canvas.height;

	heroData = {
		images: [img],
		frames: {width: 142, height: 101, regX: 81, regY: 78},
		animations: {
			fly: {
				frames: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16],
				next: "fly",
				frequency: 1
				},
			rest: [17, 25, "rest", 4]
		}
	};

	ss = new createjs.SpriteSheet( heroData );

	var flowerss = new createjs.SpriteSheet({
		images: [img2],
		frames: {width: 64, height: 64, regX: 32, regY: 32},
		animations: {
			grow: [0, 10]
		}
	});

	flower = new createjs.BitmapAnimation(flowerss);
	flower.name = "monsteridle1";
	flower.x = canvas.width/2;
	flower.y = canvas.height/2;

	hero = new createjs.BitmapAnimation(ss);

	// hero.regX = hero.spriteSheet.frameWidth / 2 | 0;
 //    hero.regY = hero.spriteSheet.frameHeight / 2 | 0;

	hero.gotoAndPlay("fly");

	hero.shadow = new createjs.Shadow("rgba(0, 0, 0, 0.3)", 0, 5, 5);

	hero.name = "hero1";
	hero.direction = 90;
	hero.vX = 1;
	hero.vY = 0;
	hero.x = screen_width/2;
	hero.y = screen_height/2;

	var randomScales = [
		0.9,
		0.8,
		1,
		1.2,
		1.3,
		1.4
	];

	var randomScale = randomScales[Math.floor(Math.random()*6)];

	hero.scaleX = randomScale;
	hero.scaleY = randomScale;

	hero.currentFrame = 0;

	circle = stage.addChild(new createjs.Shape());
	circle.graphics.beginFill("lightblue").drawCircle(50,50,50);
	circle.visible = false;
	rested = false;

	stage.addChild(hero);
	// stage.addChild(flower);

	createjs.Ticker.useRAF = true;
	createjs.Ticker.setFPS(60);

	hero.onPress = function(evt) {
		reduceHealth();
		flySpeed();
		touched = true;
	};

	stage.onMouseUp = function(evt) {
		touched = false;
	};

	// circle.onPress = function(e) {
	//	e.onMouseMove = function(evt){
	//		e.target.x = evt.stageX;
	//		e.target.y = evt.stageY;
	//	};
	// };
	
	if (touchSupport) {
		canvas.ontouchstart = function(e){
			touchX = e.touches[0].pageX - canvas.width/5;
		};
	} else {
		stage.onMouseMove = function(e){
			touchX = stage.mouseX;
		};
	}

	$("canvas").swipe({
		swipeUp: function(){
			growTree();
		}
	});

	flap();
	fly();
	rotate();

	// hero.y = fly.random;
}

function tick () {
	if (Math.round(health) > 0) {
		if (rested) {
			if (Math.round(health) < 100) {
				health += 0.05;
			} else {
				health = health;
			}
		} else {
			health -= 0.05;
		}
		if (circle) {
			circle.alpha -= 0.001;
			if (Math.floor(circle.alpha) < 0) {
				circle.visible = false;
			}
		}
		createjs.Tween.get(hero).to({alpha: health/100}, 500);
	} else {
		reset();
		dead();
	}
	$('.life').html(Math.round(health));

	if (hero.x >= screen_width - 16) {
		hero.direction = -90;
	}

	if (hero.x < 16) {
		hero.direction = 90;
	}

	if (hero.direction == 90) {
		// hero.x += hero.vX;
		if (!rested && !touched) {
			hero.x += Math.sin(createjs.Ticker.getTicks()/20)*5;
		}
		hero.y += hero.vY;
	}
	else {
		// hero.x -= hero.vX;
		if (!rested && !touched) {
			hero.x -= Math.sin(createjs.Ticker.getTicks()/20)*5;
		}
		hero.y -= hero.vY;
	}
	rested = false;

	if (circle) {
		var pt = hero.localToLocal(0, 0, circle);
		if (circle.visible && circle.hitTest(pt.x, pt.y)) {
			// hero.gotoAndPlay("rest");
			rested = true;
		}
	}

	if (touched && !rested) {
		hero.y += Math.cos(createjs.Ticker.getTicks()/10)*10;
	}

	// MOUSE FOLLOW DIRECTION AND ROTATION
	// var diffX = stage.mouseX - flower.x;
	// var diffY = stage.mouseY - flower.y;

	// flower.x += diffX/20;
	// flower.y += diffY/20;

	// flower.rotation = Math.atan2(diffY, diffX) * 180 / Math.PI + 90;
	// END OF MOUSE FOLLOW DIRECTION AND ROTATION

	stage.update();
}

function reduceHealth() {
	health -= 15;
	if (Math.round(health) < 1) {
		reset();
		dead();
		// init();
	}
}

function dead () {
	$('.dead').fadeIn(300, function(){
		$('.life').html("x_x");
	});
	$('.again').on('click', function(){
		location.reload();
	});
	// $('.dead').fadeIn().on('click', function(){
	//	$(this).fadeOut();
	//	// health = 100;
	//	// $('.life').html(health);
	//	// startGame();
	// });
}

function fly() {
	// createjs.Tween.get(hero).to({y: (Math.floor(Math.random() * (300 - 20 + 1)) + 20)}, 300);
	var randomposx = Math.floor(Math.random() * (canvas.width - 39)) + 20;
	var randomposy = Math.floor(Math.random() * (canvas.height - 119)) + 20;
	// var randomtime = Math.floor(Math.random() * (3500-1001)) + 1000;
	if (!touched) {
		if (circle && circle.visible) {
			createjs.Tween.get(hero).to({y: circle.y, x: circle.x+50}, 2500);
		} else {
			createjs.Tween.get(hero).to({y: randomposy, x: randomposx}, 3000);
		}
	}
	// createjs.Tween.get(hero).to({x: randomx}, 3000).wait(500);
	// hero.y = randomy;
	// hero.x = randomx;
	setTimeout(fly, 3100);
}

function rotate () {
	var randomsign = Math.random() < 0.5 ? -1 : 1;
	var randomrot = (Math.floor(Math.random() * 101) + 1) * randomsign;
	if (!rested) {
		createjs.Tween.get(hero).to({rotation: randomrot}, 2000);
	} else {
		createjs.Tween.get(hero).to({rotation: 0}, 1000);
	}
	// hero.rotation += ;
	setTimeout(rotate, 2100);
}

function growTree () {
	if(!circle.visible) {
		// circle.x = canvas.width/2-50;
		circle.x = touchX - 50;
		circle.y = canvas.height-100;
		circle.visible = true;
		circle.alpha = 1;
	}
}

function flap () {
	var timeout;
	if (rested) {
		timeout = 1200;
		hero.gotoAndPlay('rest');
	} else {
		timeout = ss.getAnimation("fly").frequency * 2000;
		console.log(timeout);
		hero.gotoAndPlay('fly');
	}
	setTimeout(flap, timeout);
}

function flySpeed () {
	ss.getAnimation("fly").frequency = Math.round(100/health);
}