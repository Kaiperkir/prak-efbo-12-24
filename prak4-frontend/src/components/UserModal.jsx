import React, { useEffect, useState } from "react";

export default function UserModal({ open, mode, initialGood, onClose, onSubmit }) {
    const [name, setName] = useState("");
    const [category, setCategory] = useState("");
    const [description, setDescription] = useState("");
    const [price, setPrice] = useState("");
    const [stock, setStock] = useState("");
    const [imageFile, setImageFile] = useState(null); // ← новое состояние
    const [preview, setPreview] = useState(initialGood?.image || null); // ← превью

    useEffect(() => {
        if (!open) return;
        setName(initialGood?.name ?? "");
        setCategory(initialGood?.category ?? "");
        setDescription(initialGood?.description ?? "");
        setPrice(initialGood?.price != null ? String(initialGood.price) : "");
        setStock(initialGood?.stock != null ? String(initialGood.stock) : "");
        setPreview(initialGood?.image || null);
        setImageFile(null);
    }, [open, initialGood]);

    // ← обработчик выбора файла
    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            setPreview(URL.createObjectURL(file));
        }
    };

    if (!open) return null;

    const title = mode === "edit" ? "Редактирование товара" : "Создание товара";

    const handleSubmit = (e) => {
        e.preventDefault();

        const trimmed = name.trim();
        const parsedPrice = Number(price);
        const parsedStock = Number(stock);

        if (!trimmed) {
            alert("Введите название товара");
            return;
        }
        if (!Number.isFinite(parsedPrice) || parsedPrice < 0) {
            alert("Введите корректную цену");
            return;
        }

        // ← Отправляем FormData если есть файл, иначе обычный объект
        if (imageFile) {
            const formData = new FormData();
            formData.append('name', trimmed);
            formData.append('category', category.trim());
            formData.append('description', description.trim());
            formData.append('price', parsedPrice);
            formData.append('stock', parsedStock);
            formData.append('image', imageFile);
            
            onSubmit(formData, true); // ← флаг isFormData
        } else {
            onSubmit({
                id: initialGood?.id,
                name: trimmed,
                category: category.trim(),
                description: description.trim(),
                price: parsedPrice,
                stock: parsedStock,
            }, false);
        }
    };

    return (
        <div className="backdrop" onMouseDown={onClose}>
            <div className="modal" onMouseDown={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
                <div className="modal__header">
                    <div className="modal__title">{title}</div>
                    <button className="iconBtn" onClick={onClose} aria-label="Закрыть">
                        ✕
                    </button>
                </div>

                <form className="form" onSubmit={handleSubmit}>
                    {/* 👇 Поле загрузки картинки */}
                    <label className="label">
                        Картинка товара
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            style={{ marginTop: 8 }}
                        />
                        {preview && (
                            <img 
                                src={preview.startsWith('blob:') ? preview : `http://localhost:3000${preview}`}
                                alt="Preview"
                                style={{ 
                                    width: 100, height: 100, 
                                    objectFit: 'cover', 
                                    borderRadius: 8,
                                    marginTop: 8 
                                }}
                            />
                        )}
                    </label>

                    <label className="label">
                        Название товара
                        <input
                            className="input"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Например, Чай черный"
                            autoFocus
                        />
                    </label>

                    <label className="label">
                        Категория
                        <input
                            className="input"
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            placeholder="Например, Напитки"
                        />
                    </label>

                    <label className="label">
                        Описание
                        <textarea
                            className="input"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Описание товара"
                            rows="3"
                        />
                    </label>

                    <label className="label">
                        Цена (₽)
                        <input
                            className="input"
                            value={price}
                            onChange={(e) => setPrice(e.target.value)}
                            placeholder="Например, 150"
                            inputMode="numeric"
                        />
                    </label>

                    <label className="label">
                        Количество на складе
                        <input
                            className="input"
                            value={stock}
                            onChange={(e) => setStock(e.target.value)}
                            placeholder="Например, 50"
                            inputMode="numeric"
                        />
                    </label>

                    <div className="modal__footer">
                        <button type="button" className="btn" onClick={onClose}>
                            Отмена
                        </button>
                        <button type="submit" className="btn btn--primary">
                            {mode === "edit" ? "Сохранить" : "Создать"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}