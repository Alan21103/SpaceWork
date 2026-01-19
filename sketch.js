let scene, camera, renderer, raycaster, mouse, controls;
let planets = [], stars = [], meteors = [], sunMesh = null;
let currentMode = 'game', isInitialized = false, isOrbiting = true;
let selectedPlanet = null, isZooming = false, gameState = 'exploring';
let score = 0, lives = 3, currentWave = 1, planetsAnsweredInWave = 0;

const textureLoader = new THREE.TextureLoader();
const meteorTexture = textureLoader.load('ceres.jpg');

const atmosphereVertex = `varying vec3 vNormal; void main() { vNormal = normalize(normalMatrix * normal); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`;
const atmosphereFragment = `varying vec3 vNormal; uniform vec3 glowColor; void main() { float intensity = pow(0.6 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.5); gl_FragColor = vec4(glowColor, 1.0) * intensity; }`;

function initProject(mode) {
    if (isInitialized) return;
    isInitialized = true; currentMode = mode;
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 5000);
    camera.position.set(0, 150, mode === 'gallery' ? 250 : 100);
    
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    document.getElementById('canvas-container').appendChild(renderer.domElement);
    
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    scene.add(new THREE.AmbientLight(0xffffff, 0.8));

    createStars();

    // MATAHARI HANYA DI GALERI
    if (mode === 'gallery') { 
        spawnSun();
        buildGallerySystem(); 
        setupOrbitToggle(); 
    } else { 
        updateHighscoreHUD(); 
        startNewWave(); 
    }
    window.addEventListener('click', onSceneClick);
    animate();
}

function spawnSun() {
    const data = planetData[0];
    const mat = new THREE.MeshPhongMaterial({ map: textureLoader.load(data.texture), emissive: 0xffaa00, emissiveIntensity: 0.5 });
    sunMesh = new THREE.Mesh(new THREE.SphereGeometry(data.size, 64, 64), mat);
    const sunGlow = new THREE.Mesh(new THREE.SphereGeometry(data.size * 1.25, 64, 64), new THREE.ShaderMaterial({ vertexShader: atmosphereVertex, fragmentShader: atmosphereFragment, uniforms: { glowColor: { value: new THREE.Color(data.glow) } }, side: THREE.BackSide, transparent: true, blending: THREE.AdditiveBlending }));
    sunMesh.add(sunGlow);
    scene.add(new THREE.PointLight(0xffffff, 2, 1000), sunMesh);
}

function buildGallerySystem() {
    planets = [];
    planetData.forEach((data, index) => {
        if (index === 0) return; // Skip Matahari
        const mesh = new THREE.Mesh(new THREE.SphereGeometry(data.size, 64, 64), new THREE.MeshPhongMaterial({ map: textureLoader.load(data.texture), shininess: 25 }));
        const atmosphere = new THREE.Mesh(new THREE.SphereGeometry(data.size * 1.15, 64, 64), new THREE.ShaderMaterial({ vertexShader: atmosphereVertex, fragmentShader: atmosphereFragment, uniforms: { glowColor: { value: new THREE.Color(data.glow) } }, side: THREE.BackSide, transparent: true, blending: THREE.AdditiveBlending }));
        mesh.add(atmosphere);
        const angle = Math.random() * Math.PI * 2;
        mesh.position.set(Math.cos(angle) * data.orbit, 0, Math.sin(angle) * data.orbit);
        const orbit = new THREE.Mesh(new THREE.RingGeometry(data.orbit - 0.2, data.orbit + 0.2, 128), new THREE.MeshBasicMaterial({ color: 0x00d4ff, side: THREE.DoubleSide, transparent: true, opacity: 0.3 }));
        orbit.rotation.x = Math.PI / 2; scene.add(orbit);
        scene.add(mesh);
        planets.push({ mesh, data, rotSpeed: 0.01, orbitAngle: angle });
    });
}

function startNewWave() { planetsAnsweredInWave = 0; document.getElementById('wave-display').textContent = currentWave; spawnGamePlanets(Math.min(3 + currentWave, 8), 0.005 + (currentWave * 0.004)); }

function spawnGamePlanets(count, speed) {
    planets.forEach(p => scene.remove(p.mesh)); planets = [];
    for (let i = 0; i < count; i++) {
        const data = planetData[(i % 8) + 1], angle = (i / count) * Math.PI * 2, orbitRadius = 50 + (i * 8);
        const mesh = new THREE.Mesh(new THREE.SphereGeometry(data.size, 64, 64), new THREE.MeshPhongMaterial({ map: textureLoader.load(data.texture), shininess: 25 }));
        const atmosphere = new THREE.Mesh(new THREE.SphereGeometry(data.size * 1.15, 64, 64), new THREE.ShaderMaterial({ vertexShader: atmosphereVertex, fragmentShader: atmosphereFragment, uniforms: { glowColor: { value: new THREE.Color(data.glow) } }, side: THREE.BackSide, transparent: true, blending: THREE.AdditiveBlending }));
        mesh.add(atmosphere);
        mesh.position.set(Math.cos(angle) * orbitRadius, Math.sin(angle) * orbitRadius, 0);
        scene.add(mesh);
        planets.push({ mesh, data, rotSpeed: 0.02, orbitAngle: angle, orbitRadius, revSpeed: speed });
    }
}

function updateMeteors() {
    if (Math.random() < 0.02) {
        const m = new THREE.Mesh(new THREE.DodecahedronGeometry(0.5 + Math.random(), 0), new THREE.MeshPhongMaterial({ map: meteorTexture, color: 0x888888, flatShading: true }));
        const dist = 200, side = Math.random() > 0.5 ? 1 : -1;
        m.position.set(side * dist, (Math.random()-0.5)*100, (Math.random()-0.5)*100);
        m.userData = { v: new THREE.Vector3(-side * (0.8 + Math.random()), (Math.random()-0.5)*0.2, (Math.random()-0.5)*0.2) };
        scene.add(m); meteors.push(m);
    }
    for(let i=meteors.length-1; i>=0; i--) { meteors[i].position.add(meteors[i].userData.v); if(meteors[i].position.length() > 400) { scene.remove(meteors[i]); meteors.splice(i, 1); } }
}

function animate() {
    requestAnimationFrame(animate);
    if (sunMesh) sunMesh.rotation.y += 0.002;
    if (!isZooming) {
        planets.forEach(p => {
            if (!p.answered) {
                p.mesh.rotation.y += p.rotSpeed;
                if (isOrbiting) {
                    p.orbitAngle += (currentMode === 'gallery' ? p.data.orbitSpeed : p.revSpeed);
                    const r = (currentMode === 'gallery' ? p.data.orbit : p.orbitRadius);
                    p.mesh.position.x = Math.cos(p.orbitAngle) * r;
                    p.mesh.position[currentMode === 'gallery' ? 'z' : 'y'] = Math.sin(p.orbitAngle) * r;
                }
            }
        });
    }
    updateMeteors();
    if (isZooming && selectedPlanet) {
        controls.enabled = false;
        const target = selectedPlanet.mesh.position.clone().add(new THREE.Vector3(0, 0, 15));
        camera.position.lerp(target, 0.1); camera.lookAt(selectedPlanet.mesh.position);
    } else { controls.enabled = true; controls.update(); }
    renderer.render(scene, camera);
}

function onSceneClick(e) {
    mouse = new THREE.Vector2((e.clientX/window.innerWidth)*2-1, -(e.clientY/window.innerHeight)*2+1);
    raycaster = new THREE.Raycaster(); raycaster.setFromCamera(mouse, camera);
    const hits = raycaster.intersectObjects(planets.map(p => p.mesh), true);
    if (hits.length > 0) {
        let obj = hits[0].object; while(obj.parent && !planets.find(p => p.mesh === obj)) obj = obj.parent;
        selectedPlanet = planets.find(p => p.mesh === obj);
        if (selectedPlanet) { isZooming = true; showUI(currentMode === 'game' ? 'game' : 'gallery'); }
    }
}

function showUI(type) {
    document.getElementById('planet-name-display').textContent = selectedPlanet.data.name.toUpperCase();
    document.getElementById('planet-title').textContent = selectedPlanet.data.name.toUpperCase();
    document.getElementById('planet-facts').innerHTML = selectedPlanet.data.facts.map(f => `<p>${f}</p>`).join('');
    document.getElementById('planet-info-panel').style.display = 'block';
    if (type === 'game') {
        gameState = 'questioning'; document.getElementById('question-text').textContent = selectedPlanet.data.questions[0].q;
        const opt = document.getElementById('options-container'); opt.innerHTML = '';
        selectedPlanet.data.questions[0].options.forEach((o, i) => { const b = document.createElement('button'); b.className = 'option-btn'; b.textContent = o; b.onclick = () => verifyAnswer(i, b); opt.appendChild(b); });
        document.getElementById('question-panel').style.display = 'block';
    } else { const b = document.getElementById('close-gallery-info'); b.style.display = 'block'; b.onclick = () => { isZooming = false; document.getElementById('planet-info-panel').style.display = 'none'; document.getElementById('planet-name-display').textContent = "PILIH PLANET"; }; }
}

function verifyAnswer(idx, btn) {
    if (idx === selectedPlanet.data.questions[0].correct) { score += 25 * currentWave; Swal.fire({ title: 'VALID!', icon: 'success', timer: 1000, showConfirmButton: false }); selectedPlanet.answered = true; planetsAnsweredInWave++; }
    else { lives--; score = Math.max(0, score - 15); document.getElementById('lives-counter').textContent = `x${lives}`; if (lives <= 0) location.reload(); Swal.fire({ title: 'EROR!', text: `Energi Berkurang!`, icon: 'error' }); }
    document.getElementById('score').textContent = score;
    setTimeout(() => { isZooming = false; gameState = 'exploring'; document.getElementById('question-panel').style.display = 'none'; document.getElementById('planet-info-panel').style.display = 'none'; document.getElementById('planet-name-display').textContent = "READY"; if (planetsAnsweredInWave === planets.length) { currentWave++; startNewWave(); } }, 1200);
}

function setupOrbitToggle() { const btn = document.getElementById('orbit-toggle-btn'); btn.onclick = () => { isOrbiting = !isOrbiting; btn.textContent = isOrbiting ? "ORBIT: JALAN" : "ORBIT: BERHENTI"; btn.style.background = isOrbiting ? "linear-gradient(180deg, #00ff88 0%, #009955 100%)" : "linear-gradient(180deg, #ff4d4d 0%, #cc0000 100%)"; }; }
function updateHighscoreHUD() { document.getElementById('high-score-display').textContent = localStorage.getItem('planetaria_best') || 0; }
function createStars() { const geo = new THREE.BufferGeometry(); const pos = []; for(let i=0; i<4000; i++) pos.push((Math.random()-0.5)*4000, (Math.random()-0.5)*4000, (Math.random()-0.5)*4000); geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); scene.add(new THREE.Points(geo, new THREE.PointsMaterial({color: 0xffffff, size: 1.5}))); }
window.addEventListener('resize', () => { camera.aspect = window.innerWidth / window.innerHeight; camera.updateProjectionMatrix(); renderer.setSize(window.innerWidth, window.innerHeight); });