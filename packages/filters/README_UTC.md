---
title: 日期、时间字段与时区
---

### 概述

日期和时间类型的字段，在数据库中保存的都是UTC时间。其中日期类型字段对应的是00:00:00。

查询日期时间类型字段时，必须先把时间转换为UTC时间格式再执行查询。

例如想要查询 创建日期为北京时间下午13:00以前的文档，需要先将北京时间转换为GMT时间再执行查询。
```js
[["created","<=","2019-08-06T07:00:00Z"]]
```

以下各组方式是等效的，它们都是用utc格式定义时间值：
- [["created","<=",new Date("2019-05-25T06:44:44.000Z")]]
- [["created","<=","2019-05-25T06:44:44.000Z"]]
- [["created","<=",new Date("2019-05-25T06:44:44Z")]]
- [["created","<=","2019-05-25T06:44:44Z"]]

以本地时间为中国北京时间为例，以上utc方式等效于：
- [["created","<=",new Date("2019-05-25 14:44:44")]]
- [["created","<=","2019-05-25 14:44:44"]]

以上utc格式及本地时间格式都将转换为OData Query：`(created le 2019-05-25T06:44:44Z)`

> 虽然支持本地时间格式搜索，但是对最终用户统一建议使用utc时间格式

> between操作符中的日期、时间字段规则同上

### 日期字段
用户想搜索北京时间2019-08-07的数据，应该使用`[["signed_date","between",["2019-08-06T16:00:00Z","2019-08-07T15:59:59Z"]]`
OData请求会是：`((signed_date ge 2019-08-06T16:00:00Z) and (signed_date le 2019-08-07T15:59:59Z))`

> 注意与@steedos/filters包不一样，Creator中过滤器日期控件搜索条件定为搜索2019-08-07数据时，OData请求是`((signed_date ge 2019-08-07T00:00:00Z) and (signed_date le 2019-08-07T23:59:59Z))`，这是因为Creator中对日期字段做了特别识别处理，直接用了utc的当天的时间范围，但是不影响功能。

> 基于@steedos/filters包中日期字段上述规则，要求数据库中日期字段是存储为当天utc的0点，见： https://github.com/steedos/creator/issues/1271

### 时间字段：
用户想搜索北京时间2019-08-07 13:00:00前的数据，应用使用`[["created","<=",[["created","<=","2019-08-07T05:00:00Z"]]]]`
OData请求会是：`(signed_date ge 2019-08-07T05:00:00Z)`

> Creator中时间字段与@steedos/filters包是一样的

### 内置时间范围：
用户想搜索北京时间今年的数据，应该使用`[["created","between","this_year"]]`
Creator中前端使用，会自动转换为`[["signed_date","between",["2018-12-31T16:00:00Z","2019-12-31T15:59:59Z"]]`，
其OData请求会是：`((created ge 2018-12-31T16:00:00Z) and (created le 2019-12-31T15:59:59Z))`；
后台使用，默认自动转换为`[["signed_date","between",["2019-01-01T00:00:00Z","2019-12-31T23:59:59Z"]]`，
其OData请求会是：`((signed_date ge 2019-01-01T00:00:00Z) and (signed_date le 2019-12-31T23:59:59Z))`；

> 后台可以配置utcOffset值来改变默认行为，比如设置为utcOffset等于8，则与上述Creator中前端效果是一样的，会自动减去8小时。

> 注意与@steedos/filters包不一样，Creator中过滤器中选择今年范围时，OData请求是`((signed_date ge 2019-01-01T00:00:00Z) and (signed_date le 2019-12-31T23:59:59Z))`，这是因为Creator中今年这样的范围是以日期字段处理的，做了特别处理，直接用了utc的当年的时间范围，但是不影响功能。

### yml格式
注意yml格式文件中日期、时间字段加引号与不加引号是有区别的：
- 不加引号的话，是定义Date对象，且2019-05-25T06:44:44.000Z、2019-05-25 06:44:44都是utc格式，不支持本地时间写法
- 加引号的话，是定义string，且'2019-05-25T06:44:44.000Z'、'2019-05-25 06:44:44'是有区别的，前者会被识别为utc，后者会被识别为本地时间

以下是定义`created <= 2019-05-25T06:44:44Z`的yml格式写法，它们是等效的：
```
filters:
  - 
    - 
      - created
      - '<='
      - 2019-05-25T06:44:44Z
```
==
```
filters:
  - 
    - 
      - created
      - '<='
      - '2019-05-25T06:44:44Z'
```
==

```
filters:
  - 
    - 
      - created
      - '<='
      - 2019-05-25 06:44:44
```
==

```
filters:
  - 
    - 
      - created
      - '<='
      - '2019-05-25 14:44:44'
```


### 数据库中存储值
以上日期、时间字段与时区规则只适用于数据库中值存储的是date对象，不支持数据库中直接存储为字符串的方式，以mongodb为例：
- 支持`ISODate("2009-05-17T16:00:00.000Z")`这种存储方式，不支持存储为`"2009-05-17T16:00:00.000Z"`的时间字段比较
- 如果存储为字符串的话，比较时会存在时区偏差现象