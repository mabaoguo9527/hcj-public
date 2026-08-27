import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { addTodo, toggleTodo, removeTodo } from '../store/actions/todos';

export default function TodoList() {
    const list = useSelector((state) => state.todos.list);
    const dispatch = useDispatch();
    const [text, setText] = useState('');

    const submit = (e) => {
        e.preventDefault();
        if (!text.trim()) return;
        dispatch(addTodo(text.trim()));
        setText('');
    };

    return (
        <section style={{ padding: 16, border: '1px solid #ddd' }}>
            <h2>待办列表</h2>
            <form onSubmit={submit}>
                <input
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="输入待办,回车添加"
                />
                <button type="submit">添加</button>
            </form>
            <ul>
                {list.map((t) => (
                    <li key={t.id}>
                        <label
                            style={{
                                textDecoration: t.done ? 'line-through' : 'none',
                                cursor: 'pointer',
                            }}
                        >
                            <input
                                type="checkbox"
                                checked={t.done}
                                onChange={() => dispatch(toggleTodo(t.id))}
                            />
                            {t.text}
                        </label>
                        <button onClick={() => dispatch(removeTodo(t.id))}>删除</button>
                    </li>
                ))}
            </ul>
        </section>
    );
}
