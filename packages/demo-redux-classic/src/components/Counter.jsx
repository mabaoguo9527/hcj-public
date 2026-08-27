import { useSelector, useDispatch } from 'react-redux';
import {
    increment,
    decrement,
    incrementBy,
    incrementAsync,
} from '../store/actions/counter';

export default function Counter() {
    const value = useSelector((state) => state.counter.value);
    const dispatch = useDispatch();

    return (
        <section style={{ padding: 16, border: '1px solid #ddd', marginBottom: 16 }}>
            <h2>计数器:{value}</h2>
            <button onClick={() => dispatch(increment())}>+1</button>
            <button onClick={() => dispatch(decrement())}>-1</button>
            <button onClick={() => dispatch(incrementBy(5))}>+5</button>
            <button onClick={() => dispatch(incrementAsync())}>2 秒后 +1</button>
        </section>
    );
}
