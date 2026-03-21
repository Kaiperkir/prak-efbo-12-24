const express = require('express');
const bcrypt = require('bcrypt');


const app = express();
app.use(express.json());

const PORT = 3000;

// Импровизированные БД
const users = [];
const products = [];

// ==========================================
// МАРШРУТЫ АУТЕНТИФИКАЦИИ (Практика 7)
// ==========================================

// Регистрация пользователя
app.post('/api/auth/register', async (req, res) => {
    const { email, password, first_name, last_name } = req.body;

    if (!email || !password || !first_name || !last_name) {
        return res.status(400).json({ error: 'Все поля обязательны (email, password, first_name, last_name)' });
    }

    const exists = users.find(u => u.email === email);
    if (exists) {
        return res.status(409).json({ error: 'Пользователь с таким email уже существует' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = {
        id: Date.now().toString(),
        email,
        first_name,
        last_name,
        password: hashedPassword
    };

    users.push(newUser);

    res.status(201).json({
        id: newUser.id,
        email: newUser.email,
        first_name: newUser.first_name,
        last_name: newUser.last_name
    });
});

// Логин пользователя
app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: 'email и password обязательны' });
    }

    const user = users.find(u => u.email === email);
    if (!user) {
        return res.status(401).json({ error: 'Неверные учетные данные' });
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
        return res.status(401).json({ error: 'Неверные учетные данные' });
    }

    res.status(200).json({ message: 'Успешный вход (токены будут в 8 практике)' });
});

// ==========================================
// МАРШРУТЫ ТОВАРОВ (CRUD)
// ==========================================

// Создать товар
app.post('/api/products', (req, res) => {
    const { title, category, description, price } = req.body;
    const newProduct = {
        id: Date.now().toString(),
        title,
        category,
        description,
        price: Number(price)
    };
    products.push(newProduct);
    res.status(201).json(newProduct);
});

// Получить список товаров
app.get('/api/products', (req, res) => {
    res.json(products);
});

// Получить товар по id
app.get('/api/products/:id', (req, res) => {
    const product = products.find(p => p.id === req.params.id);
    if (!product) return res.status(404).json({ error: 'Товар не найден' });
    res.json(product);
});

// Обновить параметры товара
app.put('/api/products/:id', (req, res) => {
    const { title, category, description, price } = req.body;
    const index = products.findIndex(p => p.id === req.params.id);
    
    if (index === -1) return res.status(404).json({ error: 'Товар не найден' });

    products[index] = { ...products[index], title, category, description, price: Number(price) };
    res.json(products[index]);
});

// Удалить товар
app.delete('/api/products/:id', (req, res) => {
    const index = products.findIndex(p => p.id === req.params.id);
    if (index === -1) return res.status(404).json({ error: 'Товар не найден' });
    
    const deletedProduct = products.splice(index, 1);
    res.json({ message: 'Товар удален', product: deletedProduct[0] });
});

// Запуск сервера
app.listen(PORT, () => {
    console.log(`Сервер практики 7 запущен на http://localhost:${PORT}`);
});