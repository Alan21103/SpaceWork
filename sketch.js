let scene, camera, renderer, raycaster, mouse, controls;
let planets = [], stars = [], meteors = [], sunMesh = null, orbitLines = [];
let currentMode = 'game', isInitialized = false, isOrbiting = true;
let selectedPlanet = null, isZooming = false;
let score = 0, lives = 3, sectorIndex = 0, planetsAnsweredInWave = 0, shakeIntensity = 0;

const textureLoader = new THREE.TextureLoader();

const atmosphereVertex = `varying vec3 vNormal; void main() { vNormal = normalize(normalMatrix * normal); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`;
const atmosphereFragment = `varying vec3 vNormal; uniform vec3 glowColor; void main() { float intensity = pow(0.7 - dot(vNormal, vec3(0,0,1.0)), 6.0); gl_FragColor = vec4(glowColor, intensity); }`;

function initProject(mode) {
    if (isInitialized) return;
    isInitialized = true; currentMode = mode;
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 5000);
    camera.position.set(0, 150, mode === 'gallery' ? 250 : 200);
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    document.getElementById('canvas-container').appendChild(renderer.domElement);
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    scene.add(new THREE.AmbientLight(0xffffff, 0.8), new THREE.PointLight(0xffffff, 2, 1000));
    createStars();
    if (mode === 'gallery') { spawnSun(); buildGallerySystem(); setupOrbitToggle(); } else { startNewWave(); }
    window.addEventListener('click', onSceneClick);
    animate();
}

function createAtmosphere(size, color) {
    return new THREE.Mesh(
        new THREE.SphereGeometry(size * 1.12, 64, 64),
        new THREE.ShaderMaterial({ vertexShader: atmosphereVertex, fragmentShader: atmosphereFragment, uniforms: { glowColor: { value: new THREE.Color(color) } }, side: THREE.BackSide, transparent: true, blending: THREE.AdditiveBlending })
    );
}

function spawnSun() {
    const data = planetData[0];
    sunMesh = new THREE.Mesh(new THREE.SphereGeometry(data.size, 64, 64), new THREE.MeshPhongMaterial({ map: textureLoader.load(data.texture), emissive: 0xffaa00, emissiveIntensity: 0.5 }));
    sunMesh.add(createAtmosphere(data.size, data.glow)); scene.add(sunMesh);
}

function buildGallerySystem() {
    planets = []; orbitLines = [];
    planetData.forEach((data, index) => {
        if (index === 0) return;
        const mesh = new THREE.Mesh(new THREE.SphereGeometry(data.size, 64, 64), new THREE.MeshPhongMaterial({ map: textureLoader.load(data.texture), shininess: 25 }));
        mesh.add(createAtmosphere(data.size, data.glow));
        const orbitLine = new THREE.Mesh(new THREE.RingGeometry(data.orbit - 0.2, data.orbit + 0.2, 128), new THREE.MeshBasicMaterial({ color: 0x00d4ff, side: THREE.DoubleSide, transparent: true, opacity: 0.2 }));
        orbitLine.rotation.x = Math.PI / 2; scene.add(orbitLine); orbitLines.push(orbitLine);
        const angle = Math.random() * Math.PI * 2;
        mesh.position.set(Math.cos(angle) * data.orbit, 0, Math.sin(angle) * data.orbit);
        scene.add(mesh);
        planets.push({ mesh, data, rotSpeed: 0.01, orbitAngle: angle, answered: false });
    });
}

function startNewWave() {
    planets.forEach(p => scene.remove(p.mesh)); planets = []; planetsAnsweredInWave = 0;
    document.getElementById('current-sector-text').textContent = sectorIndex + 1;
    const count = Math.min(2 + sectorIndex, 8); 
    for (let i = 1; i <= count; i++) {
        const data = planetData[i];
        const mesh = new THREE.Mesh(new THREE.SphereGeometry(data.size * 4.5, 64, 64), new THREE.MeshPhongMaterial({ map: textureLoader.load(data.texture), shininess: 25 }));
        mesh.add(createAtmosphere(data.size * 4.5, data.glow));
        const angle = ((i-1) / count) * Math.PI * 2;
        mesh.position.set(Math.cos(angle) * 120, Math.sin(angle) * 120, 0);
        scene.add(mesh);
        planets.push({ mesh, data, rotSpeed: 0.015, answered: false });
    }
}

// --- LOGIKA METEOR ---
function updateMeteors() {
    if (Math.random() < 0.04) {
        const m = new THREE.Mesh(new THREE.DodecahedronGeometry(0.5 + Math.random(), 0), new THREE.MeshPhongMaterial({ color: 0x888888, flatShading: true }));
        m.position.set(300 * (Math.random() > 0.5 ? 1 : -1), (Math.random()-0.5)*200, (Math.random()-0.5)*200);
        m.userData = { v: new THREE.Vector3(-Math.sign(m.position.x) * (1.5 + Math.random()), (Math.random()-0.5)*0.5, (Math.random()-0.5)*0.5) };
        scene.add(m); meteors.push(m);
    }
    for(let i=meteors.length-1; i>=0; i--) { 
        meteors[i].position.add(meteors[i].userData.v); 
        meteors[i].rotation.x += 0.02;
        if(meteors[i].position.length() > 600) { scene.remove(meteors[i]); meteors.splice(i, 1); } 
    }
}

function triggerRocket(message, callback) {
    const rocket = document.getElementById('rocket-container');
    const smokeText = document.getElementById('smoke-text');
    smokeText.textContent = message;
    rocket.style.transition = 'none';
    rocket.style.left = '-150vw'; 
    rocket.style.opacity = '1';
    rocket.offsetHeight; 
    setTimeout(() => {
        rocket.style.transition = '3.5s cubic-bezier(0.45, 0.05, 0.55, 0.95)';
        rocket.style.left = '150vw';
        setTimeout(callback, 1750);
    }, 100);
    setTimeout(() => {
        rocket.style.opacity = '0';
        setTimeout(() => { rocket.style.transition = 'none'; rocket.style.left = '-150vw'; }, 500);
    }, 3600);
}

function animate() {
    requestAnimationFrame(animate);
    if (sunMesh) sunMesh.rotation.y += 0.002;
    planets.forEach(p => { 
        p.mesh.rotation.y += p.rotSpeed; 
        if (!isZooming && currentMode === 'gallery' && isOrbiting) {
            p.orbitAngle += p.data.orbitSpeed;
            p.mesh.position.set(Math.cos(p.orbitAngle) * p.data.orbit, 0, Math.sin(p.orbitAngle) * p.data.orbit);
        }
    });
    updateMeteors();
    if (shakeIntensity > 0) {
        camera.position.x += (Math.random() - 0.5) * shakeIntensity;
        camera.position.y += (Math.random() - 0.5) * shakeIntensity;
        shakeIntensity *= 0.92; if (shakeIntensity < 0.05) shakeIntensity = 0;
    }
    if (isZooming && selectedPlanet) {
        controls.enabled = false;
        const pPos = selectedPlanet.mesh.position.clone();
        let camOffset = currentMode === 'game' ? -15 : 12;
        let lookAtOffset = currentMode === 'game' ? -15 : 3;
        let zoom = currentMode === 'game' ? 25 : selectedPlanet.data.size * 4.2;
        camera.position.lerp(new THREE.Vector3(pPos.x + camOffset, pPos.y, pPos.z + zoom), 0.08);
        camera.lookAt(new THREE.Vector3(pPos.x + lookAtOffset, pPos.y, pPos.z));
    } else { controls.enabled = true; controls.update(); }
    renderer.render(scene, camera);
}

function onSceneClick(e) {
    if (isZooming) return;
    mouse = new THREE.Vector2((e.clientX/window.innerWidth)*2-1, -(e.clientY/window.innerHeight)*2+1);
    raycaster = new THREE.Raycaster(); raycaster.setFromCamera(mouse, camera);
    const hits = raycaster.intersectObjects(planets.map(p => p.mesh), true);
    if (hits.length > 0) {
        let obj = hits[0].object; while(obj.parent && !planets.find(p => p.mesh === obj)) obj = obj.parent;
        selectedPlanet = planets.find(p => p.mesh === obj);
        if (selectedPlanet) {
            if (currentMode === 'game' && selectedPlanet.answered) return;
            isZooming = true;
            if (currentMode === 'gallery') {
                sunMesh.visible = false; orbitLines.forEach(l => l.visible = false);
                planets.forEach(p => { if (p !== selectedPlanet) p.mesh.visible = false; });
            }
            showUI(currentMode);
        }
    }
}

function showUI(type) {
    document.getElementById('planet-name-display').textContent = selectedPlanet.data.name.toUpperCase();
    if (type === 'game') {
        const qIdx = sectorIndex < 4 ? 0 : 1;
        const quest = selectedPlanet.data.questions[qIdx] || selectedPlanet.data.questions[0];
        document.getElementById('question-text').textContent = quest.q;
        const opt = document.getElementById('options-container'); opt.innerHTML = '';
        quest.options.forEach((o, i) => { const b = document.createElement('button'); b.className = 'option-btn'; b.textContent = o; b.onclick = () => verifyAnswer(i, b, quest.correct); opt.appendChild(b); });
        document.getElementById('question-panel').style.display = 'block';
    } else {
        document.getElementById('planet-facts').innerHTML = selectedPlanet.data.facts.map(f => `<p>► ${f}</p>`).join('');
        document.getElementById('planet-info-panel').style.display = 'block';
        const b = document.getElementById('close-gallery-info'); b.style.display = 'block';
        b.onclick = () => { 
            isZooming = false; document.getElementById('planet-info-panel').style.display = 'none'; 
            document.getElementById('planet-name-display').textContent = "PILIH PLANET"; 
            sunMesh.visible = true; orbitLines.forEach(l => l.visible = true); planets.forEach(p => p.mesh.visible = true);
        };
    }
}

function verifyAnswer(idx, btn, correct) {
    const allButtons = document.querySelectorAll('.option-btn');
    allButtons.forEach(b => b.style.pointerEvents = 'none');
    if (idx === correct) {
        score += 10; btn.style.background = "linear-gradient(180deg, #00ff88 0%, #009955 100%)";
        selectedPlanet.answered = true; planetsAnsweredInWave++;
        const totalInWave = Math.min(2 + sectorIndex, 8);
        if (planetsAnsweredInWave === totalInWave) {
            sectorIndex++;
            setTimeout(() => {
                isZooming = false; document.getElementById('question-panel').style.display = 'none';
                if (sectorIndex >= 10) { customSwal('MASTER!', 'Selesai!', 'success').then(() => location.reload()); }
                else { triggerRocket(`SECTOR ${sectorIndex} BERHASIL!`, startNewWave); }
            }, 1000);
            return;
        }
    } else {
        lives--; shakeIntensity = 7.5; btn.classList.add('shake-anim');
        btn.style.background = "linear-gradient(180deg, #ff4d4d 0%, #cc0000 100%)";
        document.getElementById('lives-counter').textContent = `x${lives}`;
        if (lives <= 0) { setTimeout(() => customSwal('GAGAL', 'Energi habis!', 'error').then(() => location.reload()), 1000); return; }
    }
    document.getElementById('score').textContent = score;
    setTimeout(() => { isZooming = false; document.getElementById('question-panel').style.display = 'none'; document.getElementById('planet-name-display').textContent = "PILIH PLANET"; }, 1200);
}

function setupOrbitToggle() {
    const btn = document.getElementById('orbit-toggle-btn');
    btn.onclick = () => {
        isOrbiting = !isOrbiting; btn.textContent = isOrbiting ? "ORBIT: JALAN" : "ORBIT: BERHENTI";
        btn.style.background = isOrbiting ? "linear-gradient(180deg, #00ff88 0%, #009955 100%)" : "linear-gradient(180deg, #ff4d4d 0%, #cc0000 100%)";
    };
}

function createStars() { const geo = new THREE.BufferGeometry(); const pos = []; for(let i=0; i<4000; i++) pos.push((Math.random()-0.5)*4000, (Math.random()-0.5)*4000, (Math.random()-0.5)*4000); geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); scene.add(new THREE.Points(geo, new THREE.PointsMaterial({color: 0xffffff, size: 1.5}))); }
window.addEventListener('resize', () => { camera.aspect = window.innerWidth / window.innerHeight; camera.updateProjectionMatrix(); renderer.setSize(window.innerWidth, window.innerHeight); });