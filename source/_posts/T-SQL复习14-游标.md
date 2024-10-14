---
title: T-SQL复习14--游标
tags:
  - SQL Server
  - T-SQL
  - SQL Server
excerpt: |2-

      
        
        
          <ul>
  <li><a href="#%e6%a6%82%e5%bf%b5">概念</a><ul>
  <li><a href="#%e6%b8%b8%e6%a0%87%e7%b1%bb%e5%9e%8b">游标类型：</a><ul>
  <li><a href="#%e5%8f%aa%
        
      
      
date: 2020-05-23 16:54:00
---

*   [概念](#%e6%a6%82%e5%bf%b5)
    *   [游标类型：](#%e6%b8%b8%e6%a0%87%e7%b1%bb%e5%9e%8b)
<!-- more -->
*   [概念](#%e6%a6%82%e5%bf%b5)
    *   [游标类型：](#%e6%b8%b8%e6%a0%87%e7%b1%bb%e5%9e%8b)
        *   [只进](#%e5%8f%aa%e8%bf%9b)
        *   [静态/不敏感](#%e9%9d%99%e6%80%81%e4%b8%8d%e6%95%8f%e6%84%9f)
        *   [动态](#%e5%8a%a8%e6%80%81)
        *   [键集](#%e9%94%ae%e9%9b%86)
*   [使用简单的游标](#%e4%bd%bf%e7%94%a8%e7%ae%80%e5%8d%95%e7%9a%84%e6%b8%b8%e6%a0%87)
*   [使用WHILE循环检索游标中的结果集](#%e4%bd%bf%e7%94%a8while%e5%be%aa%e7%8e%af%e6%a3%80%e7%b4%a2%e6%b8%b8%e6%a0%87%e4%b8%ad%e7%9a%84%e7%bb%93%e6%9e%9c%e9%9b%86)
*   [在存储过程中使用游标](#%e5%9c%a8%e5%ad%98%e5%82%a8%e8%bf%87%e7%a8%8b%e4%b8%ad%e4%bd%bf%e7%94%a8%e6%b8%b8%e6%a0%87)

# [](#概念 "概念")概念

SQL Server语句产生完整的结果集，但有时候最好对结果进行逐行处理，打开结果集中的游标，即可对结果集进行逐行处理。**游标主要用于存储过程、触发器、批处理中\***

游标通过以下方式来拓展结果处理：

*   允许定位在结果集中的特定行
*   从结果集的当前位置检索一行或一部分行
*   支持对结果集中当前位置的行进行数据修改
*   为由其他用户对显示在结果集中的数据库数据所作的更改提供不同级别的可见性支持
*   提供脚本、存储过程和触发器中用于访问结果集中的数据的TSQL语句

## [](#游标类型： "游标类型：")游标类型：

### [](#只进 "只进")只进

只进游标不支持滚动，它只支持游标从头到尾顺序提取。行只在从数据库中提取出来后才检索。对所有由当前用户发出或由其他用户提交、并影响结果集中的行的`INSERT、UPDATE、DELETE`语句，其效果在这些行从游标中提取时是可见的

### [](#静态-不敏感 "静态/不敏感")静态/不敏感

静态游标总是按照打开游标时的原样显示结果集，游标在打开期间，对数据库的`INSERT、UPDATE、DELETE`影响的行，在游标中都无法反应出来，除非关闭游标重新打开。静态游标在滚动期间很少或根本检测不到变化，但消耗的资源相对很少

### [](#动态 "动态")动态

动态游标与静态游标相对，当游标滚动时，动态游标反应结果集中所做的所有更变，所有用户做的全部`INSERT、UPDATE、DELETE`语句均通过游标可见

### [](#键集 "键集")键集

由键集驱动的游标由一组唯一标识符(键)控制，这组键称为键集，打开由剪辑驱动的游标时，该游标中各行的成员身份和顺序是固定的

# [](#使用简单的游标 "使用简单的游标")使用简单的游标

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

DECLARE CUR\_STU CURSOR \--定义游标  
FOR  
SELECT \* FROM dbo.STUDENT WHERE SEX='女'  
GO  
  
OPEN CUR\_STU   \--OPEN打开游标，然后通过执行DECLARE CURSOR语句的TSQL填充游标结果集  
FETCH NEXT FROM CUR\_STU  \--FETCH从游标表检索行，NEXT依次从结果集中第一行返回数据  
SELECT @@FETCH\_STATUS  \--查看@@FETCH\_STATUS的值，游标有数据，则状态值=0，如果游标数据被提取完之后这个状态值为-1  
CLOSE CUR\_STU  \--CLOSE关闭一个开放的游标，释放当前的结果集，必须对打开的游标使用CLOSE   
DEALLOCATE CUR\_STU  \--DEALLOCATE删除游标引用  

# [](#使用WHILE循环检索游标中的结果集 "使用WHILE循环检索游标中的结果集")使用WHILE循环检索游标中的结果集

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

  
DECLARE CUR\_STU CURSOR  
FOR  
SELECT \* FROM dbo.STUDENT WHERE SEX='男'  
GO  
  
OPEN CUR\_STU  
FETCH NEXT FROM CUR\_STU  
WHILE (SELECT @@FETCH\_STATUS)=0  
BEGIN  
 FETCH NEXT FROM CUR\_STU  
END  
CLOSE CUR\_STU  
DEALLOCATE CUR\_STU  

# [](#在存储过程中使用游标 "在存储过程中使用游标")在存储过程中使用游标

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
29  
30  
31  
32  

USE SCHOOL  
GO  
IF OBJECT\_ID('P\_UPDATE\_STU','P') IS NOT NULL  
DROP PROCEDURE P\_UPDATE\_STU  
GO  
CREATE PROCEDURE P\_UPDATE\_STU  
AS  
BEGIN  
 BEGIN TRY  
SET NOCOUNT ON \--关闭显示受影响行数消息  
  
DECLARE @ID BIGINT \--定义两个变量  
DECLARE @AGE INT  
  
DECLARE STU\_CUR CURSOR FOR  \--定义游标  
SELECT STU.ID,stu.AGE FROM dbo.GRADE GR INNER JOIN dbo.STUDENT STU ON GR.STUDENTID=STU.ID  
  
OPEN STU\_CUR  \--打开游标  
FETCH NEXT FROM STU\_CUR INTO @ID,@AGE  \--获取第一行赋值给两个变量  
WHILE @@FETCH\_STATUS=0  
BEGIN  
UPDATE dbo.STUDENT SET AGE=@AGE+1 WHERE ID\=@ID  
FETCH NEXT FROM STU\_CUR INTO @ID,@AGE  
END  
END TRY  
BEGIN CATCH  
SELECT ERROR\_NUMBER(),ERROR\_PROCEDURE(),ERROR\_MESSAGE()  
END CATCH  
  
CLOSE STU\_CUR  
DEALLOCATE STU\_CUR  
END