// let a: string //变量a只能存储字符串
// let b: number //变量b只能存储数值
// let c: boolean //变量c只能存储布尔值
//
// a = 'hello'
// a = 100 //警告：不能将类型“number”分配给类型“string”
//
// b = 666
// b = '你好'//警告：不能将类型“string”分配给类型“number”
//
// c = true
// c = 666 //警告：不能将类型“number”分配给类型“boolean”
//
// // 参数x必须是数字，参数y也必须是数字，函数返回值也必须是数字
// function demo(x:number,y:number):number{
//     return x + y
// }
//
// demo(100,200)
// demo(100,'200') //警告：类型“string”的参数不能赋给类型“number”的参数
// demo(100,200,300) //警告：应有2个参数，但获得3个
// demo(100) //警告：应有2个参数，但获得1个