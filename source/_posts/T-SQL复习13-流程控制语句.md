---
title: T-SQL复习13--流程控制语句
tags:
  - SQL Server
  - T-SQL
  - SQL Server
excerpt: |2-

      
        
        
          <ul>
  <li><a href="#beginend">BEGIN…END</a></li>
  <li><a href="#ifelse">IF…ELSE…</a></li>
  <li><a href="#while">WHILE</a></li></ul>
        
      
      
date: 2020-05-23 16:17:00
---

*   [BEGIN…END](#beginend)
*   [IF…ELSE…](#ifelse)
*   [WHILE](#while)
<!-- more -->
- [BEGIN…END](#beginend)
- [IF…ELSE…](#ifelse)
- [WHILE](#while)
  - [在WHILE中使用BREAK、CONTINUE](#在while中使用breakcontinue)
- [GOTO](#goto)
  - [使用GOTO语句实现循环](#使用goto语句实现循环)
- [WAITFOR](#waitfor)

# [](#BEGIN…END "BEGIN…END")BEGIN…END

可以包含多个TSQL语言，一次性执行多个TSQL语言

# [](#IF…ELSE… "IF…ELSE…")IF…ELSE…

当`IF`中的条件满足时，执行`IF`条件后的TSQL语句，若`IF`中的条件不满足，则执行`ELSE`后的TSQL语句

具体语法：

```sql
IF 布尔表达式  
TSQL  
ELSE --ELSE子句可选  
TSQL  
```
**注意：`IF`或`ELSE`条件只能影响一个TSQL语句，若要在`IF`或`ELSE`条件后面执行多个TSQL，则需要用`BEGIN...END`关键字**

示例：

```sql
IF(SELECT AGE FROM dbo.STUDENT WHERE NAME='YOYOYO')>18  
PRINT '已成年'  
ELSE  
PRINT '未成年'  
```
使用嵌套的`IF...ELSE...`，示例：

```sql
DECLARE @age INT  
SELECT @age=AGE FROM dbo.STUDENT WHERE NAME='YOYOYO'  
IF @age>=18  
PRINT '已成年'  
ELSE  
BEGIN  
 IF(@age>=12)  
PRINT '小朋友'  
ELSE  
PRINT '小小朋友'  
END  
```
# [](#WHILE "WHILE")WHILE

设置重复执行SQL语句或语句块的条件，指要指定的条件为真，就重复执行语句。可以使用`BREAK`和`CONTINUE`关键字在循环内部控制`WHILE`循环中语句的执行

示例：

```sql
WHILE (SELECT AGE FROM dbo.STUDENT WHERE NAME='Jame')<18  
BEGIN  
 UPDATE dbo.STUDENT SET AGE=AGE+1 WHERE NAME='Jame'  
END  
SELECT * FROM dbo.STUDENT WHERE NAME='Jame' --查询检查结果  
```
## [](#在WHILE中使用BREAK、CONTINUE "在WHILE中使用BREAK、CONTINUE")在WHILE中使用BREAK、CONTINUE

*   BREAK：退出循环，即推出当前循环，执行出现在END关键字后面的语句
*   CONTINUE：跳出本次循环，进行循环条件判断

示例：

```sql
WHILE (SELECT AGE FROM dbo.STUDENT WHERE NAME='Jame')<30  
BEGIN  
 UPDATE dbo.STUDENT SET AGE=AGE+1 WHERE NAME='Jame'  
IF(SELECT AGE FROM dbo.STUDENT WHERE NAME='Jame')<22  
CONTINUE  
ELSE  
 BREAK  
END  
SELECT * FROM dbo.STUDENT WHERE NAME='Jame'  
```
# [](#GOTO "GOTO")GOTO

将执行流更改到标签处，`GOTO`语句和标签可在过程、批处理或语句块中的任意位置使用

示例：

```sql
-- 使用GOTO语句循环出10到20之间的数字  
DECLARE @N INT  
SET @N=10  
LABEL:  --标签名称要以冒号结束  
IF @N<20  
BEGIN  
 SET @N=@N+1  
PRINT @N  
GOTO LABEL  --GOTO指定跳转的标签名称  
END  
```
## [](#使用GOTO语句实现循环 "使用GOTO语句实现循环")使用GOTO语句实现循环

示例：

```sql
LABEL1:  
IF(SELECT AGE FROM dbo.STUDENT WHERE NAME='Jame')<25  
BEGIN  
 UPDATE dbo.STUDENT SET AGE=AGE+1 WHERE NAME='Jame'  
GOTO LABEL1  
END  
ELSE  
SELECT * FROM dbo.STUDENT WHERE NAME='Jame'  
```
# [](#WAITFOR "WAITFOR")WAITFOR

控制语句执行的时间

示例：

```sql
BEGIN  
WAITFOR TIME '16:52' --在几点开始执行，不能指定日期  
SELECT * FROM dbo.STUDENT  
END  
  
  
BEGIN  
WAITFOR DELAY '00:00:10' --多长时间后开始，最长为24小时，不能指定日期  
SELECT * FROM dbo.STUDENT  
END
```