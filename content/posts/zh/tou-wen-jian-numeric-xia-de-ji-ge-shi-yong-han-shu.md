---
title: "头文件<numeric>下的几个实用函数"
description: "介绍 C++ 头文件 <numeric> 中的累加、内积、相邻差、前缀和与 iota 等实用函数。"
published: "2022-12-03T11:29:00+08:00"
updated: "2023-06-07T23:10:00+08:00"
locale: zh-CN
tags: ["STL"]
draft: false
---

## 累加函数

```cpp
accumulate(first, last, val, op);
```

first 和 last 表示序列（可以是数组、vector、array 等）的首尾指针/迭代器，val 表示操作的初始值，op 表示运算符，进行累加、累减、累乘还是累除

```cpp
#include<bits/stdc++.h>
using namespace std;
int a[13] = {1, 1, 4, 5, 1, 4, 1, 9, 1, 9, 8, 1, 0};
int main(){
	cout << accumulate(a, a + 13, 0) << endl;
	cout << accumulate(a, a + 13, 1) << endl;
	cout << accumulate(a, a + 13, 0, minus<int>()) << endl;
	cout << accumulate(a, a + 12, 1, multiplies<int>()) << endl;
	cout << accumulate(a, a + 12, 51840, divides<int>()) << endl;
	return 0;
}
```

以上代码的运行结果如下

```
45
46
-45
51840
1
```

进行累除操作时注意确认容器内的值，比如

```cpp
#include<bits/stdc++.h>
using namespace std;
vector<int> a = {1, 9, 1, 9, 8, 1, 0};
int main(){
	cout << accumulate(a.begin(), a.end(), 114514, divides<int>());
	return 0;
}
```

以上代码的运行结果为

```
Runtime Error
```

## 差分，但不止差分

```cpp
adjacent_difference(first, last, first2, op);
```

求序列的每一位与前一位的和/差/积/商，定义首元素与前一位的和/差/积/商为其本身

first 和 last 表示序列（可以是数组、vector、array 等）的首尾指针/迭代器，first2 表示目标序列（同上）的首位指针/迭代器，op表示运算符，默认计算差

```cpp
#include<bits/stdc++.h>
using namespace std;
vector<int> a = {1, 1, 4, 5, 1, 4, 1, 9, 1, 9, 8, 1, 0}, res(13);
int main(){
	adjacent_difference(a.begin(), a.end(), res.begin());
	for(int i = 0; i < 13; i++){
		cout << res[i] << " ";
	} cout << endl;
	adjacent_difference(a.begin(), a.end(), res.begin(), plus<int>());
	for(int i = 0; i < 13; i++){
		cout << res[i] << " ";
	} cout << endl;
	adjacent_difference(a.begin(), a.end(), res.begin(), multiplies<int>());
	for(int i = 0; i < 13; i++){
		cout << res[i] << " ";
	} cout << endl;
	adjacent_difference(a.begin(), a.end(), res.begin(), divides<int>());
	for(int i = 0; i < 13; i++){
		cout << res[i] << " ";
	} cout << endl;
	return 0;
}
```

以上代码的运行结果如下

```
1 0 3 1 -4 3 -3 8 -8 8 -1 -7 -1
1 2 5 9 6 5 5 10 10 10 17 9 1
1 1 4 20 5 4 4 9 9 9 72 8 0
1 1 4 1 0 4 0 9 0 9 0 0 0
```

同样地，进行除法操作时注意确认容器内的值，比如

```cpp
#include<bits/stdc++.h>
using namespace std;
vector<int> a = {1, 9, 1, 9, 8, 1, 0, 1, 1, 4, 5, 1, 4}, res(13);
int main(){
	adjacent_difference(a.begin(), a.end(), res.begin(), divides<int>());
	return 0;
}
```

以上代码的运行结果为

```
Runtime Error
```

## 前缀和

```cpp
partial_sum(first, last, first2);
```

first 和 last 表示序列（可以是数组、vector、array 等）的首尾指针/迭代器，first2 表示目标序列（同上）的首位指针/迭代器

```cpp
#include<bits/stdc++.h>
using namespace std;
vector<int> a = {1, 1, 4, 5, 1, 4, 1, 9, 1, 9, 8, 1, 0}, res(13);
int main(){
	partial_sum(a.begin(), a.end(), res.begin());
	for(int i = 0; i < 13; i++){
		cout << res[i] << ' ';
	} cout << endl;
	return 0;
}
```

以上代码的运行结果如下

```
1 2 6 11 12 16 17 26 27 36 44 45 45
```

## 递增赋值

```cpp
iota(first, last, val);
```

给一个序列（可以是数组、vector、array 等）范围为 \[first, last) 的元素赋值，其中第一个元素赋为val，以后的元素递增1

```cpp
#include<bits/stdc++.h>
using namespace std;
int a[50];
int main(){
	iota(a + 11, a + 45, 14);
	for(int i = 0; i < 50; i++){
		cout << a[i] << ' ';
	} cout << endl;
	return 0;
}
```

以上代码的运行结果如下

```
0 0 0 0 0 0 0 0 0 0 0 14 15 16 17 18 19 20 21 22 23 24 25 26 27 28 29 30 31 32 33 34 35 36 37 38 39 40 41 42 43 44 45 46 47 0 0 0 0 0
```

用变量作为参数进行此操作时，注意应保证 left \<= right.以下是反例

```cpp
#include<bits/stdc++.h>
using namespace std;
int a[114514];
int main(){
	iota(a + 1919, a + 81, 0);
	return 0;
}
```

运行此代码，可以随机获得RE或TLE

## 向量的内积

```cpp
inner_product(first, last, first2, val);
```

计算两个向量（可以用数组、vector、array 等存储）的内积加上 val 的值

first 和 last 表示第一个向量的首尾指针/迭代器，first2 表示第二个向量的首位指针/迭代器

```cpp
#include<bits/stdc++.h>
using namespace std;
int a[10] = {1, 1, 4, 5, 1, 4};
int b[10] = {1, 8, 1, 9, 8, 1, 0};
int main(){
	cout << inner_product(a, a + 6, b, 0);
	return 0;
}
```

以上代码的运行结果如下

```
70
```

## C++17新增功能

```cpp
gcd(x, y);
```

字面意思

```cpp
lcm(x, y);
```

字面意思

```cpp
midpoint(x, y);
```

返回 (x + y) / 2 的值（好像有点多此一举？）
