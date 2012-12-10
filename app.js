var stage;
var canvas;
var screen_width;
var screen_height;
var ss;
var hero;
var heroData;
var flowerss;
var flower;
var frandomScales;
var frandomScale;
var randomScale;
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
		"flower-sprite.png",
		"flower-sprite2.png",
		"flower-sprite3.png"
	];
var img = new Image();
var img2 = new Image();

var rested;
var health = 100;

var numberOfImagesLoaded = 0;

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
	createjs.Touch.enable(stage);

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
	// stage.canvas.width = window.innerWidth - window.innerWidth/5;
	stage.canvas.width = window.innerWidth;
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

	frandomScales = [
	0.6,
	0.7,
	0.6,
	0.5,
	0.8
	];

	frandomScale = frandomScales[Math.floor(Math.random()*5)];

	ss = new createjs.SpriteSheet( heroData );

	flowerss = new createjs.SpriteSheet({
		images: [img2],
		frames: {width: 354.5, height: 661, regX: 80*frandomScale, regY: 0},
		animations: {
			grow: [0, 9, false, 2]
		}
	});

	flower = new createjs.BitmapAnimation(flowerss);
	flower.name = "flower1";
	flower.x = canvas.width/2;
	flower.y = canvas.height/2;

	hero = new createjs.BitmapAnimation(ss);

	hero.gotoAndPlay("fly");

	hero.shadow = new createjs.Shadow("rgba(0, 0, 0, 0.3)", 0, 5, 5);
	flower.shadow = new createjs.Shadow("rgba(0, 0, 0, 0.3)", 1, 6, 5);

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

	randomScale = randomScales[Math.floor(Math.random()*6)];

	hero.scaleX = randomScale;
	hero.scaleY = randomScale;

	hero.currentFrame = 0;

	flower.visible = false;
	rested = false;

	stage.addChild(flower);
	stage.addChild(hero);

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
		swipeUp: growTree
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
		if (flower) {
			flower.alpha -= 0.001;
			if (Math.floor(flower.alpha) < 0) {
				flower.visible = false;
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

	if (flower) {
		var pt = hero.localToLocal(0, 0, flower);
		if (flower.visible && flower.hitTest(pt.x, pt.y)) {
			// hero.gotoAndPlay("rest");
			rested = true;
		}
	}

	if (touched && !rested) {
		hero.y += Math.cos(createjs.Ticker.getTicks()/10)*10;
	}

	if (rested && flower.x < canvas.width/2) {
		hero.scaleX = -randomScale;
	} else {
		hero.scaleX = randomScale;
	}

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
}

function fly() {
	var randomposx = Math.floor(Math.random() * (canvas.width - 39)) + 20;
	var randomposy = Math.floor(Math.random() * (canvas.height - 119)) + 20;

	if (!touched) {
		if (flower && flower.visible) {
			createjs.Tween.get(hero).to({y: flower.y, x: flower.x+50}, 2500);
		} else {
			createjs.Tween.get(hero).to({y: randomposy, x: randomposx}, 3000);
		}
	}

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

	setTimeout(rotate, 2100);
}

function growTree () {
	if(!flower.visible) {
		var fHeight = flowerss.getFrame(3).rect.height;
		var fWidth = flowerss.getFrame(3).rect.width;
		flower.scaleY = frandomScale;
		flower.x = touchX;
		if (flower.x < canvas.width/2) {
			flower.scaleX = -frandomScale;
			flower.regX = fWidth / (3*frandomScale);
			flower.regY = fHeight / 9;
		} else {
			flower.scaleX = frandomScale;
			flower.regX = fWidth / 8;
			flower.regY = fHeight / 9;
		}

		flower.y = canvas.height-fHeight*frandomScale/1.2;
		flower.visible = true;
		flower.alpha = 1;
		flower.gotoAndPlay("grow");
	}
}

function flap () {
	var timeout;
	if (rested) {
		timeout = 1200;
		hero.gotoAndPlay('rest');
	} else {
		timeout = ss.getAnimation("fly").frequency * 2000;
		hero.gotoAndPlay('fly');
	}
	setTimeout(flap, timeout);
}

function flySpeed () {
	ss.getAnimation("fly").frequency = Math.round(100/health);
}