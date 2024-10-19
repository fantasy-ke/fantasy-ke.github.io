---
title: T-SQL复习11--存储过程
tags:
  - SQL Server
  - T-SQL
  - SQL Server
excerpt: >2-

      
        
        
          <ul>
  <li><a href="#%e8%a7%a3%e6%9e%90">解析</a></li>

  <li><a
  href="#%e5%ad%98%e5%82%a8%e8%bf%87%e7%a8%8b%e7%9a%84%e7%b1%bb%e5%9e%8b">存储过程的类型</a
        
      
      
date: 2020-05-22 17:51:00
---

*   [解析](#%e8%a7%a3%e6%9e%90)
*   [存储过程的类型](#%e5%ad%98%e5%82%a8%e8%bf%87%e7%a8%8b%e7%9a%84%e7%b1%bb%e5%9e%8b)
<!-- more -->
*   [解析](#%e8%a7%a3%e6%9e%90)
*   [存储过程的类型](#%e5%ad%98%e5%82%a8%e8%bf%87%e7%a8%8b%e7%9a%84%e7%b1%bb%e5%9e%8b)
*   [简单的存储过程](#%e7%ae%80%e5%8d%95%e7%9a%84%e5%ad%98%e5%82%a8%e8%bf%87%e7%a8%8b)
    *   [创建](#%e5%88%9b%e5%bb%ba)
    *   [执行](#%e6%89%a7%e8%a1%8c)
    *   [修改](#%e4%bf%ae%e6%94%b9)
    *   [删除](#%e5%88%a0%e9%99%a4)
*   [执行多步操作的存储过程](#%e6%89%a7%e8%a1%8c%e5%a4%9a%e6%ad%a5%e6%93%8d%e4%bd%9c%e7%9a%84%e5%ad%98%e5%82%a8%e8%bf%87%e7%a8%8b)
*   [带输入参数的存储过程](#%e5%b8%a6%e8%be%93%e5%85%a5%e5%8f%82%e6%95%b0%e7%9a%84%e5%ad%98%e5%82%a8%e8%bf%87%e7%a8%8b)
    *   [概念](#%e6%a6%82%e5%bf%b5)
    *   [创建](#%e5%88%9b%e5%bb%ba-1)
    *   [执行](#%e6%89%a7%e8%a1%8c-1)
*   [带通配符的存储过程](#%e5%b8%a6%e9%80%9a%e9%85%8d%e7%ac%a6%e7%9a%84%e5%ad%98%e5%82%a8%e8%bf%87%e7%a8%8b)
    *   [创建](#%e5%88%9b%e5%bb%ba-2)
    *   [执行](#%e6%89%a7%e8%a1%8c-2)
*   [带输出参数的存储过程](#%e5%b8%a6%e8%be%93%e5%87%ba%e5%8f%82%e6%95%b0%e7%9a%84%e5%ad%98%e5%82%a8%e8%bf%87%e7%a8%8b)
    *   [创建](#%e5%88%9b%e5%bb%ba-3)
    *   [执行](#%e6%89%a7%e8%a1%8c-3)
*   [带表值参数的存储过程](#%e5%b8%a6%e8%a1%a8%e5%80%bc%e5%8f%82%e6%95%b0%e7%9a%84%e5%ad%98%e5%82%a8%e8%bf%87%e7%a8%8b)
    *   [创建](#%e5%88%9b%e5%bb%ba-4)
    *   [执行](#%e6%89%a7%e8%a1%8c-4)
*   [带变量的存储过程](#%e5%b8%a6%e5%8f%98%e9%87%8f%e7%9a%84%e5%ad%98%e5%82%a8%e8%bf%87%e7%a8%8b)
    *   [概念](#%e6%a6%82%e5%bf%b5-1)
    *   [创建](#%e5%88%9b%e5%bb%ba-5)
    *   [执行](#%e6%89%a7%e8%a1%8c-5)
*   [可捕获异常的存储过程](#%e5%8f%af%e6%8d%95%e8%8e%b7%e5%bc%82%e5%b8%b8%e7%9a%84%e5%ad%98%e5%82%a8%e8%bf%87%e7%a8%8b)
    *   [概念](#%e6%a6%82%e5%bf%b5-2)
    *   [创建](#%e5%88%9b%e5%bb%ba-6)
    *   [执行](#%e6%89%a7%e8%a1%8c-6)
*   [对存储过程加密及重新编译](#%e5%af%b9%e5%ad%98%e5%82%a8%e8%bf%87%e7%a8%8b%e5%8a%a0%e5%af%86%e5%8f%8a%e9%87%8d%e6%96%b0%e7%bc%96%e8%af%91)
    *   [概念](#%e6%a6%82%e5%bf%b5-3)
    *   [创建](#%e5%88%9b%e5%bb%ba-7)
*   [存储过程的优化](#%e5%ad%98%e5%82%a8%e8%bf%87%e7%a8%8b%e7%9a%84%e4%bc%98%e5%8c%96)

# [](#解析 "解析")解析

存储过程是由一个或多个`Transact-SQL`语句构成的一个组

存储过程可以：

*   接受输入参数并以输出参数的格式向调用程序返回多个值
*   包含用于在数据库中执行操作的编程语句，这包括调用其他存储过程
*   向调用程序返回状态值，以值明成功或失败(以及失败的原因)

使用存储过程的好处：

*   减少了服务器/客户端网络流量
*   更强的安全性
*   代码的重复使用
*   更容易维护
*   改进的性能

# [](#存储过程的类型 "存储过程的类型")存储过程的类型

*   用户定义的存储过程：由用户自己创建的存储过程
*   临时存储过程：也是由用户创建的存储过程，存储在`tempdb`中，名字以`#`开头，仅在创建该过程的会话中存在，会话结束，临时存储过程即被删除(类似临时表)
*   系统存储过程：系统存储过程是由SQL Server附带的，系统过程以`sp_`开头，帮助用户使用、管理数据库

# [](#简单的存储过程 "简单的存储过程")简单的存储过程

## [](#创建 "创建")创建

示例：

```sql
USE SCHOOL  
GO  
IF OBJECT_ID('P_STUDENT') IS NOT NULL  
DROP PROCEDURE P_STUDENT  
GO  
CREATE PROCEDURE P_STUDENT  
AS  
BEGIN  
 SELECT NAME,AGE FROM dbo.STUDENT  
END  
GO  
```
## [](#执行 "执行")执行

示例：

```sql
EXEC dbo.P_STUDENT  --EXEC是EXECUTE的简写  
EXECUTE dbo.P_STUDENT  
```
## [](#修改 "修改")修改

示例：

```sql
ALTER PROCEDURE P_STUDENT  
AS  
BEGIN  
 SELECT NAME,AGE,SEX FROM dbo.STUDENT WHERE AGE>13  
END  
```
## [](#删除 "删除")删除

示例：

```sql
DROP PROCEDURE dbo.P_STUDENT  
```
# [](#执行多步操作的存储过程 "执行多步操作的存储过程")执行多步操作的存储过程

示例：

```sql
USE SCHOOL  
GO  
IF OBJECT_ID('P_COURSE02') IS NOT NULL  
DROP PROCEDURE P_COURSE02  
GO  
CREATE PROCEDURE P_COURSE02  
AS  
BEGIN  
 INSERT INTO COURSE01 SELECT * FROM dbo.COURSE  
UPDATE COURSE01 SET NAME='高数' WHERE NAME='.NET CORE'  
DELETE FROM dbo.COURSE01 WHERE NAME='JAVA'  
SELECT * FROM dbo.COURSE01  
END  
GO  
```
# [](#带输入参数的存储过程 "带输入参数的存储过程")带输入参数的存储过程

## [](#概念 "概念")概念

*   输入参数：调用方将数据值传递给存储过程
*   输出参数：存储过程将数据值返回给调用方
*   变量：可以在存储过程内部存储和传递数据值，不能将数据从外部传递到存储过程内部

## [](#创建-1 "创建")创建

示例：

```sql
USE SCHOOL  
GO  
IF OBJECT_ID('P_STUDENT') IS NOT NULL  
DROP PROCEDURE P_STUDENT  
GO  
CREATE PROCEDURE P_STUDENT  
@sex CHAR(2),   --注意：定义参数位置在存储过程名称粥，参数要以@符号开始  
@age INT = 18   --这里是将age参数的默认值设定为18，当参数由默认值的时候，调用方如果没传该参数的值过来，则使用默认值进行执行  
AS  
BEGIN  
 SELECT ID,NAME,AGE,SEX FROM dbo.STUDENT WHERE SEX=@sex AND AGE>@age   
END  
GO  
```
## [](#执行-1 "执行")执行

示例：

```sql
EXEC dbo.P_STUDENT @sex='女',@age=15  
```
# [](#带通配符的存储过程 "带通配符的存储过程")带通配符的存储过程

示例：

## [](#创建-2 "创建")创建

```sql
USE SCHOOL  
GO  
IF OBJECT_ID('P_STUDENT','P') IS NOT NULL  
DROP PROCEDURE P_STUDENT  
GO  
CREATE PROCEDURE P_STUDENT  
@name NVARCHAR(100)   --参数定义方法不变  
AS  
BEGIN  
 SELECT NAME,AGE,SEX FROM dbo.STUDENT WHERE NAME LIKE @name  --通配符查询得使用LIKE  
END  
GO  
```
## [](#执行-2 "执行")执行

示例：

```sql
EXEC dbo.P_STUDENT @name = N'王%'  
```
# [](#带输出参数的存储过程 "带输出参数的存储过程")带输出参数的存储过程

## [](#创建-3 "创建")创建

示例：

```sql
USE SCHOOL  
GO  
IF OBJECT_ID('P_STUDENT','P') IS NOT NULL  
DROP PROCEDURE P_STUDENT  
GO  
CREATE PROCEDURE P_STUDENT  
@name NVARCHAR(100),  
@age INT OUTPUT  --OUTPUT或OUT都表示为输出参数  
AS  
BEGIN  
 SELECT @age=AGE FROM dbo.STUDENT WHERE NAME=@name  
END  
GO  
```
## [](#执行-3 "执行")执行

示例：

```sql
-- 执行带输出参数的存储过程时一定要先使用DECLARE声明参数  
DECLARE @age INT  
EXECUTE dbo.P_STUDENT @name = N'李筱思',  
 @age = @age OUTPUT  
SELECT @age 返回值age  
```
# [](#带表值参数的存储过程 "带表值参数的存储过程")带表值参数的存储过程

## [](#创建-4 "创建")创建

示例：

```sql
USE SCHOOL  
GO  
-- 创建表类型  
IF OBJECT_ID('TYPE01','TT') IS NOT NULL  
DROP TYPE TYPE01  
GO  
CREATE TYPE TYPE01 AS TABLE  
(  
NAME NVARCHAR(100) NOT NULL,  
SEX CHAR(2) NOT NULL,  
AGE INT NOT NULL  
)  
GO  
-- 创建存储过程  
IF OBJECT_ID('P_INSERT_STUDENT','P') IS NOT NULL  
DROP PROCEDURE P_INSERT_STUDENT  
GO  
CREATE PROCEDURE P_INSERT_STUDENT  
@DATA TYPE01 READONLY  --定义输入参数类型为上面定义的TYPE01类型  
AS  
BEGIN  
 INSERT INTO STUDENT(NAME,SEX,AGE) SELECT NAME,SEX,AGE FROM @DATA  
END  
GO  
```
## [](#执行-4 "执行")执行

示例：

```sql
-- 执行存储类型  
-- 先定义表类型的变量@MyData  
DECLARE @MyData AS TYPE01  
-- 然后往变量@MyData里添加数据  
INSERT INTO @MyData  
SELECT 'Jame','男',12 UNION ALL  
SELECT 'Alice','女',23  
-- 执行存储过程，将上面定义的变量传入存储过程  
EXEC dbo.P_INSERT_STUDENT @DATA = @MyData  
GO  
-- 查看执行结果  
SELECT * FROM dbo.STUDENT  
GO  
```
# [](#带变量的存储过程 "带变量的存储过程")带变量的存储过程

## [](#概念-1 "概念")概念

变量：变量分局部变量和全局变量

*   局部变量：用户自定义的变量，作用范围在程序内部，局部变量必须先生命，再使用，名称必须以`@`开头
*   全局变量：是SQL系统内部实现定义好的变量，不需要用户参与定义，任何程序均可以随时调用，SQL中共有30多个全局变量，名称都以`@@`开头，主要用于SQL Server的配置设定值和效能统计数据

声明局部变量：`DECLARE 以@开头的变量名 数据类型(长度)`

局部变量复制：

1.  `SET 局部变量名=值`
2.  `SELECT 局部变量名=字段名 FROM 表名 ORDER BY 字段名`，若`SELECT`返回值有多个，则数据库引擎会分配最后一个值给变量

局部变量的作用域：在`DECLARE`变量开始至脚本或存储过程结束

## [](#创建-5 "创建")创建

示例：

```sql
USE SCHOOL  
GO  
IF OBJECT_ID('P_STUDENT','P') IS NOT NULL  
DROP PROCEDURE dbo.P_STUDENT  
GO  
CREATE PROCEDURE P_STUDENT  
@NAME NVARCHAR(100)  
AS  
BEGIN  
 DECLARE @AGE INT  --注意：参数的定义位置在AS前面，变量的定义位置在AS后面  
SELECT @AGE=AGE FROM dbo.STUDENT WHERE NAME=@NAME  --通过查询结果给变量复制  
SELECT * FROM dbo.STUDENT WHERE AGE=@AGE --使用变量进行查询  
END  
GO  
```
## [](#执行-5 "执行")执行

示例：

```sql
EXEC dbo.P_STUDENT @NAME = N'李筱思'  
```
# [](#可捕获异常的存储过程 "可捕获异常的存储过程")可捕获异常的存储过程

## [](#概念-2 "概念")概念

使用`TRY...CATCH`结构来捕获并处理异常

在`TRY`块中的SQL发生异常，则执行`CATCH`块中的SQL，`TRY...CATCH`不可用在用户自定义函数中

## [](#创建-6 "创建")创建

示例：

```sql
USE SCHOOL  
GO  
IF OBJECT_ID('P_STUDENT','P') IS NOT NULL  
DROP PROCEDURE dbo.P_STUDENT  
GO  
CREATE PROCEDURE P_STUDENT  
@ID CHAR(10),  
@NAME VARCHAR(10),  
@SEX CHAR(2)  
AS  
BEGIN  
 BEGIN TRY  
INSERT INTO STUDENT(ID,SEX,NAME)  --这里模拟个异常  
SELECT @ID,@NAME,@SEX  
END TRY  
BEGIN CATCH  
SELECT ERROR_NUMBER() AS ERROR_NUM,  
 ERROR_PROCEDURE() AS ERROR_PROC,  
 ERROR_SEVERITY() AS ERROR_SEVE,  
 ERROR_MESSAGE() AS ERROR_MSG  
END CATCH  
END  
GO  
```
## [](#执行-6 "执行")执行

示例：

```sql
EXEC dbo.P_STUDENT @ID = '1',  
 @NAME = '123131',  
 @SEX = '131'  
```
# [](#对存储过程加密及重新编译 "对存储过程加密及重新编译")对存储过程加密及重新编译

## [](#概念-3 "概念")概念

使用`EXEC sys.sp_helptext 存储过程名字`查看存储过程定义

使用`WITH ENCRYPTION`选项对过程定义进行模糊处理

使用`WITH RECOMPILE`选项强制重新编译过程：

1.  数据结构进行了重要更改，则重新编译过程会进行更新并针对这些更改优化过程的查询计划，这样可以提高过程的处理性能
2.  对过程引用的基础表添加了过程可能从中受益的新索引，可以强制在下次执行过程时对其重新编译

## [](#创建-7 "创建")创建

示例：

```sql
USE SCHOOL  
GO  
IF OBJECT_ID('P_STUDENT','P') IS NOT NULL  
DROP PROCEDURE P_STUDENT  
GO  
CREATE PROCEDURE P_STUDENT  
@NAME VARCHAR(10)  
WITH ENCRYPTION,RECOMPILE  
AS  
BEGIN  
 DECLARE @AGE INT  
SELECT @AGE=AGE FROM dbo.STUDENT WHERE NAME=@NAME  
SELECT * FROM dbo.STUDENT WHERE AGE=@AGE  
END  
GO  
```
# [](#存储过程的优化 "存储过程的优化")存储过程的优化

1.  在存储过程中使用`SET NOCOUNT ON/OFF`关闭或启用显示受TSQL语句影响的行计数消息：**`SET NOCOUNT ON`有利于提升过程执行效率**
2.  当在过程中创建或引用数据库对象时使用架构名称，减少数据库引擎解析对象名称所用的处理时间：**就是类似`dbo.STUDENT`这样的写法，补上前面的`dbo`，不要直接写`STUDENT`**
3.  避免函数包装在`WHERE`和`JOIN`子句中指定的列，这样做会使列具有不确定性并且禁止查询处理器使用索引
4.  避免在返回许多行数据的`SELECT`语句中使用标量函数。因为标量函数必须应用于每一行，会降低性能
5.  避免使用`SELECT *`。而是应指定所需的列名称
6.  避免处理或返回过多的数据，尽可能在过程代码中缩小结果的范围
7.  通过使用`BEGIN/END TRANSACTION`来使用显示事务并且保留尽可能短的事务。更长的事务意味着更长的记录锁定和更高的死锁风险
8.  通过`TRY...CATCH...`功能进行过程内的错误处理，`TRY...CATCH...`可以封装整个TSQL语句块
9.  在过程主体中对`CREATE TABLE`或`ALTER TABLE`语句引用的所有表列使用`DEFAULT`关键字，这将禁止将`NULL`传递到不允许`NULL`值的列
10.  对于临时表中的每一列使用`NULL`或`NOT NULL`
11.  使用`UNION ALL`运算符来代替`UNION`或`OR`运算符，除非存在针对非重复值的特定需要。`UNION ALL`运算符要求更少的处理开销，因为重复值不从结果集中筛选出来