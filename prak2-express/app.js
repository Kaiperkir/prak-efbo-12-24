const express = require('express');
const app = express();
const port = 3000;

// Middleware для парсинга JSON
app.use(express.json());

// Middleware для парсинга данных из форм
app.use(express.urlencoded({ extended: false }));

// Данные (имитация базы данных)
let goods = [
    { id: 1, name: 'Чай черный', price: 150 },
    { id: 2, name: 'Кофе молотый', price: 400 }
];

// ==========================================
// МАРШРУТЫ
// ==========================================

// Главная страница
app.get('/', (req, res) => {
    res.send('API для управления товарами. Доступные маршруты: /goods');
});

// 1. Просмотр всех товаров (GET)
app.get('/goods', (req, res) => {
    res.json(goods);
});

// 2. Просмотр товара по ID (GET)
app.get('/goods/:id', (req, res) => {
    const id = +req.params.id;
    const item = goods.find(i => i.id === id);
    
    if (!item) {
        return res.status(404).json({ error: 'Товар не найден' });
    }
    
    res.json(item);
});

// 3. Добавление нового товара (POST)
app.post('/goods', (req, res) => {
    const { name, price } = req.body;
    
    // Проверка обязательных полей
    if (!name || !price) {
        return res.status(400).json({ error: 'Название и цена обязательны' });
    }
    
    // Создаем новый товар
    const newItem = {
        id: Date.now(),
        name: name,
        price: Number(price)
    };
    
    // Добавляем в массив
    goods.push(newItem);
    
    // Возвращаем созданный товар со статусом 201
    res.status(201).json(newItem);
});

// 4. Обновление товара (PATCH)
app.patch('/goods/:id', (req, res) => {
    const id = +req.params.id;
    const item = goods.find(i => i.id === id);
    
    if (!item) {
        return res.status(404).json({ error: 'Товар не найден' });
    }
    
    // Обновляем поля, если они переданы
    if (req.body.name !== undefined) {
        item.name = req.body.name;
    }
    
    if (req.body.price !== undefined) {
        item.price = Number(req.body.price);
    }
    
    res.json(item);
});

// 5. Удаление товара (DELETE)
app.delete('/goods/:id', (req, res) => {
    const id = +req.params.id;
    
    // Сохраняем исходную длину массива
    const initialLength = goods.length;
    
    // Фильтруем массив, удаляя товар с указанным ID
    goods = goods.filter(i => i.id !== id);
    
    // Проверяем, был ли товар найден и удален
    if (goods.length === initialLength) {
        return res.status(404).json({ error: 'Товар не найден' });
    }
    
    res.json({ message: 'Товар удален' });
});

// Запуск сервера
app.listen(port, () => {
    console.log(`Сервер запущен на: http://localhost:${port}`);
});