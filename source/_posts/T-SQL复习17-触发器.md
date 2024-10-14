---
title: T-SQL复习17--触发器
tags:
  - SQL Server
  - T-SQL
  - SQL Server
excerpt: |2-

      
        
        
          <h1 id="概念"><a href="#概念" class="headerlink" title="概念"></a>概念</h1><p>触发器是数据库服务器中发生事件时自动执行的特种存储过程</p>
  <h1 id="类型"><a href="#类型" class="heade
        
      
      
date: 2020-05-24 13:24:00
---

# [](#概念 "概念")概念

触发器是数据库服务器中发生事件时自动执行的特种存储过程
<!-- more -->
# [](#概念 "概念")概念

触发器是数据库服务器中发生事件时自动执行的特种存储过程

# [](#类型 "类型")类型

*   DML触发器：当发生数据操作语言，如`INSERT`、`UPDATE`或`DELETE`时，执行的触发器
*   DDL触发器：当发生数据定义语言，如`CREATE`、`ALTER`或`DROP`时，执行的触发器
*   登陆触发器：与SQL Server示例建立用户会话时执行的触发器

# [](#DML触发器 "DML触发器")DML触发器

DML触发器有点：DML触发器类似于约束，可以强制实体完整性或域完整性；当约束支持的功能无法满足应用程序的功能要求时，DML触发器非常有用

示例：

1  
2  
3  
4  
5  
6  
7  
8  
9  
10  
11  
12  
13  
14  

USE SCHOOL  
GO  
IF OBJECT\_ID('TR\_INSERT') IS NOT NULL  
DROP TRIGGER TR\_INSERT  
GO  
CREATE TRIGGER TR\_INSERT  
ON dbo.STUDENT  
FOR INSERT  
AS  
PRINT '插入学生表成功'  
GO  
  
\--测试触发INSERT触发器  
INSERT dbo.STUDENT(NAME,SEX,Age) VALUES('Alice','女',24)  

# [](#触发器工作原理 "触发器工作原理")触发器工作原理

SQL Server创建了两个专用表：`inserted`和`deleted`表，这是两个逻辑表，由系统维护，不允许用户直接对两个表进行修改。他们存放在内存中，不存放在数据库中。这两个表的结构总是与被触发器作用的表的结构相同

*   inserted表：存放由于`INSERT`或`UPDATE`语句的执行而要加到该触发表中去的所有新行。即用于插入或更新表的新行值，在插入或更新表的同时，也将其副本存储`inserted`表中。因为在`inserted`表中的行总是与触发表中的新行相同
    
*   deleted表：存放由于`DELETE`或`UPDATE`语句的执行而要从该触发表中删除的所有行。也就是说，把触发表中要删除或要更新的旧行移到`deleted`表中。因此`deleted`表和触发表的行不相同
    

示例：

1  
2  
3  
4  
5  
6  
7  
8  
9  
10  
11  
12  
13  
14  
15  
16  
17  

\-- 当向成绩表插入学生多个课程的成绩时，学生的总分发生相应变化  
USE SCHOOL  
GO  
IF OBJECT\_ID('TR\_SCORE') IS NOT NULL  
DROP TRIGGER TR\_SCORE  
GO  
CREATE TRIGGER TR\_SCORE  
ON dbo.SCORE  
FOR INSERT  
AS  
BEGIN  
 DECLARE @SCORE INT  
SELECT @SCORE=SCORE FROM inserted  
UPDATE dbo.TOTALSCORE SET TOTALSCORE=TOTALSCORE+@SCORE  
PRINT '学生总成绩修改成功'  
END  
GO  

# [](#禁用触发器 "禁用触发器")禁用触发器

示例：

1  
2  

ALTER TABLE dbo.STUDENT  
DISABLE TRIGGER TR\_INSERT  

# [](#启用触发器 "启用触发器")启用触发器

示例：

1  
2  

ALTER TABLE dbo.SCORE  
ENABLE TRIGGER TR\_SCORE  

# [](#删除触发器 "删除触发器")删除触发器

示例：

1  

DROP TRIGGER dbo.TR\_SCORE