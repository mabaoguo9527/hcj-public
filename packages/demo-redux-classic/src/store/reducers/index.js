import { combineReducers } from 'redux';
import counter from './counter';
import todos from './todos';

const rootReducer = combineReducers({
    counter, // 对应 state.counter
    todos,   // 对应 state.todos
});

export default rootReducer;
