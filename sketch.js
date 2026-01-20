let scene, camera, renderer, raycaster, mouse, controls;
let planets = [], stars = [], meteors = [], sunMesh = null, orbitLines = [];
let currentMode = 'game', isInitialized = false, isOrbiting = true;
let selectedPlanet = null, isZooming = false;
let score = 0, lives = 3, sectorIndex = 0, planetsAnsweredInWave = 0, shakeIntensity = 0;
let isMuted = false;

// --- AUDIO SETUP ---
const bgMusic = new Audio('assets/bgm.mp3'); 
bgMusic.loop = true;
bgMusic.volume = 0.5;

const meteorAmbience = new Audio('assets/meteor.mp3'); 
meteorAmbience.loop = true;
meteorAmbience.volume = 0.4;

const clickSound = new Audio('assets/click.mp3');
const correctSound = new Audio('assets/correct.mp3');
const wrongSound = new Audio('assets/wrong.mp3');
const rocketSound = new Audio('assets/rocket.mp3');
const gameOverSound = new Audio('assets/over.mp3');
gameOverSound.volume = 0.7;

bgMusic.play().catch(e => console.log("Menunggu interaksi."));

function playClickSound() { if (!isMuted) { clickSound.currentTime = 0; clickSound.play().catch(e => {}); } }
function playCorrectSound() { if (!isMuted) { correctSound.currentTime = 0; correctSound.play().catch(e => {}); } }
function playWrongSound() { if (!isMuted) { wrongSound.currentTime = 0; wrongSound.play().catch(e => {}); } }
function playRocketSound() { if (!isMuted) { rocketSound.currentTime = 0; rocketSound.play().catch(e => {}); } }

function triggerPixelGameOver() {
    if (!isMuted) {
        meteorAmbience.pause();
        gameOverSound.currentTime = 0;
        gameOverSound.play().catch(e => {});
    }
    const screen = document.getElementById('pixel-game-over');
    const container = document.getElementById('explosion-container');
    screen.style.display = 'flex';
    for (let i = 0; i < 40; i++) {
        const pixel = document.createElement('div');
        pixel.className = 'explosion-pixel';
        const angle = Math.random() * Math.PI * 2;
        const dist = 100 + Math.random() * 200;
        const tx = Math.cos(angle) * dist + 'px';
        const ty = Math.sin(angle) * dist + 'px';
        pixel.style.setProperty('--tx', tx);
        pixel.style.setProperty('--ty', ty);
        const colors = ['#ff0000', '#ff4500', '#ff8c00', '#ffd700'];
        pixel.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        container.appendChild(pixel);
        setTimeout(() => pixel.remove(), 2000);
    }
    setTimeout(() => location.reload(), 4500);
}

function switchToMeteorMusic() { bgMusic.pause(); bgMusic.currentTime = 0; if (!isMuted) meteorAmbience.play().catch(e => {}); }

function toggleMute() {
    isMuted = !isMuted;
    const btn = document.getElementById('mute-btn');
    if(btn) btn.textContent = isMuted ? "SUARA: MATI" : "SUARA: AKTIF";
    if (isMuted) { bgMusic.pause(); meteorAmbience.pause(); } 
    else { if (isInitialized) meteorAmbience.play().catch(e => {}); else bgMusic.play().catch(e => {}); }
}

const textureLoader = new THREE.TextureLoader();
const meteorTexture = textureLoader.load('images/ceres.jpg');

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
    scene.add(new THREE.AmbientLight(0xffffff, 0.9), new THREE.PointLight(0xffffff, 1.5, 1000));
    createStars();
    if (mode === 'gallery') { spawnSun(); buildGallerySystem(); setupOrbitToggle(); } else { startNewWave(); }
    window.addEventListener('click', onSceneClick);
    animate();
}

function createAtmosphere(size, color) {
    return new THREE.Mesh(
        new THREE.SphereGeometry(size * 1.12, 64, 64),
        new THREE.ShaderMaterial({ 
            vertexShader: `varying vec3 vNormal; void main() { vNormal = normalize(normalMatrix * normal); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`, 
            fragmentShader: `varying vec3 vNormal; uniform vec3 glowColor; void main() { float intensity = pow(0.7 - dot(vNormal, vec3(0,0,1.0)), 6.0); gl_FragColor = vec4(glowColor, intensity); }`, 
            uniforms: { glowColor: { value: new THREE.Color(color) } }, 
            side: THREE.BackSide, transparent: true, blending: THREE.AdditiveBlending 
        })
    );
}

function spawnSun() {
    if(typeof planetData !== 'undefined') {
        const data = planetData[0];
        sunMesh = new THREE.Mesh(new THREE.SphereGeometry(data.size, 64, 64), new THREE.MeshPhongMaterial({ map: textureLoader.load(data.texture), emissive: 0xffaa00, emissiveIntensity: 0.5 }));
        sunMesh.add(createAtmosphere(data.size, data.glow)); scene.add(sunMesh);
    }
}

function buildGallerySystem() {
    planets = []; orbitLines = [];
    planetData.forEach((data, index) => {
        if (index === 0) return; // Skip Matahari

        // 1. Buat Body Planet
        const mesh = new THREE.Mesh(
            new THREE.SphereGeometry(data.size, 64, 64), 
            new THREE.MeshPhongMaterial({ map: textureLoader.load(data.texture), shininess: 25 })
        );

        // --- TAMBAHAN KHUSUS SATURNUS ---
        if (data.name === 'Saturnus') {
        // 1. Load Tekstur Cincin yang Realistik (Gunakan file PNG transparan)
        const ringTexture = textureLoader.load('images/saturn_ring.png');
        
        // 2. Gunakan RingBufferGeometry untuk performa lebih ringan & presisi
        // Inner radius (1.4x), Outer radius (2.4x)
        const ringGeo = new THREE.RingBufferGeometry(data.size * 1.4, data.size * 2.4, 128);
        
        // 3. Atur UV Mapping agar tekstur melingkar sempurna
        const pos = ringGeo.attributes.position;
        const v3 = new THREE.Vector3();
        for (let i = 0; i < pos.count; i++) {
            v3.fromBufferAttribute(pos, i);
            ringGeo.attributes.uv.setXY(i, v3.length() < data.size * 1.9 ? 0 : 1, 1);
        }

        // 4. Material dengan efek transparan dan pencahayaan lembut
        const ringMat = new THREE.MeshPhongMaterial({
            map: ringTexture,
            side: THREE.DoubleSide, // Agar terlihat dari bawah dan atas
            transparent: true,
            opacity: 0.8,
            shininess: 0,
            blending: THREE.NormalBlending
        });

        const ringMesh = new THREE.Mesh(ringGeo, ringMat);

        // 5. Kemiringan khas Saturnus (sekitar 27 derajat)
        ringMesh.rotation.x = Math.PI / 2.2;
        
        // Tambahkan ke planet utama
        mesh.add(ringMesh);
        }
        // -------------------------------

        mesh.add(createAtmosphere(data.size, data.glow));

        // 2. Buat Garis Orbit
        const orbitLine = new THREE.Mesh(
            new THREE.RingGeometry(data.orbit - 0.2, data.orbit + 0.2, 128), 
            new THREE.MeshBasicMaterial({ color: 0x00d4ff, side: THREE.DoubleSide, transparent: true, opacity: 0.2 })
        );
        orbitLine.rotation.x = Math.PI / 2; 
        scene.add(orbitLine); 
        orbitLines.push(orbitLine);

        // 3. Atur Posisi Acak Awal
        const angle = Math.random() * Math.PI * 2;
        mesh.position.set(Math.cos(angle) * data.orbit, 0, Math.sin(angle) * data.orbit);
        
        scene.add(mesh);
        planets.push({ mesh, data, rotSpeed: 0.01, orbitAngle: angle, answered: false });
    });
}

function startNewWave() {
    planets.forEach(p => scene.remove(p.mesh)); planets = []; planetsAnsweredInWave = 0;
    // ... kode lama ...
    for (let i = 1; i <= count; i++) {
        const data = planetData[i];
        const mesh = new THREE.Mesh(new THREE.SphereGeometry(data.size * 4.5, 64, 64), new THREE.MeshPhongMaterial({ map: textureLoader.load(data.texture), shininess: 25 }));
        
        // --- TAMBAHAN CINCIN DI MODE GAME ---
        if (data.name === 'Saturnus') {
            const ringGeo = new THREE.RingGeometry(data.size * 4.5 * 1.4, data.size * 4.5 * 2.2, 64);
            const ringMat = new THREE.MeshPhongMaterial({ color: 0xEAD6B0, side: THREE.DoubleSide, transparent: true, opacity: 0.6 });
            const ringMesh = new THREE.Mesh(ringGeo, ringMat);
            ringMesh.rotation.x = Math.PI / 2.2;
            mesh.add(ringMesh);
        }
        // ------------------------------------

        mesh.add(createAtmosphere(data.size * 4.5, data.glow));
        // ... sisa kode startNewWave ...
    }
}

function updateMeteors() {
    if (Math.random() < 0.05) {
        const geo = new THREE.DodecahedronGeometry(1.5 + Math.random() * 2, 0); 
        const mat = new THREE.MeshPhongMaterial({ map: meteorTexture, color: 0xffffff, shininess: 2, flatShading: true });
        const m = new THREE.Mesh(geo, mat);
        m.position.set((Math.random() - 0.5) * 600, (Math.random() - 0.5) * 400, (Math.random() - 0.5) * 600);
        if (m.position.length() < 150) m.position.multiplyScalar(2);
        const speed = 1.5 + Math.random() * 2;
        m.userData = { v: new THREE.Vector3((Math.random() - 0.5) * speed, (Math.random() - 0.5) * speed, (Math.random() - 0.5) * speed), rv: (Math.random() - 0.5) * 0.04 };
        scene.add(m); meteors.push(m);
    }
    for(let i = meteors.length - 1; i >= 0; i--) { 
        meteors[i].position.add(meteors[i].userData.v); 
        meteors[i].rotation.x += meteors[i].userData.rv; meteors[i].rotation.y += meteors[i].userData.rv;
        if(meteors[i].position.length() > 800) { scene.remove(meteors[i]); meteors.splice(i, 1); } 
    }
}

function triggerRocket(message, callback) {
    playRocketSound();
    const rocket = document.getElementById('rocket-container');
    document.getElementById('smoke-text').textContent = message;
    rocket.style.transition = 'none'; rocket.style.left = '-150vw'; rocket.style.opacity = '1';
    rocket.offsetHeight; 
    setTimeout(() => {
        rocket.style.transition = '3.5s cubic-bezier(0.45, 0.05, 0.55, 0.95)';
        rocket.style.left = '150vw'; setTimeout(callback, 1750);
    }, 100);
    setTimeout(() => { rocket.style.opacity = '0'; }, 3600);
}

function animate() {
    requestAnimationFrame(animate);
    if (sunMesh) sunMesh.rotation.y += 0.002;
    planets.forEach(p => { 
        p.mesh.rotation.y += p.rotSpeed; 
        if (!isZooming && currentMode === 'gallery' && isOrbiting) {
            p.orbitAngle += p.data.orbitSpeed; p.mesh.position.set(Math.cos(p.orbitAngle) * p.data.orbit, 0, Math.sin(p.orbitAngle) * p.data.orbit);
        }
    });
    updateMeteors();
    if (shakeIntensity > 0) {
        camera.position.x += (Math.random() - 0.5) * shakeIntensity; camera.position.y += (Math.random() - 0.5) * shakeIntensity;
        shakeIntensity *= 0.92; if (shakeIntensity < 0.05) shakeIntensity = 0;
    }

    // --- LOGIKA ZOOM DIPERBAIKI ---
    if (isZooming && selectedPlanet) {
        controls.enabled = false;
        const pPos = selectedPlanet.mesh.position.clone();
        // Offset agar kamera tidak menabrak planet, tapi tetap fokus ke planet
        let zoomDist = currentMode === 'game' ? 25 : selectedPlanet.data.size * 5;
        camera.position.lerp(new THREE.Vector3(pPos.x, pPos.y + 2, pPos.z + zoomDist), 0.08);
        camera.lookAt(pPos); // Fokus tepat ke planet
    } else { if(controls) { controls.enabled = true; controls.update(); } }
    
    if(renderer && scene && camera) renderer.render(scene, camera);
}

function onSceneClick(e) {
    if (isZooming) return;
    mouse = new THREE.Vector2((e.clientX/window.innerWidth)*2-1, -(e.clientY/window.innerHeight)*2+1);
    raycaster = new THREE.Raycaster(); raycaster.setFromCamera(mouse, camera);
    const hits = raycaster.intersectObjects(planets.map(p => p.mesh), true);
    if (hits.length > 0) {
        playClickSound();
        let obj = hits[0].object; while(obj.parent && !planets.find(p => p.mesh === obj)) obj = obj.parent;
        selectedPlanet = planets.find(p => p.mesh === obj);
        if (selectedPlanet) {
            if (currentMode === 'game' && selectedPlanet.answered) return;
            isZooming = true;
            if (currentMode === 'gallery') {
                if(sunMesh) sunMesh.visible = false; orbitLines.forEach(l => l.visible = false);
                planets.forEach(p => { if (p !== selectedPlanet) p.mesh.visible = false; });
            }
            showUI(currentMode);
        }
    }
}

function showUI(type) {
    document.getElementById('planet-name-display').textContent = selectedPlanet.data.name.toUpperCase();
    if (type === 'game') {
        const quest = selectedPlanet.data.questions[sectorIndex < 4 ? 0 : 1] || selectedPlanet.data.questions[0];
        document.getElementById('question-text').textContent = quest.q;
        const opt = document.getElementById('options-container'); opt.innerHTML = '';
        quest.options.forEach((o, i) => { const b = document.createElement('button'); b.className = 'option-btn'; b.textContent = o; b.onclick = () => verifyAnswer(i, b, quest.correct); opt.appendChild(b); });
        document.getElementById('question-panel').style.display = 'block';
    } else {
        document.getElementById('planet-facts').innerHTML = selectedPlanet.data.facts.map(f => `<p>► ${f}</p>`).join('');
        document.getElementById('planet-info-panel').style.display = 'block';
        const b = document.getElementById('close-gallery-info'); b.style.display = 'block';
        b.onclick = () => { 
            playClickSound(); 
            isZooming = false; 
            // Kembalikan orbit saat info ditutup
            isOrbiting = true;
            const orbitBtn = document.getElementById('orbit-toggle-btn');
            if(orbitBtn) {
                orbitBtn.textContent = "ORBIT: JALAN";
                orbitBtn.style.background = "linear-gradient(180deg, #00ff88 0%, #009955 100%)";
            }
            document.getElementById('planet-info-panel').style.display = 'none'; 
            document.getElementById('planet-name-display').textContent = "PILIH PLANET"; 
            if(sunMesh) sunMesh.visible = true; orbitLines.forEach(l => l.visible = true); planets.forEach(p => p.mesh.visible = true);
        };
    }
}

function verifyAnswer(idx, btn, correct) {
    const allButtons = document.querySelectorAll('.option-btn');
    allButtons.forEach(b => b.style.pointerEvents = 'none');
    if (idx === correct) {
        playCorrectSound(); score += 10; btn.style.background = "linear-gradient(180deg, #00ff88 0%, #009955 100%)";
        selectedPlanet.answered = true; planetsAnsweredInWave++;
        if (planetsAnsweredInWave === Math.min(2 + sectorIndex, 8)) {
            sectorIndex++;
            setTimeout(() => {
                isZooming = false; document.getElementById('question-panel').style.display = 'none';
                if (sectorIndex >= 10) { customSwal('MASTER!', 'Selesai!', 'success').then(() => location.reload()); }
                else { triggerRocket(`SECTOR ${sectorIndex} BERHASIL!`, startNewWave); }
            }, 1000);
            return;
        }
    } else {
        lives--; shakeIntensity = 10.0; btn.classList.add('shake-anim');
        btn.style.background = "linear-gradient(180deg, #ff4d4d 0%, #cc0000 100%)";
        document.getElementById('lives-counter').textContent = `x${lives}`;
        if (lives <= 0) { triggerPixelGameOver(); return; }
        else { playWrongSound(); }
    }
    document.getElementById('score').textContent = score;
    setTimeout(() => { isZooming = false; document.getElementById('question-panel').style.display = 'none'; document.getElementById('planet-name-display').textContent = "PILIH PLANET"; }, 1200);
}

function setupOrbitToggle() {
    const btn = document.getElementById('orbit-toggle-btn');
    if(btn) btn.onclick = () => { playClickSound(); isOrbiting = !isOrbiting; btn.textContent = isOrbiting ? "ORBIT: JALAN" : "ORBIT: BERHENTI"; btn.style.background = isOrbiting ? "linear-gradient(180deg, #00ff88 0%, #009955 100%)" : "linear-gradient(180deg, #ff4d4d 0%, #cc0000 100%)"; };
}

function createStars() { const geo = new THREE.BufferGeometry(); const pos = []; for(let i=0; i<4000; i++) pos.push((Math.random()-0.5)*4000, (Math.random()-0.5)*4000, (Math.random()-0.5)*4000); geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); scene.add(new THREE.Points(geo, new THREE.PointsMaterial({color: 0xffffff, size: 1.5}))); }
window.addEventListener('resize', () => { camera.aspect = window.innerWidth / window.innerHeight; camera.updateProjectionMatrix(); renderer.setSize(window.innerWidth, window.innerHeight); });