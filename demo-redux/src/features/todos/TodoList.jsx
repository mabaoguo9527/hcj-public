import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { addTodo, toggleTodo, removeTodo } from './todosSlice';

export default function TodoList() {
    const [text, setText] = useState('');
    const todos = useSelector((state) => state.todos.list);
    const dispatch = useDispatch();

    const handleAdd = () => {
        if (!text.trim()) return;
        dispatch(addTodo(text));
        setText('');
    };

    return (
        <div style={{ padding: 20, border: '1px solid #ddd', borderRadius: 8, marginTop: 16 }}>
            <h2>待办列表</h2>
            <input
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="输入要做的事"
            />
            <button onClick={handleAdd} style={{ marginLeft: 8 }}>添加</button>
            <ul>
                {todos.map((t) => (
                    <li key={t.id}>
            <span
                style={{ textDecoration: t.done ? 'line-through' : 'none', cursor: 'pointer' }}
                onClick={() => dispatch(toggleTodo(t.id))}
            >
              {t.text}
            </span>
                        <button onClick={() => dispatch(removeTodo(t.id))} style={{ marginLeft: 8 }}>删除</button>
                    </li>
                ))}
            </ul>
        </div>
    );
}
