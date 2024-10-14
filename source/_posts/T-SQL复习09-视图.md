---
title: T-SQL复习09--视图
tags:
  - SQL Server
  - T-SQL
  - SQL Server
excerpt: |2-

      
        
        
          <ul>
  <li><a href="#%e8%a7%a3%e6%9e%90">解析</a></li>
  <li><a href="#%e8%a7%86%e5%9b%be%e7%9a%84%e4%bd%9c%e7%94%a8">视图的作用</a></li>
  <li><a href="
        
      
      
date: 2020-05-22 15:36:00
---

*   [解析](#%e8%a7%a3%e6%9e%90)
*   [视图的作用](#%e8%a7%86%e5%9b%be%e7%9a%84%e4%bd%9c%e7%94%a8)
<!-- more -->
*   [解析](#%e8%a7%a3%e6%9e%90)
*   [视图的作用](#%e8%a7%86%e5%9b%be%e7%9a%84%e4%bd%9c%e7%94%a8)
*   [创建视图](#%e5%88%9b%e5%bb%ba%e8%a7%86%e5%9b%be)
*   [修改视图](#%e4%bf%ae%e6%94%b9%e8%a7%86%e5%9b%be)
*   [更新视图数据](#%e6%9b%b4%e6%96%b0%e8%a7%86%e5%9b%be%e6%95%b0%e6%8d%ae)
*   [使用系统存储过程查看创建视图脚本](#%e4%bd%bf%e7%94%a8%e7%b3%bb%e7%bb%9f%e5%ad%98%e5%82%a8%e8%bf%87%e7%a8%8b%e6%9f%a5%e7%9c%8b%e5%88%9b%e5%bb%ba%e8%a7%86%e5%9b%be%e8%84%9a%e6%9c%ac)
*   [加密视图](#%e5%8a%a0%e5%af%86%e8%a7%86%e5%9b%be)
*   [删除视图](#%e5%88%a0%e9%99%a4%e8%a7%86%e5%9b%be)

# [](#解析 "解析")解析

视图是一个虚拟表，其内容由查询定义，同表一样，视图包含一系列带有名称的列和行数据，行和列数据来自定义视图的查询所引用的表，并且在引用视图时动态生成

# [](#视图的作用 "视图的作用")视图的作用

1.  集中用户需要的数据
2.  用作安全机制，数据库管理元只允许用户通过视图查询数据，而不授予用户直接访问视图基础表的权限
3.  提高性能，存储复杂查询

# [](#创建视图 "创建视图")创建视图

示例：

1  
2  
3  
4  
5  
6  

USE SCHOOL  
GO  
CREATE VIEW V\_BEST\_SCORE  
AS  
SELECT \* FROM dbo.GRADE WHERE SCORE>90  
GO  

# [](#修改视图 "修改视图")修改视图

示例：

1  
2  
3  
4  
5  
6  

USE SCHOOL  
GO  
ALTER VIEW dbo.V\_BEST\_SCORE  
AS  
SELECT \* FROM dbo.GRADE WHERE SCORE>95  
GO  

# [](#更新视图数据 "更新视图数据")更新视图数据

示例：

1  
2  
3  
4  

USE SCHOOL  
GO  
UPDATE dbo.V\_BEST\_SCORE SET SCORE=96  
GO  

_注：更新视图数据同时也会更新源表数据_

# [](#使用系统存储过程查看创建视图脚本 "使用系统存储过程查看创建视图脚本")使用系统存储过程查看创建视图脚本

示例：

1  

EXEC sys.sp\_helptext 'V\_BEST\_SCORE'  

# [](#加密视图 "加密视图")加密视图

使用`WITH ENCRYPTION`加密视图脚本，`WITH CHECK OPTION`强制更新视图的数据并且符合创建视图时的筛选条件  
示例：

1  
2  
3  
4  
5  
6  

USE SCHOOL  
GO  
ALTER VIEW dbo.V\_BEST\_SCORE WITH ENCRYPTION  
AS  
SELECT \* FROM dbo.GRADE WHERE SCORE>90  
WITH CHECK OPTION  

加密了视图之后，使用`sp_helptext`存储过程就无法查看视图脚本了

使用`WITH CHECK OPTION`表示如果更新视图数据，必须保证更新完数据还在视图里，即参照上面的示例，如果将`SCORE`更新成91，则可以更新成功，如果将`SCORE`更新成89，则无法更新成功

# [](#删除视图 "删除视图")删除视图

示例：

1  

DROP VIEW dbo.V\_BEST\_SCORE