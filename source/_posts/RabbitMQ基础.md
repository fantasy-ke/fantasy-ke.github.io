---
title: RabbitMQ基础
tags:
  - 消息队列
  - RabbitMQ
  - 消息队列
excerpt: |2-
  <ul>
  <li><a href="#主流消息中间件">主流消息中间件</a></li>
  <li><a href="#activemq">ActiveMQ</a></li>
  <li><a href="#kafka">Kafka</a></li>
  </ul>
 
date: 2020-05-26 22:36:00
---

*   [主流消息中间件](#主流消息中间件)
    *   [ActiveMQ](#activemq)
    *   [Kafka](#kafka)
<!-- more -->
- [主流消息中间件](#主流消息中间件)
  - [ActiveMQ](#activemq)
  - [Kafka](#kafka)
  - [RocketMQ](#rocketmq)
  - [RabbitMQ](#rabbitmq)
- [RabbitMQ核心概念及AMQP协议](#rabbitmq核心概念及amqp协议)
  - [为什么用RabbitMQ](#为什么用rabbitmq)
  - [RabbitMQ高性能的原因](#rabbitmq高性能的原因)
  - [什么是AMQP](#什么是amqp)
  - [AMQP核心概念](#amqp核心概念)
  - [RabbitMQ整体架构](#rabbitmq整体架构)
  - [RabbitMQ消息流转](#rabbitmq消息流转)
- [RabbitMQ常用命令](#rabbitmq常用命令)
  - [rabbitmq-server](#rabbitmq-server)
  - [rabbitmq-plugins](#rabbitmq-plugins)
- [消息生产与消费](#消息生产与消费)
  - [重要概念](#重要概念)
  - [创建项目](#创建项目)
  - [具体代码](#具体代码)
  - [运行测试](#运行测试)
- [Exchange–交换机](#exchange交换机)
  - [Exchange属性(交换机属性)](#exchange属性交换机属性)
  - [Direct Exchange](#direct-exchange)
    - [代码示例](#代码示例)
      - [创建项目](#创建项目-1)
      - [具体代码](#具体代码-1)
  - [Topic Exchange](#topic-exchange)
    - [代码示例](#代码示例-1)
      - [创建项目](#创建项目-2)
      - [具体代码](#具体代码-2)
  - [Fanout Exchange](#fanout-exchange)
    - [代码示例](#代码示例-2)
      - [创建项目](#创建项目-3)
      - [具体代码](#具体代码-3)
- [Binding–绑定](#binding绑定)
- [Queue–消息队列](#queue消息队列)
- [Message–消息](#message消息)
- [Virtual Hots–虚拟主机](#virtual-hots虚拟主机)

> 源码：[https://github.com/xiejiamiao/AllSamples](https://github.com/xiejiamiao/AllSamples)

# [](#主流消息中间件 "主流消息中间件")主流消息中间件

**衡量MQ指标：服务性能、数据存储、集群架构**

## [](#ActiveMQ "ActiveMQ")ActiveMQ

*   ActiveMQ是Apache出品，最流行的、能力最强劲的开源消息总线，并且它是一个完全支持JMS规范的消息中间件
*   其丰富的API、多种集群构建模式使得它称为业界老牌消息中间件，在中小型企业中应用广泛
*   性能比较一般，面对大数量高并发的情况容易出现堵塞、消息堆积过多导致延迟
*   适合并发量不高的场景

ActiveMQ的集群模式：  
![ActiveMQ集群模式.png](https://i.loli.net/2020/05/27/UmneOgI2GSRY7Kp.png)

## [](#Kafka "Kafka")Kafka

Kafka是LinkedIn开源的分布式发布-订阅消息系统，目前归属于Apache顶级项目。Kafka主要特点是基于Pull的模式来处理消息消费，追求高吞吐量(配置不高的单机服务器也能支撑每秒100K的吞吐数据量)，一开始的目的就是用于日志收集和传输。0.8版本开始支持复制，不支持事务，对消息的重复、丢失、错误没有严格要求，适合产生大量数据的互联网服务的数据收集业务

Kafka集群模式：  
![Kafka集群模式.png](https://i.loli.net/2020/05/27/K7ZvEM3S16XLDUr.png)

## [](#RocketMQ "RocketMQ")RocketMQ

RocketMQ是阿里开源的消息中间件，目前也已经孵化为Apache顶级项目，它是纯Java开发，具有高吞吐量、高可用性、适合大规模分布式系统应用的特点。RocketMQ思路起源于Kafka，它对消息的可靠传输和事务性做了优化，目前在阿里集团被广泛应用于交易、充值、流计算、消息推送、日志流式处理、binglog分布等场景

RocketMQ集群模式：  
![RocketMQ集群模式.png](https://i.loli.net/2020/05/27/SDQGuKW8sAz93RX.png)

## [](#RabbitMQ "RabbitMQ")RabbitMQ

RabbitMQ是使用Erlang语言开发的开源消息队列系统，基于AMQP协议来实现。AMQP的主要特征是面向消息、队列、路由（包括点对点和发布/订阅）、可靠性、安全。AMQP协议更多用在企业系统内，对数据一致性、稳定性和可靠性要求很高的场景，对性能和吞吐量的要求还在其次。

RabbitMQ高可用负载均衡集群模式：  
![RbbitMQ高可用负载均衡集群.png](https://i.loli.net/2020/05/27/fGiY93JrbTU1xI7.png)

# [](#RabbitMQ核心概念及AMQP协议 "RabbitMQ核心概念及AMQP协议")RabbitMQ核心概念及AMQP协议

**RabbitMQ**是一个开源的消息代理和队列服务器，用来通过普通协议在完全不同的应用之间共享数据，RabbitMQ是使用Erlang语言来编写的，并且RabbitMQ是基于AMQP协议的。

## [](#为什么用RabbitMQ "为什么用RabbitMQ")为什么用RabbitMQ

*   与`SpringAMQP`完美的整合、API丰富
*   集群模式丰富，表达式配置，HA模式，镜像队列模型
*   保证数据不丢失的前提下做到高可靠性、可用性

## [](#RabbitMQ高性能的原因 "RabbitMQ高性能的原因")RabbitMQ高性能的原因

**Erlang语言**最初在于交换机领域的架构模式，这使得RabbitMQ在Broker之间进行数据交互的性能是非常优秀的

**Erlang**的优点：有着与原生Socket一样的延迟

## [](#什么是AMQP "什么是AMQP")什么是AMQP

*   AMQP全称：Advance Message Queuing Protocol（高级消息队列协议）
*   AMQP定义：具有现代特征的二进制协议。是一个提供统一消息的应用层标准高级消息队列协议，是应用层协议的一个开放标准，为面向消息的中间件设计。
*   AMQP协议模型：  
    ![AMQP协议模型.png](https://i.loli.net/2020/05/27/KPqzXyw2lYTxs3Q.png)

## [](#AMQP核心概念 "AMQP核心概念")AMQP核心概念

*   **Server**：又称Broker，接受客户端的连接，实现AMQP实体服务
*   **Connection**：连接，应用程序域Broker的网络连接
*   **Channel**：网络信道，几乎所有的操作都在Channel中进行，Channel是进行消息读写的通道。客户端可建立多个Channel，每个Channel代表一个会话任务
*   **Message**：消息，服务器和应用程序之间传送的数据，有`Properties`和`Body`组成，Properties可以对消息进行修饰，比如消息的优先级、延迟等高级特性；Body则是消息体内容
*   **Virtual host**：虚拟主机，用于进行逻辑隔离，最上层的消息路由。一个Virtual host里面可以有若干个Exchange和Queue，同一个Virtual host里面不能有相同名称的Exchange和Queue
*   **Exchange**：交换机，接受消息，根据路由键转发消息到绑定的队列
*   **Binding**：Exchange和Queue之间的虚拟连接，bingding中可以包含routing key
*   **Routing key**：一个路由规则，虚拟机可用它来确定如何路由一个特定消息
*   **Queue**：也成为Message Queue，消息队列，保存消息并将它们转发给消费者

## [](#RabbitMQ整体架构 "RabbitMQ整体架构")RabbitMQ整体架构

![RabbitMQ整体架构.png](https://i.loli.net/2020/05/27/9o4DdunCB53hPyR.png)

## [](#RabbitMQ消息流转 "RabbitMQ消息流转")RabbitMQ消息流转

![RabbitMQ消息流转.png](https://i.loli.net/2020/05/27/6DIpaO721zVJFQn.png)

# [](#RabbitMQ常用命令 "RabbitMQ常用命令")RabbitMQ常用命令

## [](#rabbitmq-server "rabbitmq-server")rabbitmq-server

*   启动并后台运行：`rabbitmq-server start &`
*   停止服务：`rabbitmq-server stop`
    
    ## [](#rabbitmqctl "rabbitmqctl")rabbitmqctl
    
*   启动应用：`rabbitmqctl start_app`
*   停止应用：`rabbitmqctl stop_app`
*   节点状态：`rabbitmqctl status`
    
    ### [](#用户相关 "用户相关")用户相关
    
*   添加用户：`rabbitmqctl add_user username password`
*   列出所有用户：`rabbitmqctl list_users`
*   删除用户：`rabbitmqctl delete_user username`
*   清除用户权限：`rabbitmqctl clear_permissions -p vhostpath username`
*   列出用户权限：`rabbitmqctl list_user_permissions username`
*   修改密码：`rabbitmqctl change_password username newpassword`
*   设置用户权限：`rabbitmqctl set_permissions -p vhostpath username ".*" ".*" ".*"`
    
    ### [](#virtual-host相关 "virtual host相关")virtual host相关
    
*   创建虚拟主机：`rabbitmqctl add_vhost vhostpath`
*   列出所有虚拟主机：`rabbitmqctl list_vhosts`
*   列出虚拟主机上所有权限：`rabbitmqctl list_permissions -p vhostpath`
*   删除虚拟主机：`rabbitmqctl delete_vhost vhostpath`
    
    ### [](#queue相关 "queue相关")queue相关
    
*   查看所有队列信息：`rabbitmqctl list_queues`
*   清楚队列里的消息：`rabbitmqctl -p vhostpath purge_queue blue`
    
    ### [](#高级操作 "高级操作")高级操作
    
*   移除所有数据：`rabbitmqctl reset`(要在`rabbitmqctl stop_app`之后使用)
*   组成集群命令：`rabbitmqctl join_cluster <clusternode> [--ram]`
*   查看集群状态：`rabbitmqctl cluster_status`
*   修改集群节点的存储形式：`rabbitmqctl change_cluster_node_type disc | ram`
*   忘记节点(摘除节点)：`rabbitmqctl forget_cluster_node [--offline]`
*   修改节点名称：`rabbitmqctl rename_cluster_node oldnode1 newnode1 [oldnode2] [newnode2...]`

## [](#rabbitmq-plugins "rabbitmq-plugins")rabbitmq-plugins

*   列出当前所有插件：`rabbitmq-plugins list`
*   启动控制台：`rabbitmq-plugins enable rabbitmq_management`

# [](#消息生产与消费 "消息生产与消费")消息生产与消费

## [](#重要概念 "重要概念")重要概念

*   `ConnectionFactory`：获取连接工厂
*   `Connection`：一个连接
*   `Channel`：数据通信信道，可发送和接收消息
*   `Queue`：具体的消息存储队列
*   `Producer`：消息生产者
*   `Consumer`：消息消费者

## [](#创建项目 "创建项目")创建项目

创建两个控制台应用程序，名字分别为：

1  
2  

BasicConsumer  
BasicProducer  

在两个项目分别通过nuget引入`RabbitMQ.Client`

## [](#具体代码 "具体代码")具体代码

BasicProducer.Program代码：


```csharp
using System;  
using System.Text;  
using RabbitMQ.Client;  
  
namespace BasicProducer  
{  
 class Program  
 {  
 static void Main(string\[\] args)  
 {  
 // 1.创建一个ConnectionFactory  
 var connectionFactory = new ConnectionFactory  
 {  
 HostName = "127.0.0.1",  
 Port = 5672,  
 UserName = "admin",  
 Password = "admin",  
 VirtualHost = "/"  
 };  
 // 2.通过连接工厂创建连接  
 using (var connection = connectionFactory.CreateConnection())  
 {  
 // 3.通过connection创建Channel  
 var channel = connection.CreateModel();  
 // 4.通过channel发送数据  
 var message = "Hello RabbitMQ";  
 var body = Encoding.UTF8.GetBytes(message);  
 for (int i = 0; i < 5; i++)  
 {  
 channel.BasicPublish(exchange: "", routingKey: "test001", basicProperties: null, body: body);  
 }  
 }  
 Console.WriteLine("发送完毕");  
 }  
 }  
}  
```
BasicConsumer.Program代码

```csharp
using System;  
using System.Text;  
using RabbitMQ.Client;  
using RabbitMQ.Client.Events;  
  
namespace BasicConsumer  
{  
 class Program  
 {  
 static void Main(string\[\] args)  
 {  
 // 1.创建一个ConnectionFactory  
 var connectionFactory = new ConnectionFactory  
 {  
 HostName = "127.0.0.1",   
 Port = 5672,  
 UserName = "admin",   
 Password = "admin",  
 VirtualHost = "/"  
 };  
 // 2.通过连接工厂创建连接  
 using (var connection = connectionFactory.CreateConnection())  
 {  
 // 3.通过connection创建Channel  
 var channel = connection.CreateModel();  
 // 4.声明一个队列  
 var queue = channel.QueueDeclare(queue: "test001", durable: true, exclusive: false, autoDelete: true, arguments: null);  
 // 5.创建消费者  
 var consumer = new EventingBasicConsumer(channel);  
 // 6.设置Channel  
 channel.BasicConsume(queue: "test001", autoAck: true, consumer: consumer);  
 // 7.获取消息  
 consumer.Received += (model, ea) =>  
 {  
 var body = ea.Body;  
 var message = Encoding.UTF8.GetString(body.ToArray());  
 Console.WriteLine($"接收到消息:{message}");  
 };  
 Console.WriteLine("输入回车键键退出");  
 Console.ReadLine();  
 }  
 }  
 }  
}  
```
## [](#运行测试 "运行测试")运行测试

**注意：先运行Consumer，再运行Producer**，可以看到Consumer端接收到了Producer端发出的5条消息

# [](#Exchange–交换机 "Exchange–交换机")Exchange–交换机

Exchange：接受消息，并根据路由键转发消息所绑定的队列  
![Exchange.png](https://i.loli.net/2020/05/27/fXumPnWEpoLehdy.png)

## [](#Exchange属性-交换机属性 "Exchange属性(交换机属性)")Exchange属性(交换机属性)

*   Name：交换机名字
*   Type：交换机类型 `direct`、`topic`、`fanout`、`headers`
*   Durability：是否需要持久化，true为持久化
*   Auto Delete：当最后一个绑定到Exchange上的队列删除后，自动删除该Exchange
*   Internal：当前Exchange是否用于RabbitMQ内部使用，默认为false
*   Arguments：扩展参数，用于扩展AMQP协议自制定化使用

## [](#Direct-Exchange "Direct Exchange")Direct Exchange

所有发送到Direct Exchange的消息都会被转发到RouteKey中指定的Queue

**注意：Direct模式可以使用RabbitMQ自带的Exchange:default Exchange，所以不需要将Exchange进行任何绑定(bingding)操作，消息传递时，RouteKey必须完全匹配才会被队列接受，否则该消息会被抛弃**

![Direct Exchange.png](https://i.loli.net/2020/05/27/bYIA27sadEDihwx.png)

### [](#代码示例 "代码示例")代码示例

#### [](#创建项目-1 "创建项目")创建项目

创建两个控制台应用程序

```csharp
DirectExchange.Consumer  
DirectExchange.Producer  
```
再分别通过nuget引入`RabbitMQ.Client`

#### [](#具体代码-1 "具体代码")具体代码

DirectExchange.Producer

```csharp
using System;  
using System.Text;  
using RabbitMQ.Client;  
  
namespace DirectExchange.Producer  
{  
 class Program  
 {  
 static void Main(string\[\] args)  
 {  
 Console.WriteLine("\*\*\*\* Direct Exchange Producer Sample \*\*\*\*");  
  
 var connectionFactory = new ConnectionFactory()  
 {  
 HostName = "127.0.0.1",  
 Port = 5672,  
 UserName = "admin",  
 Password = "admin",  
 VirtualHost = "/",  
 AutomaticRecoveryEnabled = true,  
 NetworkRecoveryInterval = TimeSpan.FromSeconds(3)  
 };  
 using (var connection = connectionFactory.CreateConnection())  
 {  
 using (var channel = connection.CreateModel())  
 {  
 var exchangeName = "test_direct_exchange";  
 var routingKey = "test.direct";  
  
 var message = "Hello World RabbitMQ For Direct Exchange";  
 var body = Encoding.UTF8.GetBytes(message);  
  
 channel.BasicPublish(exchangeName, routingKey, null, body);  
 }  
 }  
  
 Console.WriteLine("消息发送完毕");  
 }  
 }  
}  
```
DirectExchange.Consumer

```csharp
using System;  
using System.Text;  
using RabbitMQ.Client;  
using RabbitMQ.Client.Events;  
  
namespace DirectExchange.Consumer  
{  
 class Program  
 {  
 static void Main(string\[\] args)  
 {  
 Console.WriteLine("\*\*\*\* Direct Exchange Consumer Sample \*\*\*\*");  
  
 var connectionFactory = new ConnectionFactory()  
 {  
 HostName = "127.0.0.1",  
 Port = 5672,  
 UserName = "admin",  
 Password = "admin",  
 VirtualHost = "/",  
 AutomaticRecoveryEnabled = true,  
 NetworkRecoveryInterval = TimeSpan.FromSeconds(3)  
 };  
  
 using var connection = connectionFactory.CreateConnection();  
 using var channel = connection.CreateModel();  
  
 var exchangeName = "test_direct_exchange";  
 var queueName = "test_direct_queue";  
 var routingKey = "test.direct";  
  
 // 声明一个交换机  
 channel.ExchangeDeclare(exchange: exchangeName, type: ExchangeType.Direct, durable: true, autoDelete: false, arguments: null);  
 // 声明一个队列  
 channel.QueueDeclare(queue: queueName, durable: true, exclusive: false, autoDelete: false, arguments: null);  
 // 建立一个绑定关系  
 channel.QueueBind(queue:queueName,exchange:exchangeName,routingKey:routingKey);  
  
 var consumer = new EventingBasicConsumer(channel);  
 channel.BasicConsume(queue: queueName, autoAck: true, consumer);  
 consumer.Received += (model, ea) =>  
 {  
 var body = ea.Body;  
 var message = Encoding.UTF8.GetString(body.ToArray());  
 Console.WriteLine($"接收到消息：{message}");  
 };  
  
 Console.WriteLine("输入回车键退出...");  
 Console.ReadLine();  
 }  
 }  
}  
```
## [](#Topic-Exchange "Topic Exchange")Topic Exchange

所有发送到Topic Exchange的消息都会被转发到所有关系RouteKey中指定Topic的Queue上

Exchange将RouteKey和某个Topic进行模糊匹配，此时队列需要绑定一个Topic

_注意：可以使用通配符进行模糊匹配_

```csharp
符号"#"匹配一个或多个词  
符号"\*"匹配不多不少一个词  
例如："log.#" 能够匹配到 "log.info.oa"  
 "log.\*" 只能够匹配到 "log.error"  
```
![Topic Exchange.png](https://i.loli.net/2020/05/27/J95AiKbfn4UutRa.png)

### [](#代码示例-1 "代码示例")代码示例

#### [](#创建项目-2 "创建项目")创建项目

创建两个控制台应用程序

TopicExchange.Consumer  
TopicExchange.Producer  

再分别通过nuget引入`RabbitMQ.Client`

#### [](#具体代码-2 "具体代码")具体代码

TopicExchange.Producer

```csharp
using System;  
using System.Text;  
using RabbitMQ.Client;  
  
namespace TopicExchange.Producer  
{  
 class Program  
 {  
 static void Main(string\[\] args)  
 {  
 Console.WriteLine("\*\*\*\* Topic Exchange Producer Sample \*\*\*\*");  
  
 var connectionFactory = new ConnectionFactory()  
 {  
 HostName = "127.0.0.1",  
 Port = 5672,  
 UserName = "admin",  
 Password = "admin",  
 VirtualHost = "/",  
 AutomaticRecoveryEnabled = true,  
 NetworkRecoveryInterval = TimeSpan.FromSeconds(3)  
 };  
 using var connection = connectionFactory.CreateConnection();  
 using var channel = connection.CreateModel();  
  
 var exchangeName = "test_topic_exchange";  
 var routingKey1 = "user.save";  
 var routingKey2 = "user.update";  
 var routingKey3 = "user.delete.abc";  
  
 var message = "Hello World RabbitMQ For Topic Exchange Message";  
 var body = Encoding.UTF8.GetBytes(message);  
  
 channel.BasicPublish(exchange: exchangeName, routingKey: routingKey1, basicProperties: null, body);  
 channel.BasicPublish(exchange: exchangeName, routingKey: routingKey2, basicProperties: null, body);  
 channel.BasicPublish(exchange: exchangeName, routingKey: routingKey3, basicProperties: null, body);  
   
 Console.WriteLine("消息发送完毕");  
 }  
 }  
}  
```

TopicExchange.Consumer

```csharp
using System;  
using System.Text;  
using RabbitMQ.Client;  
using RabbitMQ.Client.Events;  
  
namespace TopicExchange.Consumer  
{  
 class Program  
 {  
 static void Main(string\[\] args)  
 {  
 Console.WriteLine("\*\*\*\* Topic Exchange Consumer Sample \*\*\*\*");  
  
 var connectionFactory = new ConnectionFactory()  
 {  
 HostName = "127.0.0.1",  
 Port = 5672,  
 UserName = "admin",  
 Password = "admin",  
 VirtualHost = "/",  
 AutomaticRecoveryEnabled = true,  
 NetworkRecoveryInterval = TimeSpan.FromSeconds(3)  
 };  
 using var connection = connectionFactory.CreateConnection();  
 using var channel = connection.CreateModel();  
  
 var exchangeName = "test_topic_exchange";  
 var queueName = "test_topic_queue";  
 var routingKey = "user.\*";  
 // 声明交换机  
 channel.ExchangeDeclare(exchange: exchangeName, type: ExchangeType.Topic, durable: true, autoDelete: false, arguments: null);  
 // 声明队列  
 channel.QueueDeclare(queue: queueName, durable: false, exclusive: false, autoDelete: false, arguments: null);  
 // 建立绑定关系  
 channel.QueueBind(queue: queueName, exchange: exchangeName, routingKey: routingKey);  
  
 var consumer = new EventingBasicConsumer(channel);  
 channel.BasicConsume(queue: queueName, autoAck: true, consumer: consumer);  
 consumer.Received += (model, ea) =>  
 {  
 var body = ea.Body;  
 var message = Encoding.UTF8.GetString(body.ToArray());  
   
 Console.WriteLine($"接收到消息：{message}   RoutingKey={ea.RoutingKey}");  
 };  
  
 Console.WriteLine("输入回车退出...");  
 Console.ReadLine();  
 }  
 }  
}  
```
## [](#Fanout-Exchange "Fanout Exchange")Fanout Exchange

不处理路由键，只需要简单的队列绑定到交换机上，发送到交换机上的消息都会被转发到与该交换机绑定的所有队列上，**Fanout交换机转发消息是最快的**

![Fanout Exchange.png](https://i.loli.net/2020/05/27/VaGHXMh6YsboDJp.png)

### [](#代码示例-2 "代码示例")代码示例

#### [](#创建项目-3 "创建项目")创建项目

创建两个控制台应用程序

```csharp
FanoutExchange.Consumer  
FanoutExchange.Producer  
```
再分别通过nuget引入`RabbitMQ.Client`

#### [](#具体代码-3 "具体代码")具体代码

FanoutExchange.Producer

```csharp
using System;  
using System.Text;  
using RabbitMQ.Client;  
  
namespace FanoutExchange.Producer  
{  
 class Program  
 {  
 static void Main(string\[\] args)  
 {  
 Console.WriteLine("\*\*\*\* Fanout Exchange Producer Sample \*\*\*\*");  
  
 var connectionFactory = new ConnectionFactory()  
 {  
 HostName = "127.0.0.1",  
 Port = 5672,  
 UserName = "admin",  
 Password = "admin",  
 VirtualHost = "/",  
 AutomaticRecoveryEnabled = true,  
 NetworkRecoveryInterval = TimeSpan.FromSeconds(3)  
 };  
  
 using var connection = connectionFactory.CreateConnection();  
 using var channel = connection.CreateModel();  
  
 var exchangeName = "test_fanout_exchange";  
 var message = "Hello World RabbitMQ For Fanout Exchange";  
 var body = Encoding.UTF8.GetBytes(message);  
 channel.BasicPublish(exchange: exchangeName, routingKey: "", basicProperties: null, body: body);  
  
 Console.WriteLine("消息发送完毕");  
 }  
 }  
}  
```
FanoutExchange.Consumer

```csharp
using System;  
using System.Text;  
using RabbitMQ.Client;  
using RabbitMQ.Client.Events;  
  
namespace FanoutExchange.Consumer  
{  
 class Program  
 {  
 static void Main(string\[\] args)  
 {  
 Console.WriteLine("\*\*\*\* Fanout Exchange Consumer Sample \*\*\*\*");  
  
 var connectionFactory = new ConnectionFactory()  
 {  
 HostName = "127.0.0.1",  
 Port = 5672,  
 UserName = "admin",  
 Password = "admin",  
 VirtualHost = "/",  
 AutomaticRecoveryEnabled = true,  
 NetworkRecoveryInterval = TimeSpan.FromSeconds(3)  
 };  
 using var connection = connectionFactory.CreateConnection();  
 using var channel = connection.CreateModel();  
  
 var exchangeName = "test_fanout_exchange";  
 var queueName = "test_fanout_queue";  
 // 声明  
 channel.ExchangeDeclare(exchange: exchangeName, type: ExchangeType.Fanout, durable: true, autoDelete: false, arguments: null);  
 channel.QueueDeclare(queue: queueName, durable: true, exclusive: false, autoDelete: false, arguments: null);  
 channel.QueueBind(queue:queueName,exchange:exchangeName,"");  
  
 var consumer = new EventingBasicConsumer(channel);  
 channel.BasicConsume(queue: queueName, autoAck: true, consumer);  
 consumer.Received += (model, ea) =>  
 {  
 var body = ea.Body;  
 var message = Encoding.UTF8.GetString(body.ToArray());  
 Console.WriteLine($"接收到消息：{message}");  
 };  
 Console.WriteLine("输入回车退出...");  
 Console.ReadLine();  
 }  
 }  
}  
```
# [](#Binding–绑定 "Binding–绑定")Binding–绑定

*   Exchange和Exchange、Queue之间的连接关系
*   Binding中可以包含RoutingKey或参数

# [](#Queue–消息队列 "Queue–消息队列")Queue–消息队列

*   消息队列，实际存储消息数据
*   Durability：是否持久化，Durable：是，Transient：否
*   Auto Delete：如果是yes，则代表当最后一个监听被移除之后，该queue会被自动删除

# [](#Message–消息 "Message–消息")Message–消息

*   服务器和应用程序之间传送的数据
*   本质上就是一段数据，由Properties和Payload(Body)组成
*   常用属性：delivery mode、headers（自定义属性）
*   content_type、content_encoding、priority(优先级)
*   correlation_id（消息唯一ID）、reply_to（消息处理失败了返回哪个队列）、expiration（消息过期时间，多久时间没被消费就过期）、message_id
*   timestamp、type、user_id、app_id、cluster_id

# [](#Virtual-Hots–虚拟主机 "Virtual Hots–虚拟主机")Virtual Hots–虚拟主机

*   虚拟地址，用于进行逻辑隔离，最上层的消息路由