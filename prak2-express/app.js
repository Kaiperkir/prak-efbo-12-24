const express = require('express');
const cors = require('cors');
const { nanoid } = require('nanoid');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Авторизация и Роли
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const ACCESS_SECRET = 'access_secret';
const REFRESH_SECRET = 'refresh_secret';

// 🔥 SWAGGER
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const app = express();
const port = 3000;

// ==========================================
// 1. ФАЙЛОВАЯ БАЗА ДАННЫХ (Чтоб ничего не пропадало)
// ==========================================
const goodsFile = path.join(__dirname, 'goods.json');
const usersFile = path.join(__dirname, 'users.json');

// Загружаем юзеров из файла (или создаем пустой массив)
let users = [];
if (fs.existsSync(usersFile)) {
    users = JSON.parse(fs.readFileSync(usersFile, 'utf8'));
}
const saveUsers = () => fs.writeFileSync(usersFile, JSON.stringify(users, null, 2));

const refreshTokens = new Set();

// Загружаем товары из файла (или создаем стандартные)
let goods = [];
if (fs.existsSync(goodsFile)) {
    goods = JSON.parse(fs.readFileSync(goodsFile, 'utf8'));
} else {
    goods = [
        { id: nanoid(6), name: 'Чай черный', category: 'Напитки', description: 'Классический черный чай', price: 150, stock: 50, image: null },
        { id: nanoid(6), name: 'Кофе молотый', category: 'Напитки', description: 'Арабика свежей обжарки', price: 400, stock: 30, image: null },
        { id: nanoid(6), name: 'Сахар', category: 'Бакалея', description: 'Сахар белый 1кг', price: 85, stock: 100, image: null },
        { id: nanoid(6), name: 'Печенье овсяное', category: 'Сладости', description: 'Диетическое печенье', price: 120, stock: 45, image: null },
        { id: nanoid(6), name: 'Шоколад', category: 'Сладости', description: 'Горький шоколад 72%', price: 250, stock: 20, image: null }
    ];
    fs.writeFileSync(goodsFile, JSON.stringify(goods, null, 2));
}
const saveGoods = () => fs.writeFileSync(goodsFile, JSON.stringify(goods, null, 2));


// ==========================================
// 2. НАСТРОЙКИ MULTER (Загрузка картинок)
// ==========================================
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname).toLowerCase();
        cb(null, `good_${nanoid(6)}_${Date.now()}${ext}`);
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        const allowed = /jpeg|jpg|png|gif|webp/i;
        if (allowed.test(path.extname(file.originalname)) && allowed.test(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Только изображения!'));
        }
    }
});

// ==========================================
// 3. БАЗОВЫЕ MIDDLEWARE
// ==========================================
app.use(express.json());
app.use(cors({
    origin: "*", // Пускаем фронтенд с любого порта (исправляет ошибку)
    methods: ["GET", "POST", "PATCH", "DELETE", "PUT"],
    allowedHeaders: ["Content-Type", "Authorization"],
}));
app.use('/uploads', express.static(uploadDir));

// ==========================================
// 4. СЕКЬЮРИТИ MIDDLEWARE (Токены и Роли)
// ==========================================
const generateTokens = (user) => {
    const accessToken = jwt.sign({ sub: user.id, email: user.email, role: user.role }, ACCESS_SECRET, { expiresIn: '15m' });
    const refreshToken = jwt.sign({ sub: user.id, email: user.email, role: user.role }, REFRESH_SECRET, { expiresIn: '7d' });
    return { accessToken, refreshToken };
};

const authMiddleware = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Нет токена авторизации' });
    try {
        req.user = jwt.verify(token, ACCESS_SECRET);
        next();
    } catch (err) { res.status(401).json({ error: 'Неверный или протухший токен' }); }
};

const roleMiddleware = (roles) => (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) return res.status(403).json({ error: 'Доступ запрещен' });
    next();
};

// ==========================================
// 5. МАРШРУТЫ: АВТОРИЗАЦИЯ И ПОЛЬЗОВАТЕЛИ
// ==========================================
app.post('/api/auth/register', async (req, res) => {
    const { email, password, role } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Заполните все поля' });
    if (users.find(u => u.email === email)) return res.status(409).json({ error: 'Пользователь существует' });

    const user = { id: nanoid(6), email, password: await bcrypt.hash(password, 10), role: role || 'user' };
    users.push(user);
    saveUsers(); // Сохраняем в файл!
    res.status(201).json({ id: user.id, email: user.email, role: user.role });
});

app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;
    const user = users.find(u => u.email === email);
    if (!user || !(await bcrypt.compare(password, user.password))) return res.status(401).json({ error: 'Неверные данные' });
    
    const tokens = generateTokens(user);
    refreshTokens.add(tokens.refreshToken);
    res.json(tokens);
});

app.post('/api/auth/refresh', (req, res) => {
    const { refreshToken } = req.body;
    if (!refreshToken || !refreshTokens.has(refreshToken)) return res.status(401).json({ error: 'Invalid refresh' });
    try {
        const payload = jwt.verify(refreshToken, REFRESH_SECRET);
        const user = users.find(u => u.id === payload.sub);
        if (!user) throw new Error();
        
        refreshTokens.delete(refreshToken);
        const newTokens = generateTokens(user);
        refreshTokens.add(newTokens.refreshToken);
        res.json(newTokens);
    } catch (err) { res.status(401).json({ error: 'Expired refresh' }); }
});

app.get('/api/auth/me', authMiddleware, (req, res) => {
    const user = users.find(u => u.id === req.user.sub);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ id: user.id, email: user.email, role: user.role });
});

// Управление персоналом (Только Админ)
app.get('/api/users', authMiddleware, roleMiddleware(['admin']), (req, res) => {
    res.json(users.map(({ password, ...u }) => u));
});

app.delete('/api/users/:id', authMiddleware, roleMiddleware(['admin']), (req, res) => {
    if (req.user.sub === req.params.id) return res.status(400).json({ error: 'Нельзя удалить себя' });
    users = users.filter(u => u.id !== req.params.id);
    saveUsers(); // Сохраняем удаление!
    res.json({ message: 'Пользователь удален' });
});

// ==========================================
// 6. МАРШРУТЫ: ТОВАРЫ
// ==========================================
app.get('/goods', (req, res) => res.json(goods));

app.get('/goods/:id', (req, res) => {
    const item = goods.find(i => i.id === req.params.id);
    if (!item) return res.status(404).json({ error: 'Товар не найден' });
    res.json(item);
});

// Создание товара (Только Продавец и Админ)
app.post('/goods', authMiddleware, roleMiddleware(['seller', 'admin']), (req, res) => {
    upload.single('image')(req, res, function(err) {
        if (err) return res.status(400).json({ error: err.message });
        try {
            const { name, category, description, price, stock } = req.body;
            if (!name || price === undefined) return res.status(400).json({ error: 'Название и цена обязательны' });
            
            const newItem = {
                id: nanoid(6),
                name: name.trim(),
                category: category || 'Без категории',
                description: description || '',
                price: Number(price),
                stock: Number(stock) || 0,
                image: req.file ? `/uploads/${req.file.filename}` : null
            };
            
            goods.push(newItem);
            saveGoods(); // Сохраняем в файл!
            res.status(201).json(newItem);
        } catch (e) { res.status(500).json({ error: e.message }); }
    });
});

// Обновление товара
app.patch('/goods/:id', authMiddleware, roleMiddleware(['seller', 'admin']), (req, res) => {
    upload.single('image')(req, res, function(err) {
        if (err) return res.status(400).json({ error: err.message });
        
        const item = goods.find(i => i.id === req.params.id);
        if (!item) return res.status(404).json({ error: 'Товар не найден' });
        
        const { name, category, description, price, stock } = req.body;
        if (name !== undefined) item.name = name.trim();
        if (category !== undefined) item.category = category;
        if (description !== undefined) item.description = description;
        if (price !== undefined) item.price = Number(price);
        if (stock !== undefined) item.stock = Number(stock);
        if (req.file) item.image = `/uploads/${req.file.filename}`;
        
        saveGoods(); // Сохраняем изменения в файл!
        res.json(item);
    });
});

// Удаление товара (ТОЛЬКО Админ)
app.delete('/goods/:id', authMiddleware, roleMiddleware(['admin']), (req, res) => {
    const len = goods.length;
    goods = goods.filter(i => i.id !== req.params.id);
    if (goods.length === len) return res.status(404).json({ error: 'Товар не найден' });
    
    saveGoods(); // Сохраняем удаление в файл!
    res.status(204).send();
});

// ==========================================
// 7. ЗАПУСК СЕРВЕРА
// ==========================================
app.listen(port, () => {
    console.log(`🚀 Сервер запущен на порту ${port}`);
});