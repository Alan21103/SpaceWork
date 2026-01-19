// Master Data Pengetahuan Planetaria
const planetData = [
    { 
        name: 'Matahari', texture: 'sun.jpg', size: 6.5, glow: 0xffaa00, 
        facts: ['Pusat tata surya kita', 'Sumber energi utama bagi seluruh planet'], 
        questions: [] 
    },
    { 
        name: 'Merkurius', texture: 'mercury.jpg', size: 1.2, glow: 0xB48C64, orbit: 12, orbitSpeed: 0.02, 
        facts: ['Planet terkecil di tata surya', 'Suhu permukaannya ekstrem (panas & dingin)'], 
        questions: [{ q: 'Manakah planet yang paling kecil?', options: ['Bumi', 'Merkurius', 'Mars'], correct: 1 }] 
    },
    { 
        name: 'Venus', texture: 'venus.jpg', size: 1.4, glow: 0xFFC864, orbit: 18, orbitSpeed: 0.012, 
        facts: ['Planet terpanas karena efek rumah kaca', 'Berotasi searah jarum jam (terbalik)'], 
        questions: [{ q: 'Planet manakah yang paling panas?', options: ['Venus', 'Mars', 'Jupiter'], correct: 0 }] 
    },
    { 
        name: 'Bumi', texture: 'earth.jpg', size: 1.5, glow: 0x00d4ff, orbit: 24, orbitSpeed: 0.008, 
        facts: ['Satu-satunya planet dengan kehidupan', '71% permukaannya tertutup oleh air'], 
        questions: [{ q: 'Berapa persen air di permukaan Bumi?', options: ['50%', '71%', '90%'], correct: 1 }] 
    },
    { 
        name: 'Mars', texture: 'mars.jpg', size: 1.3, glow: 0xff4500, orbit: 32, orbitSpeed: 0.006, 
        facts: ['Sering disebut Planet Merah', 'Memiliki gunung tertinggi: Olympus Mons'], 
        questions: [{ q: 'Kenapa Mars berwarna merah?', options: ['Oksida Besi', 'Es', 'Gas'], correct: 0 }] 
    },
    { 
        name: 'Jupiter', texture: 'jupiter.jpg', size: 3.8, glow: 0xD3A17E, orbit: 45, orbitSpeed: 0.003, 
        facts: ['Planet terbesar di tata surya kita', 'Memiliki badai raksasa (Great Red Spot)'], 
        questions: [{ q: 'Manakah planet yang paling besar?', options: ['Jupiter', 'Saturnus', 'Bumi'], correct: 0 }] 
    },
    { 
        name: 'Saturnus', texture: 'saturn.jpg', ringTexture: 'saturn_ring.png', size: 3.2, glow: 0xEAD6B0, orbit: 60, orbitSpeed: 0.002, 
        facts: ['Dikenal karena sistem cincin esnya yang indah', 'Planet paling ringan (bisa mengapung di air)'], 
        questions: [{ q: 'Ciri khas utama dari Saturnus?', options: ['Cincinnya', 'Ukurannya', 'Suhu'], correct: 0 }] 
    },
    { 
        name: 'Uranus', texture: 'uranus.jpg', size: 2.4, glow: 0xB2E2E2, orbit: 75, orbitSpeed: 0.0015, 
        facts: ['Planet es raksasa yang berwarna biru muda', 'Satu-satunya planet yang rotasinya miring'], 
        questions: [{ q: 'Planet yang rotasinya paling miring?', options: ['Uranus', 'Mars', 'Bumi'], correct: 0 }] 
    },
    { 
        name: 'Neptunus', texture: 'neptune.jpg', size: 2.4, glow: 0x3F54BA, orbit: 90, orbitSpeed: 0.001, 
        facts: ['Planet terjauh dari Matahari', 'Memiliki angin paling kencang di tata surya'], 
        questions: [{ q: 'Planet terjauh dari Matahari adalah?', options: ['Uranus', 'Neptunus', 'Pluto'], correct: 1 }] 
    }
];