import React, { useEffect, useState } from "react";
import "./UsersPage.css";
import UsersList from "../../components/UsersList";
import UserModal from "../../components/UserModal";
import { api } from "../../api";

export default function UsersPage() {
    const [goods, setGoods] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState("create");
    const [editingGood, setEditingGood] = useState(null);

    useEffect(() => {
        loadGoods();
    }, []);

    const loadGoods = async () => {
        try {
            setLoading(true);
            const data = await api.getGoods();
            setGoods(data);
        } catch (err) {
            console.error(err);
            alert("Ошибка загрузки товаров");
        } finally {
            setLoading(false);
        }
    };

    const openCreate = () => {
        setModalMode("create");
        setEditingGood(null);
        setModalOpen(true);
    };

    const openEdit = (good) => {
        setModalMode("edit");
        setEditingGood(good);
        setModalOpen(true);
    };

    const closeModal = () => {
        setModalOpen(false);
        setEditingGood(null);
    };

    const handleDelete = async (id) => {
        const ok = window.confirm("Удалить товар?");
        if (!ok) return;
        try {
            await api.deleteGood(id);
            setGoods((prev) => prev.filter((g) => g.id !== id));
        } catch (err) {
            console.error(err);
            alert("Ошибка удаления товара");
        }
    };

    const handleSubmitModal = async (payload) => {
        try {
            if (modalMode === "create") {
                const newGood = await api.createGood(payload);
                setGoods((prev) => [...prev, newGood]);
            } else {
                const updatedGood = await api.updateGood(payload.id, payload);
                setGoods((prev) =>
                    prev.map((g) => (g.id === payload.id ? updatedGood : g))
                );
            }
            closeModal();
        } catch (err) {
            console.error(err);
            alert("Ошибка сохранения товара");
        }
    };

    return (
        <div className="page">
            <header className="header">
                <div className="header__inner">
                    <div className="brand">Internet Store</div>
                    <div className="header__right">React + Express</div>
                </div>
            </header>

            <main className="main">
                <div className="container">
                    <div className="toolbar">
                        <h1 className="title">Товары</h1>
                        <button className="btn btn--primary" onClick={openCreate}>
                            + Создать
                        </button>
                    </div>

                    {loading ? (
                        <div className="empty">Загрузка...</div>
                    ) : (
                        <UsersList goods={goods} onEdit={openEdit} onDelete={handleDelete} />
                    )}
                </div>
            </main>

            <footer className="footer">
                <div className="footer__inner">
                    © {new Date().getFullYear()} Internet Store
                </div>
            </footer>

            <UserModal
                open={modalOpen}
                mode={modalMode}
                initialGood={editingGood}
                onClose={closeModal}
                onSubmit={handleSubmitModal}
            />
        </div>
    );
}