/* ====================================================================
   DEMO DATA - SAMPLE ONLY, NOT MEASURED NUMBERS
   --------------------------------------------------------------------
   Every sample entity, matchup suggestion and feed post lives here, in
   its own file. Swap this file and the app shows a whole different
   dataset, with no other change.
   ==================================================================== */
const DEMO_ENTITIES = {
    'jollibee': {
        name: 'Jollibee', type: 'brand', peer: 'McDo', skuSample: 'Chickenjoy',
        mentions: 12420, avgLikes: 940, commentRatio: 86, shareAmp: 90, velocity: 89, sentiment: 68, ugc: 93, reach: 95,
        drivers: { speed: 74, aesthetic: 75, value: 87, quality: 93, service: 86 },
        platforms: { tiktok: 48, instagram: 24, facebook: 28 }
    },
    'mcdo': {
        name: 'McDo', type: 'brand', peer: 'Jollibee', skuSample: 'Chicken McDo',
        mentions: 9340, avgLikes: 780, commentRatio: 73, shareAmp: 77, velocity: 83, sentiment: 55, ugc: 82, reach: 90,
        drivers: { speed: 90, aesthetic: 79, value: 85, quality: 80, service: 81 },
        platforms: { tiktok: 41, instagram: 31, facebook: 28 }
    },
    'kfc': {
        name: 'KFC', type: 'brand', peer: 'Jollibee', skuSample: 'Chicken and Fun Shots',
        mentions: 6281, avgLikes: 560, commentRatio: 61, shareAmp: 66, velocity: 71, sentiment: 42, ugc: 68, reach: 76,
        drivers: { speed: 78, aesthetic: 62, value: 88, quality: 74, service: 66 },
        platforms: { tiktok: 44, instagram: 20, facebook: 36 }
    },
    'kkopi': {
        name: 'KKOPI', type: 'brand', peer: 'BigBrew', skuSample: 'Iced Spanish Latte',
        mentions: 6840, avgLikes: 620, commentRatio: 89, shareAmp: 83, velocity: 80, sentiment: 74, ugc: 87, reach: 75,
        drivers: { speed: 63, aesthetic: 94, value: 79, quality: 89, service: 91 },
        platforms: { tiktok: 46, instagram: 41, facebook: 13 }
    },
    'bigbrew': {
        name: 'BigBrew', type: 'brand', peer: 'KKOPI', skuSample: 'Kape Brusko',
        mentions: 8150, avgLikes: 480, commentRatio: 65, shareAmp: 71, velocity: 87, sentiment: 47, ugc: 80, reach: 88,
        drivers: { speed: 91, aesthetic: 59, value: 96, quality: 72, service: 69 },
        platforms: { tiktok: 53, instagram: 17, facebook: 30 }
    },
    'justcoffee': {
        name: 'JustCoffee', type: 'brand', peer: 'BigBrew', skuSample: 'Sea Salt Latte',
        mentions: 4920, avgLikes: 530, commentRatio: 80, shareAmp: 69, velocity: 68, sentiment: 69, ugc: 74, reach: 64,
        drivers: { speed: 76, aesthetic: 87, value: 82, quality: 85, service: 83 },
        platforms: { tiktok: 41, instagram: 39, facebook: 20 }
    },
    'rhode': {
        name: 'Rhode', type: 'brand', peer: 'Rare Beauty', skuSample: 'Peptide Lip Tint',
        mentions: 19400, avgLikes: 1620, commentRatio: 88, shareAmp: 92, velocity: 94, sentiment: 76, ugc: 95, reach: 91,
        drivers: { speed: 78, aesthetic: 97, value: 71, quality: 90, service: 82 },
        platforms: { tiktok: 54, instagram: 38, facebook: 8 }
    },
    'rare beauty': {
        name: 'Rare Beauty', type: 'brand', peer: 'Rhode', skuSample: 'Soft Pinch Blush',
        mentions: 22100, avgLikes: 1580, commentRatio: 91, shareAmp: 87, velocity: 89, sentiment: 82, ugc: 94, reach: 94,
        drivers: { speed: 83, aesthetic: 92, value: 84, quality: 94, service: 91 },
        platforms: { tiktok: 49, instagram: 42, facebook: 9 }
    },
    'apple': {
        name: 'Apple', type: 'brand', peer: 'Samsung', skuSample: 'iPhone 16 Pro',
        mentions: 42800, avgLikes: 2450, commentRatio: 82, shareAmp: 88, velocity: 94, sentiment: 60, ugc: 95, reach: 98,
        drivers: { speed: 85, aesthetic: 96, value: 56, quality: 94, service: 86 },
        platforms: { tiktok: 44, instagram: 39, facebook: 17 }
    },
    'samsung': {
        name: 'Samsung', type: 'brand', peer: 'Apple', skuSample: 'Galaxy S24 Ultra',
        mentions: 36400, avgLikes: 1980, commentRatio: 77, shareAmp: 82, velocity: 87, sentiment: 64, ugc: 89, reach: 93,
        drivers: { speed: 88, aesthetic: 88, value: 76, quality: 91, service: 80 },
        platforms: { tiktok: 45, instagram: 35, facebook: 20 }
    },
    'iphone 16 pro': {
        name: 'iPhone 16 Pro', type: 'product', parentBrand: 'Apple', peer: 'Galaxy S24 Ultra',
        mentions: 28900, avgLikes: 1840, commentRatio: 87, shareAmp: 91, velocity: 93, sentiment: 58, ugc: 94, reach: 95,
        drivers: { speed: 92, aesthetic: 95, value: 54, quality: 93, service: 85 },
        platforms: { tiktok: 48, instagram: 38, facebook: 14 }
    },
    'galaxy s24 ultra': {
        name: 'Galaxy S24 Ultra', type: 'product', parentBrand: 'Samsung', peer: 'iPhone 16 Pro',
        mentions: 24100, avgLikes: 1620, commentRatio: 84, shareAmp: 85, velocity: 86, sentiment: 69, ugc: 88, reach: 90,
        drivers: { speed: 94, aesthetic: 89, value: 75, quality: 92, service: 81 },
        platforms: { tiktok: 46, instagram: 36, facebook: 18 }
    },
    'galaxy s24': {
        name: 'Galaxy S24', type: 'product', parentBrand: 'Samsung', peer: 'iPhone 16 Pro',
        mentions: 21400, avgLikes: 1490, commentRatio: 81, shareAmp: 82, velocity: 84, sentiment: 67, ugc: 86, reach: 88,
        drivers: { speed: 91, aesthetic: 87, value: 77, quality: 90, service: 80 },
        platforms: { tiktok: 45, instagram: 36, facebook: 19 }
    },
    'nike air max dn': {
        name: 'Nike Air Max Dn', type: 'product', parentBrand: 'Nike', peer: 'Adidas Ultraboost 5',
        mentions: 11400, avgLikes: 920, commentRatio: 81, shareAmp: 84, velocity: 85, sentiment: 66, ugc: 87, reach: 84,
        drivers: { speed: 79, aesthetic: 94, value: 65, quality: 88, service: 80 },
        platforms: { tiktok: 51, instagram: 39, facebook: 10 }
    },
    'adidas ultraboost 5': {
        name: 'Adidas Ultraboost 5', type: 'product', parentBrand: 'Adidas', peer: 'Nike Air Max Dn',
        mentions: 9800, avgLikes: 860, commentRatio: 86, shareAmp: 79, velocity: 80, sentiment: 75, ugc: 83, reach: 80,
        drivers: { speed: 85, aesthetic: 86, value: 73, quality: 94, service: 84 },
        platforms: { tiktok: 46, instagram: 43, facebook: 11 }
    },
    'sony wh-1000xm5': {
        name: 'Sony WH-1000XM5', type: 'product', parentBrand: 'Sony', peer: 'Bose QC Ultra',
        mentions: 8900, avgLikes: 740, commentRatio: 88, shareAmp: 82, velocity: 81, sentiment: 73, ugc: 86, reach: 85,
        drivers: { speed: 84, aesthetic: 91, value: 74, quality: 93, service: 80 },
        platforms: { tiktok: 47, instagram: 38, facebook: 15 }
    },
    'bose qc ultra': {
        name: 'Bose QC Ultra', type: 'product', parentBrand: 'Bose', peer: 'Sony WH-1000XM5',
        mentions: 7200, avgLikes: 690, commentRatio: 84, shareAmp: 76, velocity: 77, sentiment: 78, ugc: 80, reach: 79,
        drivers: { speed: 82, aesthetic: 85, value: 69, quality: 95, service: 86 },
        platforms: { tiktok: 42, instagram: 40, facebook: 18 }
    },

    /* ---- more food brands ---- */
    'mang inasal': {
        name: 'Mang Inasal', type: 'brand', peer: 'Jollibee', skuSample: 'Pecho Chicken Inasal',
        mentions: 11200, avgLikes: 810, commentRatio: 79, shareAmp: 84, velocity: 85, sentiment: 72, ugc: 88, reach: 92,
        drivers: { speed: 80, aesthetic: 70, value: 92, quality: 86, service: 83 },
        platforms: { tiktok: 50, instagram: 22, facebook: 28 }
    },
    'chowking': {
        name: 'Chowking', type: 'brand', peer: 'Jollibee', skuSample: 'Chao Fan',
        mentions: 7600, avgLikes: 590, commentRatio: 68, shareAmp: 72, velocity: 74, sentiment: 49, ugc: 76, reach: 82,
        drivers: { speed: 88, aesthetic: 64, value: 90, quality: 78, service: 70 },
        platforms: { tiktok: 43, instagram: 19, facebook: 38 }
    },
    'greenwich': {
        name: 'Greenwich', type: 'brand', peer: "Shakey's", skuSample: 'Hawaiian Overload',
        mentions: 5900, avgLikes: 520, commentRatio: 70, shareAmp: 68, velocity: 70, sentiment: 61, ugc: 72, reach: 74,
        drivers: { speed: 79, aesthetic: 66, value: 86, quality: 82, service: 75 },
        platforms: { tiktok: 39, instagram: 24, facebook: 37 }
    },
    'shakeys': {
        name: "Shakey's", type: 'brand', peer: 'Greenwich', skuSample: 'Pepperoni Pizza',
        mentions: 6400, avgLikes: 560, commentRatio: 71, shareAmp: 69, velocity: 72, sentiment: 68, ugc: 74, reach: 77,
        drivers: { speed: 78, aesthetic: 72, value: 84, quality: 87, service: 81 },
        platforms: { tiktok: 37, instagram: 25, facebook: 38 }
    },
    'burger king': {
        name: 'Burger King', type: 'brand', peer: 'McDo', skuSample: 'Whopper',
        mentions: 6800, avgLikes: 540, commentRatio: 66, shareAmp: 70, velocity: 76, sentiment: 52, ugc: 74, reach: 84,
        drivers: { speed: 82, aesthetic: 74, value: 80, quality: 84, service: 71 },
        platforms: { tiktok: 47, instagram: 25, facebook: 28 }
    },
    'popeyes': {
        name: 'Popeyes', type: 'brand', peer: 'Jollibee', skuSample: 'Spicy Chicken Sandwich',
        mentions: 5400, avgLikes: 470, commentRatio: 63, shareAmp: 64, velocity: 72, sentiment: 58, ugc: 70, reach: 72,
        drivers: { speed: 81, aesthetic: 70, value: 83, quality: 79, service: 68 },
        platforms: { tiktok: 52, instagram: 23, facebook: 25 }
    },
    'starbucks': {
        name: 'Starbucks', type: 'brand', peer: 'KKOPI', skuSample: 'Caramel Macchiato',
        mentions: 31500, avgLikes: 2050, commentRatio: 76, shareAmp: 86, velocity: 79, sentiment: 63, ugc: 92, reach: 96,
        drivers: { speed: 84, aesthetic: 93, value: 60, quality: 90, service: 88 },
        platforms: { tiktok: 38, instagram: 44, facebook: 18 }
    },
    'coffee project': {
        name: 'Coffee Project', type: 'brand', peer: 'BigBrew', skuSample: 'Cold Brew Latte',
        mentions: 9100, avgLikes: 700, commentRatio: 72, shareAmp: 74, velocity: 82, sentiment: 65, ugc: 79, reach: 81,
        drivers: { speed: 77, aesthetic: 88, value: 78, quality: 86, service: 85 },
        platforms: { tiktok: 45, instagram: 40, facebook: 15 }
    },
    'pickup coffee': {
        name: 'Pickup Coffee', type: 'brand', peer: 'KKOPI', skuSample: 'Sea Salt Latte',
        mentions: 4300, avgLikes: 450, commentRatio: 78, shareAmp: 67, velocity: 90, sentiment: 71, ugc: 73, reach: 69,
        drivers: { speed: 92, aesthetic: 76, value: 94, quality: 73, service: 80 },
        platforms: { tiktok: 56, instagram: 30, facebook: 14 }
    },

    /* ---- more beauty brands ---- */
    'maybelline': {
        name: 'Maybelline', type: 'brand', peer: 'Rare Beauty', skuSample: 'Sky High Mascara',
        mentions: 18600, avgLikes: 1380, commentRatio: 82, shareAmp: 84, velocity: 83, sentiment: 66, ugc: 90, reach: 92,
        drivers: { speed: 80, aesthetic: 90, value: 86, quality: 83, service: 78 },
        platforms: { tiktok: 51, instagram: 38, facebook: 11 }
    },
    'sunnies face': {
        name: 'Sunnies Face', type: 'brand', peer: 'Rhode', skuSample: 'Fluffmatte Lipstick',
        mentions: 7900, avgLikes: 660, commentRatio: 85, shareAmp: 76, velocity: 81, sentiment: 79, ugc: 85, reach: 78,
        drivers: { speed: 75, aesthetic: 93, value: 88, quality: 87, service: 84 },
        platforms: { tiktok: 48, instagram: 42, facebook: 10 }
    },
    'luxe organix': {
        name: 'Luxe Organix', type: 'brand', peer: 'Rare Beauty', skuSample: 'Miracle Serum',
        mentions: 6300, avgLikes: 540, commentRatio: 80, shareAmp: 71, velocity: 78, sentiment: 74, ugc: 77, reach: 73,
        drivers: { speed: 74, aesthetic: 79, value: 91, quality: 80, service: 82 },
        platforms: { tiktok: 52, instagram: 33, facebook: 15 }
    },
    'the ordinary': {
        name: 'The Ordinary', type: 'brand', peer: 'Rare Beauty', skuSample: 'Niacinamide Serum',
        mentions: 14200, avgLikes: 1120, commentRatio: 88, shareAmp: 80, velocity: 76, sentiment: 72, ugc: 88, reach: 87,
        drivers: { speed: 76, aesthetic: 74, value: 84, quality: 92, service: 79 },
        platforms: { tiktok: 47, instagram: 41, facebook: 12 }
    },

    /* ---- more tech and shoe brands ---- */
    'xiaomi': {
        name: 'Xiaomi', type: 'brand', peer: 'Samsung', skuSample: 'Redmi Note 14',
        mentions: 21400, avgLikes: 1560, commentRatio: 79, shareAmp: 81, velocity: 88, sentiment: 68, ugc: 88, reach: 91,
        drivers: { speed: 88, aesthetic: 84, value: 93, quality: 87, service: 82 },
        platforms: { tiktok: 48, instagram: 30, facebook: 22 }
    },
    'realme': {
        name: 'Realme', type: 'brand', peer: 'Xiaomi', skuSample: 'Realme 13 Pro',
        mentions: 16800, avgLikes: 1240, commentRatio: 75, shareAmp: 77, velocity: 84, sentiment: 66, ugc: 84, reach: 87,
        drivers: { speed: 86, aesthetic: 85, value: 94, quality: 83, service: 80 },
        platforms: { tiktok: 52, instagram: 28, facebook: 20 }
    },
    'oppo': {
        name: 'Oppo', type: 'brand', peer: 'Vivo', skuSample: 'Reno 13',
        mentions: 15300, avgLikes: 1100, commentRatio: 73, shareAmp: 75, velocity: 80, sentiment: 64, ugc: 82, reach: 88,
        drivers: { speed: 83, aesthetic: 87, value: 88, quality: 85, service: 81 },
        platforms: { tiktok: 49, instagram: 31, facebook: 20 }
    },
    'vivo': {
        name: 'Vivo', type: 'brand', peer: 'Oppo', skuSample: 'Vivo V29',
        mentions: 13900, avgLikes: 1020, commentRatio: 72, shareAmp: 74, velocity: 79, sentiment: 65, ugc: 81, reach: 86,
        drivers: { speed: 82, aesthetic: 86, value: 89, quality: 84, service: 80 },
        platforms: { tiktok: 50, instagram: 30, facebook: 20 }
    },
    'nike': {
        name: 'Nike', type: 'brand', peer: 'Adidas', skuSample: 'Air Force 1',
        mentions: 39200, avgLikes: 2310, commentRatio: 84, shareAmp: 90, velocity: 89, sentiment: 63, ugc: 94, reach: 97,
        drivers: { speed: 85, aesthetic: 95, value: 72, quality: 91, service: 86 },
        platforms: { tiktok: 52, instagram: 37, facebook: 11 }
    },
    'adidas': {
        name: 'Adidas', type: 'brand', peer: 'Nike', skuSample: 'Samba',
        mentions: 31700, avgLikes: 1890, commentRatio: 82, shareAmp: 87, velocity: 86, sentiment: 67, ugc: 91, reach: 94,
        drivers: { speed: 84, aesthetic: 91, value: 75, quality: 90, service: 85 },
        platforms: { tiktok: 50, instagram: 36, facebook: 14 }
    },

    /* ---- more products (SKUs) ---- */
    'redmi note 14': {
        name: 'Redmi Note 14', type: 'product', parentBrand: 'Xiaomi', peer: 'Realme 13 Pro',
        mentions: 17600, avgLikes: 1280, commentRatio: 83, shareAmp: 86, velocity: 88, sentiment: 64, ugc: 89, reach: 88,
        drivers: { speed: 89, aesthetic: 84, value: 94, quality: 85, service: 82 },
        platforms: { tiktok: 53, instagram: 29, facebook: 18 }
    },
    'realme 13 pro': {
        name: 'Realme 13 Pro', type: 'product', parentBrand: 'Realme', peer: 'Redmi Note 14',
        mentions: 14200, avgLikes: 1050, commentRatio: 80, shareAmp: 82, velocity: 85, sentiment: 67, ugc: 85, reach: 84,
        drivers: { speed: 87, aesthetic: 88, value: 92, quality: 83, service: 80 },
        platforms: { tiktok: 54, instagram: 28, facebook: 18 }
    },
    'airpods pro 2': {
        name: 'AirPods Pro 2', type: 'product', parentBrand: 'Apple', peer: 'Galaxy Buds 3 Pro',
        mentions: 26400, avgLikes: 1760, commentRatio: 85, shareAmp: 89, velocity: 87, sentiment: 61, ugc: 93, reach: 94,
        drivers: { speed: 88, aesthetic: 92, value: 64, quality: 90, service: 87 },
        platforms: { tiktok: 47, instagram: 38, facebook: 15 }
    },
    'galaxy buds 3 pro': {
        name: 'Galaxy Buds 3 Pro', type: 'product', parentBrand: 'Samsung', peer: 'AirPods Pro 2',
        mentions: 11800, avgLikes: 890, commentRatio: 82, shareAmp: 79, velocity: 84, sentiment: 69, ugc: 86, reach: 83,
        drivers: { speed: 86, aesthetic: 88, value: 78, quality: 88, service: 82 },
        platforms: { tiktok: 46, instagram: 36, facebook: 18 }
    },
    'nike air force 1': {
        name: 'Nike Air Force 1', type: 'product', parentBrand: 'Nike', peer: 'Adidas Samba',
        mentions: 19800, avgLikes: 1520, commentRatio: 83, shareAmp: 87, velocity: 85, sentiment: 70, ugc: 91, reach: 90,
        drivers: { speed: 80, aesthetic: 94, value: 76, quality: 89, service: 84 },
        platforms: { tiktok: 53, instagram: 36, facebook: 11 }
    },
    'adidas samba': {
        name: 'Adidas Samba', type: 'product', parentBrand: 'Adidas', peer: 'Nike Air Force 1',
        mentions: 22100, avgLikes: 1690, commentRatio: 81, shareAmp: 85, velocity: 88, sentiment: 73, ugc: 90, reach: 89,
        drivers: { speed: 82, aesthetic: 92, value: 79, quality: 90, service: 83 },
        platforms: { tiktok: 51, instagram: 37, facebook: 12 }
    }
};

const DEMO_MATCHUPS = {
    brand: [
        { q: 'Jollibee vs McDo', tag: 'Fast Food Share of Voice & Sentiment', icon: 'chart' },
        { q: 'KKOPI vs BigBrew', tag: 'Alangilan Student Coffee Pulse', icon: 'coffee' },
        { q: 'KKOPI vs BigBrew vs JustCoffee', tag: '3-Brand Local Cafe Benchmark', icon: 'layers' },
        { q: 'Rhode vs Rare Beauty', tag: 'Creator Beauty Advocacy & Velocity', icon: 'spark' },
        { q: 'Apple vs Galaxy S24', tag: 'Test Mismatched Guardrail (Brand vs SKU)', icon: 'shield' },
        { q: 'Mang Inasal vs Jollibee', tag: 'Grilled Chicken Share of Voice', icon: 'chart' },
        { q: 'Starbucks vs KKOPI', tag: 'Cafe Chain vs Student Favorite', icon: 'coffee' },
        { q: 'Xiaomi vs Samsung vs Vivo', tag: '3-Brand Budget Phone Benchmark', icon: 'layers' },
        { q: 'Maybelline vs Sunnies Face', tag: 'Everyday Makeup Talk', icon: 'spark' }
    ],
    product: [
        { q: 'iPhone 16 Pro vs Galaxy S24 Ultra', tag: 'Flagship camera and battery talk', icon: 'phone' },
        { q: 'Nike Air Max Dn vs Adidas Ultraboost 5', tag: 'Running Shoe Comfort & Durability', icon: 'zap' },
        { q: 'Sony WH-1000XM5 vs Bose QC Ultra', tag: 'ANC Headphone Community Depth', icon: 'music' },
        { q: 'AirPods Pro 2 vs Galaxy Buds 3 Pro', tag: 'Earbuds ANC and Fit', icon: 'music' },
        { q: 'Nike Air Force 1 vs Adidas Samba', tag: 'Everyday Sneaker Rotation', icon: 'zap' },
        { q: 'Redmi Note 14 vs Realme 13 Pro', tag: 'Mid-range Value Talk', icon: 'phone' }
    ]
};

/* Sample feed posts: what a real socmed scrape would hand back, fake accounts
   and copywriter-style captions, all marked as sample data by the badge. */
const DEMO_POSTS = [
    {
        id: 'p1', cat: 'food', plat: 'tiktok', handle: '@batstate.kape', time: '18m ago',
        sentiment: 'Positive', sentClass: 'sent-pos',
        caption: 'KKOPI pastel study corner in Alangilan is packed right now—oat spanish latte still undefeated vs BigBrew pila across the street #kkopi #alangilancoffee',
        views: '42.8K', likes: '4.9K', ratio: '11.4% C/L', velocity: '+184% vel',
        matchup: 'KKOPI vs BigBrew', mode: 'brand'
    },
    {
        id: 'p2', cat: 'food', plat: 'facebook', handle: 'South Luzon Foodies', time: '41m ago',
        sentiment: 'Positive', sentClass: 'sent-pos',
        caption: 'Chickenjoy spicy bucket size comparison vs McDo new crispy chicken cut—comments are 4,200+ debating which gravy & rice combo is more sulit.',
        views: '118K', likes: '9.4K', ratio: '14.2% C/L', velocity: '+210% vel',
        matchup: 'Jollibee vs McDo', mode: 'brand'
    },
    {
        id: 'p3', cat: 'tech', plat: 'instagram', handle: '@techbench.ph', time: '1h ago',
        sentiment: 'Mixed', sentClass: 'sent-mix',
        caption: 'Concert zoom test at Philippine Arena: Galaxy S24 Ultra 5x optical vs iPhone 16 Pro low-light video stabilization. Full raw clips in reel.',
        views: '295K', likes: '24.1K', ratio: '9.8% C/L', velocity: '+165% vel',
        matchup: 'iPhone 16 Pro vs Galaxy S24 Ultra', mode: 'product'
    },
    {
        id: 'p4', cat: 'beauty', plat: 'tiktok', handle: '@glowcheck.mnl', time: '2h ago',
        sentiment: 'Positive', sentClass: 'sent-pos',
        caption: 'Humidity wear test in Manila traffic: Rare Beauty Soft Pinch vs Rhode Pocket Blush. Look at the pigment hold after 6 hours!',
        views: '164K', likes: '19.2K', ratio: '12.6% C/L', velocity: '+148% vel',
        matchup: 'Rhode vs Rare Beauty', mode: 'brand'
    },
    {
        id: 'p5', cat: 'tech', plat: 'tiktok', handle: '@runclub.bgc', time: '3h ago',
        sentiment: 'Positive', sentClass: 'sent-pos',
        caption: '10km tempo run review: Adidas Ultraboost 5 Lightboost foam energy return vs Nike Air Max Dn dynamic air pods.',
        views: '88.4K', likes: '7.1K', ratio: '10.9% C/L', velocity: '+122% vel',
        matchup: 'Nike Air Max Dn vs Adidas Ultraboost 5', mode: 'product'
    }
];

/* The same posts, plus deliberate junk, so the cleaning pipeline can be
   shown dropping duplicates, spam and out-of-scope noise on the way in. */
const DEMO_RAW_POSTS = [
    ...DEMO_POSTS,
    { id: 'raw1', cat: 'food', plat: 'tiktok', handle: '@batstate.kape', caption: 'KKOPI pastel study corner in Alangilan is packed right now—oat spanish latte still undefeated vs BigBrew pila across the street #kkopi #alangilancoffee', mediaUrl: null },
    { id: 'raw2', cat: 'food', plat: 'facebook', handle: 'South Luzon Foodies', caption: 'Chickenjoy spicy bucket vs McDo crispy chicken cut!!! #sulit #friedchicken', mediaUrl: null },
    { id: 'raw3', cat: 'spam', plat: 'tiktok', handle: '@quickcash.ph', caption: 'FREE 500 GCASH NOW!!! click link in bio, legit payout, DM me fast', mediaUrl: null },
    { id: 'raw4', cat: 'out', plat: 'tiktok', handle: '@fruitstand.batangas', caption: 'Fresh apples from Benguet, 80 pesos per kilo today only. Apples apples apples!', mediaUrl: null },
    { id: 'raw5', cat: 'out', plat: 'facebook', handle: 'Random Story', caption: 'I ate an apple today and thought about my childhood.', mediaUrl: null },
    { id: 'raw6', cat: 'tech', plat: 'instagram', handle: '@techbench.ph', caption: 'APPLE iPhone 16 Pro camera test: night mode vs Samsung Galaxy S24 Ultra zoom, side by side clips.', mediaUrl: null },
    { id: 'raw7', cat: 'food', plat: 'tiktok', handle: '@coffee.beats', caption: 'Jollibee Chickenjoy vs McDo Chicken McDo taste test with my cousins. Watch till the end!', mediaUrl: null }
];

window.DemoData = {
    entities: DEMO_ENTITIES,
    matchups: DEMO_MATCHUPS,
    posts: DEMO_POSTS,
    rawPosts: DEMO_RAW_POSTS
};
