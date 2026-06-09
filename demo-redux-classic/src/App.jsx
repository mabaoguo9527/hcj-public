import Counter from './components/Counter';
import TodoList from './components/TodoList';

export default function App() {
  return (
      <main style={{ maxWidth: 560, margin: '40px auto', fontFamily: 'sans-serif' }}>
        <h1>原生 Redux 学习项目</h1>
        <Counter />
        <TodoList />
      </main>
  );
}
