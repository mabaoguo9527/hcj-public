// PersonInterface接口，用与限制Person类的格式
interface PersonInterface {
    name: string
    age: number
    speak(n: number): void
}
//定义一个类Person，实现PersonInterface接口
class Person implements PersonInterface {
    constructor(
        public name: string,
        public age: number
    ) { }
    //实现接口中的speak 方法
    speak(n: number): void {
        for (let i = 0; i < n; i++) {
            //打印出包含名字和年龄的问候语句
            console.log(`你好，我叫${this.name}，我的年龄是${this.age}`);
        }
    }
}

//创建一个Person类的实例p1，传入名字'tom'和年龄18
const p1 = new Person('tom', 18);
p1.speak(3)
