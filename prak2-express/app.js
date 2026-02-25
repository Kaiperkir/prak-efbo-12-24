const express = require('express');
const cors = require('cors');
const { nanoid } = require('nanoid');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// 🔥 SWAGGER
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const app = express();
const port = 3000;

// 📁 Папка uploads
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// 📦 MULTER
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname).toLowerCase();
        const uniqueName = `good_${nanoid(6)}_${Date.now()}${ext}`;
        cb(null, uniqueName);
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        const allowed = /jpeg|jpg|png|gif|webp/i;
        const ext = allowed.test(path.extname(file.originalname));
        const mime = allowed.test(file.mimetype);
        if (ext && mime) {
            cb(null, true);
        } else {
            cb(new Error('Только изображения: jpg, png, gif, webp'));
        }
    }
});

// Middleware
app.use(express.json());
app.use(cors({
    origin: "http://localhost:3001",
    methods: ["GET", "POST", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
}));

app.use('/uploads', express.static(uploadDir));

// 🔥 SWAGGER CONFIGURATION
const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'API Интернет-магазина',
            version: '1.0.0',
            description: 'API для управления товарами интернет-магазина',
        },
        servers: [
            {
                url: `http://localhost:${port}`,
                description: 'Локальный сервер',
            },
        ],
    },
    apis: ['./app.js'],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

/**
 * @swagger
 * components:
 *   schemas:
 *     Good:
 *       type: object
 *       required:
 *         - name
 *         - price
 *       properties:
 *         id:
 *           type: string
 *           description: Автоматически сгенерированный ID товара
 *         name:
 *           type: string
 *           description: Название товара
 *         category:
 *           type: string
 *           description: Категория товара
 *         description:
 *           type: string
 *           description: Описание товара
 *         price:
 *           type: number
 *           description: Цена товара в рублях
 *         stock:
 *           type: integer
 *           description: Количество на складе
 *         image:
 *           type: string
 *           description: Путь к изображению товара
 *       example:
 *         id: "abc123"
 *         name: "Чай черный"
 *         category: "Напитки"
 *         description: "Классический черный чай"
 *         price: 150
 *         stock: 50
 *         image: "/uploads/good_abc123_1234567890.jpg"
 */

// Товары
let goods = [
    { id: nanoid(6), name: 'Чай черный', category: 'Напитки', description: 'Классический черный чай', price: 150, stock: 50, image: null },
    { id: nanoid(6), name: 'Кофе молотый', category: 'Напитки', description: 'Арабика свежей обжарки', price: 400, stock: 30, image: null },
    { id: nanoid(6), name: 'Сахар', category: 'Бакалея', description: 'Сахар белый 1кг', price: 85, stock: 100, image: null },
    { id: nanoid(6), name: 'Печенье овсяное', category: 'Сладости', description: 'Диетическое печенье', price: 120, stock: 45, image: null },
    { id: nanoid(6), name: 'Шоколад', category: 'Сладости', description: 'Горький шоколад 72%', price: 250, stock: 20, image: null },
    { id: nanoid(6), name: 'Мёд', category: 'Натуральные продукты', description: 'Цветочный мёд 500г', price: 350, stock: 15, image: null },
    { id: nanoid(6), name: 'Орехи кешью', category: 'Снеки', description: 'Жареные без соли 200г', price: 450, stock: 25, image: null },
    { id: nanoid(6), name: 'Чай зелёный', category: 'Напитки', description: 'Зелёный чай с жасмином', price: 220, stock: 40, image: null },
    { id: nanoid(6), name: 'Сухофрукты', category: 'Снеки', description: 'Микс сухофруктов 300г', price: 300, stock: 35, image: null },
    { id: nanoid(6), name: 'Какао', category: 'Напитки', description: 'Какао-порошок 250г', price: 180, stock: 60, image: null }
];

// Роуты
app.get('/', (req, res) => res.json({ message: 'API работает' }));

/**
 * @swagger
 * /goods:
 *   get:
 *     summary: Возвращает список всех товаров
 *     tags: [Goods]
 *     responses:
 *       200:
 *         description: Список товаров
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Good'
 */
app.get('/goods', (req, res) => res.json(goods));

/**
 * @swagger
 * /goods/{id}:
 *   get:
 *     summary: Получает товар по ID
 *     tags: [Goods]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID товара
 *     responses:
 *       200:
 *         description: Данные товара
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Good'
 *       404:
 *         description: Товар не найден
 */
app.get('/goods/:id', (req, res) => {
    const item = goods.find(i => i.id === req.params.id);
    if (!item) return res.status(404).json({ error: 'Товар не найден' });
    res.json(item);
});

/**
 * @swagger
 * /goods:
 *   post:
 *     summary: Создает новый товар
 *     tags: [Goods]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               category:
 *                 type: string
 *               description:
 *                 type: string
 *               price:
 *                 type: number
 *               stock:
 *                 type: integer
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Товар успешно создан
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Good'
 *       400:
 *         description: Ошибка в теле запроса
 */
app.post('/goods', (req, res) => {
    upload.single('image')(req, res, function(err) {
        if (err) {
            console.error('❌ Multer error:', err.message);
            return res.status(400).json({ error: err.message });
        }
        
        try {
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
                stock: Number(stock) || 0,
                image: req.file ? `/uploads/${req.file.filename}` : null
            };
            
            goods.push(newItem);
            res.status(201).json(newItem);
        } catch (e) {
            console.error('❌ Ошибка:', e.message);
            res.status(500).json({ error: e.message });
        }
    });
});

/**
 * @swagger
 * /goods/{id}:
 *   patch:
 *     summary: Обновляет товар
 *     tags: [Goods]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID товара
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               category:
 *                 type: string
 *               description:
 *                 type: string
 *               price:
 *                 type: number
 *               stock:
 *                 type: integer
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Обновленный товар
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Good'
 *       400:
 *         description: Нет данных для обновления
 *       404:
 *         description: Товар не найден
 */
app.patch('/goods/:id', (req, res) => {
    upload.single('image')(req, res, function(err) {
        if (err) {
            console.error('❌ Multer error:', err.message);
            return res.status(400).json({ error: err.message });
        }
        
        const item = goods.find(i => i.id === req.params.id);
        if (!item) return res.status(404).json({ error: 'Товар не найден' });
        
        const { name, category, description, price, stock } = req.body;
        if (name !== undefined) item.name = name.trim();
        if (category !== undefined) item.category = category;
        if (description !== undefined) item.description = description;
        if (price !== undefined) item.price = Number(price);
        if (stock !== undefined) item.stock = Number(stock);
        if (req.file) item.image = `/uploads/${req.file.filename}`;
        
        res.json(item);
    });
});

/**
 * @swagger
 * /goods/{id}:
 *   delete:
 *     summary: Удаляет товар
 *     tags: [Goods]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID товара
 *     responses:
 *       204:
 *         description: Товар успешно удален
 *       404:
 *         description: Товар не найден
 */
app.delete('/goods/:id', (req, res) => {
    const len = goods.length;
    goods = goods.filter(i => i.id !== req.params.id);
    if (goods.length === len) {
        return res.status(404).json({ error: 'Товар не найден' });
    }
    res.status(204).send();
});

app.listen(port, () => {
    console.log(`🚀 Сервер: http://localhost:${port}`);
    console.log(`📚 Swagger: http://localhost:${port}/api-docs`);
    console.log(`📁 Uploads: ${uploadDir}`);
});