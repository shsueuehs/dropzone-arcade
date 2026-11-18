const tabs = [...document.querySelectorAll(".tab")];
const views = ["reactionGame","memoryGame","ticGame","numberGame","houseGame"];
const gameMeta = {
 reaction:["GAME 01 / QUICK REFLEX","Reaction Test","Wait for green, then tap as quickly as you can.","1 PLAYER"],
 memory:["GAME 02 / BRAIN TRAIN","Memory Match","Flip cards and find all matching pairs.","1 PLAYER"],
 tictactoe:["GAME 03 / CLASSIC","Tic-Tac-Toe","Take turns getting three marks in a row.","2 PLAYERS"],
 number:["GAME 04 / NUMBER PUZZLE","Number Hunt","Can you find the hidden number in seven tries?","1 PLAYER"],
 house:["GAME 05 / SPOOKY PUZZLE","The Quiet House","Find the key, avoid the caretaker, and escape.","1 PLAYER"]
};
function showGame(name){
 tabs.forEach(t=>t.classList.toggle("active",t.dataset.game===name));
 views.forEach((id,i)=>document.getElementById(id).classList.toggle("hidden",["reaction","memory","tictactoe","number","house"][i]!==name));
 const meta=gameMeta[name];document.getElementById("gameEyebrow").textContent=meta[0];document.getElementById("gameTitle").textContent=meta[1];document.getElementById("gameDesc").textContent=meta[2];document.getElementById("gameBadge").textContent=meta[3];
}
tabs.forEach(t=>t.addEventListener("click",()=>showGame(t.dataset.game)));

// Reaction test
let reactionState="idle",reactionTimer=null,reactionStart=0,best=null;
const pad=document.getElementById("reactionPad"),reactionText=document.getElementById("reactionText"),reactionHint=document.getElementById("reactionHint");
pad.addEventListener("click",()=>{
 if(reactionState==="idle"||reactionState==="done"){
  reactionState="waiting";pad.className="reaction-pad waiting";reactionText.textContent="WAIT FOR GREEN";reactionHint.textContent="Don't tap yet";
  clearTimeout(reactionTimer);reactionTimer=setTimeout(()=>{reactionState="ready";reactionStart=performance.now();pad.className="reaction-pad ready";reactionText.textContent="TAP NOW!";reactionHint.textContent="As fast as you can";},1200+Math.random()*2600);
 }else if(reactionState==="waiting"){
  clearTimeout(reactionTimer);reactionState="done";pad.className="reaction-pad early";reactionText.textContent="TOO EARLY!";reactionHint.textContent="Tap to try again";document.getElementById("reactionResult").textContent="Jumped the gun—try again.";
 }else if(reactionState==="ready"){
  const ms=Math.round(performance.now()-reactionStart);best=best===null?ms:Math.min(best,ms);reactionState="done";pad.className="reaction-pad waiting";reactionText.textContent=ms+" ms";reactionHint.textContent="Tap to play again";document.getElementById("reactionResult").textContent=`Reaction: ${ms} ms · Best: ${best} ms`;
 }
});

// Memory match
const emojis=["🚀","🌙","🎮","⭐","🪐","🎧"];let deck=[],first=null,lock=false,moves=0,pairs=0;
function initMemory(){deck=[...emojis,...emojis].sort(()=>Math.random()-.5).map((v,i)=>({v,id:i,matched:false}));first=null;lock=false;moves=0;pairs=0;document.getElementById("memoryMoves").textContent="0";document.getElementById("memoryPairs").textContent="0 / 6";const grid=document.getElementById("memoryGrid");grid.innerHTML="";deck.forEach(card=>{const b=document.createElement("button");b.className="memory-card";b.textContent="?";b.setAttribute("aria-label","Hidden card");b.addEventListener("click",()=>flipCard(card.id,b));grid.appendChild(b);});}
function flipCard(id,button){const card=deck[id];if(lock||card.matched||button.classList.contains("flipped"))return;button.classList.add("flipped");button.textContent=card.v;button.setAttribute("aria-label",card.v);if(first===null){first={card,button};return;}moves++;document.getElementById("memoryMoves").textContent=moves;if(first.card.v===card.v){first.card.matched=card.matched=true;first.button.classList.add("matched");button.classList.add("matched");pairs++;document.getElementById("memoryPairs").textContent=`${pairs} / 6`;first=null;if(pairs===6)setTimeout(()=>alert(`Nice work! You matched all pairs in ${moves} moves.`),150);}else{lock=true;const old=first;first=null;setTimeout(()=>{old.button.classList.remove("flipped");old.button.textContent="?";old.button.setAttribute("aria-label","Hidden card");button.classList.remove("flipped");button.textContent="?";button.setAttribute("aria-label","Hidden card");lock=false;},750);}}
document.getElementById("memoryReset").addEventListener("click",initMemory);initMemory();

// Tic tac toe
let board=Array(9).fill(""),turn="X",ticOver=false;
const wins=[[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
function renderTic(){const root=document.getElementById("ticBoard");root.innerHTML="";board.forEach((v,i)=>{const b=document.createElement("button");b.className="tic-cell";b.textContent=v;b.disabled=!!v||ticOver;b.addEventListener("click",()=>playTic(i));root.appendChild(b);});}
function playTic(i){if(board[i]||ticOver)return;board[i]=turn;const win=wins.some(line=>line.every(n=>board[n]===turn));if(win){ticOver=true;document.getElementById("ticStatus").textContent=turn+" wins!";}else if(board.every(Boolean)){ticOver=true;document.getElementById("ticStatus").textContent="It's a draw!";}else{turn=turn==="X"?"O":"X";document.getElementById("ticStatus").textContent="Your turn: "+turn;}renderTic();}
function resetTic(){board=Array(9).fill("");turn="X";ticOver=false;document.getElementById("ticStatus").textContent="Your turn: X";renderTic();}
document.getElementById("ticReset").addEventListener("click",resetTic);resetTic();

// Number hunt
let answer=0,tries=7,finished=false;
function resetGuess(){answer=1+Math.floor(Math.random()*100);tries=7;finished=false;document.getElementById("triesLeft").textContent=tries;document.getElementById("guessFeedback").textContent="You have 7 tries. Good luck!";document.getElementById("guessInput").value="";document.getElementById("guessInput").disabled=false;document.querySelector("#guessForm button").disabled=false;}
document.getElementById("guessForm").addEventListener("submit",e=>{e.preventDefault();if(finished)return;const input=document.getElementById("guessInput"),n=Number(input.value);if(!Number.isInteger(n)||n<1||n>100){document.getElementById("guessFeedback").textContent="Enter a whole number from 1 to 100.";return;}tries--;document.getElementById("triesLeft").textContent=tries;let msg=n===answer?"You found it! Great guessing.":n<answer?"Too low. Try a higher number.":"Too high. Try a lower number.";if(n===answer||tries===0){finished=true;if(tries===0&&n!==answer)msg=`Out of tries! The number was ${answer}.`;document.getElementById("guessInput").disabled=true;document.querySelector("#guessForm button").disabled=true;}document.getElementById("guessFeedback").textContent=msg;input.value="";});
document.getElementById("guessReset").addEventListener("click",resetGuess);resetGuess();

// The Quiet House: original, small grid maze. Caretaker moves one step after each player move.
const mazeMap=["#########","#P..#..K#","#.#.#.#.#","#.#...#.#","#.###.#.#","#...#...#","###.#.###","#C.....E#","#########"];
let walls=[],player={x:1,y:1},keeper={x:1,y:7},key={x:7,y:1},exit={x:7,y:7},hasKey=false,houseMoves=0,houseDone=false;
function resetHouse(){walls=[];mazeMap.forEach((row,y)=>[...row].forEach((ch,x)=>{if(ch==="#")walls.push(`${x},${y}`);}));player={x:1,y:1};keeper={x:1,y:7};hasKey=false;houseMoves=0;houseDone=false;document.getElementById("houseMoves").textContent="0";document.getElementById("houseStatus").textContent="Find the key";drawMaze();}
function blocked(x,y){return walls.includes(`${x},${y}`);}
function drawMaze(){const root=document.getElementById("maze");root.innerHTML="";for(let y=0;y<9;y++)for(let x=0;x<9;x++){const d=document.createElement("div");d.className="tile";if(blocked(x,y))d.classList.add("wall");else if(player.x===x&&player.y===y){d.classList.add("player");d.textContent="🙂";}else if(keeper.x===x&&keeper.y===y){d.classList.add("keeper");d.textContent="●";}else if(key.x===x&&key.y===y&&!hasKey){d.classList.add("key");d.textContent="✦";}else if(exit.x===x&&exit.y===y){d.classList.add("exit");d.textContent="▣";}root.appendChild(d);}}
function moveHouse(dx,dy){if(houseDone)return;const nx=player.x+dx,ny=player.y+dy;if(blocked(nx,ny))return;player={x:nx,y:ny};houseMoves++;if(player.x===key.x&&player.y===key.y&&!hasKey){hasKey=true;document.getElementById("houseStatus").textContent="Key found! Reach exit";}if(player.x===exit.x&&player.y===exit.y){if(hasKey){houseDone=true;document.getElementById("houseStatus").textContent="You escaped!";}else{document.getElementById("houseStatus").textContent="You need the key";player={x:nx,y:ny};}}
 if(!houseDone){const opts=[[keeper.x+1,keeper.y],[keeper.x-1,keeper.y],[keeper.x,keeper.y+1],[keeper.x,keeper.y-1]].filter(([x,y])=>!blocked(x,y));opts.sort((a,b)=>(Math.abs(a[0]-player.x)+Math.abs(a[1]-player.y))-(Math.abs(b[0]-player.x)+Math.abs(b[1]-player.y)));if(opts.length){const [kx,ky]=opts[0];keeper={x:kx,y:ky};}if(player.x===keeper.x&&player.y===keeper.y){houseDone=true;document.getElementById("houseStatus").textContent="Caught! Try another route.";}}
 document.getElementById("houseMoves").textContent=houseMoves;drawMaze();}
const dirs={up:[0,-1],down:[0,1],left:[-1,0],right:[1,0]};
document.querySelectorAll("[data-dir]").forEach(b=>b.addEventListener("click",()=>moveHouse(...dirs[b.dataset.dir])));
document.addEventListener("keydown",e=>{if(document.getElementById("houseGame").classList.contains("hidden"))return;const map={ArrowUp:"up",w:"up",ArrowDown:"down",s:"down",ArrowLeft:"left",a:"left",ArrowRight:"right",d:"right"};const dir=map[e.key];if(dir){e.preventDefault();moveHouse(...dirs[dir]);}});
document.getElementById("houseReset").addEventListener("click",resetHouse);resetHouse();
