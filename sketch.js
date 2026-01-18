let isVR = false;
let angle = 0;
let stars = [];
let galaxies = [];
let galaxyRotation = 0;
let planets = [];
let selectedPlanet = null;
let isZooming = false;
let zoomProgress = 0;
let targetZoom = 1;
let cameraOffset = { x: 0, y: 0, z: 0 };
let targetCameraOffset = { x: 0, y: 0, z: 0 };

// Game variables
let gameState = 'exploring';
let currentLevel = 1;
let score = 0;
let questionsAnswered = 0;
let correctAnswers = 0;

// Textures for planets
let planetTextures = {};
let texturesLoaded = false;

// Planet data dengan informasi edukatif
let planetData = [
  {
    name: 'Merkurius',
    color: {r: 180, g: 140, b: 100},
    textureURL: 'https://i.imgur.com/5Z3jXGj.jpg', // Mercury texture
    facts: [
      'Planet terdekat dengan Matahari',
      'Tidak memiliki atmosfer',
      'Suhu siang hari bisa mencapai 430°C',
      'Planet terkecil di tata surya'
    ],
    questions: [
      {
        q: 'Planet manakah yang terdekat dengan Matahari?',
        options: ['Venus', 'Merkurius', 'Bumi', 'Mars'],
        correct: 1
      },
      {
        q: 'Berapa perkiraan suhu siang hari di Merkurius?',
        options: ['100°C', '250°C', '430°C', '600°C'],
        correct: 2
      }
    ]
  },
  {
    name: 'Venus',
    color: {r: 255, g: 200, b: 100},
    textureURL: 'https://i.imgur.com/RWXRC6j.jpg', // Venus texture
    facts: [
      'Planet terpanas di tata surya',
      'Berotasi berlawanan arah',
      'Atmosfer sangat tebal dengan CO2',
      'Disebut juga Bintang Kejora'
    ],
    questions: [
      {
        q: 'Planet manakah yang terpanas di tata surya?',
        options: ['Merkurius', 'Venus', 'Mars', 'Bumi'],
        correct: 1
      },
      {
        q: 'Apa kandungan utama atmosfer Venus?',
        options: ['Oksigen', 'Nitrogen', 'CO2', 'Helium'],
        correct: 2
      }
    ]
  },
  {
    name: 'Bumi',
    color: {r: 100, g: 150, b: 255},
    textureURL: 'https://i.imgur.com/BJlobcP.jpg', // Earth texture
    facts: [
      'Satu-satunya planet dengan kehidupan',
      '71% permukaannya adalah air',
      'Memiliki 1 satelit alami (Bulan)',
      'Atmosfer mengandung 21% oksigen'
    ],
    questions: [
      {
        q: 'Berapa persen permukaan Bumi yang tertutup air?',
        options: ['50%', '60%', '71%', '85%'],
        correct: 2
      },
      {
        q: 'Berapa jumlah satelit alami yang dimiliki Bumi?',
        options: ['0', '1', '2', '3'],
        correct: 1
      }
    ]
  },
  {
    name: 'Mars',
    color: {r: 255, g: 100, b: 80},
    textureURL: 'https://i.imgur.com/xR4c5If.jpg', // Mars texture
    facts: [
      'Disebut Planet Merah',
      'Memiliki gunung tertinggi di tata surya (Olympus Mons)',
      'Memiliki 2 bulan: Phobos dan Deimos',
      'Atmosfer sangat tipis'
    ],
    questions: [
      {
        q: 'Mengapa Mars disebut Planet Merah?',
        options: ['Karena panas', 'Karena oksida besi', 'Karena lava', 'Karena atmosfer'],
        correct: 1
      },
      {
        q: 'Berapa jumlah satelit alami Mars?',
        options: ['0', '1', '2', '4'],
        correct: 2
      }
    ]
  },
  {
    name: 'Jupiter',
    color: {r: 220, g: 180, b: 140},
    textureURL: 'jupiter.jpg', // Jupiter texture
    facts: [
      'Planet terbesar di tata surya',
      'Memiliki Bintik Merah Besar (badai raksasa)',
      'Memiliki lebih dari 79 bulan',
      'Terdiri dari gas (tidak punya permukaan padat)'
    ],
    questions: [
      {
        q: 'Planet manakah yang terbesar di tata surya?',
        options: ['Saturnus', 'Jupiter', 'Uranus', 'Neptunus'],
        correct: 1
      },
      {
        q: 'Apa yang dimaksud dengan Bintik Merah Besar di Jupiter?',
        options: ['Gunung', 'Badai raksasa', 'Kawah', 'Danau'],
        correct: 1
      }
    ]
  },
  {
    name: 'Saturnus',
    color: {r: 230, g: 210, b: 160},
    textureURL: 'https://i.imgur.com/dLWkulY.jpg', // Saturn texture
    facts: [
      'Terkenal dengan cincin indahnya',
      'Planet kedua terbesar',
      'Memiliki lebih dari 80 bulan',
      'Density-nya lebih rendah dari air'
    ],
    questions: [
      {
        q: 'Apa yang membuat Saturnus istimewa?',
        options: ['Warnanya', 'Cincinnya', 'Ukurannya', 'Suhunya'],
        correct: 1
      },
      {
        q: 'Apakah Saturnus bisa mengapung di air?',
        options: ['Ya, karena density-nya rendah', 'Tidak', 'Hanya setengahnya', 'Tergantung suhu'],
        correct: 0
      }
    ]
  },
  {
    name: 'Uranus',
    color: {r: 150, g: 230, b: 230},
    textureURL: 'https://i.imgur.com/aKvrQNx.jpg', // Uranus texture
    facts: [
      'Berotasi miring (hampir 90 derajat)',
      'Berwarna biru karena metana',
      'Planet terdingin di tata surya',
      'Memiliki 27 bulan yang diketahui'
    ],
    questions: [
      {
        q: 'Mengapa Uranus berwarna biru?',
        options: ['Karena air', 'Karena metana', 'Karena es', 'Karena gas nitrogen'],
        correct: 1
      },
      {
        q: 'Apa yang unik dari rotasi Uranus?',
        options: ['Sangat cepat', 'Miring hampir 90°', 'Berlawanan arah', 'Tidak berotasi'],
        correct: 1
      }
    ]
  },
  {
    name: 'Neptunus',
    color: {r: 100, g: 120, b: 255},
    textureURL: 'https://i.imgur.com/0xkG3h0.jpg', // Neptune texture
    facts: [
      'Planet terjauh dari Matahari',
      'Memiliki angin terkencang (2000 km/jam)',
      'Berwarna biru tua',
      'Memiliki 14 bulan yang diketahui'
    ],
    questions: [
      {
        q: 'Planet manakah yang terjauh dari Matahari?',
        options: ['Uranus', 'Neptunus', 'Pluto', 'Saturnus'],
        correct: 1
      },
      {
        q: 'Berapa kecepatan angin di Neptunus?',
        options: ['500 km/jam', '1000 km/jam', '2000 km/jam', '3000 km/jam'],
        correct: 2
      }
    ]
  }
];

function preload() {
  // Load planet textures
  planetData.forEach(data => {
    planetTextures[data.name] = loadImage(data.textureURL, 
      () => console.log(`Loaded: ${data.name}`),
      () => {
        console.log(`Failed to load: ${data.name}, using color instead`);
        planetTextures[data.name] = null;
      }
    );
  });
}

function setup() {
  if (typeof createVRCanvas === 'function') {
    createVRCanvas();
    isVR = true;
  } else {
    createCanvas(windowWidth, windowHeight, WEBGL);
    isVR = false;
  }

  // Membuat data bintang acak
  for (let i = 0; i < 400; i++) {
    stars.push({
      x: random(-2000, 2000),
      y: random(-2000, 2000),
      z: random(-2000, 2000),
      size: random(1, 3)
    });
  }
  
  // Membuat galaksi spiral
  for (let g = 0; g < 3; g++) {
    let galaxy = {
      x: random(-3000, 3000),
      y: random(-3000, 3000),
      z: random(-4000, -2000),
      rotation: random(TWO_PI),
      speed: random(0.001, 0.003),
      size: random(300, 600),
      particles: []
    };
    
    for (let i = 0; i < 150; i++) {
      let spiralAngle = i * 0.3;
      let radius = i * 2;
      let armOffset = random(-30, 30);
      
      galaxy.particles.push({
        angle: spiralAngle,
        radius: radius,
        offset: armOffset,
        brightness: random(100, 255),
        size: random(1, 3)
      });
    }
    
    galaxies.push(galaxy);
  }
  
  // Membuat planet sesuai level
  initializePlanets();
  noStroke();
  updateUI();
}

function initializePlanets() {
  planets = [];
  let numPlanets = min(3 + currentLevel, 8);
  
  for (let i = 0; i < numPlanets; i++) {
    let data = planetData[i];
    let angle = (i / numPlanets) * TWO_PI;
    let radius = 250;
    
    planets.push({
      x: cos(angle) * radius,
      y: sin(angle) * radius,
      z: 0,
      radius: random(40, 70),
      color: data.color,
      rotation: random(TWO_PI),
      rotationSpeed: random(0.005, 0.02),
      orbitAngle: random(TWO_PI),
      orbitSpeed: random(0.002, 0.005),
      orbitRadius: random(20, 50),
      data: data,
      hasBeenAsked: false
    });
  }
}

function draw() {
  background(5, 5, 15);

  if (isZooming) {
    zoomProgress = lerp(zoomProgress, 1, 0.08);
    if (zoomProgress > 0.95) {
      zoomProgress = 1;
      if (gameState === 'zooming') {
        gameState = 'questioning';
        showQuestion();
      }
    }
  } else {
    zoomProgress = lerp(zoomProgress, 0, 0.08);
  }

  cameraOffset.x = lerp(cameraOffset.x, targetCameraOffset.x, 0.1);
  cameraOffset.y = lerp(cameraOffset.y, targetCameraOffset.y, 0.1);
  cameraOffset.z = lerp(cameraOffset.z, targetCameraOffset.z, 0.1);

  if (selectedPlanet) {
    let zoomAmount = easeInOutCubic(zoomProgress);
    
    // Posisikan kamera ke kanan agar planet terlihat di sisi kanan layar
    let offsetX = width * 0.25; // Geser ke kanan
    
    camera(
      lerp(0, -selectedPlanet.x + offsetX, zoomAmount) + cameraOffset.x,
      lerp(0, -selectedPlanet.y, zoomAmount) + cameraOffset.y,
      lerp(800, 250, zoomAmount) + cameraOffset.z,
      lerp(0, selectedPlanet.x + offsetX, zoomAmount),
      lerp(0, selectedPlanet.y, zoomAmount),
      0,
      0, 1, 0
    );
  }

  push();
  for (let s of stars) {
    fill(255, random(150, 255));
    push();
    translate(s.x, s.y, s.z);
    sphere(isVR ? s.size * 0.005 : s.size);
    pop();
  }
  pop();

  galaxyRotation += 0.001;
  
  for (let galaxy of galaxies) {
    galaxy.rotation += galaxy.speed;
    
    push();
    translate(galaxy.x, galaxy.y, galaxy.z);
    rotateZ(galaxyRotation * 0.5);
    
    push();
    fill(255, 200, 255, 100);
    noStroke();
    sphere(isVR ? 0.02 : 20);
    fill(255, 150, 255, 50);
    sphere(isVR ? 0.04 : 40);
    pop();
    
    for (let p of galaxy.particles) {
      let totalAngle = p.angle + galaxy.rotation;
      
      for (let arm = 0; arm < 3; arm++) {
        let armAngle = totalAngle + (arm * TWO_PI / 3);
        let x = cos(armAngle) * p.radius;
        let y = sin(armAngle) * p.radius;
        let z = sin(p.angle * 0.5) * 20 + p.offset;
        
        push();
        translate(x, y, z);
        
        let colorMix = map(p.radius, 0, galaxy.size, 0, 1);
        let r = lerp(255, 100, colorMix);
        let g = lerp(150, 150, colorMix);
        let b = lerp(255, 255, colorMix);
        
        fill(r, g, b, p.brightness * 0.6);
        noStroke();
        sphere(isVR ? p.size * 0.002 : p.size);
        pop();
      }
    }
    pop();
  }

  ambientLight(40, 40, 60);
  pointLight(255, 0, 150, 200, 200, 200);
  pointLight(0, 255, 255, -200, -200, 200);
  
  for (let planet of planets) {
    pointLight(planet.color.r, planet.color.g, planet.color.b, planet.x, planet.y, planet.z);
  }

  for (let i = 0; i < planets.length; i++) {
    let planet = planets[i];
    
    planet.rotation += planet.rotationSpeed;
    planet.orbitAngle += planet.orbitSpeed;
    
    push();
    translate(planet.x, planet.y, planet.z);
    
    if (planet === selectedPlanet && isZooming) {
      push();
      fill(255, 255, 255, 30 + sin(frameCount * 0.1) * 20);
      noStroke();
      sphere(planet.radius * 2.2);
      
      // Tambah ring orbit bercahaya
      push();
      rotateX(PI / 3);
      noFill();
      stroke(255, 255, 255, 100 + sin(frameCount * 0.05) * 50);
      strokeWeight(2);
      circle(0, 0, planet.radius * 3);
      pop();
      
      pop();
    }
    
    push();
    rotateY(planet.orbitAngle);
    translate(planet.orbitRadius, 0, 0);
    fill(255, 255, 255, 200);
    sphere(planet.radius * 0.15);
    pop();
    
    rotateY(planet.rotation);
    rotateX(planet.rotation * 0.5);
    
    specularMaterial(planet.color.r, planet.color.g, planet.color.b);
    shininess(50);
    fill(planet.color.r, planet.color.g, planet.color.b);
    sphere(planet.radius);
    
    if (planet.data.name === 'Saturnus' || planet.data.name === 'Uranus') {
      push();
      rotateX(PI / 2);
      noFill();
      stroke(planet.color.r, planet.color.g, planet.color.b, 100);
      strokeWeight(3);
      for (let r = 1.3; r < 1.8; r += 0.1) {
        circle(0, 0, planet.radius * r * 2);
      }
      pop();
    }
    
    noStroke();
    fill(planet.color.r, planet.color.g, planet.color.b, 30);
    sphere(planet.radius * 1.3);
    
    pop();
  }
}

function mousePressed() {
  if (gameState !== 'exploring') return;
  
  for (let planet of planets) {
    let screenPos = getScreenPosition(planet.x, planet.y, planet.z);
    let d = dist(mouseX, mouseY, screenPos.x, screenPos.y);
    
    if (d < planet.radius * 1.5) {
      selectPlanet(planet);
      break;
    }
  }
}

function selectPlanet(planet) {
  selectedPlanet = planet;
  gameState = 'zooming';
  isZooming = true;
  zoomProgress = 0;
  
  document.getElementById('planet-name').textContent = planet.data.name.toUpperCase();
}

function showQuestion() {
  if (!selectedPlanet || selectedPlanet.hasBeenAsked) {
    resetZoom();
    return;
  }
  
  let questions = selectedPlanet.data.questions;
  let question = random(questions);
  
  // Show question panel (kiri)
  let panel = document.getElementById('question-panel');
  let questionText = document.getElementById('question-text');
  let optionsContainer = document.getElementById('options-container');
  let feedback = document.getElementById('feedback');
  
  questionText.textContent = question.q;
  optionsContainer.innerHTML = '';
  feedback.textContent = '';
  
  question.options.forEach((option, index) => {
    let btn = document.createElement('button');
    btn.className = 'option-btn';
    btn.textContent = option;
    btn.onclick = () => checkAnswer(index, question.correct, btn);
    optionsContainer.appendChild(btn);
  });
  
  panel.style.display = 'block';
  
  // Show planet info panel (kanan)
  let infoPanel = document.getElementById('planet-info-panel');
  let planetTitle = document.getElementById('planet-title');
  let planetFacts = document.getElementById('planet-facts');
  
  planetTitle.textContent = selectedPlanet.data.name.toUpperCase();
  planetFacts.innerHTML = '';
  
  selectedPlanet.data.facts.forEach(fact => {
    let factDiv = document.createElement('div');
    factDiv.className = 'planet-fact';
    factDiv.textContent = fact;
    planetFacts.appendChild(factDiv);
  });
  
  infoPanel.style.display = 'block';
  
  gameState = 'answering';
}

function checkAnswer(selected, correct, btn) {
  let buttons = document.querySelectorAll('.option-btn');
  buttons.forEach(b => b.disabled = true);
  
  questionsAnswered++;
  
  if (selected === correct) {
    btn.classList.add('correct');
    document.getElementById('feedback').innerHTML = '✓ Benar! +10 poin';
    document.getElementById('feedback').style.color = '#00ff64';
    score += 10;
    correctAnswers++;
    selectedPlanet.hasBeenAsked = true;
  } else {
    btn.classList.add('wrong');
    buttons[correct].classList.add('correct');
    document.getElementById('feedback').innerHTML = '✗ Salah! Jawaban yang benar: ' + buttons[correct].textContent;
    document.getElementById('feedback').style.color = '#ff0040';
  }
  
  updateUI();
  
  setTimeout(() => {
    document.getElementById('question-panel').style.display = 'none';
    document.getElementById('planet-info-panel').style.display = 'none';
    resetZoom();
    checkLevelComplete();
  }, 3000);
}

function resetZoom() {
  isZooming = false;
  gameState = 'exploring';
  selectedPlanet = null;
  targetCameraOffset = { x: 0, y: 0, z: 0 };
}

function checkLevelComplete() {
  let allAsked = planets.every(p => p.hasBeenAsked);
  
  if (allAsked) {
    currentLevel++;
    questionsAnswered = 0;
    
    setTimeout(() => {
      alert(`Level ${currentLevel - 1} Selesai!\nSkor Anda: ${score}\nLanjut ke Level ${currentLevel}!`);
      initializePlanets();
      updateUI();
    }, 500);
  }
}

function updateUI() {
  document.getElementById('level-num').textContent = currentLevel;
  document.getElementById('score').textContent = score;
}

function getScreenPosition(x, y, z) {
  let cam = { x: 0, y: 0, z: 800 };
  
  if (selectedPlanet && isZooming) {
    let zoomAmount = easeInOutCubic(zoomProgress);
    cam.x = lerp(0, -selectedPlanet.x, zoomAmount);
    cam.y = lerp(0, -selectedPlanet.y, zoomAmount);
    cam.z = lerp(800, 300, zoomAmount);
  }
  
  let dx = x - cam.x;
  let dy = y - cam.y;
  let dz = z - cam.z;
  
  let fov = PI / 3;
  let cameraZ = (height / 2) / tan(fov / 2);
  
  let screenX = (dx / -dz) * cameraZ + width / 2;
  let screenY = (dy / -dz) * cameraZ + height / 2;
  
  return { x: screenX, y: screenY };
}

function easeInOutCubic(t) {
  return t < 0.5 ? 4 * t * t * t : 1 - pow(-2 * t + 2, 3) / 2;
}

function windowResized() {
  if (!isVR) resizeCanvas(windowWidth, windowHeight);
}