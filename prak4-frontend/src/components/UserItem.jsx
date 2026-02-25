import React from "react";

export default function UserItem({ good, onEdit, onDelete }) {
    return (
        <div className="userRow">
            <div className="userMain">
                {/* 👇 Картинка товара */}
                <div className="userImage">
                    {good.image ? (
                        <img 
                            src={`http://localhost:3000${good.image}`} 
                            alt={good.name}
                            style={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 8 }}
                        />
                    ) : (
                        <div style={{ 
                            width: 60, height: 60, 
                            background: '#f0f0f0', 
                            borderRadius: 8,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: 24
                        }}>
                            📦
                        </div>
                    )}
                </div>
                
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