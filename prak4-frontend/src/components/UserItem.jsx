import React from "react";

export default function UserItem({ good, onEdit, onDelete }) {
    return (
        <div className="userRow">
            <div className="userMain">
                {/* 👇 Было: g.id, g.name... Надо: good.id, good.name */}
                <div className="userId">#{good.id.slice(0, 6)}</div>
                <div className="userName">{good.name}</div>
                <div className="userAge">{good.category}</div>
                <div className="userPrice">{good.price} ₽</div>
                <div className="userStock">На складе: {good.stock}</div>
            </div>

            <div className="userActions">
                <button className="btn" onClick={() => onEdit(good)}>
                    Редактировать
                </button>
                <button className="btn btn--danger" onClick={() => onDelete(good.id)}>
                    Удалить
                </button>
            </div>
        </div>
    );
}