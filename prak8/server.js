const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken'); // Подключаем библиотеку для JWT[cite: 5]

const app = express();
app.use(express.json());

const PORT = 3000;
const JWT_SECRET = 'access_secret'; // Секретный ключ для подписи[cite: 5]
const ACCESS_EXPIRES_IN = '15m'; // Время жизни токена[cite: 5]

const users = [];
const products = [];

// ==========================================
// MIDDLEWARE ДЛЯ ПРОВЕРКИ ТОКЕНА[cite: 5]
// ==========================================
function authMiddleware(req, res, next) {
    const header = req.headers.authorization || '';
    const [scheme, token] = header.split(' ');

    if (scheme !== 'Bearer' || !token) {
        return res.status(401).json({ error: 'Missing or invalid Authorization header' });
    }

    try {
        const payload = jwt.verify(token, JWT_SECRET);
        req.user = payload; // Сохраняем данные пользователя в req[cite: 5]
        next();
    } catch (err) {
        return res.status(401).json({ error: 'Invalid or expired token' });
    }
}

// ==========================================
// МАРШРУТЫ АУТЕНТИФИКАЦИИ
// ==========================================

// Регистрация
app.post('/api/auth/register', async (req, res) => {
    const { email, password, first_name, last_name } = req.body;
    if (!email || !password || !first_name || !last_name) return res.status(400).json({ error: 'Все поля обязательны' });
    if (users.find(u => u.email === email)) return res.status(409).json({ error: 'Пользователь уже существует' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = { id: Date.now().toString(), email, first_name, last_name, password: hashedPassword };
    users.push(newUser);

    res.status(201).json({ id: newUser.id, email: newUser.email });
});

// Логин (Выдача токена)[cite: 5]
app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;
    const user = users.find(u => u.email === email);

    if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.status(401).json({ error: 'Неверные учетные данные' });
    }

    // Создание access-токена[cite: 5]
    const accessToken = jwt.sign(
        { sub: user.id, email: user.email },
        JWT_SECRET,
        { expiresIn: ACCESS_EXPIRES_IN }
    );

    res.json({ accessToken });
});

// Получение информации о текущем пользователе (ЗАЩИЩЕНО)[cite: 5]
app.get('/api/auth/me', authMiddleware, (req, res) => {
    const user = users.find(u => u.id === req.user.sub);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ id: user.id, email: user.email, first_name: user.first_name, last_name: user.last_name });
});

// ==========================================
// МАРШРУТЫ ТОВАРОВ
// ==========================================

// Создать товар (пока не защищаем по заданию)
app.post('/api/products', (req, res) => {
    const newProduct = { id: Date.now().toString(), ...req.body, price: Number(req.body.price) };
    products.push(newProduct);
    res.status(201).json(newProduct);
});

// Получить список товаров
app.get('/api/products', (req, res) => {
    res.json(products);
});

// ЗАЩИЩЕННЫЕ МАРШРУТЫ ДЛЯ ТОВАРОВ ПО ID[cite: 5]
app.get('/api/products/:id', authMiddleware, (req, res) => {
    const product = products.find(p => p.id === req.params.id);
    if (!product) return res.status(404).json({ error: 'Товар не найден' });
    res.json(product);
});

app.put('/api/products/:id', authMiddleware, (req, res) => {
    const index = products.findIndex(p => p.id === req.params.id);
    if (index === -1) return res.status(404).json({ error: 'Товар не найден' });
    products[index] = { ...products[index], ...req.body, price: Number(req.body.price) };
    res.json(products[index]);
});

app.delete('/api/products/:id', authMiddleware, (req, res) => {
    const index = products.findIndex(p => p.id === req.params.id);
    if (index === -1) return res.status(404).json({ error: 'Товар не найден' });
    res.json({ message: 'Товар удален', product: products.splice(index, 1)[0] });
});

app.listen(PORT, () => console.log(`Сервер практики 8 запущен на http://localhost:${PORT}`));