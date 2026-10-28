---
title: "常数优化1"
description: "介绍 union、数组模拟容器、条件判断等能显著提升代码运行速度的 C++ 常数优化方法。"
published: "2022-12-03T11:32:38+08:00"
updated: "2022-12-03T11:33:00+08:00"
locale: zh-CN
tags: ["常数优化"]
draft: false
---

本文介绍的常数优化方法能使代码加速到原来的一半甚至更快

## 使用union类

#### 定义

union是一种特殊的类，定义方法如下（定义在main内或main外都可以）

```cpp
union Union{
	int a;
	double b;
	char c;
};
Union u;
```

#### 互斥的特性

union的所有成员存储在同一个地址上，因此在任意时刻，union中只能有一个成员有值，例如以下代码就是错误的

```cpp
U.a = 27;
U.b = 6.7;
cout << U.a;
return 0;
```

正是由于此特性，union不仅节约空间，而且使得变量更容易被存储到高速缓存中，从而起到常数优化作用

#### 在union中加入对象

可以在union中加入对象，例如

```cpp
class Class{
	int a;
};
union Union{
	Class test;
	int n;
};
```

以上代码如果要通过union修改a的值，需要将a定义为public，如下

```cpp
#include<bits/stdc++.h>
using namespace std;
class Class{
public:
	int a;
};
union Union{
	Class test;
	int n;
};
Union u;
int main(){
    u.test.a = 114;
    cout << u.test.a;
    return 0;
}
```

以上代码可以正常运行，如果将第4行的public改为private或protected，则不能编译

## 一个循环分多路执行

以下两段代码

```cpp
int sum = 0;
for(int i = 1; i <= n; i++){
	sum += a[i];
}
```

和

```cpp
int sum1 = 0, sum2 = 0, sum3 = 0, sum4 = 0;
for(int i = 1; i <= n; i += 4){
	sum1 += a[i];
	sum2 += a[i + 1];
	sum3 += a[i + 2];
	sum4 += a[i + 3];
}
```

前者运行时间大约是后者的两倍

## 位运算小技巧

这部分引自《论程序底层优化的一些方法和技巧》

#### 无分支地求绝对值

```cpp
int abs(int x){
	int y = (x >> 31);
	return (x + y) ^ y;
}
```

#### 无分支地求最大值

```cpp
int max(int x, int y){
	int m = (x - y) >> 31;
	return y & m | x & (~m);
}
```

#### 不使用除法求平均数

```cpp
int average(int x, int y){
	return (x & y) + ((x ^ y) >> 1);
}
```

#### 不使用中间变量交换两个数（节约空间）

```cpp
void swap(int &x, int &y){
	x ^= y;
	y ^= x;
	x ^= y;
}
```

#### 使原来为a的x变为b

```cpp
	x ^= a ^ b;
```

## 高维数组寻址非常慢

举个例子，与其写

```cpp
if(a[i][j][k][l] > a[i][j][k - 1][l] + a[i][j][k][l - 1]){
	a[i][j][k][l] += a[i][j][k - 1][l] + a[i][j][k][l - 1];
}
```

不如写成

```cpp
int &p = a[i][j][k][l], tmp = a[i][j][k - 1][l] + a[i][j][k][l - 1];
if(p > tmp){
	p += tmp;
}
```

这样优化的效果在dp中尤其明显

另外，某一维很小，如

```cpp
dp[10000000][2]
```

则应当定义为大小为10000000的结构体或两个数组，如下

```cpp
struct DP{
	int a, b;
}dp[10000000];
//or
dp0[10000000], dp1[10000000];
```

而在这两种写法中，又推荐使用结构体

## 高维数组尽量按内存连续访问

不能避免使用高维数组时，应注意这一点

以下两段代码

```cpp
int a[10000][10000], sum = 0;
for(int i = 0; i < 10000; i++){
	for(int j = 0; j < 10000; j++){
		sum += a[i][j];
	}
}
```

和

```cpp
int a[10000][10000], sum = 0;
for(int i = 0; i < 10000; i++){
	for(int j = 0; j < 10000; j++){
		sum += a[j][i];
	}
}
```

后者运行时间大约是前者的3倍，如果数组的大小是2的整数次幂，后者运行时间会达到前者的10倍以上

## 避免将多维数组某一位的大小定义为2的幂

根据《论程序底层优化的一些方法和技巧》中的测试，遍历一个2048 \* 2048的数组比遍历一个2049 \* 2049的数组慢大约4倍，所以，请不要将多维数组某一维的大小定义为2的幂，尽量将多维数组的每一维大小都定义为奇数。

ps.尤其是开状压dp数组，记得大小+1
