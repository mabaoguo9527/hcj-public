
# 核心概念回顾
概念	在代码里对应
Store	configureStore({...}) 生成的对象
State	state.counter.value、state.todos.list
Action	increment()、addTodo('xxx') 返回的 {type, payload}
Reducer	createSlice 里 reducers 中的每个函数
Dispatch	dispatch(action)，唯一改 state 的方式
Selector	useSelector(state => ...) 读取片段


