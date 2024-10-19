---
title: Redis集群
tags:
  - Redis
  - Redis
  - NOSQL
excerpt: |2-

      
        
        
          <ul>
  <li><a href="#主从复制">主从复制</a><ul>
  <li><a href="#简介">简介</a><ul>
  <li><a href="#单机redis的风险与问题">单机Redis的风险与问题</a></li>
  <li><a href="#解决方案">解
        
      
      
date: 2020-06-01 15:28:00
---

*   [主从复制](#主从复制)
    *   [简介](#简介)
        *   [单机Redis的风险与问题](#单机redis的风险与问题)
        *   [解](#解决方案)
<!-- more -->
- [主从复制](#主从复制)
  - [简介](#简介)
    - [单机Redis的风险与问题](#单机redis的风险与问题)
    - [解决方案](#解决方案)
    - [解析](#解析)
    - [主从复制的作用](#主从复制的作用)
  - [工作流程](#工作流程)
    - [建立连接阶段](#建立连接阶段)
    - [连接阶段(slave连master)](#连接阶段slave连master)
    - [授权阶段(master没密码可省略)](#授权阶段master没密码可省略)
    - [数据同步阶段](#数据同步阶段)
      - [同步阶段master说明](#同步阶段master说明)
      - [同步阶段slave说明](#同步阶段slave说明)
    - [命令传播阶段](#命令传播阶段)
    - [命令传播阶段的部分复制](#命令传播阶段的部分复制)
    - [数据同步+命令传播阶段工作流程](#数据同步命令传播阶段工作流程)
    - [心跳机制](#心跳机制)
      - [master心跳任务](#master心跳任务)
      - [心跳阶段注意事项](#心跳阶段注意事项)
  - [主从复制的完整工作流程图](#主从复制的完整工作流程图)
  - [常见问题](#常见问题)
    - [频繁的全量复制(1)](#频繁的全量复制1)
    - [频繁的全量复制(2)](#频繁的全量复制2)
    - [频繁的网络中断(1)](#频繁的网络中断1)
    - [频繁的网络中断(2)](#频繁的网络中断2)
    - [数据不一致](#数据不一致)
- [哨兵模式](#哨兵模式)
  - [哨兵](#哨兵)
  - [启动哨兵](#启动哨兵)
  - [sentinel.conf](#sentinelconf)
  - [工作原理](#工作原理)
    - [监控](#监控)
    - [通知](#通知)
    - [故障转移](#故障转移)
- [集群](#集群)
  - [现状问题](#现状问题)
  - [集群架构](#集群架构)
  - [集群的数据存储](#集群的数据存储)
  - [集群的内部通讯设计](#集群的内部通讯设计)
  - [集群搭建](#集群搭建)
  - [Cluster节点操作命令](#cluster节点操作命令)

# [](#主从复制 "主从复制")主从复制

## [](#简介 "简介")简介

互联网”三高”架构：高并发、高性能、高可用

_高可用：业界可用性目标5个9，即\*_99.999%**，即全年服务器宕机时长低于315秒，**约5.25分钟\*\*\*

### [](#单机Redis的风险与问题 "单机Redis的风险与问题")单机Redis的风险与问题

*   问题1：机器故障
    *   现象：硬盘故障、系统崩溃
    *   本质：数据丢失，很可能对业务造成灾难性打击
    *   结论：基本上会放弃使用Redis
*   问题2：容量瓶颈
    *   现象：内存不足，从16G升级到64G，从64G升级到128G，无限升级内存
    *   本质：穷！硬件条件跟不上
    *   结论：放弃使用Redis
*   结论：为了避免单点Redis服务器故障，准备多台服务器，互相连通，将数据复制从多个副本保存在不同的服务器上，**连接在一起**，并保证数据是**同步**的，即使有其中一台服务器宕机，其他服务器依然可以继续提供服务，实现Redis的高可用，同时实现数据`冗余备份`

### [](#解决方案 "解决方案")解决方案

![Redis主从复制.png](https://i.loli.net/2020/06/01/8YE1olWtHeyvsrN.png)

*   提供数据方：master
    *   主服务器、主节点、主库
    *   主客户端
*   接受数据方：slave
    *   从服务器、从节点、从库
    *   从客户端
*   需要解决的问题：数据同步
*   核心工作：master的数据复制到slave中

### [](#解析 "解析")解析

主从复制即将master中的数据即时、有效的复制到slave中

特征：一个master可以拥有多个slave，一个slave只对应一个master

职责：

*   master：
    *   写数据
    *   执行写操作时，将出现变化的数据自动同步到slave
    *   读数据（可忽略）
*   slave
    *   读数据
    *   写数据（禁止）

### [](#主从复制的作用 "主从复制的作用")主从复制的作用

*   读写分离：master写、slave读，提高服务器的读写负载能力
*   负载均衡：基于主从结构，配合读写分离，由slave分担master负载，并根据需求的变化，改变slave的数量，通过多个从节点分担数据读取负载，大大提高Redis服务器并发量与数据吞吐量
*   故障恢复：当master出现问题时，由slave提供服务，实现快速的故障恢复
*   数据冗余：实现数据热备份，是持久化之外的一种数据冗余方式
*   高可用基石：基于主从复制，构建哨兵与集群，实现Redis的高可用方案

## [](#工作流程 "工作流程")工作流程

![Redis主从复制流程.png](https://i.loli.net/2020/06/01/ibGzMmkRTAdXOIx.png)

*   主从复制过程大体可以分为3个阶段
    *   建立连接阶段（即准备阶段）
    *   数据同步阶段
    *   命令传播阶段

### [](#建立连接阶段 "建立连接阶段")建立连接阶段

建立slave到master的连接，使master能够识别slave，并保存slave端口号  
![Redis主从复制流程2.png](https://i.loli.net/2020/06/01/zbgBGNsdjCmt7a6.png)

1.  \[slave\]设置master的地址和端口，保存master信息
2.  \[slave\]建立socket连接
3.  \[slave\]发送ping命令(定时器任务)
4.  \[slave\]身份验证
5.  \[slave\]发送slave端口信息
6.  至此主从连接成功
7.  达到了以下状态：
    1.  slave：保存master的地址与端口
    2.  master：保存slave的端口
    3.  总体：master与slave之间创建了连接的socket

### [](#连接阶段-slave连master "连接阶段(slave连master)")连接阶段(slave连master)

*   方式一：客户端发送命令：`slaveof <masterip> <masterport>`
    
*   方式二：启动服务器参数：`redis-server -slaveof <masterip> <masterport>`
    
*   方式三：服务器配置：`slaveof <masterip> <masterport>`
    
*   slave系统信息
    
    *   `master_link_down_since_seconds`
    *   `masterhost`
    *   `masterport`
*   master系统信息
    
    *   `slave_listening_port`（多个）

### [](#授权阶段-master没密码可省略 "授权阶段(master没密码可省略)")授权阶段(master没密码可省略)

*   master配置文件设置密码
    
    ```bash
    requirepass <password>  
    ```
*   master客户端发送命令设置密码
    
    ```bash
    config get requirepass <password>  
    config get requirepass  
    ```
*   slave客户端发送命令设置密码
    
    ```bash
    auth <password>  
    ```
*   slave配置文件设置密码
    
    ```bash
    masterauth <password>  
    ```
*   启动客户端设置密码
    
    ```bash
    redis-cli -a <password>  
    ```

### [](#数据同步阶段 "数据同步阶段")数据同步阶段

![Redis主从复制数据同步阶段.png](https://i.loli.net/2020/06/01/U4ShNtHmXn3YZrM.png)

1.  \[slave\]请求同步数据
2.  \[master\]创建RDB同步数据
3.  \[slave\]恢复RDB同步数据
4.  \[slave\]请求部分同步数据
5.  \[slave\]恢复部分同步数据
6.  至此数据同步工作完成
7.  达到了以下状态
    1.  slave：具有master端全部数据，包含RDB过程接受的数据
    2.  master：保存slave当前数据同步的位置
    3.  总体：master与slave之间完成了数据克隆

#### [](#同步阶段master说明 "同步阶段master说明")同步阶段master说明

1.  如果master数据量巨大，数据同步阶段应避免流量高峰期，避免造成master阻塞，影响业务正常执行
2.  复制缓冲区大小设定不合理，会导致数据溢出，如进行全量复制周期太长，进行部分复制时发现数据已经存在丢失的情况，必须进行第二次全量复制，致使slave陷入死循环状态
    
    ```bash
    repl-backlog-size 1mb  
    ```
3.  master单机内存占用主机内存的比例不应过大，建议使用50%70%的内存，留下30%50%的内存用于执行bgsave命令和创建复制缓冲区

#### [](#同步阶段slave说明 "同步阶段slave说明")同步阶段slave说明

1.  为避免slave进行全量复制、部分复制时服务器响应阻塞或数据不同步，建议关闭此期间的对外服务
    
    ```bash
    slave-serve-stable-data yes|no  
    ```
2.  数据同步阶段，master发送给slave信息可以理解master是slave的一个客户端，主动向slave发送命令
3.  多个slave同时向master请求数据同步，master发送的RDB文件增多，如果master带宽不足，会对带宽造成巨大冲击，因此数据同步需要根据业务需求，适量错峰
4.  slave过多时，建议调整拓扑结构，由一主多从从结构变成树状结构，中间的节点既是master，也是slave。注意使用树状结构时，由于层级深度，导致深度越高的slave与顶层master间数据同步延迟较大，数据一致性变差，应谨慎选择

### [](#命令传播阶段 "命令传播阶段")命令传播阶段

*   当master数据库状态被修改时，导致主从服务器数据库状态不一致，此时需要让主从数据同步到一致的状态，同步的动作称为命令传播
*   master将接收到的数据变更命令发送给slave，slave接受命令后执行命令

### [](#命令传播阶段的部分复制 "命令传播阶段的部分复制")命令传播阶段的部分复制

*   命令传播阶段出现断网现象：
    
    *   网络闪断闪联 –> 忽略
    *   短时间网络中断 –> 部分复制
    *   长时间网络中断 –> 全量复制
*   部分复制的三个核心要素
    
    *   服务器的运行id(runid)
        *   概念：服务器运行Id，是每一台服务器每次运行的身份识别码，一台服务器多次运行可以生成多个运行id
        *   组成：运行id由40位字符组成，是一个随机的十六进制字符
        *   作用：运行id被用于在服务器间进行传输，识别身份。如果想两次操作均同一台服务器进行，必须每次操作携带对应的运行id，用于对方识别
        *   实现方式：运行id在每台服务器启动时自动生成的，master在首次连接slave时，会将自己的运行id发送给slave，slave保存此id，通过`info server`命令，可以查看节点的runid
    *   主服务器的复制积压缓冲区
        *   概念：复制缓冲区，又名复制积压缓冲区，是一个先进先出(FIFO)的队列，用于存储服务器执行过的命令，每次传播命令，master都会将传播的命令记录下来，并存储在复制缓冲区
            *   复制缓冲区默认数据存储空间大小是1M，由于存储空间大小是固定的，当入队元素的数量大于队列长度时，最先入队的元素会被弹出，而新元素会被放入队列
        *   由来：每台服务器启动时，如果开启有AOF或被连接成位master节点，即创建复制缓冲区
        *   作用：用于保存master收到的所有指令（仅影响数据变更的指令，例如set、select）
        *   数据来源：当master接收到主客户端的指令时，除了将指令执行，还会将指令存储到缓冲区中
        *   组成：偏移量和字节值
        *   工作原理
            *   通过offset区分不同的slave当前数据传播的差异
            *   master记录已发送的信息对应的offset
            *   slave记录已接受的信息对应的offset
    *   主从服务器的复制偏移量
        *   概念：一个数字，描述复制缓冲区中的指令字节位置
        *   分类：
            *   master复制偏移量：记录发送给所有slave的指令字节对应的位置（多个）
            *   slave复制偏移量：记录slave接受master发送过来的指令字节对应的位置（一个）
        *   数据来源：
            *   master端：发送一次记录一次
            *   slave端：接受一次记录一次
        *   作用：同步信息，比对master与slave的差异，当slave断线后，恢复数据使用

### [](#数据同步-命令传播阶段工作流程 "数据同步+命令传播阶段工作流程")数据同步+命令传播阶段工作流程

![Redis数据同步完整流程.png](https://i.loli.net/2020/06/01/aqjy9vknYB7rUxJ.png)

### [](#心跳机制 "心跳机制")心跳机制

进入命令传播阶段，master与slave间需要进行信息交换，使用心跳机制进行维护，实现双方连接保持在线

#### [](#master心跳任务 "master心跳任务")master心跳任务

*   指令：`PING`
*   周期：由`repl-ping-slave-period`决定，默认10秒
*   作用：判断slave是否在线
*   查询：`info replication` 获取slave最后一次连接时间间隔，lag项维持在0或1视为正常
    
    #### [](#slave心跳任务 "slave心跳任务")slave心跳任务
    
*   指令：`REPLCONF ACK {offset}`
*   周期：1秒
*   作用1：汇报slave自己的复制偏移量，获取最新的数据变更指令
*   作用2：判断master是否在线

#### [](#心跳阶段注意事项 "心跳阶段注意事项")心跳阶段注意事项

*   当slave多数掉线，或延迟过高时，master为保障数据稳定性，将拒绝所有信息同步操作
    
    ```bash
    min-slave-to-write 2  
    min-slave-max-lag 8  
    ```
    slave数量少于2个，或者所有slave的延迟都大于等于10秒时，强制关闭master写功能，停止数据同步
*   slave数量由slave发送`REPLCONF ACK`命令做确认
*   slave延迟由slave发送`REPLCONF ACK`命令做确认

## [](#主从复制的完整工作流程图 "主从复制的完整工作流程图")主从复制的完整工作流程图

![主从复制的完整工作流程.png](https://i.loli.net/2020/06/01/u2P1MQC4YUJEk8N.png)

## [](#常见问题 "常见问题")常见问题

### [](#频繁的全量复制-1 "频繁的全量复制(1)")频繁的全量复制(1)

伴随着系统的运行，master的数据量会越来越大，一旦master重启，runid将发生变化，会导致全部slave的全量复制操作

*   内部优化调整方案（redis自己操作的）
    *   master内部创建master_replid变量，使用runid相同的策略生成，长度41位，并发送给所有slave
    *   在master关闭时执行命令`shutdown save`，进行RDB持久化，将runid与offset保存到RDB文件中
        *   repl-id repl-offset
        *   通过redis-check-rdb命令可以查看该信息
    *   master重启后加载RDB文件，恢复数据，重启后RDB文件将保存的repl-id与repl-offset加载到内存中
        *   master_repl_id = repl master_repl_offset = repl-offset
        *   通过info命令可以查看该信息
*   作用：本机保存上次runid，重启后恢复该值，使所有slave认为还是之前的master

### [](#频繁的全量复制-2 "频繁的全量复制(2)")频繁的全量复制(2)

*   问题现象：网络环境不佳，出现网络中断，slave不提供服务
*   问题原因：复制缓冲区过小，断网后slave的offset越界，触发全量复制
*   最终结果：slave反复进行全量复制
*   解决方案：修复复制缓冲区大小
*   建议设置如下：
    *   测算从master到slave的重连平均时长second
    *   获取master平均每秒产生写命令数据总量`write_size_per_second`
    *   最有复制缓冲区空间 = 2 \* second \* write_size_per_second

### [](#频繁的网络中断-1 "频繁的网络中断(1)")频繁的网络中断(1)

*   问题现象：master的CPU占用过高或slave频繁断开联系
*   问题原因：
    *   slave每1秒发送`REPLCONF ACK`命令到`master`
    *   当slave接到了慢查询时（`keys *`、`hgetall`等），会大量占用CPU性能
    *   master每1秒调用复制定时函数`replicationCron()`，会对slave发现长时间没有进行响应
*   最终结果：
    *   master各种资源（输出缓冲区、带宽、连接等）被严重占用
*   解决方案：通过设置合理的超时时间，确认是否释放slave
    
    ```bash
    repl-timeout  
    ```
    该参数定义了超时时间的阙值（默认60秒），超过该值，释放slave

### [](#频繁的网络中断-2 "频繁的网络中断(2)")频繁的网络中断(2)

*   问题现象：slave与master连接断开
*   问题原因：
    *   master发送`ping`指令频度较低
    *   master设定超时时间较短
    *   ping指令在网络中存在丢包
*   解决方案：提高`ping`指令发送的频度
    
    ```bash
    repl-ping-slave-period  
    ```
    超时时间`repl-time`的时间至少是`ping`指令频度的5到10倍，否则slave很容易判定超时

### [](#数据不一致 "数据不一致")数据不一致

*   问题现象：多个slave获取相同数据不同步
*   问题原因：网络信息不同步，数据发送有延迟
*   解决方案：
    *   优化主从间的网络环境，通常放置在同一个机房部署，如使用阿里云等云服务器要注意此现象
    *   监控主从节点延迟（通过offset）判断，如果slave延迟过大，暂时屏蔽程序对该slave的数据访问
        
        ```bash
        slave-serve-stable-data yes|no  
        ```
        开启后仅响应info、slaveof等少数命令（慎用，除非对数据一致性要求很高）

# [](#哨兵模式 "哨兵模式")哨兵模式

主从复制模式中，如果master宕机了，需要做以下操作：

1.  将宕机的master下线
2.  找一个slave作为master
3.  通知所有的slave连接新的master
4.  启动新的master与slave

## [](#哨兵 "哨兵")哨兵

哨兵是一个分布式系统，用于对主从结构中的每台服务器进行监控，当出现故障时通过投票机制选择新的master并将所有slave连接到新的master

![image.png](https://i.loli.net/2020/06/01/3MagA7w2GtNWklb.png)

哨兵的作用：

*   监控
    *   不断的检查master和slave是否正常运行
    *   master存活检测、master与slave运行情况检测
*   通知（提醒）：当被监控的服务器出现问题后，向其他（哨兵间、客户端）发送通知
*   自动故障转移：断开master与slave连接，选取一个slave作为master，将其他slave连接到新的master，并告知客户端新的服务器地址

**哨兵也是一台redis服务器，只是不提供数据服务，通常哨兵配置数量为单数**

## [](#启动哨兵 "启动哨兵")启动哨兵

*   配置一拖二的主从结构
*   配置三个哨兵（配置相同，端口不同）
    *   参看`sentinel.conf`
*   启动哨兵
    
    ```bash
    redis-sentinel sentinel-端口号.conf  
    ```
*   启动顺序
    1.  启动master
    2.  启动slave
    3.  启动哨兵

## [](#sentinel-conf "sentinel.conf")sentinel.conf

*   `port 26379`：哨兵对外的端口
    
*   `dir /tmp`：哨兵的工作信息存储位置
    
*   `sentinel monitor mymaster 127.0.0.1 6379 2`
    
    > 设置哨兵监控的Master，其中mymaster是自己给master起的名字，可以自定义，后面使用的时候保持一致即可，最后面的2表示有多少个哨兵认为master挂了，就认定为挂了，一般设置(哨兵数量/2+1)
    
*   `sentinel down-after-milliseconds mymaster 30000`
    
    > master连接多长时间没响应就认为挂了
    
*   `sentinel parallel-syncs mymaster 1`
    
    > 进行新的master切换的时候，一次有多少个slave来进行同步数据，这个值越小，对服务器性能压力越小，速度越慢，相反，这个值越大，对服务器性能压力就越大，与之对应的速度就越快
    
*   `sentinel failover-timeout mymaster 1800000`
    
    > 在进行同步的时候，超过多长的时间算超时
    

## [](#工作原理 "工作原理")工作原理

### [](#监控 "监控")监控

用于同步各个节点的状态信息

*   获取各个sentinel的状态（是否在线）
*   获取master的状态
    *   master属性
        *   runid
        *   role：master
    *   各个slave的详细信息
        *   runid
        *   role：slave
        *   master_host、master_port
        *   offset
        *   …

1.  sentinelA在启动的时候，会先连接master，建立CMD连接，获取master信息，并在master的配置里新增自己的信息
2.  sentinelA在获取到master信息后，通过master信息得到master的slave信息，然后连接slave，获取slave信息
3.  sentinelB启动时连接master，获取master信息，这时候发现master已经有sentinelA连接过的记录，便与sentinelA建立起一条pub/sub通道(发布订阅通道)，再连接master对应的slave
4.  再有其他的sentinel启动连到master，一样执行的是sentinelB的步骤，就这样，每个sentinel都与其他的sentinel建立连接，形成一个小型组网

### [](#通知 "通知")通知

多个sentinel中的其中一个向master和slave发送一条hello信息，确定是否在线，并将这个是否在线的结果发布到sentinel自己的组网里，通知其他sentinel这个结果

### [](#故障转移 "故障转移")故障转移

1.  当通知阶段中有一个sentinelA发送了hello信息给master，但是master没做反应，这时候这个sentinelA就认为这个master出现故障，便将这个master的状态标记为`sdown`(主观下线)，并将这个消息发布到sentinel的pub/sub的通道中，通知其他sentinel
2.  其他sentinel街道sentinelA发布的消息，作为吃瓜群众赶紧也去发送hello信息给master，看看是不是真挂了。这时如果达到了`sentinel.conf`里配置的数量的sentinel认为master挂了，那所有的sentinel就都认为master是真挂了，便将这个master的状态标记为`odown`(客观下线)
3.  出现`odown`之后，所有sentinel就开会讨论谁去做故障转移这件事，sentinel发起投票，确定谁去做故障转移
4.  挑选出来做故障处理的sentinel要依照下面的规则挑选备选master
    1.  在线的（排除掉下线的）
    2.  响应快的（排除掉响应慢的）
    3.  与原master沟通密切的（排除掉与原master断开时间久的）
    4.  有限原则
        1.  优先级
        2.  offset
        3.  runid
5.  挑选出备选master之后，便向新的master发送`slaveof no one`的指令，将它升级到master，然后再向其他slave发送`slaveof 新masterIP 端口`，让其他slave全部指向新master

**原master重新上线之后，会变成slave去连接现在的master**

# [](#集群 "集群")集群

## [](#现状问题 "现状问题")现状问题

*   redis提供的服务OPS可以达到10w/秒，当前业务OPS已经达到20w/秒
*   内存单机容量达到256G，当前业务需求内存容量1T

**这时候就需要集群来解决上面的问题了**

## [](#集群架构 "集群架构")集群架构

集群就是使用网络将若干台计算机联通起来，并提供统一的管理方式，使其对外呈现单机的服务效果

集群作用：

*   分散单台服务器的访问压力，实现负载均衡
*   分散单台服务器的存储压力，实现可扩展性
*   降低单台服务器宕机带来的业务灾难

## [](#集群的数据存储 "集群的数据存储")集群的数据存储

*   通过算法设计，计算出key应该保存的位置
    *   通过`CRC16(key)`得到一个数值，然后与`16384`取模，得到这个key最终应该保存的位置
*   也就是说将所有的存储空间计划切割成16384份，每台主机保存一部分
    *   每份代表的是一个存储空间，不是存储一个key的保存空间
*   将key按照计算出的结果放到对应的存储空间
*   增强可扩展性

## [](#集群的内部通讯设计 "集群的内部通讯设计")集群的内部通讯设计

*   各个数据库相互通信，保存各个库中槽的编号数据
*   一次命中，直接返回
*   一次未命中，告知具体位置

## [](#集群搭建 "集群搭建")集群搭建

*   搭建一个三主三从的集群

cluster配置：

```bash
cluster-enabled yes  
cluster-config-file nodes-6379.conf  
cluster-node-timeout 100000  
```
大概的redis.conf配置如下：

```bash
port 6379  
daemonize yes  
dir /redis-all-in/data  
dbfilename dump-6379.rdb  
rdbcompression yes  
rdbchecksum yes  
save 10 2  
appendonly yes  
appendfsync always  
appendfilename appendonly-6379.aof  
databases 16  
cluster-enabled yes  
cluster-config-file nodes-6379.conf  
cluster-node-timeout 10000  
```
启动命令（redis 5.0以后的启动方式）：

```bash
redis-cli --cluster create 127.0.0.1:6379 127.0.0.1:6380 127.0.0.1:6381 127.0.0.1:6382 127.0.0.1:6383 127.0.0.1:6384 --cluster-replicas 1  
```
输入上面命令之后redis会自动分配槽位置与主从节点，确定没问题之后输入`yes`即可自动创建cluster集群

`--cluster-replicas`表示1个master连1个slave

## [](#Cluster节点操作命令 "Cluster节点操作命令")Cluster节点操作命令

*   查看集群节点信息：`cluster nodes`
*   进入一个从节点，切换其主节点：`cluster replicate <master-id>`
*   发现一个新节点，新增主节点：`cluster meet ip:port`
*   忽略一个没有slot的节点：`cluster forget <id>`
*   手动故障转移：`cluster failover`