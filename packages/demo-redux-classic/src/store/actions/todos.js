import { ADD_TODO, TOGGLE_TODO, REMOVE_TODO } from '../actionTypes';

let nextId = 1;

export const addTodo = (text) => ({
    type: ADD_TODO,
    payload: { id: nextId++, text, done: false },
});

export const toggleTodo = (id) => ({
    type: TOGGLE_TODO,
    payload: id,
});

export const removeTodo = (id) => ({
    type: REMOVE_TODO,
    payload: id,
});
