import React, { useState, useEffect } from "react";
import UsersPage from "./pages/UsersPage/UsersPage";
import { api } from "./api";

function App() {
    const [currentPage, setCurrentPage] = useState("store");
    const [user, setUser] = useState(null);

    useEffect(() => {
        if (localStorage.getItem("accessToken")) {
            api.getMe().then(setUser).catch(() => {
                localStorage.clear();
                setUser(null);
            });
        }
    }, []);

    const handleLogout = () => { localStorage.clear(); setUser(null); };

    const LoginPage = () => {
        const [isLoginMode, setIsLoginMode] = useState(true);
        const [form, setForm] = useState({ email: '', password: '', role: 'user' });
        const [error, setError] = useState('');

        const onSubmit = async (e) => {
            e.preventDefault();
            setError('');
            try {
                if (!isLoginMode) await api.register(form);
                const res = await api.login({ email: form.email, password: form.password });
                localStorage.setItem("accessToken", res.accessToken);
                localStorage.setItem("refreshToken", res.refreshToken);
                
                const me = await api.getMe();
                setUser(me);
                setCurrentPage("store"); 
            } catch (err) { setError(isLoginMode ? "Неверный логин/пароль" : "Ошибка регистрации!"); }
        };

        return (
            <div style={{ maxWidth: '400px', margin: '100px auto', padding: '30px', border: '1px solid #e0e0e0', borderRadius: '12px', background: '#fff', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                <div style={{ display: 'flex', marginBottom: '20px', borderBottom: '2px solid #eee' }}>
                    <button type="button" onClick={() => { setIsLoginMode(true); setError(''); }} style={{ flex: 1, padding: '10px', background: 'none', border: 'none', borderBottom: isLoginMode ? '2px solid #1976d2' : 'none', color: isLoginMode ? '#1976d2' : '#666', fontWeight: isLoginMode ? 'bold' : 'normal', cursor: 'pointer' }}>Вход</button>
                    <button type="button" onClick={() => { setIsLoginMode(false); setError(''); }} style={{ flex: 1, padding: '10px', background: 'none', border: 'none', borderBottom: !isLoginMode ? '2px solid #1976d2' : 'none', color: !isLoginMode ? '#1976d2' : '#666', fontWeight: !isLoginMode ? 'bold' : 'normal', cursor: 'pointer' }}>Регистрация</button>
                </div>
                {error && <p style={{ color: '#d32f2f', textAlign: 'center', background: '#ffebee', padding: '10px', borderRadius: '8px' }}>{error}</p>}
                <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    <input style={{ padding: '10px', borderRadius: '8px', border: '1px solid #ddd' }} placeholder="Email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} required />
                    <input style={{ padding: '10px', borderRadius: '8px', border: '1px solid #ddd' }} type="password" placeholder="Пароль" value={form.password} onChange={e => setForm({...form, password: e.target.value})} required />
                    
                    {!isLoginMode && (
                        <select style={{ padding: '10px', borderRadius: '8px', border: '1px solid #ddd' }} value={form.role} onChange={e => setForm({...form, role: e.target.value})}>
                            <option value="user">Обычный покупатель (user)</option>
                            <option value="seller">Продавец товаров (seller)</option>
                            <option value="admin">Владелец / Админ (admin)</option>
                        </select>
                    )}
                    
                    <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                        <button type="button" onClick={() => setCurrentPage("store")} style={{ flex: 1, padding: '10px', background: '#f5f5f5', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>Назад</button>
                        <button type="submit" style={{ flex: 1, padding: '10px', background: '#1976d2', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>{isLoginMode ? "Войти" : "Создать"}</button>
                    </div>
                </form>
            </div>
        );
    };

    return currentPage === "login" ? <LoginPage /> : <div className="App"><UsersPage user={user} onLoginClick={() => setCurrentPage("login")} onLogout={handleLogout} /></div>;
}

export default App;