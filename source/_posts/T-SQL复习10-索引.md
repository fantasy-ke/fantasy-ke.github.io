---
title: T-SQL复习10--索引
tags:
  - SQL Server
  - T-SQL
  - SQL Server
excerpt: |2-

      
        
        
          <ul>
  <li><a href="#%e8%a7%a3%e6%9e%90">解析</a></li>
  <li><a href="#%e5%88%86%e7%b1%bb">分类</a></li></ul>
        
      
      
date: 2020-05-22 16:19:00
---

*   [解析](#%e8%a7%a3%e6%9e%90)
*   [分类](#%e5%88%86%e7%b1%bb)
<!-- more -->
*   [解析](#%e8%a7%a3%e6%9e%90)
*   [分类](#%e5%88%86%e7%b1%bb)
    *   [聚集索引](#%e8%81%9a%e9%9b%86%e7%b4%a2%e5%bc%95)
    *   [非聚集索引](#%e9%9d%9e%e8%81%9a%e9%9b%86%e7%b4%a2%e5%bc%95)
    *   [唯一索引](#%e5%94%af%e4%b8%80%e7%b4%a2%e5%bc%95)
*   [查询优化器如何使用索引](#%e6%9f%a5%e8%af%a2%e4%bc%98%e5%8c%96%e5%99%a8%e5%a6%82%e4%bd%95%e4%bd%bf%e7%94%a8%e7%b4%a2%e5%bc%95)
*   [创建索引](#%e5%88%9b%e5%bb%ba%e7%b4%a2%e5%bc%95)
    *   [隐式创建索引](#%e9%9a%90%e5%bc%8f%e5%88%9b%e5%bb%ba%e7%b4%a2%e5%bc%95)
    *   [显示创建索引](#%e6%98%be%e7%a4%ba%e5%88%9b%e5%bb%ba%e7%b4%a2%e5%bc%95)
*   [删除索引](#%e5%88%a0%e9%99%a4%e7%b4%a2%e5%bc%95)
*   [查看SQL Server的查询步骤](#%e6%9f%a5%e7%9c%8bsql-server%e7%9a%84%e6%9f%a5%e8%af%a2%e6%ad%a5%e9%aa%a4)
*   [在哪些字段创建索引](#%e5%9c%a8%e5%93%aa%e4%ba%9b%e5%ad%97%e6%ae%b5%e5%88%9b%e5%bb%ba%e7%b4%a2%e5%bc%95)

# [](#解析 "解析")解析

索引就像书中的目录，使你能快速定位到所需的信息，数据库中的索引可以加快检索表或视图中的信息速度。索引包含表或视图中的一列或多列生成的键，这些键存储在一个结构(B树)中，时SQL Server可以快速有效的查找域键值相关联的行

索引类似一个微表，索引中只存储索引所在列的件值，需要查询数据时，若可以用到索引中的列，则首先会在索引表中查询，而不是直接从数据表中查询数据

# [](#分类 "分类")分类

## [](#聚集索引 "聚集索引")聚集索引

聚集索引是指数据表回根据索引表中键值的顺序存储和排序表数据，因为一张表只能按照一个顺序排序，所以一张表只能由一个聚集索引

## [](#非聚集索引 "非聚集索引")非聚集索引

非聚集索引中的键值只是在逻辑上排序，并不对表中的数据进行排序，因此叫做非聚集索引，一张表可以有多个非聚集索引，当一个表有聚集索引时，非聚集索引时指向聚集索引的指针，也就是说当使用非聚集索引查询数据时，SQL Server先从非聚集索引中查到该键值，再去查该键值对应的聚集索引键值，再从聚集索引中找到需要的数据，如果表中没有聚集索引，那么非聚集索引就是一个行定位符

## [](#唯一索引 "唯一索引")唯一索引

唯一索引指的时不允许该索引键列有两行重复的值，聚集索引和非聚集索引都可以是唯一索引

# [](#查询优化器如何使用索引 "查询优化器如何使用索引")查询优化器如何使用索引

当执行查询时，查询优化器评估可用于检索数据的每个方法，然后选择最有效的方法，可能采用的方法包括扫描表和扫描一个或多个索引(如果有).

扫描表时，查询优化器读取表中的所有行，并提取满足查询条件的行，扫描表会有许多磁盘I/O操作，并占用大量资源

查询优化器使用索引时，搜索索引键列，查找到查询所需行的存储位置，然后从该位置提取匹配行，通常，搜索索引比搜索表要快很多，因为索引与表不同，一般每行包含的列非常少，且行遵循排序顺序

# [](#创建索引 "创建索引")创建索引

## [](#隐式创建索引 "隐式创建索引")隐式创建索引

创建`PRIMARY KEY`约束后，会自动创建唯一聚集索引；创建`UNIQUE`约束后，会自动创建唯一非聚集索引  
这里不做示例，需要查看示例返回看约束

## [](#显示创建索引 "显示创建索引")显示创建索引

示例：

```sql
-- 创建唯一聚集索引  
USE SCHOOL  
GO  
CREATE UNIQUE CLUSTERED INDEX INDEX_ID  --创建唯一聚集索引  
ON dbo.STUDENT(ID DESC) --指定STUDENT表的ID列  
GO  
  
-- 创建唯一非聚集索引  
USE SCHOOL  
GO  
CREATE UNIQUE NONCLUSTERED INDEX INDEX_NAME  
ON dbo.STUDENT(NAME DESC)  
GO  
```
# [](#删除索引 "删除索引")删除索引

示例：

```sql
DROP INDEX dbo.STUDENT.[INDEX_NAME]  
```
# [](#查看SQL-Server的查询步骤 "查看SQL Server的查询步骤")查看SQL Server的查询步骤

查看SQL Server的查询步骤，已经是否选择了哪个索引，帮助用户分析哪些索引被系统引用

示例：

```sql
SET SHOWPLAN_ALL ON --开启显示查询步骤  
GO  
SELECT * FROM dbo.STUDENT WHERE ID=2  
```
# [](#在哪些字段创建索引 "在哪些字段创建索引")在哪些字段创建索引

1.  查询经常引用的列可创建聚集索引
2.  频繁更新的列不应该创建聚集索引，可创建非聚集索引
3.  用户`GROUP BY`和`ORDER BY`的列
4.  若要创建组合聚集索引，应把最常用的字段放在组合键中靠前的位置
5.  一个表中的索引最好不要超过5个，因为创建索引后，向表中写数据时，SQL Server既要向数据表中写数据，同时也要向创建的索引中写数据，索引越多需要写入越多，因此新建索引时要考虑这个因素