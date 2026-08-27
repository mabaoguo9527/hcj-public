import Counter from './features/counter/Counter';
import TodoList from './features/todos/TodoList';

export default function App() {
  return (
      <div style={{ maxWidth: 600, margin: '40px auto', fontFamily: 'sans-serif' }}>
        <h1>Redux 学习 Demo</h1>
        <Counter />
        <TodoList />
      </div>
  );
}
