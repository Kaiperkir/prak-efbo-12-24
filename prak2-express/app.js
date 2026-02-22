const express = require('express');
const cors = require('cors');
const { nanoid } = require('nanoid');
const app = express();
const port = 3000;

// Middleware
app.use(express.json());
app.use(cors({
    origin: "http://localhost:3001",
    methods: ["GET", "POST", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
}));

// Товары (минимум 10)
let goods = [
    { id: nanoid(6), name: 'Чай черный', category: 'Напитки', description: 'Классический черный чай', price: 150, stock: 50 },
    { id: nanoid(6), name: 'Кофе молотый', category: 'Напитки', description: 'Арабика свежей обжарки', price: 400, stock: 30 },
    { id: nanoid(6), name: 'Сахар', category: 'Бакалея', description: 'Сахар белый 1кг', price: 85, stock: 100 },
    { id: nanoid(6), name: 'Печенье овсяное', category: 'Сладости', description: 'Диетическое печенье', price: 120, stock: 45 },
    { id: nanoid(6), name: 'Шоколад', category: 'Сладости', description: 'Горький шоколад 72%', price: 250, stock: 20 },
    { id: nanoid(6), name: 'Мёд', category: 'Натуральные продукты', description: 'Цветочный мёд 500г', price: 350, stock: 15 },
    { id: nanoid(6), name: 'Орехи кешью', category: 'Снеки', description: 'Жареные без соли 200г', price: 450, stock: 25 },
    { id: nanoid(6), name: 'Чай зелёный', category: 'Напитки', description: 'Зелёный чай с жасмином', price: 220, stock: 40 },
    { id: nanoid(6), name: 'Сухофрукты', category: 'Снеки', description: 'Микс сухофруктов 300г', price: 300, stock: 35 },
    { id: nanoid(6), name: 'Какао', category: 'Напитки', description: 'Какао-порошок 250г', price: 180, stock: 60 }
];

// Главная
app.get('/', (req, res) => {
    res.json({ message: 'API интернет-магазина' });
});

// GET все товары
app.get('/goods', (req, res) => res.json(goods));

// GET товар по ID
app.get('/goods/:id', (req, res) => {
    const item = goods.find(i => i.id === req.params.id);
    if (!item) return res.status(404).json({ error: 'Товар не найден' });
    res.json(item);
});

// POST создать товар
app.post('/goods', (req, res) => {
    const { name, category, description, price, stock } = req.body;
    if (!name || price === undefined) {
        return res.status(400).json({ error: 'Название и цена обязательны' });
    }
    const newItem = {
        id: nanoid(6),
        name: name.trim(),
        category: category || 'Без категории',
        description: description || '',
        price: Number(price),
        stock: Number(stock) || 0
    };
    goods.push(newItem);
    res.status(201).json(newItem);
});

// PATCH обновить товар
app.patch('/goods/:id', (req, res) => {
    const item = goods.find(i => i.id === req.params.id);
    if (!item) return res.status(404).json({ error: 'Товар не найден' });
    
    const { name, category, description, price, stock } = req.body;
    if (name !== undefined) item.name = name.trim();
    if (category !== undefined) item.category = category;
    if (description !== undefined) item.description = description;
    if (price !== undefined) item.price = Number(price);
    if (stock !== undefined) item.stock = Number(stock);
    
    res.json(item);
});

// DELETE удалить товар
app.delete('/goods/:id', (req, res) => {
    const initialLength = goods.length;
    goods = goods.filter(i => i.id !== req.params.id);
    if (goods.length === initialLength) {
        return res.status(404).json({ error: 'Товар не найден' });
    }
    res.status(204).send();
});

app.listen(port, () => {
    console.log(`🚀 Сервер запущен: http://localhost:${port}`);
});