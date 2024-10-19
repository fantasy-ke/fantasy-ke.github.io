---
title: Redis进阶
tags:
  - Redis
  - Redis
  - NOSQL
excerpt: |2-

      
        
        
          <ul>
  <li><a href="#net-core操作redis">.NET Core操作Redis</a></li>
  <li><a href="#持久化">持久化</a><ul>
  <li><a href="#持久化过程保存什么">持久化过程保存什么</a></li>
  <li
        
      
      
date: 2020-05-30 12:08:00
---

*   [.NET Core操作Redis](#net-core操作redis)
*   [持久化](#持久化)
    *   [持久化过程保存什么](#持久化过程保存什么)
<!-- more -->
- [.NET Core操作Redis](#net-core操作redis)
- [持久化](#持久化)
  - [持久化过程保存什么](#持久化过程保存什么)
  - [RDB](#rdb)
    - [RDB持久化的配置](#rdb持久化的配置)
    - [自动执行RDB](#自动执行rdb)
    - [自动执行RDB注意](#自动执行rdb注意)
    - [三种方案对比](#三种方案对比)
    - [RDB特殊启动形式](#rdb特殊启动形式)
    - [RDB优点](#rdb优点)
    - [RDB缺点](#rdb缺点)
  - [AOF](#aof)
    - [RDB存储的弊端](#rdb存储的弊端)
    - [概念](#概念)
    - [AOF写数据三种策略(appendfsync)](#aof写数据三种策略appendfsync)
    - [AOF配置](#aof配置)
    - [AOF重写](#aof重写)
      - [AOF重写作用](#aof重写作用)
      - [AOF重写规则](#aof重写规则)
      - [AOF重写方式](#aof重写方式)
      - [AOF自动重写方式](#aof自动重写方式)
      - [AOF重写流程](#aof重写流程)
  - [RDB与AOF区别](#rdb与aof区别)
  - [RDB与AOF怎么选](#rdb与aof怎么选)
- [事务](#事务)
  - [简介](#简介)
  - [基本操作](#基本操作)
  - [事务的工作流程](#事务的工作流程)
  - [事务的注意事项](#事务的注意事项)
  - [锁 – 基于特定条件的事务执行](#锁--基于特定条件的事务执行)
    - [乐观锁](#乐观锁)
      - [业务分析](#业务分析)
    - [分布式锁](#分布式锁)
      - [业务分析](#业务分析-1)
    - [死锁](#死锁)
      - [业务分析](#业务分析-2)
- [删除策略](#删除策略)
  - [Redis中的数据特征](#redis中的数据特征)
  - [定时删除](#定时删除)
  - [惰性删除](#惰性删除)
  - [定期删除](#定期删除)
  - [删除策略比对](#删除策略比对)
  - [逐出算法](#逐出算法)
    - [新数据进入检测](#新数据进入检测)
- [Redis.Conf](#redisconf)
  - [服务器基础配置](#服务器基础配置)
  - [日志配置](#日志配置)
  - [客户端配置](#客户端配置)
- [高级数据类型](#高级数据类型)
  - [Bitmaps](#bitmaps)
  - [HyperLogLog](#hyperloglog)
    - [说明](#说明)
  - [GEO](#geo)

# [](#NET-Core操作Redis ".NET Core操作Redis").NET Core操作Redis

创建控制台应用`RedisSample01`，通过`nuget`引入`CSRedisCore`

具体示例代码如下：

```bash
using System;  
using System.Linq;  
using System.Threading.Tasks;  
using CSRedis;  
  
namespace RedisSample01  
{  
    class Program  
    {  
        static async Task Main(string\[\] args)  
        {  
        
        var redis = new CSRedisClient("127.0.0.1:6379,defaultDatabase=0,prefix=ds_");  
        RedisHelper.Initialization(redis);  
        
        Console.WriteLine("↓↓↓↓↓ String Sample ↓↓↓↓↓");  
        await RedisHelper.SetAsync("name", "dimsum");  
        var name = await RedisHelper.GetAsync<string>("name");  
        Console.WriteLine($"name = {name}");  
        Console.WriteLine("↑↑↑↑↑ Sample End ↑↑↑↑↑↑");  
        Console.WriteLine();  
        
        
        Console.WriteLine("↓↓↓↓↓ List Sample ↓↓↓↓↓");  
        await RedisHelper.DelAsync("list1");  
        await RedisHelper.LPushAsync("list1", "a", "b", "c");  
        await RedisHelper.RPushAsync("list1", "x");  
        
        var list1 =await RedisHelper.LRangeAsync("list1", 0, -1);  
        Console.WriteLine($"list1 = {String.Join(',',list1)}");  
        var list1Length = await redis.LLenAsync("list1");  
        Console.WriteLine($"list1.length = {list1Length}");  
        Console.WriteLine("↑↑↑↑↑ Sample End ↑↑↑↑↑↑");  
        
        
        Console.WriteLine("↓↓↓↓↓ Hash Sample ↓↓↓↓↓");  
        
        await RedisHelper.HSetAsync("hash1", "name", "张三");  
        await RedisHelper.HSetAsync("hash1", "age", 19);  
        await RedisHelper.HSetAsync("hash1", "job", "C#");  
        
        var hash1 = await RedisHelper.HGetAllAsync("hash1");  
        Console.WriteLine($"hash1 = {string.Join(',', hash1.Select(x => $"{x.Key}:{x.Value}").ToArray())}");  
        Console.WriteLine("↑↑↑↑↑ Sample End ↑↑↑↑↑↑");  
        
        Console.WriteLine();  
        Console.WriteLine("====================");  
        Console.WriteLine("Sample done");  
        }  
    }  
}  
```
# [](#持久化 "持久化")持久化

*   持久化：利用永久性存储介质将数据进行保存，在特定的时间将保存的数据进行恢复的工作机制
*   为什么要持久化？防止数据的意外丢失，确保数据安全

## [](#持久化过程保存什么 "持久化过程保存什么")持久化过程保存什么

*   RDB：将当前数据状态进行保存，快照形式，存储数据结果，存储格式简单，关注点在数据
*   AOF：将数据的操作过程进行保存，日志形式，存储操作过程，存储格式复杂，关注点在数据的操作过程

## [](#RDB "RDB")RDB

*   操作命令：`save`
*   作用：手动执行一次保存操作

### [](#RDB持久化的配置 "RDB持久化的配置")RDB持久化的配置

**在配置文件中修改**

*   dbfilename dump.rdb
    *   说明：设置本地数据库文件名，默认为`dump.rdb`
    *   经验：通常设置为`dump-端口号.rdb`
*   dir
    *   说明：设置存储`.rdb`文件的路径
    *   经验：通常设置成存储空间较大的目录中，目录名称`data`
*   rdbcompression yes
    *   说明：设置存储至本地数据库时是否压缩数据，默认为`yes`，采用`LZF`压缩
    *   经验：通常默认为开启状态，如果设置为`no`，可以节省CPU运行时间，但会使存储的文件变大(巨大)
*   rdbchecksum yes
    *   说明：设置是否进行`RDB`文件格式校验，该校验过程在写文件和读文件过程均进行
    *   经验：通常默认为开启状态，如果设置为no，可以节约读写行过程约10%时间消耗，但是存储一定的数据损坏风险
*   stop-writes-on-bgsave-error yes
    *   说明：后台存储过程中如果出现错误现象，是否停止保存操作(这个配置项针对bgsave操作)
    *   经验：通常默认为开启状态
        
        ### [](#注意 "注意")注意
        
*   _save指令的执行会阻塞当前Redis服务器，知道当前RDB过程完成位置，有可能会造成长时间阻塞，线上环境不建议使用\*_
    
    ### [](#bgsave "bgsave")bgsave
    
*   操作命令：`bgsave`
*   作用：手动启动后台保存操作，但不是立即执行

**注意：bgsave命令是针对save阻塞问题做的优化，redis内部所有涉及到RDB操作都采用bgsave的方式，save命令可以放弃使用**  
![bgsave.png](https://i.loli.net/2020/05/30/GMkazeWvx2iwmYp.png)

### [](#自动执行RDB "自动执行RDB")自动执行RDB

*   配置：`save second changes`
*   作用：满足限定时间范围内key的变化数量达到指定数量，即进行持久化
*   参数：
    *   second：监控时间范围
    *   changes：监控`key`的变化量
*   位置：在conf文件中进行配置
*   示例：
    *   `save 900 1` -> 900秒内变化1个即触发RDB
    *   `save 300 10` -> 300秒内变化10个即触发RDB
    *   `save 60 10000` -> 60秒内变化10000个即触发RDB
*   经验：一般监控时间大，变化时间小

### [](#自动执行RDB注意 "自动执行RDB注意")自动执行RDB注意

*   `save`配置要根据实际业务情况进行设置，频度过高或过低都会出现性能问题，结果可能是灾难性的
*   `save`配置中对于`second`与`changes`设置通常具有互补对应关系，尽量不要设置成包含行关系
*   `save`配置启动后执行的是`bgsave`操作

### [](#三种方案对比 "三种方案对比")三种方案对比

方式

save指令

bgsave指令

save配置

读写

同步

异步

阻塞客户端指令

是

否

额外内存消耗

否

是

启动新进程

否

是

### [](#RDB特殊启动形式 "RDB特殊启动形式")RDB特殊启动形式

*   全量复制：（主从复制再说）
*   服务器运行过程中重启：`debug reload`
*   关闭服务器时指定保存数据：`shutdown save`

### [](#RDB优点 "RDB优点")RDB优点

*   `RDB`是一个紧凑压缩的二进制文件，存储效率较高
*   `RDB`内部存储的是redis在某个时间点的数据快照，非常适合用于数据备份，全量复制等场景
*   `RDB`恢复数据的速度要比`AOF`快很多
*   应用：服务器中每N小时执行`bgsave`备份，并将`RDB`文件拷贝到远程服务器中，用于灾难恢复

### [](#RDB缺点 "RDB缺点")RDB缺点

*   `RDB`方式无论是执行指令还是利用配置，无法做到实时持久化，具有较大的可能性丢失数据
*   `bgsave`指令每次运行要执行`fork`操作创建子进程，要牺牲掉一些性能
*   `Redis`的众多版本中未进行`RDB`文件格式的版本统一，有可能出现各版本服务之间数据格式无法兼容现象

## [](#AOF "AOF")AOF

### [](#RDB存储的弊端 "RDB存储的弊端")RDB存储的弊端

*   存储数据量较大，效率较低。基于快照思想，每次读写都是全部数据，当数据量巨大时，效率非常低
*   大数据量下的IO性能较低
*   基于`fork`创建子进程，内存产生额外消耗
*   宕机带来的数据丢失风险
    
    ### [](#解决思路 "解决思路")解决思路
    
*   不写全数据，仅记录部分数据
*   改记录数据为记录操作过程
*   对所有数据操作均进行记录，排除丢失数据的风险

### [](#概念 "概念")概念

*   AOP(append only file)持久化：以独立日志的方式记录每次写命令，重启时再重新执行`AOF`文件中命令，以达到恢复数据的目的，与`RDB`相比可以简单描述为**改记录数据为记录数据产生的过程**
*   `AOF`的主要作用是解决了数据持久化的实时性，目前已经是`Redis`持久化的主流方式

![image.png](https://i.loli.net/2020/05/30/795MA1npkrj46qC.png)

### [](#AOF写数据三种策略-appendfsync "AOF写数据三种策略(appendfsync)")AOF写数据三种策略(appendfsync)

*   always(每次)：每次写入操作均同步到`AOF`文件中，数据零误差，性能较差
*   everysec(每秒)：每秒将缓冲区的指令同步到`AOF`文件中，数据准确性较高，性能较高，在系统突然宕机的情况下丢失1秒内的数据。**建议使用，也是默认配置项**
*   no(系统控制)：由操作系统控制每次同步到`AOF`文件的周期，整体过程不可控

### [](#AOF配置 "AOF配置")AOF配置

*   配置：`appendonly yes|no`
    *   作用：是否开启`AOF`持久化功能，默认为不开启状态
    *   经验：开启
*   配置：`appendfsync always|everysec|no`
    *   作用：`AOF`写数据策略
    *   经验：`everysec`
*   配置：`appendfilename filename`
    *   作用：`AOF`持久化文件名，默认文件名为`appendonly.aof`
    *   经验：建议配置为`appendonly-端口号.aof`
*   配置：`dir`
    *   作用：`AOF`持久化文件保存路径
    *   经验：与`RDB`持久化文件保持一致即可

### [](#AOF重写 "AOF重写")AOF重写

随着命令不断写入`AOF`，文件会越来越大，为了解决这个问题，Redis引入了`AOF`重写机制压缩文件体积。`AOF`文件重写是将Redis进程内的数据转化为些命令同步到新`AOF`文件的过程。简单说就是将对同一个数据的若干条命令执行结果转化成最终结果数据对应的指令进行记录。

#### [](#AOF重写作用 "AOF重写作用")AOF重写作用

*   降低磁盘占用量，提高磁盘利用率
*   提高持久化效率，降低持久化写时间，提升IO性能
*   降低数据恢复用时，提高数据恢复效率

#### [](#AOF重写规则 "AOF重写规则")AOF重写规则

*   进程内已超时的数据不再写入文件
*   忽略无效指令，重写时使用进程内数据直接生成，这样新的AOF文件只保留最终数据的写入命令
    *   如：`del key1、hdel key2、srem key3、set key4 111、set key4 222`
*   对同一数据的多条写命令合并为同一条命令
    *   如：`push list1 a、lpush list1 b、lpush list1 c`可以转为：`lpush list1 a b c`
    *   为了防止数据量过大造成客户端缓冲区溢出，对`list`、`set`、`hash`、`zset`等类型，每条指令最多写入64个元素

#### [](#AOF重写方式 "AOF重写方式")AOF重写方式

*   手动重写：`bgrewriteaof`
*   自动重写
    
    ```bash
    auto-aof-rewrite-min-size size  
    auto-aof-rewrite-percentage percentage  
    ```

#### [](#AOF自动重写方式 "AOF自动重写方式")AOF自动重写方式

*   自动重写触发条件设置
    
    ```bash
    auto-aof-rewrite-min-size size --自动AOF的重写尺寸(默认值比较大)  
    auto-aof-rewrite-percentage percent  --自动重写的百分比  
    ```
*   自动重写触发对比参数（运行指令info persistence获取具体信息）
    
    ```bash
    aof_current_size  
    aof_base_size  
    ```
*   自动重写触发条件
    
    ```bash
    aof_current_size > auto_aof_rewrite_min_size  
    aof_current_size - aof_base_size / aof_base_size >= auto-aof-rewrite-percentage  
    ```
    #### [](#AOF非重写流程 "AOF非重写流程")AOF非重写流程
    
    ![image.png](https://i.loli.net/2020/05/31/Eb6D8x2mK5toUBn.png)

#### [](#AOF重写流程 "AOF重写流程")AOF重写流程

![image.png](https://i.loli.net/2020/05/31/TCr4WfDitezAhSo.png)

## [](#RDB与AOF区别 "RDB与AOF区别")RDB与AOF区别

持久方式

RDB

AOF

占用存储空间

小（数据级：压缩）

大（指令集：重写）

存储速度

慢

快

恢复速度

快

慢

数据安全性

会丢失数据

依据策略决定

消耗资源

高/重量级

低/轻量级

启动优先级

低

高

## [](#RDB与AOF怎么选 "RDB与AOF怎么选")RDB与AOF怎么选

*   对数据非常敏感，建议使用默认的`AOF`持久化方案
    *   `AOF`持久化策略使用`everysecond`，每秒钟`fsync`一次。该策略redis仍然可以保持很好的性能，当出现问题时，最多丢失0-1秒钟的数据
    *   注意：`AOF`文件存储体积较大，且恢复速度较慢
*   数据呈现具有有效性，建议使用`RDB`持久化方案
    *   数据可以良好的做到阶段内无丢失（该阶段是开发者或运维人员手工维护的），且恢复速度快，阶段点数据恢复通常采用`RDB`方案
    *   注意：利用`RDB`实现紧凑的数据持久化会使Redis性能降得很低
*   综合比对
    *   `RDB`与`AOF`的选择实际上是在做一种权衡，每种都有利弊
    *   如不能承受数分钟以内的数据丢失，对业务数据非常敏感，选用`AOF`
    *   如能承受数分钟以内的数据丢失，且追求大数据的恢复速度，选用`RDB`
    *   灾难恢复选用`AOF`
    *   双保险策略，同时开启`RDB`和`AOF`，重启后，Redis优先使用`AOF`来恢复数据，降低丢失数据的量

# [](#事务 "事务")事务

## [](#简介 "简介")简介

为什么要有事务：Redis执行指令过程中，多条连续执行的指令被干扰、打断、插队

Redis事务就是一个命令执行的队列，将一系列预定义命令包装成一个整体（一个队列）。当执行时，一次性按照添加顺序依次执行，中间不会被打断或干扰。

一个队伍中，一次性、顺序性、排他性的执行一系列命令

## [](#基本操作 "基本操作")基本操作

*   开启事务：`multi`
    *   作用：设定事务的开启位置，此指令执行后，后续的所有指令均加入到事务中
*   执行事务：`exec`
    *   作用：设定事务的结束位置，同时执行事务。与`multi`成对出现，成对使用
*   取消事务：`discard`
    *   作用：终止当前事务的定义，发生在`multi`之后，`exex`之前

**注意：加入事务的命令暂时进入到任务队列中，并没有立即执行，只有执行`exec`命令才开始执行**

## [](#事务的工作流程 "事务的工作流程")事务的工作流程

![image.png](https://i.loli.net/2020/05/31/TkjoWPLJsxivF3h.png)

## [](#事务的注意事项 "事务的注意事项")事务的注意事项

*   定义事务的过程中，命令格式输入错误怎么办？
    *   语法错误：指命令书写格式有误
    *   处理结果：如果定义的事务中所包含存在语法错误，整体事务中所有命令均不会执行，包括那些语法正确的命令
*   定义事务的过程中，命令执行出现错误怎么办？
    *   运行错误：指命令格式正确，但是无法正确的执行，例如对`list`进行`incr`操作
    *   处理结果：能够正确运行的命令会执行，运行错误的命令不会执行

**注意：已经执行的命令对应的数据不会自动回滚，需要程序员自己在代码中实现回滚**

*   手动进行事务回滚（无奈之举才用）
    *   记录操作过程中被影响的数据之前的状态
        *   单数据：`string`
        *   多数据：`hash`、`list`、`set`、`zset`
    *   设置指令恢复所有的被修改的项
        *   单数据：直接`set`（注意周边属性，例如时效）
        *   多数据：修改对应值或整体克隆复制

## [](#锁-–-基于特定条件的事务执行 "锁 – 基于特定条件的事务执行")锁 – 基于特定条件的事务执行

### [](#乐观锁 "乐观锁")乐观锁

#### [](#业务分析 "业务分析")业务分析

*   多个客户端都有可能同时操作同一组数据，并且该数据一旦被操作修改后，将不适用于继续操作
*   在操作之前锁定要操作的数据，一旦发生变化，终止当前操作
    
    #### [](#解决方案 "解决方案")解决方案
    
*   对`key`添加监视锁，在执行`exec`前如果`key`发生了变化，终止事务执行：`watch key1 [key2...]`
*   取消对所有`key`的监视：`unwatch`
*   `watch`命令在事务开启之前，然后在执行事务的`exec`的时候，会判断`watch`的值是否已经发生变化，如果没有则正常事务执行，如果发生了变化，则操作`watch`的命令失败

### [](#分布式锁 "分布式锁")分布式锁

#### [](#业务分析-1 "业务分析")业务分析

*   使用`watch`监控一个`key`有没有改变已经不能解决问题，此处要监控的是具体数据
*   虽然Redis是单线程，但是多个客户对同一个数据同时进行操作时，如何避免不被同时修改
    
    #### [](#解决方案-1 "解决方案")解决方案
    
*   设置`setnx`设置一个公共锁：`setnx lock-key value`
    *   利用`setnx`命令的返回值特征，有值则返回设置失败，无值则返回设置成功
    *   对于返回设置成功的，拥有控制权，进行下一步的具体业务操作
    *   对于返回设置失败的，不具有控制权，排队或等待
    *   操作完毕通过`del`操作释放锁

### [](#死锁 "死锁")死锁

#### [](#业务分析-2 "业务分析")业务分析

*   由于锁操作由用户控制加锁解锁，必定会存在加所有未解锁的风险
*   需要解锁操作不能仅依赖用户控制，系统级别要能给出对应的保底处理方案
    
    #### [](#解决方案-2 "解决方案")解决方案
    
*   使用`expire`为锁`key`添加时间限定，到时不释放锁，放弃锁
    
    ```bash
    expire lock-key second  
    pexpire lock-key milliseconds  
    ```
*   由于操作通常都是微妙或毫秒级，因此该锁定时间不宜设置过长，具体时间需要业务测试后确定
    *   例如：持有锁的操作最长执行时间127ms，最短执行时间7ms
    *   测试百万次最长执行时间对应命令的最大耗时，测试百万次网络延迟平均耗时
    *   锁时间设定推荐：`最大耗时*120% + 平均网络延迟*100%`
    *   如果业务最大耗时<<网络平均耗时，通常为2个数量级，取其中单个耗时较长即可

# [](#删除策略 "删除策略")删除策略

## [](#Redis中的数据特征 "Redis中的数据特征")Redis中的数据特征

*   Redis是一种内存及数据库，所有数据均存放在内存中，内存中的数据可以通过`TTL`指令获取其状态
    *   XX：具有时效性的数据
    *   -1：永久有效的数据
    *   -2：已经过期的数据 或 被删除的数据 或 未定义的数据

数据删除策略的目的：在内存占用与CPU占用之间寻找一种平衡，顾此失彼都会造成整体Redis性能的下降，甚至引发服务器宕机或内存泄露

## [](#定时删除 "定时删除")定时删除

创建一个定时器，当`key`设置由过期时间，且过期时间到达时，由定时器立即执行对键的删除操作

*   优点：解决内存，到时就删除，快速释放掉不必要的内存占用
*   缺点：CPU压力很大，无论CPU此时负载量多高，均占用CPU，会影响Redis服务器响应时间和指令吞吐量
*   总结：用处理器性能换存储空间（拿时间换空间）

## [](#惰性删除 "惰性删除")惰性删除

数据到达过期时间，不做处理，等下次访问该数据时再进行删除，并返回不存在

*   优点：节约CPU性能，发现必须删除的时候才删除
*   缺点：内存压力很大，出现长期占用内存的数据
*   总结：用存储空间换取处理器性能（拿空间换时间）

## [](#定期删除 "定期删除")定期删除

*   Redis启动服务器初始化时，读取配置server.hz的值，默认为10
    
*   每秒执行server.hz次`serverCron()->databaseCron()->activeExpireCycle()`
    
*   `activeExpireCycle()`对每个`expires[*]`逐一进行检测，每次执行250ms/server.hz
    
*   对某个`expires[*]`检测时，随机挑选W个key检测
    
    *   如果key超时，删除key
    *   如果一轮中删除的key的数量 > W\*25%，则循环该过程
    *   如果一轮中删除的key的数量 <= W_25%，检查下一个\`expires\[_\]\`，db0-db15循环
    *   W取值=ACTIVE_EXPIRE_CYCLE_LOOKUPS_PER_LOOP属性值
*   参数`current_db`用来记录`activeExpireCycle()`进入那个`expires[*]`执行
    
*   周期性轮询Redis库中的时效性数据，采用随机抽取的策略，利用过期数据占比的方式控制删除频度
    
*   特点1：CPU性能占用设置由峰值，检测频度可自定义设置
    
*   特点2：内存压力不是很大，长期占用内存的冷数据会被持续清理
    
*   总结：周期性抽查检查空间（随机抽查，重点抽查）
    

## [](#删除策略比对 "删除策略比对")删除策略比对

删除策略

特点1

特点2

总结

定期删除

节约内存，无占用

部分时段占用CPU资源，频度高

拿时间换空间

惰性删除

内存占用严重

延时执行，CPU利用率高

拿空间换时间

定期删除

内存定期随机清理

每秒花费固定的CPU资源维护内存

随机抽查，重点抽查

## [](#逐出算法 "逐出算法")逐出算法

### [](#新数据进入检测 "新数据进入检测")新数据进入检测

*   当新数据进入Redis时，如果内存不足怎么办？
    *   Redis使用内存存储数据，在执行每一个命令前，会调用`freeMemoryIfNeeded()`检测内存是否充足，如果内存不满足新加入数据的最低存储要求，Redis要临时删除一些数据为当前指令清除存储空间。清理数据的策略称为**逐出算法**
    *   注意：逐出算法的过程不是100%能够清理出足够的可使用的内存空间，如果不成功则反复执行。当对所有数据尝试完毕后，如果不能达到内存清理的要求，将出现错误信息
        
        ### [](#影响数据逐出的相关设置 "影响数据逐出的相关设置")影响数据逐出的相关设置
        
*   最大可使用内存
    
    ```bash
    maxmemory  
    ```
    占用物理内存的比例，默认值为0，表示不限制。生产环境中根据需求设定，通常设置在50%以上。
*   每次选取待删除数据的个数
    
    ```bash
    maxmemory-samples  
    ```
    选取数据时并不会全库扫描，导致严重的性能消耗，降低读写性能。因此采用随机获取数据的方式作为待检测删除数据
*   删除策略
    
    ```bash
    maxmemory-policy  
    ```
    达到最大内存后的，对被挑选出来的数据进行删除的策略
*   检测易失数据（可能会过期的数据集`server.db[i].expires`）
    1.  `volatile-lru`：挑选最近最少使用的数据淘汰（推荐）
    2.  `volatile-lfu`：挑选最近使用次数最少的数据淘汰
    3.  `volatile-ttl`：挑选将要过期的数据淘汰
    4.  `volatile-random`：任意选择数据淘汰
*   检测全库数据（所有数据集`server.db[i].dict`)
    1.  `allkeys-lru`：挑选最近最少使用的数据淘汰
    2.  `allkeys-lfu`：挑选最近使用次数最少的数据淘汰
    3.  `allkeys-random`：任意选择数据淘汰
*   不使用数据驱逐
    *   `no-enviction`(不驱逐)：禁止驱逐数据(redis4.0中默认策略)，会引发错误OOM(Out Of Memory)
*   配置方式
    
    ```bash
    maxmemory-policy volatile-lru  
    ```
    ### [](#数据逐出策略配置依据 "数据逐出策略配置依据")数据逐出策略配置依据
    
*   使用`INFO`命令输出监控信息，查询缓存`hit`和`miss`的次数，根据业务需求调优Redis配置

# [](#Redis-Conf "Redis.Conf")Redis.Conf

## [](#服务器基础配置 "服务器基础配置")服务器基础配置

*   设置服务器以守护进程的方式运行：`daemonize yes|no`
*   绑定主机地址：`bind 127.0.0.1`
*   设置服务器端口号：`port 6379`
*   设置数据库数量：`databases 16`

## [](#日志配置 "日志配置")日志配置

*   设置服务器以指定日志记录级别：`loglevel debug|verbose|notice|warning`
*   日志记录文件名：`logfile 端口号.log`

**注意：日志级别开发期设置为`verbose`，生产环境中配置为`notice`，简化日志输出量，降低写日志IO的频度**

## [](#客户端配置 "客户端配置")客户端配置

*   设置同一时间最大客户端连接数，默认无限制。当客户端连接到达上限，Redis会关闭新的连接
    
    ```bash
    maxclient 0  
    ```
*   客户端限制等待最长时长，达到最大值后关闭连接，如需要关闭该功能，设置为0
    
    ```bash
    timeout 300  
    ```
    ## [](#多服务器快捷配置 "多服务器快捷配置")多服务器快捷配置
    
*   导入并加载指定配置文件信息，用于快速创建Redis公共配置较多的Redis实例配置文件，便于维护
    
    ```bash
    include /path/server-端口号.conf  
    ```

# [](#高级数据类型 "高级数据类型")高级数据类型

## [](#Bitmaps "Bitmaps")Bitmaps

*   获取指定key对应偏移量上的bit值
    
    ```bash
    getbit key offset  
    ```
*   设置指定key对应偏移量上的bit值，value只能时1或0
    
    1  
    
    setbit key offset value  
    
*   对指定key按位进行交、并、非、异或操作，并将结果保存到destKey中
    
    ```bash
    bitop op destKey key1 \[key2...\]  
    // and：交  
    // or：并  
    // not：非  
    // xor：异或  
    ```
*   统计指定key中1的数量
    
    ```bash
    bitcount key \[start end\]  
    ```

## [](#HyperLogLog "HyperLogLog")HyperLogLog

*   基数：数据集去重后元素个数
    
*   HyperLogLog是用来做基数统计的，运用了LogLog的算法
    
*   添加数据：`pfadd key element [element...]`
    
*   统计数据：`pfcount key [key...]`
    
*   合并数据：`pfmerge destKey sourceKey [sourceKey...]`
    

### [](#说明 "说明")说明

*   只用于进行基数统计，不是集合，不保存数据，只记录数量而不是具体数量
*   核心是基数估计算法，最终数值存在一定误差
*   误差范围：基数估计的结果是一个带有0.81%标准错误的近似值
*   耗空间极小，每个hyperloglog key占用了12K的内存用于标记基数
*   `pfadd`命令不是一次性分配12K内存使用，会随着基数的增加内存主键增大
*   `pfmerge`命令合并后占用的存储空间为12K，无论合并之前数据量多大

## [](#GEO "GEO")GEO

*   存放地理位置的数据类型
    
    ### [](#基本操作-1 "基本操作")基本操作
    
*   添加坐标点：`geoadd key longitude latitude member [longitude latitude member...]`
*   获取坐标点：`geopos key member [member...]`
*   计算坐标点距离：`getdist key member1 member2 [unit]`(unit是单位，`m=米 km=千米`)
*   根据坐标求范围内的数据
    
    ```bash
    georadius key longitude latitude redius m|km|ft|mi \[withcoord\] \[withdist\] \[withhash\] \[count count\]  
    ```
*   根据点求范围内的数据
    
    ```bash
    georadiusbymember key member radius m|km|ft|mi \[withcoord\] \[withdist\] \[withhash\] \[count count\]  
    ```
*   获取指定点对应的坐标hash值
    
    ```bash
    geohash key member \[member...\]
    ```