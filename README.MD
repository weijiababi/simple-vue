1.为什么 this.xxx 可以访问属性
使用了 Object.defineProperty 将各个数据绑定到 vue 实例上

2.总结一下数据的响应式
本质还是使用了 Object.defineProperty 定义了数据的 get 跟 set
把 data 中的数据理解为被监听数据，在定义此类数据的 get 方法时，
判断当前是否有监听器 watcher 存在，有的话则 attach 到此数据下的 dep 内，
这样当该监听数据（data）发生变化时，就可以通过遍历 dep 内的 watcher 列表，
通知各个 watcher 即将更新，或是触发页面 render。

3.computed 是如何做到依赖缓存的
computed 本质上就是一个 watcher,监听着 data 中所依赖的数据的变化;
实际上内部使用了一个 option 参数=>lazy,以及使用了一个缓存参数 value 和一个状态参数 dirty,
初始化时判断 lazy 就不进行取值（调用 get）；
而当其他位置调用了该 computed 数据（调用 get），那么此时会先判断 dirty 是否为 true，若为 true 则进行更新取值，随后设 dirty 为 false,否则直接返回 value；
另外当 computed 的依赖（data）发生变化时，也会通知 computed 更新 dirty 为 true，直到下次引用到该 computed 时，才会更新 value 及 dirty；

4.为什么要用栈来存储 Dep 的 target
组件在渲染时，会实例化一个 watcher,传入的 cb 就是组件的渲染方法 render，当 render 调用时，若引用到
data 中的值，此时就会将自身 watcher 传入 target，即为绑定数据的依赖监听，而调用到 computed 时，若
不用栈而是直接修改 Dep.target,那么在 computed 取值完成后，剩下的 render 方法就无法再继续绑定数据监听了。

5.关于 patchNode 中使用的 diff 算法
可以理解为 node 节点树的同级比对，根本点在向下递归至 text 节点后，比对 text 值替换页面

patchNode 传参为新旧两个 VNode 1.传入后，先判断新的 VNode 是否为文本类型，若是则取值，并与旧 VNode 的 textContent 进行比对，若不相等则为 OldVNode 的 dom 节点修改 textContent; 2.若不为文本类型，则当前新 VNode 应为普通文档节点（div,span）,则需要比对两个新旧 VNode 的 children,有 3 种比对情况:(1).新 VNode 存在 children，旧 VNode 不存在，则可以直接为 VNode.elm(跟旧 VNode.elm 指向同一个 dom 节点)添加新的 children 节点列表;(2)新 VNode 不存在 children，旧 VNode 存在，则清空 VNode.elm 的 children 列表;(3)新旧 VNode 均存在 children，则执行遍历比对。

需要参考https://blog.csdn.net/weixin_44761091/article/details/124141686有完整diff原理
