import { createSlice, nanoid } from '@reduxjs/toolkit';

const todosSlice = createSlice({
    name: 'todos',
    initialState: {
        list: [],
    },
    reducers: {
        addTodo: {
            reducer: (state, action) => {
                state.list.push(action.payload);
            },
            // prepare 用来加工 payload，比如自动生成 id
            prepare: (text) => ({
                payload: { id: nanoid(), text, done: false },
            }),
        },
        toggleTodo: (state, action) => {
            const todo = state.list.find((t) => t.id === action.payload);
            if (todo) todo.done = !todo.done;
        },
        removeTodo: (state, action) => {
            state.list = state.list.filter((t) => t.id !== action.payload);
        },
    },
});

export const { addTodo, toggleTodo, removeTodo } = todosSlice.actions;
export default todosSlice.reducer;
