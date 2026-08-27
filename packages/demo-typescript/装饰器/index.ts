// console.log('hello world')
//
// function Demo(target: Function) {
//     console.log(target)
// }
//
// @Demo
// class Person {
//   name: string;
//   age: number;
//
//   constructor(name: string, age: number) {
//     this.name = name;
//     this.age = age;
//   }
// }
//



//--------------------------------------------------------------------------------------------------------



// // 使用装饰器重写toString方法 + 封闭其原型对象
// function CustomString(target: Function) {
//     // 向被装饰类的原型上添加自定义的 toString 方法
//     target.prototype.toString = function () {
//         return JSON.stringify(this)
//     }
//     // 封闭其原型对象，禁止随意操作其原型对象
//     Object.seal(target.prototype)
// }
//
// // 使用 CustomString 装饰器
// @CustomString
// class Person {
//     constructor(public name: string, public age: number) { }
//     speak() {
//         console.log('你好呀！')
//     }
// }
//
// /* 测试代码如下 */
// let p1 = new Person('张三', 18)
// // 输出：{"name":"张三","age":18}
// console.log(p1.toString())
//
// // Person.prototype.a = 100 // 此行会报错：Cannot add property a, object is not extensible
// // console.log(p1.a)

//--------------------------------------------------------------------------------------------------------

// // 定义一个构造类型，且包含一个静态属性 wife
// type Constructor = {
//     new(...args: any[]): {}; // 构造签名
//     wife: string; // wife属性
// };
//
// function test(fn:Constructor){}
// class Person {
//     static wife = 'asd'
// }
// test(Person)


//--------------------------------------------------------------------------------------------------------

//
// interface Person {
//     introduce: () => void
// }
//
// // 定义一个装饰器工厂 LogInfo，它接受一个参数 n，返回一个类装饰器
// function LogInfo(n:number) {
//     // 装饰器函数，target 是被装饰的类
//     return function(target: Function){
//         target.prototype.introduce = function () {
//             for (let i = 0; i < n; i++) {
//                 console.log(`我的名字：${this.name}，我的年龄：${this.age}`)
//             }
//         }
//     }
// }
//
// @LogInfo(5)
// class Person {
//     constructor(
//         public name: string,
//         public age: number
//     ) { }
//     speak() {
//         console.log('你好呀！')
//     }
// }
//
// let p1 = new Person('张三', 18)
// // console.log(p1) // 打印的p1是：_classThis，转换的JS版本比较旧时，会出现，不必纠结
// p1.speak()
// p1.introduce()

//--------------------------------------------------------------------------------------------------------


// /*
//   参数说明：
//     ○ target: 对于静态属性来说值是类，对于实例属性来说值是类的原型对象。
//     ○ propertyKey: 属性名。
// */
// function Demo(target: object, propertyKey: string) {
//     console.log(target,propertyKey)
// }
//
// class Person {
//     @Demo name: string
//     @Demo age: number
//     @Demo static school:string
//
//     constructor(name: string, age: number) {
//         this.name = name
//         this.age = age
//     }
// }
//
// const p1 = new Person('张三', 18)


//--------------------------------------------------------------------------------------------------------





// 声明一个装饰器函数 State，用于捕获数据的修改
function State(target: object, propertyKey: string) {
    // 存储属性的内部值
    let key = `__${propertyKey}`;

    // 使用 Object.defineProperty 替换类的原始属性
    // 重新定义属性，使其使用自定义的 getter 和 setter
    Object.defineProperty(target, propertyKey, {
        get () {
            return this[key]
        },
        set(newVal: string){
            console.log(`${propertyKey}的最新值为：${newVal}`);
            this[key] = newVal
        },
        enumerable: true,
        configurable: true,
    });
}

class Person {
    name: string;
    //使用State装饰器
    @State age: number;
    school = 'atguigu';
    constructor(name: string, age: number) {
        this.name = name;
        this.age = age;
    }
}

const p1 = new Person('张三', 18);
const p2 = new Person('李四', 30);

p1.age = 80
p2.age = 90

console.log('------------------')
console.log(p1.age) //80
console.log(p2.age) //90


















