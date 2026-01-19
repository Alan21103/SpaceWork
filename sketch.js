let scene, camera, renderer, raycaster, mouse;
let planets = [];
let stars = [];
let selectedPlanet = null;
let isZooming = false;
let gameState = 'exploring';
let score = 0;

window.gameDifficulty = 'sedang'; 

const diffSettings = {
    mudah: { count: 3, speed: 0.003, scoreMult: 5 },
    sedang: { count: 5, speed: 0.008, scoreMult: 10 },
    sulit: { count: 8, speed: 0.018, scoreMult: 20 }
};

const planetData = [
    { name: 'Merkurius', color: 0xB48C64, size: 1.0, facts: ['Terdekat dengan Matahari', 'Suhu sangat panas'], questions: [{ q: 'Planet terdekat Matahari?', options: ['Mars', 'Merkurius', 'Venus'], correct: 1 }] },
    { name: 'Venus', color: 0xFFC864, size: 1.2, facts: ['Planet terpanas', 'Berotasi terbalik'], questions: [{ q: 'Planet terpanas adalah?', options: ['Bumi', 'Venus', 'Merkurius'], correct: 1 }] },
    { name: 'Bumi', color: 0x6496FF, size: 1.3, facts: ['Memiliki kehidupan', 'Satu-satunya yang berair'], questions: [{ q: 'Berapa persen air di Bumi?', options: ['50%', '71%', '90%'], correct: 1 }] },
    { name: 'Mars', color: 0xFF6450, size: 1.1, facts: ['Planet Merah', 'Kaya oksida besi'], questions: [{ q: 'Kenapa Mars merah?', options: ['Oksida Besi', 'Lava', 'Gas'], correct: 0 }] },
    { name: 'Jupiter', color: 0xD3A17E, size: 2.0, facts: ['Planet terbesar', 'Planet gas'], questions: [{ q: 'Planet terbesar?', options: ['Saturnus', 'Jupiter', 'Bumi'], correct: 1 }] }
];

function initGame() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x02050f);

    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 18;

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    
    const container = document.getElementById('canvas-container');
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    raycaster = new THREE.Raycaster();
    mouse = new THREE.Vector2();

    const light = new THREE.PointLight(0xffffff, 1.5, 100);
    light.position.set(10, 10, 10);
    scene.add(light, new THREE.AmbientLight(0xffffff, 0.4));

    createStars();
    spawnPlanets(); 

    window.addEventListener('resize', onResize);
    window.addEventListener('click', onClick);
    animate();
}

function spawnPlanets() {
    planets.forEach(p => scene.remove(p.mesh));
    planets = [];
    const setting = diffSettings[window.gameDifficulty];
    
    for (let i = 0; i < setting.count; i++) {
        const data = planetData[i % planetData.length];
        const angle = (i / setting.count) * Math.PI * 2;
        const radius = 9;
        const mesh = new THREE.Mesh(
            new THREE.SphereGeometry(data.size, 32, 32),
            new THREE.MeshPhongMaterial({ color: data.color, shininess: 20 })
        );
        mesh.position.set(Math.cos(angle) * radius, Math.sin(angle) * radius, 0);
        scene.add(mesh);
        planets.push({ mesh, data, rotSpeed: setting.speed + Math.random() * 0.005 });
    }
}

function animate() {
    requestAnimationFrame(animate);
    planets.forEach(p => p.mesh.rotation.y += p.rotSpeed);
    stars.rotation.y += 0.0002;

    if (isZooming && selectedPlanet) {
        const target = new THREE.Vector3(selectedPlanet.mesh.position.x, selectedPlanet.mesh.position.y, 4);
        camera.position.lerp(target, 0.05);
        camera.lookAt(selectedPlanet.mesh.position);
    } else {
        camera.position.lerp(new THREE.Vector3(0, 0, 18), 0.05);
        camera.lookAt(0, 0, 0);
    }
    renderer.render(scene, camera);
}

function onClick(event) {
    if (gameState !== 'exploring') return;
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);
    const hits = raycaster.intersectObjects(planets.map(p => p.mesh));
    if (hits.length > 0) {
        selectedPlanet = planets.find(p => p.mesh === hits[0].object);
        isZooming = true;
        gameState = 'questioning';
        showUI();
    }
}

function showUI() {
    document.getElementById('planet-name-display').textContent = selectedPlanet.data.name.toUpperCase();
    document.getElementById('question-text').textContent = selectedPlanet.data.questions[0].q;
    const optCont = document.getElementById('options-container');
    optCont.innerHTML = '';
    selectedPlanet.data.questions[0].options.forEach((opt, i) => {
        const btn = document.createElement('button');
        btn.className = 'option-btn';
        btn.textContent = opt;
        btn.onclick = () => verifyAnswer(i, btn);
        optCont.appendChild(btn);
    });
    const infoCont = document.getElementById('planet-facts');
    infoCont.innerHTML = selectedPlanet.data.facts.map(f => `<p>• ${f}</p>`).join('');
    document.getElementById('question-panel').style.display = 'block';
    document.getElementById('planet-info-panel').style.display = 'block';
}

function verifyAnswer(idx, btn) {
    const correct = selectedPlanet.data.questions[0].correct;
    const btns = document.querySelectorAll('.option-btn');
    btns.forEach(b => b.disabled = true);
    if (idx === correct) {
        btn.classList.add('correct');
        score += diffSettings[window.gameDifficulty].scoreMult;
    } else {
        btn.classList.add('wrong');
        btns[correct].classList.add('correct');
    }
    document.getElementById('score').textContent = score;
    setTimeout(() => {
        isZooming = false;
        gameState = 'exploring';
        document.getElementById('question-panel').style.display = 'none';
        document.getElementById('planet-info-panel').style.display = 'none';
        document.getElementById('planet-name-display').textContent = "EKSPLORASI";
    }, 2000);
}

function createStars() {
    const geo = new THREE.BufferGeometry();
    const pos = [];
    for(let i=0; i<2000; i++) pos.push((Math.random()-0.5)*200, (Math.random()-0.5)*200, (Math.random()-0.5)*200);
    geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    stars = new THREE.Points(geo, new THREE.PointsMaterial({color: 0xffffff, size: 0.1}));
    scene.add(stars);
}

function onResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}