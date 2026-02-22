import React from "react";
import UserItem from "./UserItem";

export default function UsersList({ goods, onEdit, onDelete }) {
    if (!goods.length) {
        return <div className="empty">Товаров пока нет</div>;
    }

    return (
        <div className="list">
            {goods.map((g) => (
                <UserItem key={g.id} good={g} onEdit={onEdit} onDelete={onDelete} />
            ))}
        </div>
    );
}