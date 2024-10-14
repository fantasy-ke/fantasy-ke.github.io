---
title: T-SQL复习12--CASE表达式
tags:
  - SQL Server
  - T-SQL
  - SQL Server
excerpt: >2-

      
        
        
          <ul>
  <li><a
  href="#case%e7%ae%80%e5%8d%95%e8%a1%a8%e8%be%be%e5%bc%8f">CASE简单表达式</a></li>

  <li><a href="#case%e6%90%9c%e7%b4%a2%e8%a1%a8%e8%be
        
      
      
date: 2020-05-23 15:48:00
---

*   [CASE简单表达式](#case%e7%ae%80%e5%8d%95%e8%a1%a8%e8%be%be%e5%bc%8f)
<!-- more -->
*   [CASE简单表达式](#case%e7%ae%80%e5%8d%95%e8%a1%a8%e8%be%be%e5%bc%8f)
*   [CASE搜索表达式](#case%e6%90%9c%e7%b4%a2%e8%a1%a8%e8%be%be%e5%bc%8f)
*   [在ORDER BY、GROUP BY中使用CASE表达式](#%e5%9c%a8order-bygroup-by%e4%b8%ad%e4%bd%bf%e7%94%a8case%e8%a1%a8%e8%be%be%e5%bc%8f)
*   [在UPDATE中使用CASE表达式](#%e5%9c%a8update%e4%b8%ad%e4%bd%bf%e7%94%a8case%e8%a1%a8%e8%be%be%e5%bc%8f)

# [](#CASE简单表达式 "CASE简单表达式")CASE简单表达式

`CASE`简单表达式仅用于同行检查，将第一个表达式与每个`WHEN`子句中的表达式进行等同行检查，以确定它们是否等效

示例：

1  
2  
3  
4  
5  
6  

SELECT NAME,AGE,  
(CASE SEX   
WHEN '男' THEN '是'   
ELSE '否'   
 END) AS 是否男性  
FROM dbo.STUDENT  

# [](#CASE搜索表达式 "CASE搜索表达式")CASE搜索表达式

`CASE`搜索表达式按照指定顺序对每个`WHEN`子句的**布尔表达式**进行计算

示例：

1  
2  
3  
4  
5  
6  
7  
8  

SELECT NAME,SEX,  
(  
CASE \--注意这里CASE后面没带字段名称  
WHEN AGE > '18' THEN '成年'  
ELSE '未成年'  
END  
) AS 是否成年  
FROM dbo.STUDENT  

# [](#在ORDER-BY、GROUP-BY中使用CASE表达式 "在ORDER BY、GROUP BY中使用CASE表达式")在ORDER BY、GROUP BY中使用CASE表达式

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

SELECT   
(  
 CASE   
 WHEN AGE>18 THEN '已成年'  
 ELSE '未成年'  
 END  
) AS 是否成年,COUNT(ID) AS 人数  
FROM dbo.STUDENT  
GROUP BY   
(  
 CASE   
 WHEN AGE>18 THEN '已成年'  
 ELSE '未成年'  
 END  
)  
ORDER BY 是否成年  

# [](#在UPDATE中使用CASE表达式 "在UPDATE中使用CASE表达式")在UPDATE中使用CASE表达式

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

UPDATE dbo.STUDENT SET  
AGE=  
(  
CASE NAME   
WHEN 'Hello' THEN 18  
WHEN 'world' THEN 11  
ELSE AGE  
end  
)