// let detector;
// let detectorConfig;
// let poses;
// let video;
// let skeleton = true;
// let model;
// let elbowAngle = 999;
// let backAngle = 0;
// let reps = 0;
// let upPosition = false;
// let downPosition = false;
// let highlightBack = false;
// let backWarningGiven = false;


// async function init() {
//   detectorConfig = { modelType: poseDetection.movenet.modelType.SINGLEPOSE_THUNDER };
//   detector = await poseDetection.createDetector(poseDetection.SupportedModels.MoveNet, detectorConfig);
//   edges = {
//     '5,7': 'm',
//     '7,9': 'm',
//     '6,8': 'c',
//     '8,10': 'c',
//     '5,6': 'y',
//     '5,11': 'm',
//     '6,12': 'c',
//     '11,12': 'y',
//     '11,13': 'm',
//     '13,15': 'm',
//     '12,14': 'c',
//     '14,16': 'c'
//   };
//   await getPoses();
// }

// async function videoReady() {
//   //console.log('video ready');
// }

// async function setup() {
//   var msg = new SpeechSynthesisUtterance('Loading, please wait...');
//   window.speechSynthesis.speak(msg);
//   createCanvas(640, 480);
//   video = createCapture(VIDEO, videoReady);
//   //video.size(960, 720);
//   video.hide()

//   await init();
// }

// async function getPoses() {
//   poses = await detector.estimatePoses(video.elt);
//   setTimeout(getPoses, 0);
//   //console.log(poses);
// }

// function draw() {
//   background(220);
//   translate(width, 0);
//   scale(-1, 1);
//   image(video, 0, 0, video.width, video.height);

//   // Draw keypoints and skeleton
//   drawKeypoints();
//   if (skeleton) {
//     drawSkeleton();
//   }

//   // Write text
//   fill(255);
//   strokeWeight(2);
//   stroke(51);
//   translate(width, 0);
//   scale(-1, 1);
//   textSize(40);

//   if (poses && poses.length > 0) {
//     let pushupString = `Push-ups completed: ${reps}`;
//     text(pushupString, 100, 90);
//   }
//   else {
//     text('Loading, please wait...', 100, 90);
//   }
  
// }

// function drawKeypoints() {
//   var count = 0;
//   if (poses && poses.length > 0) {
//     for (let kp of poses[0].keypoints) {
//       const { x, y, score } = kp;
//       if (score > 0.3) {
//         count = count + 1;
//         fill(255);
//         stroke(0);
//         strokeWeight(4);
//         circle(x, y, 16);
//       }
//       if (count == 17) {
//         //console.log('Whole body visible!');
//       }
//       else {
//         //console.log('Not fully visible!');
//       }
//       updateArmAngle();
//       updateBackAngle();
//       inUpPosition();
//       inDownPosition();
//     }
//   }
// }

// // Draws lines between the keypoints
// function drawSkeleton() {
//   confidence_threshold = 0.5;

//   if (poses && poses.length > 0) {
//     for (const [key, value] of Object.entries(edges)) {
//       const p = key.split(",");
//       const p1 = p[0];
//       const p2 = p[1];

//       const y1 = poses[0].keypoints[p1].y;
//       const x1 = poses[0].keypoints[p1].x;
//       const c1 = poses[0].keypoints[p1].score;
//       const y2 = poses[0].keypoints[p2].y;
//       const x2 = poses[0].keypoints[p2].x;
//       const c2 = poses[0].keypoints[p2].score;

//       if ((c1 > confidence_threshold) && (c2 > confidence_threshold)) {
//         if ((highlightBack == true) && ((p[1] == 11) || ((p[0] == 6) && (p[1] == 12)) || (p[1] == 13) || (p[0] == 12))) {
//           strokeWeight(3);
//           stroke(255, 0, 0);
//           line(x1, y1, x2, y2);
//         }
//         else {
//           strokeWeight(2);
//           stroke('rgb(0, 255, 0)');
//           line(x1, y1, x2, y2);
//         }
//       }
//     }
//   }
// }

// function updateArmAngle() {
//   /*
//   rightWrist = poses[0].keypoints[10];
//   rightShoulder = poses[0].keypoints[6];
//   rightElbow = poses[0].keypoints[8];
//   */
//   leftWrist = poses[0].keypoints[9];
//   leftShoulder = poses[0].keypoints[5];
//   leftElbow = poses[0].keypoints[7];



//   angle = (
//     Math.atan2(
//       leftWrist.y - leftElbow.y,
//       leftWrist.x - leftElbow.x
//     ) - Math.atan2(
//       leftShoulder.y - leftElbow.y,
//       leftShoulder.x - leftElbow.x
//     )
//   ) * (180 / Math.PI);

//   if (angle < 0) {
//     //angle = angle + 360;
//   }

//   if (leftWrist.score > 0.3 && leftElbow.score > 0.3 && leftShoulder.score > 0.3) {
//     //console.log(angle);
//     elbowAngle = angle;
//   }
//   else {
//     //console.log('Cannot see elbow');
//   }

// }

// function updateBackAngle() {

//   var leftShoulder = poses[0].keypoints[5];
//   var leftHip = poses[0].keypoints[11];
//   var leftKnee = poses[0].keypoints[13];

//   angle = (
//     Math.atan2(
//       leftKnee.y - leftHip.y,
//       leftKnee.x - leftHip.x
//     ) - Math.atan2(
//       leftShoulder.y - leftHip.y,
//       leftShoulder.x - leftHip.x
//     )
//   ) * (180 / Math.PI);
//   angle = angle % 180;
//   if (leftKnee.score > 0.3 && leftHip.score > 0.3 && leftShoulder.score > 0.3) {

//     backAngle = angle;
//   }

//   if ((backAngle < 20) || (backAngle > 160)) {
//     highlightBack = false;
//   }
//   else {
//     highlightBack = true;
//     if (backWarningGiven != true) {
//       var msg = new SpeechSynthesisUtterance('Keep your back straight');
//       window.speechSynthesis.speak(msg);
//       backWarningGiven = true;
//     }
//   }

// }

// function inUpPosition() {
//   if (elbowAngle > 170 && elbowAngle < 200) {
//     //console.log('In up position')
//     if (downPosition == true) {
//       var msg = new SpeechSynthesisUtterance(str(reps+1));
//       window.speechSynthesis.speak(msg);
//       reps = reps + 1;
//     }
//     upPosition = true;
//     downPosition = false;
//   }
// }

// function inDownPosition() {
//   var elbowAboveNose = false;
//   if (poses[0].keypoints[0].y > poses[0].keypoints[7].y) {
//     elbowAboveNose = true;
//   }
//   else {
//     //console.log('Elbow is not above nose')
//   }

//   if ((highlightBack == false) && elbowAboveNose && ((abs(elbowAngle) > 70) && (abs(elbowAngle) < 100))) {
//     //console.log('In down position')
//     if (upPosition == true) {
//       var msg = new SpeechSynthesisUtterance('Up');
//       window.speechSynthesis.speak(msg);
//     }
//     downPosition = true;
//     upPosition = false;
//   }
// }

//////////////////////////////////////////////////////////////////////////////////





// // Global variables
// let detector;          // Pose detection model
// let detectorConfig;    // Configuration for the detector
// let poses;             // Stores detected poses
// let video;             // Video capture element
// let skeleton = true;   // Flag to toggle skeleton drawing
// let reps = 0;          // Punch counter
// let punching = false;  // Flag to track punch state
// let lastWristX = null; // Previous wrist X position (for side view detection)
// let lastPunchTime = 0; // Timestamp of last counted punch
// const COOLDOWN = 2000; // 2 second cooldown in milliseconds

// // Initialize the pose detector
// async function init() {
//   // Use MoveNet thunder model for better accuracy
//   detectorConfig = { modelType: poseDetection.movenet.modelType.SINGLEPOSE_THUNDER };
//   detector = await poseDetection.createDetector(poseDetection.SupportedModels.MoveNet, detectorConfig);
//   await getPoses(); // Start pose estimation
// }

// // Setup function - runs once at start
// async function setup() {
//   // Audio feedback for loading
//   let msg = new SpeechSynthesisUtterance('Loading, please wait...');
//   window.speechSynthesis.speak(msg);
  
//   // Create canvas and video capture
//   createCanvas(640, 480);
//   video = createCapture(VIDEO);
//   video.hide(); // Hide the video element (we'll draw it manually)
//   await init(); // Initialize pose detector
// }

// // Continuously estimate poses from video
// async function getPoses() {
//   poses = await detector.estimatePoses(video.elt); // Get poses from video element
//   setTimeout(getPoses, 50); // Update poses frequently (20fps)
// }

// // Main drawing function
// function draw() {
//   background(220); // Clear canvas with light gray
//   image(video, 0, 0, video.width, video.height); // Draw video feed
  
//   // Draw keypoints and skeleton
//   drawKeypoints();
//   drawSkeleton();
  
//   // Display punch counter
//   fill(255);
//   strokeWeight(2);
//   stroke(51);
//   textSize(40);
//   text(`Punches: ${reps}`, 100, 90);
  
//   // Display cooldown status
//   let currentTime = millis();
//   let cooldownRemaining = COOLDOWN - (currentTime - lastPunchTime);
//   if (cooldownRemaining > 0) {
//     textSize(20);
//     text(`Cooldown: ${(cooldownRemaining/1000).toFixed(1)}s`, 100, 120);
//   }
// }

// // Draw detected keypoints (joints)
// function drawKeypoints() {
//   if (poses && poses.length > 0) {
//     // Loop through all keypoints in the first detected pose
//     for (let kp of poses[0].keypoints) {
//       if (kp.score > 0.3) { // Only draw if confidence > 30%
//         fill(255);
//         stroke(0);
//         strokeWeight(4);
//         circle(kp.x, kp.y, 16); // Draw a circle at each keypoint
//       }
//     }
//     detectPunch(); // Check for punches
//   }
// }

// // Detect punching motion (side view)
// function detectPunch() {
//   // Get relevant body parts (right arm)
//   let wrist = poses[0].keypoints[10];  // Right wrist (index 10)
//   let shoulder = poses[0].keypoints[6]; // Right shoulder (index 6)
//   let elbow = poses[0].keypoints[8];    // Right elbow (index 8)

//   // Only proceed if all keypoints are detected with good confidence
//   if (wrist.score > 0.3 && shoulder.score > 0.3 && elbow.score > 0.3) {
//     // Initialize last wrist position if first frame
//     if (lastWristX === null) {
//       lastWristX = wrist.x;
//       return;
//     }
    
//     // Thresholds for punch detection (side view)
//     const punchThreshold = 30; // Minimum horizontal movement to count as punch
//     const retractThreshold = 15; // Minimum return movement to reset
    
//     // Calculate horizontal movement from shoulder (relative to body)
//     let currentExtension = wrist.x - shoulder.x;
//     let previousExtension = lastWristX - shoulder.x;
    
//     // Detect punch extension (arm moving forward)
//     let armExtended = (currentExtension - previousExtension) > punchThreshold;
//     // Detect retraction (arm moving back)
//     let armRetracted = Math.abs(currentExtension - previousExtension) < retractThreshold;
    
//     // Get current time for cooldown check
//     let currentTime = millis();
    
//     // Count a punch when arm extends forward and cooldown has expired
//     if (!punching && armExtended && (currentTime - lastPunchTime) > COOLDOWN) {
//       reps++;
//       // Update last punch time
//       lastPunchTime = currentTime;
//       // Announce count
//       let msg = new SpeechSynthesisUtterance(reps.toString());
//       window.speechSynthesis.speak(msg);
//       punching = true;
//     }
    
//     // Reset punch state when arm retracts
//     if (punching && armRetracted) {
//       punching = false;
//     }
    
//     // Update last wrist position
//     lastWristX = wrist.x;
//   }
// }

// // Draw skeleton connections between keypoints
// function drawSkeleton() {
//   let confidence_threshold = 0.5; // Only draw if confidence > 50%
//   if (poses && poses.length > 0) {
//     // Define connections for right arm (shoulder -> elbow -> wrist)
//     let edges = [['6', '8'], ['8', '10']];
    
//     // Draw each connection
//     for (const [p1, p2] of edges) {
//       let kp1 = poses[0].keypoints[parseInt(p1)];
//       let kp2 = poses[0].keypoints[parseInt(p2)];
      
//       // Only draw if both points are confident
//       if (kp1.score > confidence_threshold && kp2.score > confidence_threshold) {
//         strokeWeight(3);
//         stroke(0, 255, 0); // Green lines
//         line(kp1.x, kp1.y, kp2.x, kp2.y);
//       }
//     }
//   }
// }



// Global variables
let detector;
let video;
let poses = [];
const COOLDOWN = 2000; // 2 second cooldown

// Players configuration
const players = {
  player1: {
    id: null,
    reps: 0,
    punching: false,
    lastWristX: null,
    lastPunchTime: 0,
    color: [255, 50, 50], // Red
    counterId: 'counter1',
    side: 'left'
  },
  player2: {
    id: null,
    reps: 0,
    punching: false,
    lastWristX: null,
    lastPunchTime: 0,
    color: [50, 50, 255], // Blue
    counterId: 'counter2',
    side: 'right'
  }
};

// Initialize the pose detector
async function init() {
  const model = poseDetection.SupportedModels.MoveNet;
  const detectorConfig = {
    modelType: poseDetection.movenet.modelType.MULTIPOSE_LIGHTNING,
    enableTracking: true,
    trackerType: poseDetection.TrackerType.BoundingBox
  };
  await tf.setBackend('webgl');
  detector = await poseDetection.createDetector(model, detectorConfig);
  await getPoses();
}

// Setup function - runs once at start
async function setup() {
  // Create fullscreen canvas
  const canvas = createCanvas(windowWidth, windowHeight);
  canvas.parent('canvas-container');
  
  // Create video capture
  video = createCapture(VIDEO);
  video.size(width, height);
  video.hide();
  
  // Hide address bar on mobile
  window.scrollTo(0, 1);
  
  await init();
}

// Handle window resize
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  video.size(width, height);
}

// Continuously estimate poses from video
async function getPoses() {
  poses = await detector.estimatePoses(video.elt, { maxPoses: 2 });
  setTimeout(getPoses, 50);
}

// Main drawing function
function draw() {
  // Fullscreen background
  background(0);
  
  // Draw video feed centered and scaled
  const videoAspect = video.width / video.height;
  const canvasAspect = width / height;
  let drawWidth, drawHeight;
  
  if (videoAspect > canvasAspect) {
    drawWidth = width;
    drawHeight = width / videoAspect;
  } else {
    drawHeight = height;
    drawWidth = height * videoAspect;
  }
  
  image(video, (width - drawWidth)/2, (height - drawHeight)/2, drawWidth, drawHeight);
  
  // Process and draw all poses
  if (poses && poses.length > 0) {
    // Assign or update player IDs based on position
    assignPlayerIds();
    
    // Draw keypoints and skeletons for each pose
    for (let i = 0; i < poses.length; i++) {
      const pose = poses[i];
      const player = getPlayerByPoseId(pose.id);
      
      if (player) {
        drawKeypoints(pose, player.color);
        drawSkeleton(pose, player.color);
        detectPunch(pose, player);
      }
    }
  }
  
  // Update counters
  updateCounters();
}

// Assign players based on horizontal position
function assignPlayerIds() {
  if (poses.length === 1) {
    // Single player - assign to whichever side they're on
    const pose = poses[0];
    const centerX = pose.keypoints[0].x; // Use nose position
    
    if (centerX < width/2) {
      if (players.player1.id === null || players.player1.id === pose.id) {
        players.player1.id = pose.id;
      }
    } else {
      if (players.player2.id === null || players.player2.id === pose.id) {
        players.player2.id = pose.id;
      }
    }
  } else if (poses.length === 2) {
    // Two players - assign leftmost to player1, rightmost to player2
    poses.sort((a, b) => a.keypoints[0].x - b.keypoints[0].x);
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
  for (let kp of pose.keypoints) {
    if (kp.score > 0.3) {
      fill(color);
      stroke(0);
      strokeWeight(4);
      circle(kp.x, kp.y, 12);
    }
  }
}

// Draw skeleton connections
function drawSkeleton(pose, color) {
  const edges = [
    // Right arm
    [6, 8], [8, 10],
    // Left arm
    [5, 7], [7, 9]
  ];
  
  for (const [i, j] of edges) {
    const kp1 = pose.keypoints[i];
    const kp2 = pose.keypoints[j];
    
    if (kp1.score > 0.3 && kp2.score > 0.3) {
      stroke(color);
      strokeWeight(4);
      line(kp1.x, kp1.y, kp2.x, kp2.y);
    }
  }
}

// Detect punching motion for a player
function detectPunch(pose, player) {
  const wrist = pose.keypoints[10]; // Right wrist
  const shoulder = pose.keypoints[6]; // Right shoulder
  
  if (wrist.score > 0.3 && shoulder.score > 0.3) {
    // Initialize last wrist position if first frame
    if (player.lastWristX === null) {
      player.lastWristX = wrist.x;
      return;
    }
    
    // Punch detection thresholds
    const punchThreshold = width * 0.05; // 5% of screen width
    const retractThreshold = width * 0.03;
    
    // Calculate movement
    const currentExtension = wrist.x - shoulder.x;
    const previousExtension = player.lastWristX - shoulder.x;
    const movement = currentExtension - previousExtension;
    
    // Detect punch extension
    const armExtended = movement > punchThreshold;
    // Detect retraction
    const armRetracted = Math.abs(movement) < retractThreshold;
    
    // Current time for cooldown
    const currentTime = millis();
    
    // Count punch if extended and cooldown expired
    if (!player.punching && armExtended && (currentTime - player.lastPunchTime) > COOLDOWN) {
      player.reps++;
      player.lastPunchTime = currentTime;
      punchFeedback(player.counterId);
      player.punching = true;
    }
    
    // Reset punch state when arm retracts
    if (player.punching && armRetracted) {
      player.punching = false;
    }
    
    // Update last wrist position
    player.lastWristX = wrist.x;
  }
}

// Update counter displays
function updateCounters() {
  select('#counter1').html(`RED: ${players.player1.reps}`);
  select('#counter2').html(`BLUE: ${players.player2.reps}`);
}

// Visual feedback for punch
function punchFeedback(counterId) {
  const counter = select(`#${counterId}`);
  counter.addClass('flash');
  setTimeout(() => counter.removeClass('flash'), 300);
  
  // Play punch sound if available
  if (typeof punchSound !== 'undefined') {
    punchSound.play();
  }
}