import React, { useEffect, useState } from "react";
import UsersList from "../../components/UsersList";
import UserModal from "../../components/UserModal";
import { api } from "../../api";
import "./UsersPage.css";

export default function UsersPage({ user, onLoginClick, onLogout }) {
    const [goods, setGoods] = useState([]);
    const [staff, setStaff] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    const [modalOpen, setModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState("create");
    const [currentGood, setCurrentGood] = useState(null);

    const loadData = async () => {
        try {
            setLoading(true);
            const data = await api.getGoods();
            setGoods(data);
            if (user?.role === 'admin') {
                const usersData = await api.getUsers();
                setStaff(usersData);
            }
            setError(null);
        } catch (err) { 
            setError("Ошибка связи с сервером. Проверьте запущен ли бэкенд."); 
        } finally { 
            setLoading(false); 
        }
    };

    useEffect(() => { loadData(); }, [user]);

    const openCreateModal = () => { setModalMode("create"); setCurrentGood(null); setModalOpen(true); };
    const openEditModal = (good) => { setModalMode("edit"); setCurrentGood(good); setModalOpen(true); };
    const closeModal = () => { setModalOpen(false); setCurrentGood(null); };

    const handleSubmit = async (data, isFormData) => {
        try {
            if (modalMode === "create") {
                await api.createGood(data, isFormData);
            } else {
                await api.updateGood(data.id, data, isFormData);
            }
            await loadData();
            closeModal();
        } catch (err) { 
            alert("Ошибка сохранения товара: " + (err.response?.data?.error || err.message)); 
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Удалить этот товар?")) return;
        try { await api.deleteGood(id); await loadData(); } catch (err) { alert("Ошибка удаления товара"); }
    };

    const handleDeleteUser = async (id) => {
        if (!window.confirm("Точно удалить этого пользователя?")) return;
        try { await api.deleteUser(id); await loadData(); } catch (err) { alert("Нельзя удалить самого себя или другого админа!"); }
    };

    if (loading) return <div className="loading">Загрузка каталога...</div>;

    return (
        <div className="page" style={{ display: 'flex', gap: '24px', alignItems: 'flex-start' }}>
            <div style={{ flex: 1 }}>
                <div style={{ background: '#fff', padding: '16px 24px', borderRadius: '12px', marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid #e0e0e0' }}>
                    <h1 style={{ margin: 0, fontSize: '24px' }}>🛒 Супер Магазин</h1>
                    {user ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                            <span style={{color: '#666'}}><b>{user.email}</b> ({user.role})</span>
                            <button className="btn btn--danger" onClick={onLogout}>Выйти</button>
                        </div>
                    ) : (
                        <button className="btn btn--primary" onClick={onLoginClick}>Войти / Регистрация</button>
                    )}
                </div>

                <div className="page__header">
                    <h2 className="page__title">Каталог товаров</h2>
                    {(user?.role === 'admin' || user?.role === 'seller') && (
                        <button className="btn btn--primary" onClick={openCreateModal}>+ Добавить товар</button>
                    )}
                </div>

                {error && <div className="error" style={{ background: '#ffebee', color: '#c62828', padding: '12px', borderRadius: '8px', marginBottom: '16px' }}>⚠️ {error}</div>}

                <UsersList goods={goods} user={user} onEdit={openEditModal} onDelete={handleDelete} />
            </div>

            {user?.role === 'admin' && (
                <div style={{ width: '300px', background: '#fff0f0', padding: '20px', borderRadius: '12px', border: '1px solid #ffcccc', position: 'sticky', top: '24px' }}>
                    <h3 style={{ margin: '0 0 16px 0', color: '#c0392b' }}>👑 Панель Админа</h3>
                    <p style={{ fontSize: '14px', color: '#666' }}>Управление персоналом:</p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {staff.map(u => (
                            <div key={u.id} style={{ background: 'white', padding: '12px', borderRadius: '8px', border: '1px solid #ddd' }}>
                                <div style={{ fontWeight: 'bold' }}>{u.email}</div>
                                <div style={{ fontSize: '12px', color: '#666', marginBottom: '8px' }}>Роль: {u.role}</div>
                                {u.id !== user?.id && u.role !== 'admin' && (
                                    <button onClick={() => handleDeleteUser(u.id)} style={{ width: '100%', padding: '6px', background: '#c0392b', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Уволить / Удалить</button>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <UserModal open={modalOpen} mode={modalMode} initialGood={currentGood} onClose={closeModal} onSubmit={handleSubmit} />
        </div>
    );
}