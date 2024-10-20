---
title: T-SQL复习08--数据完整性(约束)
tags:
  - SQL Server
  - T-SQL
  - SQL Server
excerpt: |2-
    <ul>
  <li><a href="#%e6%95%b0%e6%8d%ae%e5%ae%8c%e6%95%b4%e6%80%a7">数据完整性</a></li>
  <li><a href="#%e6%a6%82%e5%bf%b5">概念</a></li>
        </ul>
      
      
date: 2020-05-22 11:17:00
---

*   [数据完整性](#%e6%95%b0%e6%8d%ae%e5%ae%8c%e6%95%b4%e6%80%a7)
    *   [概念](#%e6%a6%82%e5%bf%b5)
<!-- more -->
*   [数据完整性](#%e6%95%b0%e6%8d%ae%e5%ae%8c%e6%95%b4%e6%80%a7)
    *   [概念](#%e6%a6%82%e5%bf%b5)
    *   [类型](#%e7%b1%bb%e5%9e%8b)
    *   [约束](#%e7%ba%a6%e6%9d%9f)
*   [域完整性类型](#%e5%9f%9f%e5%ae%8c%e6%95%b4%e6%80%a7%e7%b1%bb%e5%9e%8b)
    *   [DEFAULT约束](#default%e7%ba%a6%e6%9d%9f)
        *   [为现有表添加DEFAULT约束](#%e4%b8%ba%e7%8e%b0%e6%9c%89%e8%a1%a8%e6%b7%bb%e5%8a%a0default%e7%ba%a6%e6%9d%9f)
        *   [创建表时添加DEFAULT约束](#%e5%88%9b%e5%bb%ba%e8%a1%a8%e6%97%b6%e6%b7%bb%e5%8a%a0default%e7%ba%a6%e6%9d%9f)
    *   [CHECK约束](#check%e7%ba%a6%e6%9d%9f)
        *   [创建表时添加CHECK约束](#%e5%88%9b%e5%bb%ba%e8%a1%a8%e6%97%b6%e6%b7%bb%e5%8a%a0check%e7%ba%a6%e6%9d%9f)
        *   [为现有表添加CHECK约束](#%e4%b8%ba%e7%8e%b0%e6%9c%89%e8%a1%a8%e6%b7%bb%e5%8a%a0check%e7%ba%a6%e6%9d%9f)
        *   [删除约束](#%e5%88%a0%e9%99%a4%e7%ba%a6%e6%9d%9f)
    *   [NULL约束](#null%e7%ba%a6%e6%9d%9f)
        *   [创建表时指定是否允许为NULL](#%e5%88%9b%e5%bb%ba%e8%a1%a8%e6%97%b6%e6%8c%87%e5%ae%9a%e6%98%af%e5%90%a6%e5%85%81%e8%ae%b8%e4%b8%banull)
        *   [修改现有表的字段是否允许为NULL](#%e4%bf%ae%e6%94%b9%e7%8e%b0%e6%9c%89%e8%a1%a8%e7%9a%84%e5%ad%97%e6%ae%b5%e6%98%af%e5%90%a6%e5%85%81%e8%ae%b8%e4%b8%banull)
*   [实体完整性类型](#%e5%ae%9e%e4%bd%93%e5%ae%8c%e6%95%b4%e6%80%a7%e7%b1%bb%e5%9e%8b)
    *   [primary key约束](#primary-key%e7%ba%a6%e6%9d%9f)
        *   [创建表时指定主键](#%e5%88%9b%e5%bb%ba%e8%a1%a8%e6%97%b6%e6%8c%87%e5%ae%9a%e4%b8%bb%e9%94%ae)
        *   [给现有的表添加主键](#%e7%bb%99%e7%8e%b0%e6%9c%89%e7%9a%84%e8%a1%a8%e6%b7%bb%e5%8a%a0%e4%b8%bb%e9%94%ae)
    *   [UNIQUE约束](#unique%e7%ba%a6%e6%9d%9f)
        *   [创建表时同时创建UNIQUE约束](#%e5%88%9b%e5%bb%ba%e8%a1%a8%e6%97%b6%e5%90%8c%e6%97%b6%e5%88%9b%e5%bb%baunique%e7%ba%a6%e6%9d%9f)
        *   [给现有的表添加UNIQUE约束](#%e7%bb%99%e7%8e%b0%e6%9c%89%e7%9a%84%e8%a1%a8%e6%b7%bb%e5%8a%a0unique%e7%ba%a6%e6%9d%9f)
*   [引用完整性类型](#%e5%bc%95%e7%94%a8%e5%ae%8c%e6%95%b4%e6%80%a7%e7%b1%bb%e5%9e%8b)
    *   [FOREIGN KEY约束](#foreign-key%e7%ba%a6%e6%9d%9f)
*   [总结](#%e6%80%bb%e7%bb%93)

# [](#数据完整性 "数据完整性")数据完整性

## [](#概念 "概念")概念

数据完整性是指存储在数据库中数据的准确性和可靠性，它是应防止数据库中存在不符合语义规定的数据和防止因错误信息的输入输出造成无效操作或错误信息而提出的

## [](#类型 "类型")类型

*   域完整性：域完整性指特定列的项的有效性
*   实体完整性：要求表中的所有行具有唯一的标识，例如主关键字值
*   引用完整性：确保量表之间的关系在更新和删除期间保持同步
    
    ## [](#约束 "约束")约束
    
    使用不同的约束强制数据完整性。约束时重要的数据库对象

# [](#域完整性类型 "域完整性类型")域完整性类型

## [](#DEFAULT约束 "DEFAULT约束")DEFAULT约束

指定列的默认值

### [](#为现有表添加DEFAULT约束 "为现有表添加DEFAULT约束")为现有表添加DEFAULT约束

示例：

```sql
USE SCHOOL  
GO  
ALTER TABLE dbo.STUDENT  
ADD CONSTRAINT DEF_SEX  --添加的约束名称  
DEFAULT '男'  --约束类型及约束的值  
FOR SEX  --添加约束的列  
GO  
```
### [](#创建表时添加DEFAULT约束 "创建表时添加DEFAULT约束")创建表时添加DEFAULT约束

示例：

```sql
USE SCHOOL  
GO  
CREATE TABLE TEMP_DEFAULT  
(  
Id INT NOT NULL,  
JOB NVARCHAR(100) DEFAULT '.NET CORE DEV' NOT NULL  
)  
GO  
```
_注：每一列只能有一个`DEFAULT`约束，不能用于`IDENTITY`属性的列，若默认值长度大于该字段允许的字符空间，则插入到该列的值会被截断_

## [](#CHECK约束 "CHECK约束")CHECK约束

限制列可接受的值，控制列值的范围，检车列值

`CHECK`约束默认检查现有数据和所有新数据，使用`WITH NOCHECK`中检查新数据

### [](#创建表时添加CHECK约束 "创建表时添加CHECK约束")创建表时添加CHECK约束

示例：

```sql
USE SCHOOL  
GO  
CREATE TABLE TEMP_CHECK  
(  
ID INT NOT NULL,  
JOB NVARCHAR(100) CHECK(JOB='JAVA' OR JOB='C#') NOT NULL  
)  
GO  
```
### [](#为现有表添加CHECK约束 "为现有表添加CHECK约束")为现有表添加CHECK约束

示例：

```sql
USE SCHOOL  
GO  
ALTER TABLE dbo.STUDENT --[WITH NOCHECK] 添加WITH NOCHECK则指检查新数据，不检查表里原有数据  
ADD CONSTRAINT CHECK_AGE  --指定约束名称  
CHECK(AGE>=0 AND AGE<=150) --指定约束访范围  
GO  
```
### [](#删除约束 "删除约束")删除约束

示例：

```sql
USE SCHOOL  
GO  
ALTER TABLE dbo.STUDENT  
DROP CONSTRAINT CHECK_AGE --约束名称  
GO  
```
## [](#NULL约束 "NULL约束")NULL约束

指定列是否允许`NULL`，空值(或`NULL`)不同于`0`、空白或长度为0的字符串(如””)。NULL的意思是没有输入

### [](#创建表时指定是否允许为NULL "创建表时指定是否允许为NULL")创建表时指定是否允许为NULL

示例：

```sql
USE SCHOOL  
GO  
CREATE TABLE TEMP_NULL  
(  
ID INT NOT NULL,  
NAME NVARCHAR(100) NULL  
)  
GO  
```
### [](#修改现有表的字段是否允许为NULL "修改现有表的字段是否允许为NULL")修改现有表的字段是否允许为NULL

示例：

```sql
USE SCHOOL  
GO  
ALTER TABLE dbo.STUDENT  
ALTER COLUMN ID INT NOT NULL --NOT NULL修改为NULL则标识允许为NULL  
GO  
```
# [](#实体完整性类型 "实体完整性类型")实体完整性类型

## [](#primary-key约束 "primary key约束")primary key约束

能唯一标识表中每一行的值的一列或一组列，这样的一列或多列称为表的主键。一个表只能有一个`primary key`约束，并且`primary key`约束中的列不允许空值，不允许重复。如果对多列定义了`primary key`约束，则一列中的值可能会重复，但来自`primary key`约束定义中所有列的任何值组合必须唯一。

### [](#创建表时指定主键 "创建表时指定主键")创建表时指定主键

示例：

```sql
USE SCHOOL  
GO  
CREATE TABLE TEMP_PK  
(  
ID BIGINT PRIMARY KEY(ID),  
NAME NVARCHAR(100) NOT NULL  
)  
GO  
```
### [](#给现有的表添加主键 "给现有的表添加主键")给现有的表添加主键

示例：

```sql
USE SCHOOL  
GO  
ALTER TABLE dbo.STUDENT  
ADD CONSTRAINT PK_ID --约束名称  
PRIMARY KEY(ID) --指定主键列  
GO  
```
## [](#UNIQUE约束 "UNIQUE约束")UNIQUE约束

确保在非主键列中不输入重复的值，可以对一个表定义多个`UNIQUE`约束，但只能定义一个`PRIMARY KEY`约束，`UNIQUE`约束允许一个`NULL`值，而`PARMARY KEY`约束不允许有`NULL`值

创建`UNIQUE`约束时，同时会创建一个同名的非聚集索引，当插入或修改数据时，`UNIQUE`约束自动执行校验数据

### [](#创建表时同时创建UNIQUE约束 "创建表时同时创建UNIQUE约束")创建表时同时创建UNIQUE约束

示例：

```sql
USE SCHOOL  
GO  
CREATE TABLE TEMP_UNIUQE  
(  
ID INT NOT NULL,  
NAME NVARCHAR(20) CONSTRAINT UNIQUE_NAME UNIQUE(NAME) NULL  
)  
GO  
```
### [](#给现有的表添加UNIQUE约束 "给现有的表添加UNIQUE约束")给现有的表添加UNIQUE约束

示例：

```sql
USE SCHOOL  
GO  
ALTER TABLE dbo.STUDENT  
ADD CONSTRAINT UNIQUE_NAME  
UNIQUE(NAME)  
GO  
```
# [](#引用完整性类型 "引用完整性类型")引用完整性类型

## [](#FOREIGN-KEY约束 "FOREIGN KEY约束")FOREIGN KEY约束

用于建立和加强两个表数据之间的链接，可以是一列或多列，称为表的外键(`FK`)，一个表可以有多个`FOREIGN KEY`约束，选作外键必须与其他对应的主键列具有相同的数据类型，每个键中列的数必须相等，即如果主键是一列，则外键是一列，如果主键是多列，则外键对应也是多列。`FOREIGN KEY`约束不仅可以与另一个表的`PRIMARY KEY`约束相关联，还可以定义为引用另一个表的`UNIQUE`约束列

主键要先创建好才能创建外键，`FOREIGN KEY`约束不能自动创建索引

外键约束的主要目的时控制可以存储在外键表中的数据，同时它也可以控制对主键表中数据的更改

示例：

```sql
USE SCHOOL  
GO  
ALTER TABLE dbo.GRADE  
ADD CONSTRAINT FK_STUDENT_ID  --外键约束名称  
FOREIGN KEY(STUDENTID)  --指定当前表哪一列是外键  
REFERENCES dbo.STUDENT(ID) --这个外键对应的是哪个表的主键  
GO  
```
# [](#总结 "总结")总结

*   `DEFAULT`、`CHECK`、`NULL`约束是针对表中的列进行完整性的控制，因此叫做域完整性
*   `PRIMARY KEY`、`UNIQUE`约束是针对行限制数据行的唯一性，因此叫做实体完整性
*   `FOREIGN KEY`约束是针对表与表之间的关系控制数据完整性，因此叫参照完整性