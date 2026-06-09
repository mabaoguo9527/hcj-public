import { configureStore } from '@reduxjs/toolkit';
import counterReducer from '../features/counter/counterSlice';
import todosReducer from '../features/todos/todosSlice';

export const store = configureStore({
    reducer: {
        counter: counterReducer,  // state.counter
        todos: todosReducer,      // state.todos
    },
});
