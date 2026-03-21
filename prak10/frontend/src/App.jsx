import { useState, useEffect } from 'react';
import api from './api';

function App() {
  const [user, setUser] = useState(null);
  const [products, setProducts] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [form, setForm] = useState({ email: '', password: '' });

  const loadData = async () => {
    try {
      const meRes = await api.get('/auth/me');
      setUser(meRes.data);
      
      const prodRes = await api.get('/products');
      setProducts(prodRes.data);

      if (meRes.data.role === 'admin') {
        const usersRes = await api.get('/users');
        setAllUsers(usersRes.data);
      }
    } catch (err) {
      localStorage.clear();
      setUser(null);
    }
  };

  useEffect(() => {
    if (localStorage.getItem('accessToken')) loadData();
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/auth/login', form);
      localStorage.setItem('accessToken', res.data.accessToken);
      localStorage.setItem('refreshToken', res.data.refreshToken);
      await loadData();
    } catch (err) { alert('Неверный логин или пароль!'); }
  };

  const Header = () => (
    <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px 30px', background: '#2c3e50', color: 'white' }}>
      <h1 style={{ margin: 0 }}>🛒 My Super Store</h1>
      <div>
        {user ? (
          <>
            <span style={{ marginRight: '15px' }}>Привет, <b>{user.email}</b> ({user.role})</span>
            <button onClick={() => { localStorage.clear(); setUser(null); }} style={{ padding: '8px 15px', cursor: 'pointer', background: '#e74c3c', color: 'white', border: 'none', borderRadius: '4px' }}>Выйти</button>
          </>
        ) : (
          <span>Требуется авторизация</span>
        )}
      </div>
    </header>
  );

  if (!user) return (
    <div style={{ fontFamily: 'sans-serif' }}>
      <Header />
      <div style={{ maxWidth: '300px', margin: '100px auto', textAlign: 'center', padding: '20px', border: '1px solid #ddd', borderRadius: '8px' }}>
        <h2>Вход в аккаунт</h2>
        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <input placeholder="Email" onChange={e => setForm({...form, email: e.target.value})} required style={{ padding: '10px' }} />
          <input type="password" placeholder="Пароль" onChange={e => setForm({...form, password: e.target.value})} required style={{ padding: '10px' }} />
          <button type="submit" style={{ padding: '10px', background: '#3498db', color: 'white', border: 'none', cursor: 'pointer' }}>Войти</button>
        </form>
      </div>
    </div>
  );

  return (
    <div style={{ fontFamily: 'sans-serif', backgroundColor: '#f5f6fa', minHeight: '100vh' }}>
      <Header />
      <main style={{ display: 'flex', padding: '20px', gap: '20px', maxWidth: '1200px', margin: '0 auto' }}>
        <section style={{ flex: 2, background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          <h2>Каталог товаров</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '15px' }}>
            {products.map(p => (
              <div key={p.id} style={{ border: '1px solid #ddd', padding: '15px', borderRadius: '8px', textAlign: 'center' }}>
                <div style={{ fontSize: '40px', marginBottom: '10px' }}>📦</div>
                <h4 style={{ margin: '10px 0' }}>{p.title}</h4>
                <p style={{ color: '#27ae60', fontWeight: 'bold' }}>{p.price} руб.</p>
                <button style={{ width: '100%', padding: '8px', background: '#34495e', color: 'white', border: 'none', cursor: 'pointer', marginBottom: '5px' }}>Купить</button>
                {user.role === 'admin' && (
                  <button onClick={() => api.delete(`/products/${p.id}`).then(loadData)} style={{ width: '100%', padding: '8px', background: '#e74c3c', color: 'white', border: 'none', cursor: 'pointer' }}>🗑 Удалить</button>
                )}
              </div>
            ))}
          </div>

          {(user.role === 'admin' || user.role === 'seller') && (
            <div style={{ marginTop: '30px', padding: '15px', border: '2px dashed #2ecc71', borderRadius: '8px' }}>
              <h3>Добавить новый товар (Только для Продавца и Владельца)</h3>
              <button onClick={() => api.post('/products', { title: 'Новый Товар ' + Math.floor(Math.random()*100), price: 5000 }).then(loadData)} style={{ padding: '10px 20px', background: '#2ecc71', color: 'white', border: 'none', cursor: 'pointer' }}>
                + Добавить в каталог
              </button>
            </div>
          )}
        </section>

        {user.role === 'admin' && (
          <section style={{ flex: 1, background: '#fff0f0', padding: '20px', borderRadius: '8px', border: '1px solid #ffcccc' }}>
            <h2 style={{ color: '#c0392b' }}>👑 Панель Владельца</h2>
            <p>Управление персоналом:</p>
            {allUsers.map(u => (
              <div key={u.id} style={{ background: 'white', padding: '10px', marginBottom: '10px', borderRadius: '4px', border: '1px solid #ddd' }}>
                <strong>{u.email}</strong> <br/>
                <span style={{ color: 'gray', fontSize: '14px' }}>Роль: {u.role}</span>
                {u.id !== user.id && (
                  <button onClick={() => api.delete(`/users/${u.id}`).then(loadData)} style={{ display: 'block', width: '100%', marginTop: '10px', padding: '5px', background: '#c0392b', color: 'white', border: 'none', cursor: 'pointer' }}>
                    ❌ Уволить (Удалить)
                  </button>
                )}
              </div>
            ))}
          </section>
        )}
      </main>
    </div>
  );
}

export default App;