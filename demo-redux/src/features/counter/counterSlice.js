import { createSlice } from '@reduxjs/toolkit';

const counterSlice = createSlice({
    name: 'counter',
    initialState: {
        value: 0,
    },
    reducers: {
        increment: (state) => {
            state.value += 1;          // 看似在改 state，其实 RTK 内部用 Immer 生成新对象
        },
        decrement: (state) => {
            state.value -= 1;
        },
        incrementByAmount: (state, action) => {
            state.value += action.payload;  // payload 就是传进来的参数
        },
    },
});

// 自动生成的 action creators
export const { increment, decrement, incrementByAmount } = counterSlice.actions;

// 默认导出 reducer
export default counterSlice.reducer;
