// Database Pengetahuan & Tantangan Planetaria (10 Sectors)
const planetData = [
    { name: 'Matahari', texture: '/images/sun.jpg', size: 7.0, glow: 0xffaa00, facts: ['Pusat tata surya kita', 'Terdiri dari gas hidrogen dan helium', 'Suhu intinya mencapai 15 juta derajat Celsius'], questions: [] },
    { 
        name: 'Merkurius', texture: '/images/mercury.jpg', size: 1.2, glow: 0xB48C64, orbit: 18, orbitSpeed: 0.02, 
        facts: ['Planet terkecil', 'Suhu malam hari mencapai -180°C', 'Tidak memiliki atmosfer pelindung', 'Tahun tersingkat (88 hari Bumi)'], 
        questions: [
            { q: 'Manakah planet yang paling kecil?', options: ['Bumi', 'Merkurius', 'Mars'], correct: 1 },
            { q: 'Berapa suhu terendah malam hari di Merkurius?', options: ['-50°C', '-180°C', '0°C'], correct: 1 }
        ] 
    },
    { 
        name: 'Venus', texture: '/images/venus.jpg', size: 1.4, glow: 0xFFC864, orbit: 28, orbitSpeed: 0.012, 
        facts: ['Planet terpanas (efek rumah kaca)', 'Atmosfer tebal karbon dioksida', 'Berotasi searah jarum jam (terbalik)', 'Sering disebut Bintang Fajar'], 
        questions: [
            { q: 'Planet manakah yang paling panas?', options: ['Venus', 'Mars', 'Jupiter'], correct: 0 },
            { q: 'Gas apa yang mendominasi atmosfer Venus?', options: ['Oksigen', 'Karbon Dioksida', 'Nitrogen'], correct: 1 }
        ] 
    },
    { 
        name: 'Bumi', texture: '/images/earth.jpg', size: 1.5, glow: 0x00d4ff, orbit: 38, orbitSpeed: 0.008, 
        facts: ['Satu-satunya tempat dengan kehidupan', '71% permukaan air', 'Atmosfer kaya nitrogen dan oksigen', 'Memiliki medan magnet pelindung'], 
        questions: [
            { q: 'Berapa persen air di permukaan Bumi?', options: ['50%', '71%', '90%'], correct: 1 },
            { q: 'Berapa persen oksigen di atmosfer Bumi?', options: ['21%', '78%', '50%'], correct: 0 }
        ] 
    },
    { 
        name: 'Mars', texture: '/images/mars.jpg', size: 1.3, glow: 0xff4500, orbit: 48, orbitSpeed: 0.006, 
        facts: ['Planet Merah karena oksida besi', 'Gunung tertinggi: Olympus Mons', 'Memiliki dua bulan: Phobos & Deimos', 'Memiliki lapisan es di kutubnya'], 
        questions: [
            { q: 'Apa julukan bagi planet Mars?', options: ['Planet Biru', 'Planet Merah', 'Planet Es'], correct: 1 },
            { q: 'Apa nama gunung tertinggi di Mars?', options: ['Everest', 'Olympus Mons', 'Vesuvius'], correct: 1 }
        ] 
    },
    { 
        name: 'Jupiter', texture: '/images/jupiter.jpg', size: 4.0, glow: 0xD3A17E, orbit: 65, orbitSpeed: 0.004, 
        facts: ['Planet terbesar', 'Memiliki badai Great Red Spot', 'Rotasi tercepat (di bawah 10 jam)', 'Memiliki setidaknya 79 bulan'], 
        questions: [
            { q: 'Manakah planet yang paling besar?', options: ['Jupiter', 'Saturnus', 'Bumi'], correct: 0 },
            { q: 'Badai raksasa di Jupiter bernama?', options: ['Red Storm', 'Great Red Spot', 'Eye of Jupiter'], correct: 1 }
        ] 
    },
    { 
        name: 'Saturnus', texture: '/images/saturn.jpg', size: 3.2, glow: 0xEAD6B0, orbit: 85, orbitSpeed: 0.002, 
        facts: ['Sistem cincin es paling megah', 'Bulan Titan memiliki atmosfer', 'Kerapatan lebih rendah dari air', 'Terdiri dari Hidrogen dan Helium'], 
        questions: [
            { q: 'Planet yang terkenal dengan cincinnya adalah?', options: ['Jupiter', 'Saturnus', 'Uranus'], correct: 1 },
            { q: 'Apa bulan terbesar milik Saturnus?', options: ['Titan', 'Europa', 'Phobos'], correct: 0 }
        ] 
    },
    { 
        name: 'Uranus', texture: '/images/uranus.jpg', size: 2.4, glow: 0xB2E2E2, orbit: 105, orbitSpeed: 0.0015, 
        facts: ['Raksasa es biru muda', 'Rotasi miring hingga 98 derajat', 'Atmosfer mengandung metana', 'Ditemukan oleh William Herschel'], 
        questions: [
            { q: 'Warna biru muda Uranus disebabkan oleh?', options: ['Air', 'Metana', 'Es'], correct: 1 },
            { q: 'Berapa derajat kemiringan rotasi Uranus?', options: ['23 Derajat', '98 Derajat', '180 Derajat'], correct: 1 }
        ] 
    },
    { 
        name: 'Neptunus', texture: '/images/neptune.jpg', size: 2.4, glow: 0x3F54BA, orbit: 125, orbitSpeed: 0.001, 
        facts: ['Planet terjauh dari Matahari', 'Angin supersonik tercepat', 'Bulan utamanya adalah Triton', 'Ditemukan melalui perhitungan matematika'], 
        questions: [
            { q: 'Planet terjauh dari Matahari adalah?', options: ['Uranus', 'Neptunus', 'Pluto'], correct: 1 },
            { q: 'Apa nama bulan terbesar Neptunus?', options: ['Triton', 'Charon', 'Titan'], correct: 0 }
        ] 
    }
];