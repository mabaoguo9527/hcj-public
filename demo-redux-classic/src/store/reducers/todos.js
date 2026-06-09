import { ADD_TODO, TOGGLE_TODO, REMOVE_TODO } from '../actionTypes';

const initialState = { list: [] };

export default function todosReducer(state = initialState, action) {
    switch (action.type) {
        case ADD_TODO:
            return { ...state, list: [...state.list, action.payload] };
        case TOGGLE_TODO:
            return {
                ...state,
                list: state.list.map((t) =>
                    t.id === action.payload ? { ...t, done: !t.done } : t
                ),
            };
        case REMOVE_TODO:
            return {
                ...state,
                list: state.list.filter((t) => t.id !== action.payload),
            };
        default:
            return state;
    }
}
