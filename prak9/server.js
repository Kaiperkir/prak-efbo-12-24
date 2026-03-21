const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const app = express();
app.use(express.json());

const PORT = 3000;

// Секреты и время жизни
const ACCESS_SECRET = 'access_secret';
const REFRESH_SECRET = 'refresh_secret';
const ACCESS_EXPIRES_IN = '15m';
const REFRESH_EXPIRES_IN = '7d';

const users = [];
const products = [];
// Хранилище refresh-токенов в памяти
const refreshTokens = new Set();

// ==========================================
// ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ
// ==========================================
function generateAccessToken(user) {
    return jwt.sign({ sub: user.id, email: user.email }, ACCESS_SECRET, { expiresIn: ACCESS_EXPIRES_IN });
}

function generateRefreshToken(user) {
    return jwt.sign({ sub: user.id, email: user.email }, REFRESH_SECRET, { expiresIn: REFRESH_EXPIRES_IN });
}

function authMiddleware(req, res, next) {
    const header = req.headers.authorization || '';
    const [scheme, token] = header.split(' ');

    if (scheme !== 'Bearer' || !token) return res.status(401).json({ error: 'Missing or invalid Authorization header' });

    try {
        req.user = jwt.verify(token, ACCESS_SECRET);
        next();
    } catch (err) {
        return res.status(401).json({ error: 'Invalid or expired token' });
    }
}

// ==========================================
// МАРШРУТЫ АУТЕНТИФИКАЦИИ
// ==========================================
app.post('/api/auth/register', async (req, res) => {
    const { email, password, first_name, last_name } = req.body;
    if (!email || !password || !first_name || !last_name) return res.status(400).json({ error: 'Все поля обязательны' });
    if (users.find(u => u.email === email)) return res.status(409).json({ error: 'Пользователь уже существует' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = { id: Date.now().toString(), email, first_name, last_name, password: hashedPassword };
    users.push(newUser);

    res.status(201).json({ id: newUser.id, email: newUser.email });
});

app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;
    const user = users.find(u => u.email === email);

    if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.status(401).json({ error: 'Неверные учетные данные' });
    }

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);
    
    refreshTokens.add(refreshToken); // Сохраняем рефреш-токен на сервере

    res.json({ accessToken, refreshToken });
});

// НОВЫЙ МАРШРУТ: Обновление пары токенов
app.post('/api/auth/refresh', (req, res) => {
    const { refreshToken } = req.body;

    if (!refreshToken) return res.status(400).json({ error: 'refreshToken is required' });
    if (!refreshTokens.has(refreshToken)) return res.status(401).json({ error: 'Invalid refresh token' });

    try {
        const payload = jwt.verify(refreshToken, REFRESH_SECRET);
        const user = users.find(u => u.id === payload.sub);
        
        if (!user) return res.status(401).json({ error: 'User not found' });

        // Удаляем старый рефреш-токен и генерируем новую пару
        refreshTokens.delete(refreshToken);
        const newAccessToken = generateAccessToken(user);
        const newRefreshToken = generateRefreshToken(user);
        refreshTokens.add(newRefreshToken);

        res.json({ accessToken: newAccessToken, refreshToken: newRefreshToken });
    } catch (err) {
        return res.status(401).json({ error: 'Invalid or expired refresh token' });
    }
});

app.get('/api/auth/me', authMiddleware, (req, res) => {
    const user = users.find(u => u.id === req.user.sub);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ id: user.id, email: user.email, first_name: user.first_name, last_name: user.last_name });
});

// ==========================================
// МАРШРУТЫ ТОВАРОВ
// ==========================================
app.post('/api/products', (req, res) => {
    const newProduct = { id: Date.now().toString(), ...req.body, price: Number(req.body.price) };
    products.push(newProduct);
    res.status(201).json(newProduct);
});

app.get('/api/products', (req, res) => res.json(products));

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

app.listen(PORT, () => console.log(`Сервер практики 9 запущен на http://localhost:${PORT}`));