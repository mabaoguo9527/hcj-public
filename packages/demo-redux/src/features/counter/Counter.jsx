import { useSelector, useDispatch } from 'react-redux';
import { increment, decrement, incrementByAmount } from './counterSlice';

export default function Counter() {
    // 从 store 读 state
    const count = useSelector((state) => state.counter.value);
    // 拿到 dispatch 方法
    const dispatch = useDispatch();

    return (
        <div style={{ padding: 20, border: '1px solid #ddd', borderRadius: 8 }}>
            <h2>计数器：{count}</h2>
            <button onClick={() => dispatch(increment())}>+1</button>
            <button onClick={() => dispatch(decrement())} style={{ marginLeft: 8 }}>-1</button>
            <button onClick={() => dispatch(incrementByAmount(5))} style={{ marginLeft: 8 }}>+5</button>
        </div>
    );
}
