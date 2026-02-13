const express = require('express');
const app = express();
const port = 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static('public'));

// Логгер
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// Данные пользователей
let users = [
  { id: 1, name: 'Кирилл Перекальский', age: 19 },
  { id: 2, name: 'Иван Иванов', age: 20 },
  { id: 3, name: 'Мария Петрова', age: 18 }
];

// Главная
app.get('/', (req, res) => {
  res.send(`
    <h1>Практическая работа №2</h1>
    <p>ЭФБО-12-24, Перекальский К.В., МIREА</p>
    <a href="/users">Перейти к /users (JSON)</a>
  `);
});

// GET все users
app.get('/users', (req, res) => {
  res.json(users);
});

// GET /users/:id
app.get('/users/:id', (req, res) => {
  const user = users.find(u => u.id == req.params.id);
  if (user) res.json(user);
  else res.status(404).json({ error: 'Пользователь не найден' });
});

// POST новый user
app.post('/users', (req, res) => {
  const { name, age } = req.body;
  const newUser = { id: Date.now(), name, age: parseInt(age) };
  users.push(newUser);
  res.status(201).json(newUser);
});

// PATCH /users/:id
app.patch('/users/:id', (req, res) => {
  const index = users.findIndex(u => u.id == req.params.id);
  if (index !== -1) {
    const { name, age } = req.body;
    if (name !== undefined) users[index].name = name;
    if (age !== undefined) users[index].age = parseInt(age);
    res.json(users[index]);
  } else {
    res.status(404).json({ error: 'Не найден' });
  }
});

// DELETE /users/:id
app.delete('/users/:id', (req, res) => {
  users = users.filter(u => u.id != req.params.id);
  res.json({ message: 'Удалено' });
});

app.listen(port, () => {
  console.log(`Сервер запущен: http://localhost:${port}`);
});
