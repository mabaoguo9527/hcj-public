/*
  Demo函数会在Person类定义时执行
  参数说明：
    ○ target参数是被装饰的类，即：Person
*/
function Demo(target: Function) {
    console.log(target)
}

// 使用装饰器
@Demo
class Person { }