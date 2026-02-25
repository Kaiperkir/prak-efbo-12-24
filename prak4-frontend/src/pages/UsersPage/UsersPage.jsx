import React, { useEffect, useState } from "react";
import UsersList from "../../components/UsersList";
import UserModal from "../../components/UserModal";
import { api } from "../../api";
import "./UsersPage.css";

export default function UsersPage() {
    const [goods, setGoods] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    const [modalOpen, setModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState("create");
    const [currentGood, setCurrentGood] = useState(null);

    const fetchGoods = async () => {
        try {
            setLoading(true);
            const data = await api.getGoods();
            setGoods(data);
            setError(null);
        } catch (err) {
            console.error("Ошибка загрузки товаров:", err);
            setError("Не удалось загрузить товары. Проверьте, запущен ли сервер на порту 3000");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchGoods();
    }, []);

    const openCreateModal = () => {
        setModalMode("create");
        setCurrentGood(null);
        setModalOpen(true);
    };

    const openEditModal = (good) => {
        setModalMode("edit");
        setCurrentGood(good);
        setModalOpen(true);
    };

    const closeModal = () => {
        setModalOpen(false);
        setCurrentGood(null);
    };

    const handleSubmit = async (data, isFormData) => {
        try {
            if (modalMode === "create") {
                await api.createGood(data, isFormData);
            } else {
                await api.updateGood(data.id, data, isFormData);
            }
            await fetchGoods();
            closeModal();
        } catch (err) {
            console.error("Ошибка при сохранении товара:", err);
            alert("Не удалось сохранить товар: " + (err.response?.data?.error || err.message));
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Удалить этот товар?")) return;
        
        try {
            await api.deleteGood(id);
            await fetchGoods();
        } catch (err) {
            console.error("Ошибка при удалении:", err);
            alert("Не удалось удалить товар");
        }
    };

    if (loading) {
        return (
            <div className="page">
                <div className="page__header">
                    <h1 className="page__title">🛒 Интернет-магазин</h1>
                </div>
                <div className="loading">Загрузка товаров...</div>
            </div>
        );
    }

    return (
        <div className="page">
            <div className="page__header">
                <h1 className="page__title">🛒 Интернет-магазин</h1>
                <button className="btn btn--primary" onClick={openCreateModal}>
                    + Добавить товар
                </button>
            </div>

            {error && (
                <div className="error" style={{ 
                    background: '#ffebee', 
                    color: '#c62828', 
                    padding: '12px 16px', 
                    borderRadius: 8,
                    marginBottom: 16 
                }}>
                    ⚠️ {error}
                </div>
            )}

            <UsersList 
                goods={goods} 
                onEdit={openEditModal} 
                onDelete={handleDelete} 
            />

            <UserModal
                open={modalOpen}
                mode={modalMode}
                initialGood={currentGood}
                onClose={closeModal}
                onSubmit={handleSubmit}
            />
        </div>
    );
}