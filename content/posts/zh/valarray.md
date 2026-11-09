---
title: "valarray"
description: "介绍 C++ valarray 的初始化、运算、数学函数、切片和常用操作，并附完整代码示例。"
published: "2022-12-03T11:19:00+08:00"
updated: "2022-12-03T11:25:00+08:00"
locale: zh-CN
tags: ["STL"]
draft: false
---

本文所有代码均使用头文件valarray和iostream，并定义print函数如下

```cpp
template <typename T> void print(const valarray<T> &va){
	for(unsigned i = 0; i < va.size(); i++)
		cout << va[i] << ' ';
	cout << endl;
}
```

## 构造函数

#### 默认构造函数

```cpp
valarray();
```

构造一个空的valarray

#### 用单个元素构造

```cpp
valarray(val, n);
```

构造一个大小为n，每个元素都为val的valarray.例子：

```cpp
valarray<int> var(1, 5);
print(var);
```

运行结果

```
1 1 1 1 1
```

#### 用数组等容器构造

```cpp
valarray(first, n);
```

从数组等容器的first开始，向后选取n个元素构造成valarray.例子：

```cpp
valarray<int> var(data, sizeof(data) / sizeof(int));
valarray<int> Var(data + 2, 4);
print(var), print(Var);
```

运行结果

```
2 0 0 6 10 11 13
0 6 10 11
```

注意数组大小，比如这样的代码:

```cpp
int data[7] = {2, 0, 0, 6, 10, 11, 13};
valarray<int> var(data, 8);
```

运行以后可能随机获得一堆乱码或RE

#### 套娃：用valarray构造valarray

可以用一个valarray的全部或部分构造另一个valarray，直接上例子：

```cpp
int data[6] = {2, 10, 11, 12, 13, 28};
valarray<int> var1(data, 6);
valarray<int> var2(var1);
valarray<int> var3(var2[slice(0, 3, 2)]);
print(var2), print(var3);
```

运行结果

```
2 10 11 12 13 28
2 11 13
```

解释一下上面slice的意思. slice在头文件valarray的定义如下

```cpp
slice(first, length, step);
```

三个参数表示起点、大小、跨度，获取从first开始每step步一个共length个下标，并应用（且只能应用）到valarray上

## 析构函数

```cpp
~valarray()
```

调用每个元素的析构函数，复杂度与数值数组的大小成线性。

定义在局部的valarray在消亡时会自动调用析构函数，注意时间复杂度。

## operator运算符

valarray重载了除了++和--以外的所有常见运算符，运算规则为对其中的数逐个执行运算符的操作.随便举个例子：

```cpp
int data[5] = {1, 2, 3, 4, 5};		//  var1        var2
valarray<int> var1(data, 5);
valarray<int> var2(1, 5);		//  1 2 3 4 5   1 1 1 1 1
var2 += var1;				//  1 2 3 4 5   2 3 4 5 6
var2 -= 1;				//  1 2 3 4 5   1 2 3 4 5
var1 -= var2;				//  0 0 0 0 0   1 2 3 4 5
var1 *= 123456789;			//  0 0 0 0 0   1 2 3 4 5
var2 *= var1;				//  0 0 0 0 0   0 0 0 0 0
valarray<bool> cmp = var1 == var2;
if(cmp.min() == 1) cout << "equal";	//  output:equal
var1 = 1;				//  1 1 1 1 1   0 0 0 0 0
```

对两个valarray执行运算操作时，若长度不相等，则执行到较短者的末位为止，比如将上面代码的第2行改成

```cpp
valarray<int> var1(data, 4);
```

仍然会输出

```
equal
```

注：注意两个valarray进行==运算时返回的是一个长度等于两个valarray中的较短者的长度，类型为bool的valarray.

## 应用函数

```cpp
valarray.apply(func);
```

将函数func应用到valarray中的每一个成员.例子：

```cpp
int div(int x){return x / 10;};
int main(){
	valarray<int> var = {10, 20, 30, 40, 50};
	valarray<int> var2 = var.apply(div);
	print(var2);
	return 0;
}
```

运行结果

```
1 2 3 4 5
```

## 数学函数

```cpp
valarray.max();
valarray.min();
valarray.sum();
```

字面意思，无需解释

求最小值函数在比较两个valarray是否相等时用到，见上面 operator运算符 一节

## 移动函数

#### 循环移动

```cpp
valarray.cshift(count);
```

将valarray向左循环移动count个位置，如果count为负数，则向右循环移动|count|个位置.例子：

```cpp
valarray<int> var = {1, 2, 3, 4, 5, 6, 7, 8, 9};
var = var.cshift(2);
print(var);
```

运行结果

```
3 4 5 6 7 8 9 1 2
```

#### 位置偏移

```cpp
valarray.shift(count);
```

将valarray向左循环移动count个位置，如果count为负数，则向右循环移动|count|个位置.例子：

```cpp
valarray<int> var = {1, 2, 3, 4, 5, 6, 7, 8, 9};
var = var.shift(2);
print(var);
```

运行结果

```
3 4 5 6 7 8 9 0 0
```

#### tip

cshift和shift函数对参数的值没有特殊要求.对于cshift函数，如果参数的绝对值大于valarray的长度，则执行结果相当于参数为count % len的执行结果；对于shift函数，如果参数的绝对值大于valarray的长度，则valarray的值全为0

## 尺寸函数

#### 获取大小

```cpp
valarray.size();
```

返回元素个数

#### 更改大小

```cpp
valarray.resize(count);
```

将valarray的大小重设为count，并将其中的元素全部更改为0.例子：

```cpp
valarray<int> var = {1, 2, 3, 4, 5, 6, 7, 8, 9};
var.resize(5);
print(var);
```

运行结果

```
0 0 0 0 0
```

## 交互函数

```cpp
valarray1.swap(valarray2)
```

交换两个valarray.虽然下面的

```cpp
swap(valarray1, valarray2);
```

也可以实现此功能，但是执行速度不如前者
