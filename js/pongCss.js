
/*TODO: change the court before rule, so that it will reflect the court size
android-zvok (native menu?&phonegap in hibriden aplikacije), izhod iz aplikacije, pause button ipd
spreminjanje hitrosti glede na stevilo odigranih iger
Ploscice...Drugi mozni nacini premikanja (dodajanje sence, morda tranzicije) //zakaj pravzaprav pri tranziciji sam od sebe doda senco

Wait for DOM loaded?(mogoce je dovolj da se klice skripta iz bodya?)*/

var PLAYER_HEIGHT=court_height*0.3;
var PLAYER_WIDTH=50; 	/*zaenkrat konstantno 50px, morda bi lahko bila odvisna od velikosti zaslona*/
var court_height=300;  
var court_width=600;
var BALL_WIDTH=20;
//var change_level_at_points=2;
//var games_played=0;
var timing_interval=4; //6 sec to travell the courts witdth
var timing_factor=court_width/timing_interval; //timing_factor (celo igrisce 600px/s)
var dist;                //distance the ball needs to travel
var current_player="p1"; //direction the ball is headed to
var upper_bound;         //upper bound of the court
var lower_bound;         //lower bound of the court
var left_bound;			 //left bound of the court
var right_bound			 //right bound of the court
var ball_radius;		 //
var scorep1=0;			//current score of each player
var scorep2=0;
var player1= document.getElementById("player1");
var player2= document.getElementById("player2");
var playing=false; //current state of the game (to prevent the resize function to trigger a transition (for unknown reason)of the ball)
//console.log(player1+" "+player2);	
//var player_scored_modal_stage=0;

var play_sound=true;
var collision_player_sound;
var collision_wall_sound;
var miss_sound;



/*
Funkcija, ki resiza igrisce glede na zeljeno razmerje med visino in sirino...in na ta nacin prisili userja, da obrne zaslon nna mobilnem telefonu v landscape mode
*/
/*Hmm...Zakaj izgleda kot da browser ne klice tega, ko se resiza(n.b to velja samo za emulator->refresh)?
in kaj je fora s  temi napacnimi vrednosti TODO :   preveri kako pravzaprav izves a browser sporoca pr ave vrednos ti (t.j
a se je dogodek z izvrsil in sporocene vrednos ti odrazajo dejanske ...morda pocakaj na konec resizanja...mogoce to sprozi 
kak dogodek in potem preveri vrednosti)
(Mystery)Zakaj ta resize sprozi tranzitionend event??*/
function resizeGame() {
	console.log("resize")
    var gameArea = document.getElementById('gameArea');
    var widthToHeight = 6 / 3;
    var newWidth = window.innerWidth;
    var newHeight = window.innerHeight;
    var newWidthToHeight = newWidth / newHeight;
    
    if (newWidthToHeight > widthToHeight) {
        newWidth = newHeight * widthToHeight;
        gameArea.style.height = newHeight + 'px';
        gameArea.style.width = newWidth + 'px';
    } else {
        newHeight = newWidth / widthToHeight;
        gameArea.style.width = newWidth + 'px';
        gameArea.style.height = newHeight + 'px';
    }
    
    gameArea.style.marginTop = (-newHeight / 2) + 'px';
    gameArea.style.marginLeft = (-newWidth / 2) + 'px';
    gameArea.style.fontSize = (newWidth / 600) + 'em';
	
    var gameCanvas = document.getElementById('court');
    gameCanvas.width = newWidth;
    gameCanvas.height = newHeight;
	//var r=newWidth*0.1;
	//document.getElementById('court').setAttribute("style","width:"+r+"px");
	//document.getElementById('court').setAttribute("style","height:"+r+"px");
	
	court_height=gameCanvas.height;
	court_width=gameCanvas.width;
	
	document.getElementById('game_title').style.fontSize=(newWidth / 600) + 'em';
	
	/*var ball=document.getElementById('ball')
	ball.width=(newWidth*0.1);
	ball.height=(newWidth*0.1);
	var properties = window.getComputedStyle(ball, null);
	console.log("BALL COMPUTED W:"+ properties.height+" H:"+properties.width);
	console.log("BALL W:"+ ball.height+" H:"+ball.width)*/
	
	//var horizontal = document.getElementById('horizontal');
    //horizontal.height=newHeight*0.1;
	
   // player1.height=(newHeight*(1/3));
	//console.log("P1:"+player1.height)	;
	//console.log("court:"+document.getElementById('court').height)
	//PLAYER_HEIGHT=document.getElementById('player1').height;
	//PLAYER_WIDTH=document.getElementById('player1').width;
	PLAYER_HEIGHT=court_height*0.3;
	//console.log("Player width "+PLAYER_WIDTH+" Player height "+PLAYER_HEIGHT);
	//console.log("Court width "+court_width+" Court height "+court_height);
	timing_factor=court_width/timing_interval;
	
	document.body.style.width = newWidth+"px";//change the body height 
	document.body.style.height = newHeight+"px";
	player1.style.top="0px"; //reposition the player so that it stays on the court after resize
	player2.style.top="0px";
	//console.log("Body width "+document.body.style.width+" Court height "+document.body.style.height);
	init_variables(); 

}


function initPlayer(player){
	var p1top, // left position of moving box
	starty, // starting x coordinate of touch point
	dist = 0, // distance traveled by touch point
	touchobj = null; // Touch object holder
	
	/*TOUCH HANDLERS*/
	player.addEventListener('touchstart', function(e){
	  e.preventDefault() // prevent default click behavior
	  touchobj = e.targetTouches[0] // reference first touch point
	  p1top = parseInt(player.offsetTop) // get left position of box
	  starty = parseInt(touchobj.pageY) // get y coord of touch point
	 // console.log("p1 top:"+p1top+" Start y:"+starty); 
	}, false)

	player.addEventListener('touchmove', function(e){
	  e.preventDefault();
	  touchobj = e.targetTouches[0] // reference first touch point for this event
	  var dist = parseInt(touchobj.pageY) - starty // calculate dist traveled by touch point
	 // move box according to starting pos plus dist with lower limit 0 and upper limit 380 so it doesn't move outside track:
	  if((p1top + dist)< 0) player.style.top=0+"px";
	  else if((p1top + dist+PLAYER_HEIGHT)>court_height)player.style.top= ((court_height)-PLAYER_HEIGHT)+"px";
	  else player.style.top= (p1top + dist)+"px";
	 }, false)
	 
	 /*MOUSE HANDLERS*/
	 player.addEventListener('mousedown', function(e){
	  e.preventDefault() // prevent default click behavior
	  p1top = parseInt(player.offsetTop) // get left position of box
	  starty = parseInt(e.pageY) // get y coord of touch point
	  //console.log("p1 top:"+p1top+" Start y:"+starty); 
	 }, false)

	 player.addEventListener('mousemove', function(e){
	 e.preventDefault();
	var dist = parseInt(e.pageY) - starty // calculate dist traveled by touch point
		if((p1top + dist)< 0) player.style.top=0+"px";
	    else if((p1top + dist+PLAYER_HEIGHT)>court_height)player.style.top= ((court_height)-PLAYER_HEIGHT)+"px";
	    else player.style.top= (p1top + dist)+"px";
	 }, false)
}


/*NASTAVI EVENT LISTENERJE ZA POSAMEZNEGA IGRALCA*/
/*to do...Preveri kaj je s temi Target_tuches in kako pogosto se osvezuje vse skupaj*/
/*function initP1(){
	var p1 = player1,
	p1top, // left position of moving box
	starty, // starting x coordinate of touch point
	dist = 0, // distance traveled by touch point
	touchobj = null; // Touch object holder
	//var playerBottom=(150)*0.9-(PLAYER_HEIGHT/2);
	//var playerTop=-(150)*0.9+(PLAYER_HEIGHT/2);
	var ts=checkTouchStartSupportTS();
	 p1.addEventListener('touchstart', function(e){
	  e.preventDefault() // prevent default click behavior
	  touchobj = e.targetTouches[0] // reference first touch point
	  p1top = parseInt(p1.offsetTop) // get left position of box
	  starty = parseInt(touchobj.pageY) // get y coord of touch point
	  console.log("p1 top:"+p1top+" Start y:"+starty); 
	 }, false)

	 p1.addEventListener('touchmove', function(e){
	 e.preventDefault();
	  touchobj = e.targetTouches[0] // reference first touch point for this event
	  var dist = parseInt(touchobj.pageY) - starty // calculate dist traveled by touch point
	 // move box according to starting pos plus dist
	 // with lower limit 0 and upper limit 380 so it doesn't move outside track:
	 // p1.style.top = ( (p1top + dist > (court_height*0.7))? (court_height*0.7) : (p1top + dist < 0)? 0 : p1top + dist ) + 'px'
	  if((p1top + dist)< 0) p1.style.top=0+"px";
	  else if((p1top + dist+PLAYER_HEIGHT)>court_height)p1.style.top= ((court_height)-PLAYER_HEIGHT)+"px";
	  else p1.style.top= (p1top + dist)+"px";
	  //if(p1top>(court_height)) p1.style.top= (court_height-PLAYER_HEIGHT)+"px";
	  //if(p1top(court_height/2) )p1.style.top= playerTop+"px";
	   //console.log("dist:"+dist+"p1 top:"+p1top);
	  // console.log(court_height+" W:"+court_width);
	  // p1top+=dist;
	  
	 }, false)
	  p1.addEventListener('mousedown', function(e){
	  e.preventDefault() // prevent default click behavior
//touchobj = e.targetTouches[0] // reference first touch point
	  p1top = parseInt(p1.offsetTop) // get left position of box
	  starty = parseInt(e.pageY) // get y coord of touch point
	  console.log("p1 top:"+p1top+" Start y:"+starty); 
	 }, false)

	 p1.addEventListener('mousemove', function(e){
	 e.preventDefault();
	 //touchobj = e.targetTouches[0] // reference first touch point for this event
	 var dist = parseInt(e.pageY) - starty // calculate dist traveled by touch point
	 // move box according to starting pos plus dist
	 // with lower limit 0 and upper limit 380 so it doesn't move outside track:
	 // p1.style.top = ( (p1top + dist > (court_height*0.7))? (court_height*0.7) : (p1top + dist < 0)? 0 : p1top + dist ) + 'px'
	  if((p1top + dist)< 0) p1.style.top=0+"px";
	  else if((p1top + dist+PLAYER_HEIGHT)>court_height)p1.style.top= ((court_height)-PLAYER_HEIGHT)+"px";
	  else p1.style.top= (p1top + dist)+"px";
	  //if(p1top>(court_height)) p1.style.top= (court_height-PLAYER_HEIGHT)+"px";
	  //if(p1top(court_height/2) )p1.style.top= playerTop+"px";
	   //console.log("dist:"+dist+"p1 top:"+p1top);
	  // console.log(court_height+" W:"+court_width);
	  // p1top+=dist;
	  
	 }, false)
 }
 
 function initP2(){
 
	var p2 = player2,
	p2top, // left position of moving box
	starty, // starting x coordinate of touch point
	dist = 0, // distance traveled by touch point
	touchobj = null; // Touch object holder
	 
	  p2.addEventListener('touchstart', function(e){
		  e.preventDefault() // prevent default click behavior
		  touchobj = e.targetTouches[0] // reference first touch point
		  p2top = parseInt(p2.offsetTop) // get left position of box
		  starty = parseInt(touchobj.pageY) // get y coord of touch point
		  console.log("p2 top:"+p2top+" Start y2:"+starty); 
	 }, false)

	 p2.addEventListener('touchmove', function(e){
	 e.preventDefault();
	 touchobj = e.targetTouches[0] // reference first touch point for this event
	 var dist = parseInt(touchobj.pageY) - starty // calculate dist traveled by touch point
	 // move box according to starting pos plus dist
	 // with lower limit 0 and upper limit 380 so it doesn't move outside track:
	 // p1.style.top = ( (p1top + dist > (court_height*0.7))? (court_height*0.7) : (p1top + dist < 0)? 0 : p1top + dist ) + 'px'
	  if((p2top + dist)< 0) p2.style.top=0+"px";
	  else if((p2top + dist+PLAYER_HEIGHT)>court_height)p2.style.top= ((court_height)-PLAYER_HEIGHT)+"px";
	  else p2.style.top= (p2top + dist)+"px";
	  //if(p1top>(court_height)) p1.style.top= (court_height-PLAYER_HEIGHT)+"px";
	  //if(p1top(court_height/2) )p1.style.top= playerTop+"px";
	   //console.log("dist:"+dist+"p1 top:"+p1top);
	  // console.log(court_height+" W:"+court_width);
	  // p1top+=dist;
	  
	 }, false)
}*/
// Checks to see if the specified rule is within 
// any of the style sheets found in the document;
// returns the animation object if so
// search the CSSOM for a specific -webkit-keyframe rule

/*BALL OBJECT*/
ball={
	x: 0,
	y: 0,
	k: 0,
	n: 0,
	//ball: document.getElementById('ball'),
   print_ball: function() {
		console.log("x:"+this.x+" y:"+this.y+" k:"+this.k+" n:"+this.n);
   },
   
   init_ball: function() {
    this.x= 0;
	this.y=0;
	this.n=0;
	this.k=getNextRandomK();
	   /*if(current_player=="p1"){
			this.k=1;
		}else {
			this.k=-1;
		}*/
   }	
};

function newGame(){
	
}


/*initialize*/
function start_game(){
	  playing=true;
	   console.log("start new game");
       ball.init_ball();
	   //document.getElementsByClassName("ball1")[0].style.webkitTransform="translate3d(100px,0,0)";
	   callculateNearestCollisionPoint();
	   start_transition();
	  // games_played++;
	  //callculateNearestCollisionPoint();
}


function start_transition(){
	//document.getElementsByClassName("ball1")[0].classList.remove('objectLeft');
	//document.getElementsByClassName("ball1")[0].classList.add('objectLeft');
	//hitrost=pot/cas  cas=pot/hitrost
	var timing= dist/timing_factor;
	document.getElementById('ball').style['-webkit-transition-duration'] = timing+'s';  
	//console.log(document.getElementById('ball').style['-webkit-transition-duration']);
	//console.log("start transition:"+ball.x+" "+ball.y);
	document.getElementsByClassName("ball1")[0].style.webkitTransform="translate3d("+ball.x+"px,"+ball.y+"px,0)";
	//document.getElementsByClassName("ball1")[0].classList.remove('objectLeft');
}

/*Every time a transition end event occurs for the ball element, check what happened to the ball*/
function transition_end(){
//check if the ball hit the wall
	if(CheckCollisionWall()){ //se je zaletel v steno
		//alert("Hit the wall");
		callculateNearestCollisionPoint();
		start_transition();
	}
	//se je zaletel v playerja
	else if(checkCollisionPlayer()){
		//alert("Hit the player");
		if(current_player=="p1")current_player="p2";
		else current_player="p1";
		callculateNearestCollisionPoint();
		start_transition();
	}
	//missed the ball
	else{ 
		playing=false;
		playSound("miss");
		if(current_player=="p1"){
		   scorep2+=1;
		   document.getElementById("p2Score").innerHTML=scorep2;
		   current_player="p2";
		}
		else{ 
			scorep1+=1;
			document.getElementById("p1Score").innerHTML=scorep1;
			current_player="p1";
		}
		changeLevelTiming();
		//alert(current_player +" Missed the ball");
		moddal_appear();
		
	}
	//dodaj tocke current player...Restart the game
}

function moddal_appear(){
		//console.log("modal appear");
		var d=document.getElementById('body');
		//d.className = d.className + "modal-active";
		d.classList.add("modal-active");
		if(current_player=="p1"){
			document.getElementById('modal_box').style.left="5%";
			document.getElementById('modal_box').innerHTML="P1\nScores!";
			}
		else{
			document.getElementById('modal_box').innerHTML="P2\nScores!";
			document.getElementById('modal_box').style.left="65%";
		}
		//start_game();
		window.setTimeout(modal_hide,2000);
}
function modal_hide(){
	//console.log("modal hide");
	var d=document.getElementById('body');
	d.classList.remove("modal-active");
}

/*true: se je zadel v steno (oziroma bolje v enega izmed stropov)*/
function CheckCollisionWall(){
	if(ball.y==upper_bound || ball.y==lower_bound) {
		playSound("hit_wall");
	 return true;
	 }
	return false;
}

/*se je zaletel v igralca*/
function checkCollisionPlayer(){
	var p,b,pTop;
	//b=document.getElementById("ball");
	//console.log("CHECK COLLISION");
	var ball_y=ball.y+court_height/2;
	if(current_player=="p1"){
		p=document.getElementById("player1");		
	}else{
		p=document.getElementById("player2");		
	}
	pTop=parseInt(p.offsetTop);
	//console.log("player top: "+(pTop)+"Ball_y "+(ball_y));
	if( ball_y <  pTop) return false;
	if(ball_y> (pTop+PLAYER_HEIGHT) ) return false;
	playSound("hit_player");
	//alert("Collision");
	return true;
}

/*Compute the nearest collision collision point for the ball (either with the wall are the player)
calculate nearest x,y coordinates,  set k and n for the trajectory line*/
function callculateNearestCollisionPoint(){
	var x1,x2,y1,y2,dist1,dist2,randomK;
	//console.log("old ball:");ball.print_ball();
	//console.log("PLAYER: "+current_player);
	if(current_player=="p1"){
		//console.log("PLAYER: "+current_player);
		//find nearest collision point either on y=-court_height/2 OR x=-court_width/2(Ball going up)
		if(ball.k>0){
			//y=ball.x*k+n  y=-court_height/2  => -court_height/2=ball.x*k+n  =>ball.x=((-court_height/2)-ball.n)/ball.k
			x1=((upper_bound)-ball.n)/ball.k;
			y1=upper_bound; //THE WALL
			x2=left_bound;
			y2=ball.k*(left_bound)+ball.n
			//console.log(x1+" "+y1+" "+x2+" "+y2);
			dist1=calculateDistanceBetweenPoints(x1, y1);
			dist2=calculateDistanceBetweenPoints(x2, y2);
			//console.log("k>0 dist1 "+dist1+" dist2"+dist2);
			//if( dist1<dist2 ) {dist=dist1; ball.x=x1;ball.y=y1; }
			//else{ dist=dist2; ball.x=x2; ball.y=y2;}		
			//ball.k=ball.k*(-1);
			//ball.n=(ball.y)-(ball.k*ball.x)
			//console.log("new ball k>0:");ball.print_ball();
		}
		//find nearest collision point either on y=+court_height/2 OR x=-court_width/2(Ball going down)
		else{
			//y=ball.x*k+n  y=+court_height/2  => +court_height/2=ball.x*k+n  =>ball.x=((+court_height/2)-ball.n)/ball.k
			x1=((lower_bound)-ball.n)/ball.k;
			y1=lower_bound;
			x2=left_bound;
			y2=ball.k*(left_bound)+ball.n
			//console.log(x1+" "+y1+" "+x2+" "+y2);
			dist1=calculateDistanceBetweenPoints(x1, y1);
			dist2=calculateDistanceBetweenPoints(x2, y2);
			//console.log("k<0 dist1 "+dist1+" dist2"+dist2);
			//if( dist1<dist2){dist=dist1;ball.x=x1; ball.y=y1;}
			//else{dist=dist2; ball.x=x2; ball.y=y2;}
			//ball.k=ball.k*(-1);
			//ball.n=(ball.y)-(ball.k*ball.x)
			//console.log("new ball k<0:");ball.print_ball();	
		}

		
		
		
	}else{
	//console.log("PLAYER: "+current_player);
	if(ball.k<0){
				//y=ball.x*k+n  y=+court_height/2  => +court_height/2=ball.x*k+n  =>ball.x=((+court_height/2)-ball.n)/ball.k
			x1=(upper_bound-ball.n)/ball.k;//presecisce s spodnjo osjo
			y1=upper_bound;
			x2=right_bound;
			y2=ball.k*(right_bound)+ball.n
			//console.log(x1+" "+y1+" "+x2+" "+y2);
			dist1=calculateDistanceBetweenPoints(x1, y1);
			dist2=calculateDistanceBetweenPoints(x2, y2);
			//console.log("k<0 dist1 "+dist1+" dist2"+dist2);
			//if( dist1<dist2 ){ball.x=x1; ball.y=y1; dist=dist1;}
			//else{ball.x=x2; ball.y=y2; dist=dist2;}
			//ball.k=ball.k*(-1);
			//ball.n=(ball.y)-(ball.k*ball.x)
			//console.log("new ball k<0:");ball.print_ball();	

		}
		//K>1 <moving down
		//find nearest collision point either on y=+court_height/2 OR x=-court_width/2(Ball going down)
		else{
		    //y=ball.x*k+n  y=-court_height/2  => -court_height/2=ball.x*k+n  =>ball.x=((-court_height/2)-ball.n)/ball.k
			x1=((lower_bound)-ball.n)/ball.k;
			y1=lower_bound;
			x2=right_bound;
			y2=(ball.k*(right_bound))+ball.n
			//console.log(x1+" "+y1+" "+x2+" "+y2);
			dist1=calculateDistanceBetweenPoints(x1, y1);
			dist2=calculateDistanceBetweenPoints(x2, y2);
			//console.log("k>0 dist1 "+dist1+" dist2"+dist2);
			//if( dist1<dist2 ) {ball.x=x1;ball.y=y1;dist=dist1; }
			//else { ball.x=x2; ball.y=y2;dist=dist2;}
			//ball.k=ball.k*(-1);
			//ball.n=(ball.y)-(ball.k*ball.x)
			//console.log("new ball k>0:");ball.print_ball();
		}
	}
	if( dist1<dist2 ) {ball.x=x1;ball.y=y1;dist=dist1; }
    else { ball.x=x2; ball.y=y2;dist=dist2;}
	//start_transition();
    randomK=getNextRandomK();
	//console.log("randomK "+randomK+" ball.k "+ball.k)
	ball.k=randomK*(-1);
	ball.n=(ball.y)-(ball.k*ball.x)
	if(!isInsideCourt(ball.x,ball.y)) alert("Errror send the ball outside the court!");
}



//var ball;

/*HELPER FUNKCIJE*/
function playSound(sound){
	if(play_sound){
		if(sound=="miss"){
			miss_sound.play();
			miss_sound.currentTime = 0;
		}else if(sound=="hit_wall"){
			collision_wall_sound.play();
			collision_wall_sound.currentTime = 0;
		}else if(sound=="hit_player"){
			collision_player_sound.play();
			collision_player_sound.currentTime = 0;
		}
	}
}

//Check if ball is inside the court
function isInsideCourt(x,y){
	/*if(y>(court_height/2)+1) return false;
	if(y<-(court_height/2)-1)return false;
	if(x> ((court_width/2)-PLAYER_WIDTH) )return false;
	if(x< ((-court_width/2))+PLAYER_WIDTH) return false;*/
	if(y>lower_bound+1) return false;
	if(y<upper_bound-1)return false;
	if(x> right_bound )return false;
	if(x< left_bound) return false;
	return true;	
}

/*Returns a random number from the array of possible k values
it will not change the k sign (if current k<0 return k<0)*/
function getNextRandomK(){
	var items=Array(2.25,2,1.5,1.25,1,0.75,0.5,0.25,0.1);
	var k = items[Math.floor(Math.random()*items.length)];
	//console.log("items "+items+" item "+item);
	if(ball.k<0) k=k*-1;
	//else k=item;
	//console.log("nextk "+k)
	return k;
}

//Distance between 2 points c=sqrt(a^2+b^2)
function calculateDistanceBetweenPoints(x, y){
	//ball's x,y
	var dist=Math.sqrt( Math.pow(ball.x-x,2)  + Math.pow(ball.y-y,2) );
	//console.log("dist "+dist);
	return dist;
}

//check if both users reached a certain number of points and change the level(change the speed of the ball)
function changeLevelTiming(){
	/*if (timing_interval>1){
		//console.log("timing")
		//console.log("Timing interval "+(scorep1%change_level_at_points==0)+" timing factor " +(scorep2%change_level_at_points==0));
		if( ( (scorep1<scorep2)&& (scorep1%change_level_at_points==0 ))||( (scorep2<=scorep1)&&(scorep2%change_level_at_points==0)) ){
			timing_interval-=1;
			timing_factor=court_width/timing_interval;
			//console.log("Timing interval "+timing_interval+" timing factor" +timing_factor);
		}		
	}*/
	if(timing_interval>1){
	timing_interval-=0.1;
	timing_factor=court_width/timing_interval;
	}	
	console.log("Timing interval "+timing_interval+" timing factor " +timing_factor);
}

/*ZACETNE FUNKCIJE ZA INCIALIZACIJO*/
function init_variables(){
	ball_radius=court_width*0.03; //ball width=3% court_width;
    upper_bound=-(court_height/2)+(ball_radius/2);
	lower_bound=(court_height/2)-(ball_radius/2);
	left_bound=(-court_width/2)+PLAYER_WIDTH+(ball_radius/2);
	right_bound=(court_width/2)-PLAYER_WIDTH-(ball_radius/2);
	}
/*Android sound*/
function playAudioAndroid() {
	console.log("PLAY AUDI ANDROID");
	if(play_sound){	
		var audioElement =document.getElementById("collision_player");
		var url = '/android_asset/www/'+audioElement.getAttribute('src');
		collision_player_sound = new Media(url,
				// success callback
				 function () { console.log("playAudio():Audio Success"); },
				// error callback
				 function (err) { console.log("playAudio():Audio Error: " + err); }
		);
		audioElement =document.getElementById("collision_wall");
		url = '/android_asset/www/'+audioElement.getAttribute('src');
		collision_wall_sound = new Media(url,
				// success callback
				 function () { console.log("playAudio():Audio Success"); },
				// error callback
				 function (err) { console.log("playAudio():Audio Error: " + err); }
		);
		audioElement =document.getElementById("miss_sound");
		url = '/android_asset/www/'+audioElement.getAttribute('src');
		miss_sound = new Media(url,
				// success callback
				 function () { console.log("playAudio():Audio Success"); },
				// error callback
				 function (err) { console.log("playAudio():Audio Error: " + err); }
		);
			   // Play audio
		//my_media.play();
	}
}
	
function init_sound(){
	 /*initialze the audio elements if the play_sound is enabled*/
	if(play_sound){	
		// Initialise the collision sound for player
		collision_player_sound = document.getElementById("collision_player");
		// Initialise the collision sound for wall
	    collision_wall_sound = document.getElementById("collision_wall");
		// Initialise the fail to hit the ball
		miss_sound = document.getElementById("miss_sound");
		//console.log(collision_player_sound )
	}
}	

window.addEventListener('resize', resizeGame, false);
window.addEventListener('orientationchange', resizeGame, false);
 //to prevent scrolling effect since (overflow hidden does not seem to do it)
 //but now i can not tap buttons
document.body.addEventListener('touchstart', function(e){ e.preventDefault(); });
document.getElementById('start_button').addEventListener('touchstart', function(e){ start_game(); });

document.getElementById('ball').addEventListener( 'webkitTransitionEnd', function( event ) {
	//alert("TransitionEnd "+event.target.id);  //Get the id of element which triggered the transition end 
	//Who should actually listen for this event? And what difference does it make? What if i had several transitions going on?
	if(event.target.id=="ball" && playing){
		transition_end(); 
	}
}, false );


//init_sound();
 document.addEventListener("deviceready", function(){
      alert("123");
	  playAudioAndroid () ;
 },true);
 //document.addEventListener("deviceready",playAudioAndroid (),false); //za inicializacijo zvoka
 

resizeGame();
init_sound();
//initP1();
initPlayer(player1);
initPlayer(player2);
//initP2();
console.log (upper_bound+" "+lower_bound+" "+left_bound+" "+right_bound+" "+ball_radius);
//callculateNearestCollisionPoint();
//start_game();




