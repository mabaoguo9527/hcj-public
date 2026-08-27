import { INCREMENT, DECREMENT, INCREMENT_BY } from '../actionTypes';

export const increment = () => ({ type: INCREMENT });
export const decrement = () => ({ type: DECREMENT });
export const incrementBy = (amount) => ({
    type: INCREMENT_BY,
    payload: amount,
});

// 异步 action(thunk):2 秒后自增
export const incrementAsync = () => (dispatch) => {
    setTimeout(() => {
        dispatch(increment());
    }, 2000);
};
