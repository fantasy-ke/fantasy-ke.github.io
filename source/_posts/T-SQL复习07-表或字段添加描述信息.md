---
title: T-SQL复习07--表或字段添加描述信息
tags:
  - SQL Server
  - T-SQL
  - SQL Server
excerpt: |2-

      
        
        
          <h1 id="添加-更新-删除表级别的描述信息"><a href="#添加-更新-删除表级别的描述信息" class="headerlink" title="添加/更新/删除表级别的描述信息"></a>添加/更新/删除表级别的描述信息</h1><p>示例：</p>
  <figur
        
      
      
date: 2020-05-21 18:15:00
---

# [](#添加-更新-删除表级别的描述信息 "添加/更新/删除表级别的描述信息")添加/更新/删除表级别的描述信息

示例：
<!-- more -->
# [](#添加-更新-删除表级别的描述信息 "添加/更新/删除表级别的描述信息")添加/更新/删除表级别的描述信息

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

EXEC sys.sp\_addextendedproperty  \--添加表描述信息  
 \-- sys.sp\_updateextendedproperty  更新表属性信息  
 \-- sp\_dropextendedproperty  删除表属性信息   
 @name = N'Student',       \-- 描述的名称，可以设定为表名  
 @value = N'学生表',      \-- 描述内容  
 @level0type = N'SCHEMA',   \-- 固定语法  
 @level0name = N'dbo', \-- 架构  
 @level1type = N'TABLE',   \-- 类型  
 @level1name = N'STUDENT' \-- 要添加描述的表名  

# [](#添加-更新-删除字段描述信息 "添加/更新/删除字段描述信息")添加/更新/删除字段描述信息

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

EXEC sys.sp\_addextendedproperty  \--添加字段描述信息  
 \-- sys.sp\_updateextendedproperty  更新字段属性信息  
 \-- sp\_dropextendedproperty  删除字段属性信息   
 @name = N'ID',       \-- 描述的名称，可以设定为字段名称  
 @value = N'学生编号',      \-- 描述内容  
 @level0type = N'SCHEMA',   \-- 固定语法  
 @level0name = N'dbo', \-- 架构  
 @level1type = N'TABLE',   \-- 类型  
 @level1name = N'STUDENT', \-- 表名  
 @level2type = N'COLUMN',   \-- 列  
 @level2name = N'ID'  \-- 要添加描述的字段名  

# [](#查询表中的描述信息 "查询表中的描述信息")查询表中的描述信息

示例：

1  

SELECT \* FROM sys.extended\_properties a WHERE a.major\_id=OBJECT\_ID('\[dbo\].\[STUDENT\]')