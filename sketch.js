let isVR = false;
let angle = 0;
let stars = []; // Array untuk menyimpan koordinat bintang
let galaxies = []; // Array untuk galaksi
let galaxyRotation = 0;
let planets = []; // Array untuk planet-planet
let selectedPlanet = null;
let isDragging = false;

function setup() {
  if (typeof createVRCanvas === 'function') {
    createVRCanvas();
    isVR = true;
  } else {
    createCanvas(windowWidth, windowHeight, WEBGL);
    isVR = false;
  }

  // Membuat data bintang acak (angkasa 3D)
  for (let i = 0; i < 400; i++) {
    stars.push({
      x: random(-2000, 2000),
      y: random(-2000, 2000),
      z: random(-2000, 2000),
      size: random(1, 3)
    });
  }
  
  // Membuat beberapa galaksi spiral
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
    
    // Membuat partikel spiral untuk setiap galaksi
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
  
  // Membuat beberapa planet 3D dengan berbagai warna dan ukuran
  let planetColors = [
    {r: 255, g: 100, b: 100, name: 'Mars'},     // Merah
    {r: 100, g: 150, b: 255, name: 'Neptune'},  // Biru
    {r: 255, g: 200, b: 100, name: 'Venus'},    // Kuning keemasan
    {r: 150, g: 255, b: 150, name: 'Earth'},    // Hijau
    {r: 200, g: 150, b: 255, name: 'Purple'}    // Ungu
  ];
  
  for (let i = 0; i < 5; i++) {
    let colorData = planetColors[i];
    planets.push({
      x: random(-300, 300),
      y: random(-300, 300),
      z: random(-100, 100),
      targetX: 0,
      targetY: 0,
      targetZ: 0,
      radius: random(40, 80),
      color: colorData,
      rotation: random(TWO_PI),
      rotationSpeed: random(0.005, 0.02),
      orbitAngle: random(TWO_PI),
      orbitSpeed: random(0.002, 0.005),
      orbitRadius: random(20, 50)
    });
  }
  
  noStroke();
}

function draw() {
  background(5, 5, 15); // Hitam kebiruan sangat gelap

  // --- 1. LATAR BELAKANG ANGKASA (STARFIELD) ---
  push();
  for (let i = 0; i < stars.length; i++) {
    let s = stars[i];
    fill(255, random(150, 255)); // Efek kelap-kelip halus
    push();
    translate(s.x, s.y, s.z);
    let sz = isVR ? s.size * 0.005 : s.size;
    sphere(sz); 
    pop();
  }
  pop();

  // --- 2. GALAKSI SPIRAL BERGERAK ---
  galaxyRotation += 0.001;
  
  for (let g = 0; g < galaxies.length; g++) {
    let galaxy = galaxies[g];
    galaxy.rotation += galaxy.speed;
    
    push();
    translate(galaxy.x, galaxy.y, galaxy.z);
    rotateZ(galaxyRotation * 0.5);
    
    // Inti galaksi (glow effect)
    push();
    fill(255, 200, 255, 100);
    noStroke();
    sphere(isVR ? 0.02 : 20);
    fill(255, 150, 255, 50);
    sphere(isVR ? 0.04 : 40);
    pop();
    
    // Partikel spiral galaksi
    for (let i = 0; i < galaxy.particles.length; i++) {
      let p = galaxy.particles[i];
      let totalAngle = p.angle + galaxy.rotation;
      
      // Membuat 2-3 lengan spiral
      for (let arm = 0; arm < 3; arm++) {
        let armAngle = totalAngle + (arm * TWO_PI / 3);
        let x = cos(armAngle) * p.radius;
        let y = sin(armAngle) * p.radius;
        let z = sin(p.angle * 0.5) * 20 + p.offset;
        
        push();
        translate(x, y, z);
        
        // Warna gradient dari pusat ke luar (pink ke biru)
        let colorMix = map(p.radius, 0, galaxy.size, 0, 1);
        let r = lerp(255, 100, colorMix);
        let g = lerp(150, 150, colorMix);
        let b = lerp(255, 255, colorMix);
        
        fill(r, g, b, p.brightness * 0.6);
        noStroke();
        
        let particleSize = isVR ? p.size * 0.002 : p.size;
        sphere(particleSize);
        pop();
      }
    }
    pop();
  }

  // --- 3. PENCAHAYAAN NEON ---
  ambientLight(40, 40, 60);
  pointLight(255, 0, 150, 200, 200, 200); // Cahaya Pink
  pointLight(0, 255, 255, -200, -200, 200); // Cahaya Cyan
  
  // Cahaya dari setiap planet
  for (let planet of planets) {
    pointLight(planet.color.r, planet.color.g, planet.color.b, planet.x, planet.y, planet.z);
  }

  // --- 4. RENDERING PLANET-PLANET ---
  for (let i = 0; i < planets.length; i++) {
    let planet = planets[i];
    
    // Update posisi dengan lerp untuk smooth movement
    planet.x = lerp(planet.x, planet.targetX, 0.1);
    planet.y = lerp(planet.y, planet.targetY, 0.1);
    planet.z = lerp(planet.z, planet.targetZ, 0.1);
    
    // Update rotasi planet
    planet.rotation += planet.rotationSpeed;
    planet.orbitAngle += planet.orbitSpeed;
    
    push();
    translate(planet.x, planet.y, planet.z);
    
    // Efek orbit kecil (satelit mini)
    push();
    rotateY(planet.orbitAngle);
    translate(planet.orbitRadius, 0, 0);
    fill(255, 255, 255, 200);
    sphere(planet.radius * 0.15);
    pop();
    
    // Rotasi planet
    rotateY(planet.rotation);
    rotateX(planet.rotation * 0.5);
    
    // Material planet dengan specular
    specularMaterial(planet.color.r, planet.color.g, planet.color.b);
    shininess(50);
    fill(planet.color.r, planet.color.g, planet.color.b);
    sphere(planet.radius);
    
    // Cincin (ring) untuk beberapa planet
    if (i % 2 === 0) {
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
    
    // Glow effect di sekitar planet
    noStroke();
    fill(planet.color.r, planet.color.g, planet.color.b, 30);
    sphere(planet.radius * 1.3);
    
    pop();
  }
}

function mousePressed() {
  // Cek apakah klik pada planet
  for (let planet of planets) {
    let d = dist(mouseX - width/2, mouseY - height/2, planet.x, planet.y);
    if (d < planet.radius) {
      selectedPlanet = planet;
      isDragging = true;
      break;
    }
  }
}

function mouseDragged() {
  if (isDragging && selectedPlanet) {
    // Update target posisi planet sesuai mouse
    selectedPlanet.targetX = mouseX - width/2;
    selectedPlanet.targetY = mouseY - height/2;
  }
}

function mouseReleased() {
  isDragging = false;
  selectedPlanet = null;
}

function windowResized() {
  if (!isVR) resizeCanvas(windowWidth, windowHeight);
}