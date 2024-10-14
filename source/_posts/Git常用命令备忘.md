---
title: Git常用命令备忘
tags:
  - 版本控制
  - Git
excerpt: |2-

      
        
        
          <h1 id="本地仓库版本切换"><a href="#本地仓库版本切换" class="headerlink" title="本地仓库版本切换"></a>本地仓库版本切换</h1><ul>
  <li>查询当前本版以前的所有提交记录：<code>git log --pretty=o
        
      
      
date: 2020-06-03 16:02:00
---

# [](#本地仓库版本切换 "本地仓库版本切换")本地仓库版本切换

*   查询当前本版以前的所有提交记录：`git log --pretty=o`
<!-- more -->
# [](#本地仓库版本切换 "本地仓库版本切换")本地仓库版本切换

*   查询当前本版以前的所有提交记录：`git log --pretty=oneline`
*   查询所有版本记录：`git reflog`
*   代码切换到指定目录：`git reset --hard 版本号`

# [](#远程仓库操作 "远程仓库操作")远程仓库操作

*   推送本地仓库代码到远程仓库：`git push`
*   拉取远程仓库代码：`git pull`

# [](#分支常用命令 "分支常用命令")分支常用命令

*   查看分支：`git branch`
*   创建分支：`git branch 分支名`
*   切换分支：`git checkout 分支名`
*   创建再切换到新建的分支：`git checkout -b 分支名`
*   删除分支：`git branch -d 分支名` **不能删除当前正在使用的分支**
*   合并分支：`git merge 被合并的分支名`