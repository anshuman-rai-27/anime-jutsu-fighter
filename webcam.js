// Global variables
let detector;
let video;
let poses = [];
const COOLDOWN = 2000; // 2 second cooldown
let gameActive = true;
let winner = null;

// Players configuration
const players = {
  player1: {
    id: null,
    health: 100,
    reps: 0,
    punchingLeft: false,
    punchingRight: false,
    lastLeftWristX: null,
    lastRightWristX: null,
    lastLeftPunchTime: 0,
    lastRightPunchTime: 0,
    leftCooldownRemaining: 0,
    rightCooldownRemaining: 0,
    color: [255, 50, 50], // Red
    counterId: 'counter1',
    healthBarId: 'health1',
    leftCooldownId: 'cooldown1-left',
    rightCooldownId: 'cooldown1-right',
    side: 'left',
    name: 'RED'
  },
  player2: {
    id: null,
    health: 100,
    reps: 0,
    punchingLeft: false,
    punchingRight: false,
    lastLeftWristX: null,
    lastRightWristX: null,
    lastLeftPunchTime: 0,
    lastRightPunchTime: 0,
    leftCooldownRemaining: 0,
    rightCooldownRemaining: 0,
    color: [50, 50, 255], // Blue
    counterId: 'counter2',
    healthBarId: 'health2',
    leftCooldownId: 'cooldown2-left',
    rightCooldownId: 'cooldown2-right',
    side: 'right',
    name: 'BLUE'
  }
};

// Initialize the pose detector
async function init() {
  try {
    console.log("Initializing pose detector...");
    const model = poseDetection.SupportedModels.MoveNet;
    const detectorConfig = {
      modelType: poseDetection.movenet.modelType.MULTIPOSE_LIGHTNING,
      enableTracking: true,
      trackerType: poseDetection.TrackerType.BoundingBox
    };
    await tf.setBackend('webgl');
    detector = await poseDetection.createDetector(model, detectorConfig);
    console.log("Pose detector initialized successfully");
    await getPoses();
  } catch (error) {
    console.error("Error initializing pose detector:", error);
  }
}

// Setup function - runs once at start
async function setup() {
  console.log("Setup function started");
  
  // Create fullscreen canvas
  const canvas = createCanvas(windowWidth, windowHeight);
  canvas.parent('canvas-container');
  
  // Create video capture
  video = createCapture(VIDEO);
  video.size(width, height);
  video.hide();
  
  // Hide address bar on mobile
  window.scrollTo(0, 1);
  
  // Create health bars and cooldown indicators
  createGameUI();
  
  console.log("About to initialize pose detector");
  await init();
  console.log("Setup complete");
}

// Create game UI elements
function createGameUI() {
  // Create health bars
  const gameUI = select('#game-ui');
  
  const health1 = createDiv();
  health1.parent(gameUI);
  health1.id(players.player1.healthBarId);
  health1.class('health-bar');
  health1.style('left', '20px');
  
  const health2 = createDiv();
  health2.parent(gameUI);
  health2.id(players.player2.healthBarId);
  health2.class('health-bar');
  health2.style('right', '20px');
  
  // Create health bar contents
  const health1Fill = createDiv();
  health1Fill.parent(health1);
  health1Fill.class('health-fill red-health');
  
  const health2Fill = createDiv();
  health2Fill.parent(health2);
  health2Fill.class('health-fill blue-health');
  
  // Create cooldown indicators for both hands
  // Player 1 cooldowns
  const cooldown1Left = createDiv();
  cooldown1Left.parent(gameUI);
  cooldown1Left.id(players.player1.leftCooldownId);
  cooldown1Left.class('cooldown-indicator hidden');
  cooldown1Left.style('left', '20px');
  cooldown1Left.style('top', '70px');
  
  const cooldown1Right = createDiv();
  cooldown1Right.parent(gameUI);
  cooldown1Right.id(players.player1.rightCooldownId);
  cooldown1Right.class('cooldown-indicator hidden');
  cooldown1Right.style('left', '20px');
  cooldown1Right.style('top', '90px');
  
  // Player 2 cooldowns
  const cooldown2Left = createDiv();
  cooldown2Left.parent(gameUI);
  cooldown2Left.id(players.player2.leftCooldownId);
  cooldown2Left.class('cooldown-indicator hidden');
  cooldown2Left.style('right', '20px');
  cooldown2Left.style('top', '70px');
  
  const cooldown2Right = createDiv();
  cooldown2Right.parent(gameUI);
  cooldown2Right.id(players.player2.rightCooldownId);
  cooldown2Right.class('cooldown-indicator hidden');
  cooldown2Right.style('right', '20px');
  cooldown2Right.style('top', '90px');
  
  // Game over screen
  const gameOverScreen = createDiv();
  gameOverScreen.id('game-over');
  gameOverScreen.parent(gameUI);
  gameOverScreen.class('hidden');
  
  const winnerText = createDiv();
  winnerText.id('winner-text');
  winnerText.parent(gameOverScreen);
  
  const restartBtn = createButton('PLAY AGAIN');
  restartBtn.id('restart-btn');
  restartBtn.parent(gameOverScreen);
  restartBtn.mousePressed(restartGame);
}

// Handle window resize
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  video.size(width, height);
}

// Continuously estimate poses from video
async function getPoses() {
  if (detector) {
    try {
      poses = await detector.estimatePoses(video.elt, { maxPoses: 2 });
    } catch (error) {
      console.error("Error detecting poses:", error);
    }
  }
  setTimeout(getPoses, 50);
}

// Main drawing function
function draw() {
  // Fullscreen background
  background(0);
  
  // Draw video feed centered and scaled
  const videoAspect = video.width / video.height;
  const canvasAspect = width / height;
  let drawWidth, drawHeight, drawX, drawY;
  
  if (videoAspect > canvasAspect) {
    drawWidth = width;
    drawHeight = width / videoAspect;
    drawX = 0;
    drawY = (height - drawHeight) / 2;
  } else {
    drawHeight = height;
    drawWidth = height * videoAspect;
    drawX = (width - drawWidth) / 2;
    drawY = 0;
  }
  
  // Draw the video mirrored
  push();
  translate(width, 0);
  scale(-1, 1);
  image(video, width - drawWidth - drawX, drawY, drawWidth, drawHeight);
  pop();
  
  // Process and draw all poses if game is active
  if (gameActive && poses && poses.length > 0) {
    // Assign or update player IDs based on position
    assignPlayerIds();
    
    // Scale factor for keypoints to match video display size
    const scaleX = drawWidth / video.width;
    const scaleY = drawHeight / video.height;
    
    // Draw keypoints and skeletons for each pose
    for (let i = 0; i < poses.length; i++) {
      const pose = poses[i];
      const player = getPlayerByPoseId(pose.id);
      
      if (player) {
        // Create a corrected pose with adjusted coordinates
        const correctedPose = correctPoseCoordinates(pose, drawX, drawY, scaleX, scaleY, width);
        
        // Draw the keypoints and skeleton
        drawKeypoints(correctedPose, player.color);
        drawSkeleton(correctedPose, player.color);
        
        if (gameActive) {
          detectPunches(correctedPose, player);
        }
        
        // Draw player name above their head
        const nose = correctedPose.keypoints[0];
        if (nose.score > 0.3) {
          textSize(24);
          fill(player.color);
          textAlign(CENTER);
          text(player.name, nose.x, nose.y - 40);
        }
      }
    }
  }
  
  // Update cooldown timers
  updateCooldowns();
  
  // Update UI
  updateHealthBars();
  
  // Check for game over
  checkGameOver();
  
  // Debug info
  if (poses && poses.length > 0) {
    fill(255);
    textSize(16);
    text(`Players detected: ${poses.length}`, 10, height - 20);
  }
}

// Correct pose coordinates to match the displayed video
function correctPoseCoordinates(pose, drawX, drawY, scaleX, scaleY, canvasWidth) {
  const correctedPose = structuredClone(pose);
  
  for (let i = 0; i < correctedPose.keypoints.length; i++) {
    // Scale the coordinates from the original video size to the displayed size
    const x = correctedPose.keypoints[i].x * scaleX;
    const y = correctedPose.keypoints[i].y * scaleY;
    
    // Mirror the x-coordinate for proper display
    correctedPose.keypoints[i].x = canvasWidth - (x + drawX);
    correctedPose.keypoints[i].y = y + drawY;
  }
  
  return correctedPose;
}

// Assign players based on horizontal position
function assignPlayerIds() {
  if (poses.length === 1) {
    // Single player - assign to whichever side they're on
    const pose = poses[0];
    const centerX = pose.keypoints[0].x; // Use nose position
    
    if (centerX > video.width/2) { // Flipped logic due to mirroring
      if (players.player1.id === null || players.player1.id === pose.id) {
        players.player1.id = pose.id;
      }
    } else {
      if (players.player2.id === null || players.player2.id === pose.id) {
        players.player2.id = pose.id;
      }
    }
  } else if (poses.length === 2) {
    // Two players - assign rightmost to player1, leftmost to player2 (after mirroring)
    poses.sort((a, b) => b.keypoints[0].x - a.keypoints[0].x);
    players.player1.id = poses[0].id;
    players.player2.id = poses[1].id;
  }
}

// Get player object by pose ID
function getPlayerByPoseId(poseId) {
  if (poseId === players.player1.id) return players.player1;
  if (poseId === players.player2.id) return players.player2;
  return null;
}

// Draw detected keypoints
function drawKeypoints(pose, color) {
  // Keypoints to draw (we'll make them slightly larger)
  for (let kp of pose.keypoints) {
    if (kp.score > 0.3) {
      fill(color);
      stroke(0);
      strokeWeight(4);
      circle(kp.x, kp.y, 16); // Increased size for better visibility
    }
  }
}

// Draw skeleton connections
function drawSkeleton(pose, color) {
  const edges = [
    // Torso
    [5, 6], [5, 11], [6, 12], [11, 12],
    // Right arm
    [6, 8], [8, 10],
    // Left arm
    [5, 7], [7, 9],
    // Head
    [0, 5], [0, 6],
    // Legs
    [11, 13], [13, 15], [12, 14], [14, 16]
  ];
  
  for (const [i, j] of edges) {
    const kp1 = pose.keypoints[i];
    const kp2 = pose.keypoints[j];
    
    if (kp1.score > 0.3 && kp2.score > 0.3) {
      stroke(color);
      strokeWeight(6); // Thicker lines for better visibility
      line(kp1.x, kp1.y, kp2.x, kp2.y);
    }
  }
}

// Detect punches for both hands
function detectPunches(pose, player) {
  // Get keypoints for both wrists and shoulders
  const leftWrist = pose.keypoints[9];  // Left wrist
  const leftShoulder = pose.keypoints[5]; // Left shoulder
  const rightWrist = pose.keypoints[10]; // Right wrist  
  const rightShoulder = pose.keypoints[6]; // Right shoulder
  
  // Check if keypoints are detected with good confidence
  if (leftWrist.score > 0.3 && leftShoulder.score > 0.3) {
    // For left player, left hand punches toward center (increasing X)
    // For right player, left hand punches toward center (decreasing X)
    const punchDirection = player.side === 'left' ? 1 : -1;
    detectSinglePunch(leftWrist, leftShoulder, player, 'left', punchDirection);
  }
  
  if (rightWrist.score > 0.3 && rightShoulder.score > 0.3) {
    // For left player, right hand punches toward center (increasing X)
    // For right player, right hand punches toward center (decreasing X)
    const punchDirection = player.side === 'left' ? 1 : -1;
    detectSinglePunch(rightWrist, rightShoulder, player, 'right', punchDirection);
  }
}

// Detect a single punch
function detectSinglePunch(wrist, shoulder, player, hand, punchDirection) {
  // Initialize last wrist position if first frame
  if (hand === 'left' && player.lastLeftWristX === null) {
    player.lastLeftWristX = wrist.x;
    return;
  } else if (hand === 'right' && player.lastRightWristX === null) {
    player.lastRightWristX = wrist.x;
    return;
  }
  
  // Get the last position based on which hand
  const lastWristX = hand === 'left' ? player.lastLeftWristX : player.lastRightWristX;
  
  // Punch detection thresholds
  const punchThreshold = width * 0.03; // 3% of screen width (reduced threshold)
  const retractThreshold = width * 0.02;
  
  // Calculate movement direction 
  // If punchDirection is 1, increasing X is a punch
  // If punchDirection is -1, decreasing X is a punch
  const rawMovement = wrist.x - lastWristX;
  const movement = rawMovement * punchDirection;
  
  // Calculate punch strength based on speed
  const punchStrength = map(abs(movement), punchThreshold, punchThreshold * 2, 5, 15, true);
  
  // Current time for cooldown
  const currentTime = millis();
  
  // Get appropriate timing variables based on which hand
  const isPunching = hand === 'left' ? player.punchingLeft : player.punchingRight;
  const lastPunchTime = hand === 'left' ? player.lastLeftPunchTime : player.lastRightPunchTime;
  
  // Detect punch extension
  const armExtended = movement > punchThreshold;
  // Detect retraction
  const armRetracted = abs(movement) < retractThreshold;
  
  // Count punch if extended and cooldown expired
  if (!isPunching && armExtended && (currentTime - lastPunchTime) > COOLDOWN) {
    player.reps++;
    
    // Update appropriate timing variables
    if (hand === 'left') {
      player.lastLeftPunchTime = currentTime;
      player.leftCooldownRemaining = COOLDOWN;
      player.punchingLeft = true;
    } else {
      player.lastRightPunchTime = currentTime;
      player.rightCooldownRemaining = COOLDOWN;
      player.punchingRight = true;
    }
    
    // Show cooldown indicator
    const cooldownId = hand === 'left' ? player.leftCooldownId : player.rightCooldownId;
    showCooldown(cooldownId);
    
    // Visual feedback
    punchFeedback(player.counterId);
    
    // Damage opponent
    const opponent = player === players.player1 ? players.player2 : players.player1;
    opponent.health = max(0, opponent.health - punchStrength);
  }
  
  // Reset punch state when arm retracts
  if (isPunching && armRetracted) {
    if (hand === 'left') {
      player.punchingLeft = false;
    } else {
      player.punchingRight = false;
    }
  }
  
  // Update last wrist position
  if (hand === 'left') {
    player.lastLeftWristX = wrist.x;
  } else {
    player.lastRightWristX = wrist.x;
  }
}

// Show cooldown indicator
function showCooldown(cooldownId) {
  const cooldownEl = select(`#${cooldownId}`);
  cooldownEl.removeClass('hidden');
}

// Update cooldown timers
function updateCooldowns() {
  const currentTime = millis();
  
  // Update player1 left hand cooldown
  if (players.player1.leftCooldownRemaining > 0) {
    const elapsed = currentTime - players.player1.lastLeftPunchTime;
    players.player1.leftCooldownRemaining = max(0, COOLDOWN - elapsed);
    const percent = (players.player1.leftCooldownRemaining / COOLDOWN) * 100;
    
    const cooldownEl = select(`#${players.player1.leftCooldownId}`);
    cooldownEl.style('width', `${percent}%`);
    
    if (players.player1.leftCooldownRemaining === 0) {
      cooldownEl.addClass('hidden');
    }
  }
  
  // Update player1 right hand cooldown
  if (players.player1.rightCooldownRemaining > 0) {
    const elapsed = currentTime - players.player1.lastRightPunchTime;
    players.player1.rightCooldownRemaining = max(0, COOLDOWN - elapsed);
    const percent = (players.player1.rightCooldownRemaining / COOLDOWN) * 100;
    
    const cooldownEl = select(`#${players.player1.rightCooldownId}`);
    cooldownEl.style('width', `${percent}%`);
    
    if (players.player1.rightCooldownRemaining === 0) {
      cooldownEl.addClass('hidden');
    }
  }
  
  // Update player2 left hand cooldown
  if (players.player2.leftCooldownRemaining > 0) {
    const elapsed = currentTime - players.player2.lastLeftPunchTime;
    players.player2.leftCooldownRemaining = max(0, COOLDOWN - elapsed);
    const percent = (players.player2.leftCooldownRemaining / COOLDOWN) * 100;
    
    const cooldownEl = select(`#${players.player2.leftCooldownId}`);
    cooldownEl.style('width', `${percent}%`);
    
    if (players.player2.leftCooldownRemaining === 0) {
      cooldownEl.addClass('hidden');
    }
  }
  
  // Update player2 right hand cooldown
  if (players.player2.rightCooldownRemaining > 0) {
    const elapsed = currentTime - players.player2.lastRightPunchTime;
    players.player2.rightCooldownRemaining = max(0, COOLDOWN - elapsed);
    const percent = (players.player2.rightCooldownRemaining / COOLDOWN) * 100;
    
    const cooldownEl = select(`#${players.player2.rightCooldownId}`);
    cooldownEl.style('width', `${percent}%`);
    
    if (players.player2.rightCooldownRemaining === 0) {
      cooldownEl.addClass('hidden');
    }
  }
}

// Update health bars
function updateHealthBars() {
  // Update player 1 health bar
  const health1 = select(`#${players.player1.healthBarId} .health-fill`);
  health1.style('width', `${players.player1.health}%`);
  
  // Update player 2 health bar
  const health2 = select(`#${players.player2.healthBarId} .health-fill`);
  health2.style('width', `${players.player2.health}%`);
  
  // Update counters
  select('#counter1').html(`${players.player1.name}: ${players.player1.reps}`);
  select('#counter2').html(`${players.player2.name}: ${players.player2.reps}`);
}

// Check for game over
function checkGameOver() {
  if (!gameActive) return;
  
  if (players.player1.health <= 0) {
    gameOver(players.player2);
  } else if (players.player2.health <= 0) {
    gameOver(players.player1);
  }
}

// Game over function
function gameOver(winner) {
  gameActive = false;
  this.winner = winner;
  
  // Show game over screen
  const gameOverScreen = select('#game-over');
  gameOverScreen.removeClass('hidden');
  
  // Show winner
  select('#winner-text').html(`${winner.name} WINS!`);
}

// Restart game
function restartGame() {
  // Reset player stats
  players.player1.health = 100;
  players.player1.reps = 0;
  players.player1.punchingLeft = false;
  players.player1.punchingRight = false;
  players.player1.lastLeftPunchTime = 0;
  players.player1.lastRightPunchTime = 0;
  players.player1.leftCooldownRemaining = 0;
  players.player1.rightCooldownRemaining = 0;
  
  players.player2.health = 100;
  players.player2.reps = 0;
  players.player2.punchingLeft = false;
  players.player2.punchingRight = false;
  players.player2.lastLeftPunchTime = 0;
  players.player2.lastRightPunchTime = 0;
  players.player2.leftCooldownRemaining = 0;
  players.player2.rightCooldownRemaining = 0;
  
  // Hide game over screen
  select('#game-over').addClass('hidden');
  
  // Hide cooldown indicators
  select(`#${players.player1.leftCooldownId}`).addClass('hidden');
  select(`#${players.player1.rightCooldownId}`).addClass('hidden');
  select(`#${players.player2.leftCooldownId}`).addClass('hidden');
  select(`#${players.player2.rightCooldownId}`).addClass('hidden');
  
  // Update UI
  updateHealthBars();
  
  // Activate game
  gameActive = true;
  winner = null;
}

// Visual feedback for punch
function punchFeedback(counterId) {
  const counter = select(`#${counterId}`);
  counter.addClass('flash');
  setTimeout(() => counter.removeClass('flash'), 300);
}