---
title: T-SQL复习16--函数
tags:
  - SQL Server
  - T-SQL
  - SQL Server
excerpt: |2-

      
        
        
          <h1 id="类型"><a href="#类型" class="headerlink" title="类型"></a>类型</h1><ul>
  <li>内置函数：SQL Server自带</li>
  <li>用户自定义函数：用户自己创建的函数</li>
  </ul>
  <h1 id="
        
      
      
date: 2020-05-24 11:42:00
---

# [](#类型 "类型")类型

*   内置函数：SQL Server自带
*   用户自定义函数：用户自己创建的函数
<!-- more -->
# [](#类型 "类型")类型

*   内置函数：SQL Server自带
*   用户自定义函数：用户自己创建的函数

# [](#常用的内置函数 "常用的内置函数")常用的内置函数

## [](#日期时间函数 "日期时间函数")日期时间函数

*   GETDATE() –返回当前日期时间
*   CURRENT\_TIMESTAMP –返回当前日期时间
*   YEAR() –返回日期中的年
*   MONTH() –返回日期中的月
*   DAY() –返回日期中的日
*   SELECT DATEPART() –返回日期中指定部分的日期，如SELECT DATEPART(QUARTER,GETDATE())
*   DATEADD –返回给日期添加指定部分的数量后的日期，如SELECT DATEADD(YEAR,2,GETDATE())
*   DATEDIFF –返回指定两个日期指定部分的差，如SELECT DATEDIFF(YEAR,GETDATE(),’1991-08-22 00:00:00’)

## [](#字符串函数 "字符串函数")字符串函数

*   LEFT() –从字符串左边开始返回指定个数的字符串，如:SELECT LEFT(‘张三’,1)
*   RIGHT() –从字符串右边开始返回指定个数的字符串，如:SELECT RIGHT(‘李四’,1)
*   LEN() –返回字符串的个数，如:SELECT LEN(‘王五’)
*   DATALENGTH() –返回字符串的字节数，如:SELECT DATALENGTH(‘赵六’)
*   LTRIM() –返回删除左边的空格的字符串，如:SELECT LTRIM(‘ 深田咏美’)
*   RTRIM() –返回删除右边的空格的字符串，如:SELECT RTRIM(‘波多野结衣 ‘)
*   LOWER() –将大写字符转成小写字符
*   UPPER() –将小写字符转为大写字符
*   SUBSTRING() –返回字符串中的一部分字符，如:SELECT SUBSTRING(‘张三李四王五赵六’,2,2)

## [](#其他函数 "其他函数")其他函数

*   CAST() –将一种数据类型转换为另一种数据类型，如:SELECT CAST(‘2016-12-1’ AS datetime2)
*   CONVERT() –将一种数据类型转换为另一种数据类型，如:SELECT CONVERT(datetime2,’2020-05-06’)  
    示例：
    
    1  
    
    SELECT SUM(CAST(AGE AS BIGINT)) FROM STUDENT  
    
*   ISNULL –使用指定的替换值替换NULL  
    示例：
    
    1  
    
    SELECT ISNULL(ADDRESS,'中国') FROM STUDENT  
    
*   NEWID() –创建uniqueidentifier类型的唯一值，如：SELECT NEWID()
*   ROUND() –返回一个数值，舍入到指定的长度，如:SELECT ROUND(123.1243,2),ROUND(123.566,0,1),ROUND(123.456,-2,1)

# [](#用户自定义函数 "用户自定义函数")用户自定义函数

SQL Server用户定义函数时接受参数、执行操作(例如复杂计算)并将操作解雇以值得形式返回得例程。返回值可以是单个标量值或结果集。用户定义函数不能用于执行修改数据库状态操作

使用用户定义函数的优点：

*   可重复使用
*   执行速度更快
*   减少网络流量

函数类型：  
标量函数：返回单个值  
表值函数：用户定义表值函数返回`TABLE`数据类型

## [](#标量函数 "标量函数")标量函数

### [](#创建 "创建")创建

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

USE SCHOOL  
GO  
IF OBJECT\_ID('FN\_AGE') IS NOT NULL  
DROP FUNCTION FN\_AGE  
GO  
CREATE FUNCTION FN\_AGE  
(@NAME VARCHAR(10))  \--定义输入参数及数据类型  
RETURNS INT  \--定义返回值数据类型  
AS  
BEGIN  
 DECLARE @AGE INT  
SELECT @AGE=Age FROM dbo.STUDENT WHERE NAME\=@NAME  
  
IF @AGE IS NULL  
SET @AGE=0  
  
RETURN @AGE \--指定返回值变量  
END  
GO  

### [](#调用 "调用")调用

示例：

1  

SELECT dbo.FN\_AGE('JAME') \--必须加上所属架构dbo，否则会提示：不是可以识别的函数名称  

## [](#表值函数 "表值函数")表值函数

### [](#创建-1 "创建")创建

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
IF OBJECT\_ID('FN\_TABLE') IS NOT NULL  
DROP FUNCTION FN\_TABLE  
GO  
CREATE FUNCTION FN\_TABLE  
(@ID INT)  \--定义输入参数及数据类型  
RETURNS TABLE \--返回类型为TABLE  
AS  
RETURN  \--直接用RETURN，不能使用BEGIN...END块  
(  \--必须使用括号  
SELECT NAME,Age FROM dbo.STUDENT WHERE ID\=@ID  
)  
GO  

### [](#调用-1 "调用")调用

示例：

1  

SELECT \* FROM dbo.FN\_TABLE(3)