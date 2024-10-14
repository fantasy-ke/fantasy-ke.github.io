---
title: T-SQL复习15--事务
tags:
  - SQL Server
  - T-SQL
  - SQL Server
excerpt: |2-

      
        
        
          <ul>
  <li><a href="#%e6%a6%82%e5%bf%b5">概念</a></li>
  <li><a href="#sql-server%e4%ba%8b%e5%8a%a1">SQL Server事务</a></li>
  <li><a href="#%e5%88%9b
        
      
      
date: 2020-05-24 10:19:00
---

*   [概念](#%e6%a6%82%e5%bf%b5)
*   [SQL Server事务](#sql-server%e4%ba%8b%e5%8a%a1)
<!-- more -->
*   [概念](#%e6%a6%82%e5%bf%b5)
*   [SQL Server事务](#sql-server%e4%ba%8b%e5%8a%a1)
*   [创建提交事务](#%e5%88%9b%e5%bb%ba%e6%8f%90%e4%ba%a4%e4%ba%8b%e5%8a%a1)
*   [标记一个事务](#%e6%a0%87%e8%ae%b0%e4%b8%80%e4%b8%aa%e4%ba%8b%e5%8a%a1)
*   [回滚事务](#%e5%9b%9e%e6%bb%9a%e4%ba%8b%e5%8a%a1)
*   [在事务内设置保存点](#%e5%9c%a8%e4%ba%8b%e5%8a%a1%e5%86%85%e8%ae%be%e7%bd%ae%e4%bf%9d%e5%ad%98%e7%82%b9)
*   [在存储过程中使用事务](#%e5%9c%a8%e5%ad%98%e5%82%a8%e8%bf%87%e7%a8%8b%e4%b8%ad%e4%bd%bf%e7%94%a8%e4%ba%8b%e5%8a%a1)

# [](#概念 "概念")概念

事务是单个工作单元，如果某一事务成功，则在该事务中进行的所有数据修改均会提交，成为数据库中的永久组成部分，如果该事务遇到错误且必须取消或回滚，则所有数据修改均被清楚

# [](#SQL-Server事务 "SQL Server事务")SQL Server事务

*   自动提交事务：每条单独的语句都是一个事务
*   显式事务：每个事务均已`BEGIN TRANSACTION`语句显示开始，已`COMMIT`或`ROLLBACK`语句显式结束
*   隐式事务：在前一个事务完成时新事务隐式启动，但每个事务仍已`COMMIT`或`ROLLBACK`语句显式结束

# [](#创建提交事务 "创建提交事务")创建提交事务

示例：

1  
2  
3  
4  
5  
6  
7  

BEGIN TRANSACTION UP\_STU \--表示开始一个事务，BEGIN TRANSACTION使@@TRANCOUNT值按1递增  
\--SELECT @@TRANCOUNT  --查询@@TRANCOUNT  
  
UPDATE dbo.STUDENT SET Age=10 WHERE NAME\='Hello'  
  
COMMIT TRANSACTION UP\_STU  \--表示提交一个事务，仅当对数据库的操作全部正确时，才可以提交事务。COMMIT TRANSACTION时@@TRANCOUNT值按1递减  
\--SELECT @@TRANCOUNT  

# [](#标记一个事务 "标记一个事务")标记一个事务

示例：

1  
2  
3  
4  

BEGIN TRANSACTION UP\_STU  
WITH MARK '修改学生年龄' \--使用WITH MARK来标记事务  
UPDATE dbo.STUDENT SET Age=10 WHERE NAME\='Hello'  
COMMIT TRANSACTION UP\_STU  

_注：标记事务时事务名于事务日志中，在还原数据库时可将数据库还原到标记的事务_

# [](#回滚事务 "回滚事务")回滚事务

示例：

1  
2  
3  

BEGIN TRANSACTION UP\_STU  
UPDATE dbo.STUDENT SET Age=10 WHERE NAME\='Hello'  
ROLLBACK TRANSACTION UP\_STU \--回滚事务到事务的起点，清除自事务起点所作的所有数据的修改，ROLLBACK TRANSACTION使@@TRANCOUNT值递减到0  

# [](#在事务内设置保存点 "在事务内设置保存点")在事务内设置保存点

示例：

1  
2  
3  
4  
5  
6  
7  

BEGIN TRANSACTION UP\_STU  
UPDATE dbo.STUDENT SET Age=10 WHERE NAME\='Hello'  
SAVE TRANSACTION TRAN\_SAVE  
UPDATE dbo.STUDENT SET Age=12 WHERE NAME\='World'  
ROLLBACK TRANSACTION TRAN\_SAVE \--回滚到事务的保存点位置，ROLLBACK TRANSACTION savePointName 不影响@@TRANCOUNT  
UPDATE dbo.STUDENT SET Age=13 WHERE NAME\='World'  
COMMIT TRANSACTION UP\_STU  

# [](#在存储过程中使用事务 "在存储过程中使用事务")在存储过程中使用事务

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
18  
19  
20  
21  
22  
23  
24  
25  
26  
27  
28  

USE SCHOOL  
GO  
IF OBJECT\_ID('P\_STUDENT','P') IS NOT NULL  
DROP PROCEDURE P\_STUDENT  
GO  
CREATE PROCEDURE P\_STUDENT  
AS  
BEGIN  
 BEGIN TRY  
BEGIN TRANSACTION TRAN1 \--外层事务  
UPDATE STUDENT SET Age=10 WHERE NAME\='Hello'  
BEGIN TRANSACTION SUBTRAN1  \--嵌套事务  
INSERT INTO STUDENT(NAME,Age,SEX) VALUES('JAME',12,'男')  
COMMIT TRANSACTION SUBTRAN1  
COMMIT TRANSACTION TRAN1  
END TRY  
BEGIN CATCH  
IF @@TRANCOUNT > 0 \--@@TRANCOUNT>0表示在TRY块中的事务没有成功提交，那么就回滚整个外层事务  
BEGIN  
PRINT @@TRANCOUNT  
SELECT ERROR\_LINE(),ERROR\_MESSAGE(),ERROR\_PROCEDURE()  
ROLLBACK TRANSACTION TRAN1  
END  
ELSE  \--ELSE就是@@TRANCOUNT的值为0，说明事务都已经全部提交了  
SELECT \* FROM dbo.STUDENT  
END CATCH  
END  
GO