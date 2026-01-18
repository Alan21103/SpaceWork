// Three.js Setup
let scene, camera, renderer;
let planets = [];
let stars = [];
let selectedPlanet = null;
let isZooming = false;
let zoomProgress = 0;
let raycaster, mouse;
const textureLoader = new THREE.TextureLoader();
textureLoader.setCrossOrigin('anonymous');

// Game variables
let gameState = 'exploring';
let currentLevel = 1;
let score = 0;

// Data Planet
const planetData = [
    {
        name: 'Merkurius',
        color: 0xB48C64,
        size: 1.2,
        textureURL: '8k_mercury.jpg',
        facts: ['Planet terdekat dengan Matahari', 'Suhu siang mencapai 430°C', 'Planet terkecil'],
        questions: [{ q: 'Planet terdekat dengan Matahari?', options: ['Venus', 'Merkurius', 'Bumi'], correct: 1 }]
    },
    {
        name: 'Venus',
        color: 0xFFC864,
        size: 0.9,
        textureURL: '8k_venus_surface.jpg',
        facts: ['Planet terpanas', 'Berotasi terbalik', 'Atmosfer CO2 tebal'],
        questions: [{ q: 'Planet terpanas di tata surya?', options: ['Merkurius', 'Venus', 'Mars'], correct: 1 }]
    },
    {
        name: 'Bumi',
        color: 0x6496FF,
        size: 1.0,
        textureURL: '8k_earth_daymap.jpg',
        facts: ['71% permukaannya air', 'Memiliki 1 satelit alami', 'Ada kehidupan'],
        questions: [{ q: 'Berapa persen air di Bumi?', options: ['50%', '71%', '85%'], correct: 1 }]
    },
    {
        name: 'Mars',
        color: 0xFF6450,
        size: 0.5,
        textureURL: '8k_mars.jpg',
        facts: ['Disebut Planet Merah', 'Punya gunung tertinggi', 'Atmosfer tipis'],
        questions: [{ q: 'Mengapa Mars berwarna merah?', options: ['Panas', 'Oksida Besi', 'Lava'], correct: 1 }]
    },
    {
        name: 'Jupiter',
        color: 0xDCB48C,
        size: 2.0,
        facts: ['Planet terbesar', 'Punya badai Bintik Merah Besar', 'Planet Gas'],
        questions: [{ q: 'Planet terbesar adalah?', options: ['Saturnus', 'Jupiter', 'Uranus'], correct: 1 }]
    },
    {
        name: 'Saturnus',
        color: 0xE6D2A0,
        size: 1.8,
        facts: ['Punya cincin indah', 'Bisa mengapung di air', 'Planet kedua terbesar'],
        questions: [{ q: 'Ciri khas Saturnus adalah?', options: ['Warnanya', 'Cincinnya', 'Ukurannya'], correct: 1 }]
    },
    {
        name: 'Uranus',
        color: 0x96E6E6,
        size: 1.2,
        facts: ['Rotasi miring 90 derajat', 'Berwarna biru metana', 'Planet terdingin'],
        questions: [{ q: 'Mengapa Uranus biru?', options: ['Air', 'Metana', 'Es'], correct: 1 }]
    },
    {
        name: 'Neptunus',
        color: 0x6478FF,
        size: 1.2,
        facts: ['Planet terjauh', 'Angin terkencang (2000 km/jam)', 'Biru tua'],
        questions: [{ q: 'Planet terjauh dari Matahari?', options: ['Uranus', 'Neptunus', 'Pluto'], correct: 1 }]
    }
];

function init() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x02050f);

    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 15;

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.getElementById('canvas-container').appendChild(renderer.domElement);

    raycaster = new THREE.Raycaster();
    mouse = new THREE.Vector2();

    const mainLight = new THREE.PointLight(0xffffff, 1.2, 100);
    mainLight.position.set(10, 10, 10);
    scene.add(mainLight);
    scene.add(new THREE.AmbientLight(0xffffff, 0.3));

    createStars();
    initializePlanets();

    window.addEventListener('resize', onWindowResize);
    window.addEventListener('click', onMouseClick);

    animate();
}

function createStars() {
    const starGeometry = new THREE.BufferGeometry();
    const starVertices = [];
    for (let i = 0; i < 1000; i++) {
        starVertices.push((Math.random() - 0.5) * 200, (Math.random() - 0.5) * 200, (Math.random() - 0.5) * 200);
    }
    starGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starVertices, 3));
    const starField = new THREE.Points(starGeometry, new THREE.PointsMaterial({ color: 0xffffff, size: 0.1 }));
    scene.add(starField);
    stars.push(starField);
}

function initializePlanets() {
    planets.forEach(p => scene.remove(p.mesh));
    planets = [];
    const numPlanets = Math.min(3 + currentLevel, 8);

    for (let i = 0; i < numPlanets; i++) {
        const data = planetData[i];
        const angle = (i / numPlanets) * Math.PI * 2;
        const radius = 8;

        const geometry = new THREE.SphereGeometry(data.size, 64, 64);
        const material = new THREE.MeshPhongMaterial({ color: data.color, shininess: 10 });

        if (data.textureURL) {
            textureLoader.load(data.textureURL, (tex) => {
                material.map = tex;
                material.color.setHex(0xffffff);
                material.needsUpdate = true;
            });
        }

        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.set(Math.cos(angle) * radius, Math.sin(angle) * radius, 0);
        scene.add(mesh);

        planets.push({
            mesh: mesh,
            data: data,
            hasBeenAsked: false,
            rotationSpeed: 0.005 + Math.random() * 0.005
        });
    }
}

function animate() {
    requestAnimationFrame(animate);
    planets.forEach(p => p.mesh.rotation.y += p.rotationSpeed);
    stars.forEach(s => s.rotation.y += 0.0001);

    if (isZooming && selectedPlanet) {
        zoomProgress = Math.min(zoomProgress + 0.02, 1);
        const t = easeInOutCubic(zoomProgress);
        const targetPos = new THREE.Vector3(selectedPlanet.mesh.position.x + 2, selectedPlanet.mesh.position.y, selectedPlanet.mesh.position.z + 4);
        camera.position.lerp(targetPos, t * 0.1);
        camera.lookAt(selectedPlanet.mesh.position);

        if (zoomProgress >= 1 && gameState === 'zooming') {
            gameState = 'questioning';
            showQuestion();
        }
    } else if (!isZooming && zoomProgress > 0) {
        zoomProgress = Math.max(zoomProgress - 0.02, 0);
        camera.position.lerp(new THREE.Vector3(0, 0, 15), 0.1);
        camera.lookAt(0, 0, 0);
    }
    renderer.render(scene, camera);
}

function onMouseClick(event) {
    if (gameState !== 'exploring') return;
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(planets.map(p => p.mesh));
    if (intersects.length > 0) {
        selectedPlanet = planets.find(p => p.mesh === intersects[0].object);
        gameState = 'zooming';
        isZooming = true;
        zoomProgress = 0;
        document.getElementById('planet-name').textContent = selectedPlanet.data.name.toUpperCase();
    }
}

function showQuestion() {
    const qData = selectedPlanet.data.questions[0];
    document.getElementById('question-text').textContent = qData.q;
    const container = document.getElementById('options-container');
    container.innerHTML = '';
    qData.options.forEach((opt, i) => {
        const btn = document.createElement('button');
        btn.className = 'option-btn';
        btn.textContent = opt;
        btn.onclick = () => checkAnswer(i, qData.correct, btn);
        container.appendChild(btn);
    });
    document.getElementById('question-panel').style.display = 'block';
    
    const infoFacts = document.getElementById('planet-facts');
    infoFacts.innerHTML = '';
    selectedPlanet.data.facts.forEach(f => {
        const div = document.createElement('div');
        div.className = 'planet-fact';
        div.textContent = f;
        infoFacts.appendChild(div);
    });
    document.getElementById('planet-title').textContent = selectedPlanet.data.name;
    document.getElementById('planet-info-panel').style.display = 'block';
    gameState = 'answering';
}

function checkAnswer(selected, correct, btn) {
    const btns = document.querySelectorAll('.option-btn');
    btns.forEach(b => b.disabled = true);
    if (selected === correct) {
        btn.classList.add('correct');
        score += 10;
        selectedPlanet.hasBeenAsked = true;
    } else {
        btn.classList.add('wrong');
        btns[correct].classList.add('correct');
    }
    document.getElementById('score').textContent = score;
    setTimeout(() => {
        document.getElementById('question-panel').style.display = 'none';
        document.getElementById('planet-info-panel').style.display = 'none';
        isZooming = false;
        gameState = 'exploring';
        if (planets.every(p => p.hasBeenAsked)) {
            currentLevel++;
            alert("Level Complete!");
            initializePlanets();
            document.getElementById('level-num').textContent = currentLevel;
        }
    }, 2000);
}

function easeInOutCubic(t) { return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

init();