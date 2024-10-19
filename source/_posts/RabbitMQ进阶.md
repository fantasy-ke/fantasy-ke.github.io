---
title: RabbitMQ进阶
tags:
  - 消息队列
  - RabbitMQ
  - 消息队列
excerpt: |2-

      
        
        
          <ul>
  <li><a href="#消息是如何保障100的投递成功">消息是如何保障100%的投递成功</a><ul>
  <li><a href="#生产端的可靠性投递">生产端的可靠性投递</a></li>
  <li><a href="#具体解决方案">具体解决方案</a></l
        
      
      
date: 2020-05-29 09:32:00
---

*   [消息是如何保障100%的投递成功](#消息是如何保障100的投递成功)
    *   [生产端的可靠性投递](#生产端的可靠性投递)
    *   [具体解决方案](#具体解决方案)
<!-- more -->
- [消息是如何保障100%的投递成功](#消息是如何保障100的投递成功)
  - [生产端的可靠性投递](#生产端的可靠性投递)
- [幂等性/怎么避免重复消费](#幂等性怎么避免重复消费)
  - [消费端-幂等性保障](#消费端-幂等性保障)
  - [具体解决方案](#具体解决方案)
- [Confirm确认消息](#confirm确认消息)
  - [代码示例](#代码示例)
    - [创建项目](#创建项目)
    - [具体代码](#具体代码)
- [Return返回消息](#return返回消息)
  - [代码示例](#代码示例-1)
    - [创建项目](#创建项目-1)
    - [具体代码](#具体代码-1)
- [自定义消费者](#自定义消费者)
  - [代码示例](#代码示例-2)
    - [创建项目](#创建项目-2)
    - [具体代码](#具体代码-2)
- [消息的限流](#消息的限流)
  - [代码示例](#代码示例-3)
    - [创建项目](#创建项目-3)
      - [具体代码](#具体代码-3)
- [消息的ACK与重回队列](#消息的ack与重回队列)
  - [消费端的手工ACK和NACK](#消费端的手工ack和nack)
  - [消费端的重回队列](#消费端的重回队列)
  - [代码示例](#代码示例-4)
    - [创建项目](#创建项目-4)
- [TTL消息](#ttl消息)
- [DLX–死信队列(Dead-Letter-Exchange)](#dlx死信队列dead-letter-exchange)
- [ASP.NET Core做消费者](#aspnet-core做消费者)
  - [代码示例](#代码示例-5)

> 源码：[https://github.com/xiejiamiao/AllSamples](https://github.com/xiejiamiao/AllSamples)

# [](#消息是如何保障100-的投递成功 "消息是如何保障100%的投递成功")消息是如何保障100%的投递成功

## [](#生产端的可靠性投递 "生产端的可靠性投递")生产端的可靠性投递

*   保障消息的成功发出
    
*   保障MQ节点的成功接受
    
*   发送端收到MQ节点(Broker)确认应答
    
*   完善的消息进行补偿机制
    
    ## [](#具体解决方案 "具体解决方案")具体解决方案
    
*   消息落库，对消息状态进行达标。即在发送消息的时候将消息持久化到数据库中，然后进行状态维护
    
    ![消息落库.png](https://i.loli.net/2020/05/27/JhjECxulDILTWQp.png)
    
    缺陷：需要对消息做持久化，这样在遇到高并发的场景，数据库压力大
    
*   消息的延迟投递，做二次确认，回调检查
    
    ![消息延迟投递.png](https://i.loli.net/2020/05/27/go7lXc49nNjUPHi.png)
    

# [](#幂等性-怎么避免重复消费 "幂等性/怎么避免重复消费")幂等性/怎么避免重复消费

幂等性：通俗的讲就是一个操作不管做多少次，结果永远都一样

## [](#消费端-幂等性保障 "消费端-幂等性保障")消费端-幂等性保障

消费端实现幂等性，就意味着消费端永远不会消费多次，即使消费端收到多条一样的消息

## [](#具体解决方案-1 "具体解决方案")具体解决方案

*   `唯一ID+指纹码`机制
    
    *   唯一ID+指纹码 机制，利用数据库主键去重
    *   SELECT COUNT(1) FROM T _ORDER WHERE ID=(唯一ID+指纹码)
    *   好处：实现简单
    *   坏处：高并发下有数据库写入的性能瓶颈
    *   解决方案：跟进ID进行分库分表进行算法路由
*   利用Redis的原子性去实现
    
    *   数据是否需要进行数据落库，如果落库的话，关键解决的问题是数据库和缓存如何做到原子性
    *   如果数据不落库，那么都存在缓存中，如何设置定时同步的策略

# [](#Confirm确认消息 "Confirm确认消息")Confirm确认消息

*   消息的确定，是指生产者投递消息后，如果Broker收到消息，则会给生产者一个应答
*   生产者进行接受应答，用来确定这条消息是否正常的发送给Broker，这种方法也是消息的可靠性投递的核心保障

![Confirm机制流程图.png](https://i.loli.net/2020/05/27/y92nhMRg1b7sTJ6.png)

## [](#代码示例 "代码示例")代码示例

### [](#创建项目 "创建项目")创建项目

创建两个控制台应用程序

```csharp
ComfirmSample.Consumer  
ComfirmSample.Producer  
```
再分别通过nuget引入`RabbitMQ.Client`

### [](#具体代码 "具体代码")具体代码

ComfirmSample.Producer

```csharp
using System;  
using System.Text;  
using RabbitMQ.Client;  
  
namespace ComfirmSample.Producer  
{  
 class Program  
 {  
 static void Main(string\[\] args)  
 {  
 Console.WriteLine("\*\*\*\*\*\* Confirm Sample Producer \*\*\*\*\*\*");  
  
 var connectionFactory = new ConnectionFactory()  
 {  
 HostName = "127.0.0.1",  
 Port = 5672,  
 UserName = "admin",  
 Password = "admin",  
 VirtualHost = "/"  
 };  
  
 using var connection = connectionFactory.CreateConnection();  
 using var channel = connection.CreateModel();  
  
 // 指定消息投递模式=Confirm  
 channel.ConfirmSelect();  
  
 var exchangeName = "test _confirm _exchange";  
 var routingKey = "confirm.save";  
  
 var message = "Hello RabbitMQ For Confirm Message";  
 var body = Encoding.UTF8.GetBytes(message);  
  
 channel.BasicPublish(exchangeName, routingKey, null, body);  
  
 // 添加确认监听  
 channel.BasicAcks += (sender, ea) =>  
 {  
 Console.WriteLine($"消息确认被MQ收到  DeliveryTag={ea.DeliveryTag}");  
 };  
 // no ack-ed  
 channel.BasicNacks += (sender, ea) =>  
 {  
 Console.WriteLine($"消息发送失败  DeliveryTag={ea.DeliveryTag}");  
 };  
  
 Console.WriteLine("消息发送完成");  
 Console.WriteLine("输入回车退出...");  
 Console.ReadLine();  
 }  
 }  
}  
```
ComfirmSample.Consumer

```csharp
using System;  
using System.Text;  
using RabbitMQ.Client;  
using RabbitMQ.Client.Events;  
  
namespace ComfirmSample.Consumer  
{  
 class Program  
 {  
 static void Main(string\[\] args)  
 {  
 Console.WriteLine("\*\*\*\*\*\* Confirm Sample Consumer \*\*\*\*\*\*");  
  
 var connectionFactory = new ConnectionFactory()  
 {  
 HostName = "127.0.0.1",  
 Port = 5672,  
 UserName = "admin",  
 Password = "admin",  
 VirtualHost = "/"  
 };  
  
 using var connection = connectionFactory.CreateConnection();  
 using var channel = connection.CreateModel();  
  
 var exchangeName = "test _confirm _exchange";  
 var queueName = "test _confirm _queue";  
 var routingKey = "confirm.save";  
  
 channel.ExchangeDeclare(exchangeName,ExchangeType.Direct,true,false,null);  
 channel.QueueDeclare(queueName, true, false, false, null);  
 channel.QueueBind(queueName, exchangeName, routingKey, null);  
  
 var consumer = new EventingBasicConsumer(channel);  
 channel.BasicConsume(queueName, true, consumer);  
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
# [](#Return返回消息 "Return返回消息")Return返回消息

*   Return Listener用于处理一些不可路由的消息
*   消息生产者通过指定一个`Exchange`和`RoutingKey`，把消息送达到某一个队列中去，然后消息监听者监听队列，进行消费处理操作
*   但是在某些情况下，如果我们在发送消息的时候，当前的`Exchange`不存在或者指定的路由key路由不到，这个时候如果我们需要监听这种不可达的消息，就要使用Return Listener
*   **Mandatory**：如果为true，则监听器会接受到路由不可达的消息，然后进行后续处理，如果为false，那么broker端会自动删除该消息

![image.png](https://i.loli.net/2020/05/27/wZe1qY3NxDL2QjS.png)

## [](#代码示例-1 "代码示例")代码示例

### [](#创建项目-1 "创建项目")创建项目

创建两个控制台应用程序

```csharp
ReturnListenerSample.Consumer  
ReturnListenerSample.Producer  
```
再分别通过nuget引入`RabbitMQ.Client`

### [](#具体代码-1 "具体代码")具体代码

ReturnListenerSample.Producer

```csharp
using System;  
using System.Text;  
using RabbitMQ.Client;  
  
namespace ReturnListenerSample.Producer  
{  
 class Program  
 {  
 static void Main(string\[\] args)  
 {  
 Console.WriteLine("\*\*\*\*\*\* Return Listener Producer \*\*\*\*\*\*");  
  
 var connectionFactory = new ConnectionFactory()  
 {  
 HostName = "127.0.0.1",  
 Port = 5672,  
 UserName = "admin",  
 Password = "admin",  
 VirtualHost = "/"  
 };  
 using var connection = connectionFactory.CreateConnection();  
 using var channel = connection.CreateModel();  
  
 var exchangeName = "return _listener _exchange";  
 var routingKey = "order.save";  
 var routingKeyError = "abc.save";  
  
 var message = "Hello RabbitMQ For ReturnListener";  
 var body = Encoding.UTF8.GetBytes(message);  
  
 channel.BasicPublish(exchangeName,routingKey,mandatory:true,null,body);  
 channel.BasicPublish(exchangeName, routingKeyError, mandatory: true, null, body);  
  
 channel.BasicReturn += (model, ea) =>  
 {  
 Console.WriteLine("---------- 消息发送失败 ----------");  
 Console.WriteLine($"ReplyCode = {ea.ReplyCode}");  
 Console.WriteLine($"ReplyText ={ea.ReplyText}");  
 Console.WriteLine($"Exchange = {ea.Exchange}");  
 Console.WriteLine($"RoutingKey = {ea.RoutingKey}");  
 };  
  
 Console.WriteLine("消息发送完成");  
 Console.WriteLine("输入回车退出...");  
 Console.ReadLine();  
  
 }  
 }  
}  
```
ReturnListenerSample.Consumer
```csharp
using System;  
using System.Text;  
using RabbitMQ.Client;  
using RabbitMQ.Client.Events;  
  
namespace ReturnListenerSample.Consumer  
{  
 class Program  
 {  
 static void Main(string\[\] args)  
 {  
 Console.WriteLine("\*\*\*\*\*\* Return Listener Consumer \*\*\*\*\*\*");  
  
 var connectionFactory = new ConnectionFactory()  
 {  
 HostName = "127.0.0.1",  
 Port = 5672,  
 UserName = "admin",  
 Password = "admin",  
 VirtualHost = "/"  
 };  
  
 using var connection = connectionFactory.CreateConnection();  
 using var channel = connection.CreateModel();  
  
 var exchangeName = "return _listener _exchange";  
 var routingKey = "order.#";  
 var queueName = "return _listener _queue";  
  
 channel.ExchangeDeclare(exchangeName,ExchangeType.Topic,true,false,null);  
 channel.QueueDeclare(queueName, true, false, false, null);  
 channel.QueueBind(queueName,exchangeName,routingKey,null);  
  
  
 var consumer = new EventingBasicConsumer(channel);  
 channel.BasicConsume(queueName, true, consumer);  
 consumer.Received += (model, ea) =>  
 {  
 var body = ea.Body;  
 var message = Encoding.UTF8.GetString(body.ToArray());  
 Console.WriteLine($"接收到消息  {message}");  
 };  
  
 Console.WriteLine("输入回车退出...");  
 Console.ReadLine();  
 }  
 }  
}  
```
# [](#自定义消费者 "自定义消费者")自定义消费者

自定义Consumer在日常工作中更常用，主要就是继承`DefaultBasicConsumer`这个类，然后`override HandleBasicDeliver()`这个方法即可

## [](#代码示例-2 "代码示例")代码示例

### [](#创建项目-2 "创建项目")创建项目

创建两个控制台应用程序

```csharp
CustomerConsumer.Consumer  
CustomerConsumer.Producer  
```
再分别通过nuget引入`RabbitMQ.Client`

在`CustomerConsumer.Consumer`中创建类`MyConsumer.cs`

### [](#具体代码-2 "具体代码")具体代码

CustomerConsumer.Producer.Program.cs

```csharp
using System;  
using System.Text;  
using RabbitMQ.Client;  
  
namespace CustomerConsumer.Producer  
{  
 class Program  
 {  
 static void Main(string\[\] args)  
 {  
 Console.WriteLine("\*\*\*\*\*\* Customer Consumer Producer \*\*\*\*\*\*");  
  
 var connectionFactory = new ConnectionFactory()  
 {  
 HostName = "127.0.0.1",  
 Port = 5672,  
 UserName = "admin",  
 Password = "admin",  
 VirtualHost = "/"  
 };  
  
 using var connection = connectionFactory.CreateConnection();  
 using var channel = connection.CreateModel();  
  
 var exchangeName = "customer _consumer _exchange";  
 var routingKey = "customer.save";  
  
 var message = "Hello RabbitMQ For Customer _Consumer";  
 var body = Encoding.UTF8.GetBytes(message);  
  
 for (int i = 0; i < 5; i++)  
 {  
 channel.BasicPublish(exchangeName, routingKey, true, null, body);  
 }  
   
  
 Console.WriteLine("消息发送完成");  
 }  
 }  
}  
```
CustomerConsumer.Consumer.MyConsumer.cs

```csharp
using System;  
using System.Text;  
using RabbitMQ.Client;  
  
namespace CustomerConsumer.Consumer  
{  
 public class MyConsumer : DefaultBasicConsumer  
 {  
 private readonly IModel  _model;  
  
 public MyConsumer(IModel model):base(model)  
 {  
  _model = model;  
 }  
  
 public override void HandleBasicDeliver(string consumerTag, ulong deliveryTag, bool redelivered, string exchange, string routingKey,  
 IBasicProperties properties, ReadOnlyMemory<byte> body)  
 {  
 Console.WriteLine($"consumerTag = {consumerTag}");  
 Console.WriteLine($"deliveryTag = {deliveryTag}");  
 Console.WriteLine($"redelivered = {redelivered}");  
 Console.WriteLine($"exchange = {exchange}");  
 Console.WriteLine($"routingKey = {routingKey}");  
 var message = Encoding.UTF8.GetString(body.ToArray());  
 Console.WriteLine($"Message = {message}");  
 Console.WriteLine("===========================================");  
 }  
 }  
}  
```
CustomerConsumer.Consumer.Program.cs

```csharp
using System;  
using RabbitMQ.Client;  
  
namespace CustomerConsumer.Consumer  
{  
 class Program  
 {  
 static void Main(string\[\] args)  
 {  
 Console.WriteLine("\*\*\*\*\*\* Customer Consumer Producer \*\*\*\*\*\*");  
  
 var connectionFactory = new ConnectionFactory()  
 {  
 HostName = "127.0.0.1",  
 Port = 5672,  
 UserName = "admin",  
 Password = "admin",  
 VirtualHost = "/"  
 };  
  
 using var connection = connectionFactory.CreateConnection();  
 using var channel = connection.CreateModel();  
  
 var exchangeName = "customer _consumer _exchange";  
 var routingKey = "customer.#";  
 var queueName = "customer _consumer _queue";  
  
 channel.ExchangeDeclare(exchangeName,ExchangeType.Topic,true,false,null);  
 channel.QueueDeclare(queueName, true, false, false, null);  
 channel.QueueBind(queueName, exchangeName, routingKey);  
  
 channel.BasicConsume(queueName, true, new MyConsumer(channel));  
 Console.WriteLine("输入回车退出...");  
 Console.ReadLine();  
 }  
 }  
}  
```
# [](#消息的限流 "消息的限流")消息的限流

为什么需要消费端限流：当消费端处理能力达不到生产端的生产速度，或当Broker中囤积了巨量消息，当消费端启动之后，巨量消息同一时间全部推送到消费端，会直接导致消费端崩溃，

RabbitMQ提供了一种Qos(服务质量保证)功能，即在非自动确认消息的前提下，如果一定数目的消息(通过基于consumer或者channel设置Qos的值)未被确认之前，不进行消费新的消息

主要操作方式就是调用`channel`上的`BasicQos`方法设置，其中参数意思如下：

*   prefetchSize：表示单挑消息的最大限制，一般设置为0表示对单挑消息的体积大小不做限制
    
*   prefetchCount：表示Broker最多同时给一个消费者推送多少条消息，一旦有这么多条消息没有ack，则该consumer将block掉，知道有消息ack，Broker才会继续推消息
    
*   global：true/false，是否将上面的设置应用于channel，简单点说就是上面限制是channel级别还是consumer级别
    
*   _注意：这里的设置一定是在调用channel.BasicConsume()的时候设置consumer的autoAck=false才有效，并且一般开发中都是将autoAck设置为false，然后在业务逻辑处理完之后再手动ack\*_
    

## [](#代码示例-3 "代码示例")代码示例

### [](#创建项目-3 "创建项目")创建项目

创建两个控制台应用程序

1  
2  

ConsumerLimit.Consumer  
ConsumerLimit.Producer  

再分别通过nuget引入`RabbitMQ.Client`

在`ConsumerLimit.Consumer`中创建类`MyConsumer.cs`

#### [](#具体代码-3 "具体代码")具体代码

ConsumerLimit.Producer.Program

```csharp
using System;  
using System.Text;  
using RabbitMQ.Client;  
  
namespace ConsumerLimit.Producer  
{  
 class Program  
 {  
 static void Main(string\[\] args)  
 {  
 Console.WriteLine("\*\*\*\*\*\*\*\*\*\* Consumer Limit Producer \*\*\*\*\*\*\*\*\*\*");  
  
 var connectionFactory = new ConnectionFactory()  
 {  
 HostName = "127.0.0.1",  
 Port = 5672,  
 UserName = "admin",  
 Password = "admin",  
 VirtualHost = "/"  
 };  
  
 using var connection = connectionFactory.CreateConnection();  
 using var channel = connection.CreateModel();  
  
 var exchangeName = "consumer _limit _exchange";  
 var routingKey = "order.saved";  
  
 var random = new Random();  
 for (var i = 0; i < 10; i++)  
 {  
 var message = $"Hello RabbitMQ For Consumer Limit {random.Next(1,100)}";  
 var body = Encoding.UTF8.GetBytes(message);  
 channel.BasicPublish(exchangeName, routingKey, null, body);  
 }  
  
 Console.WriteLine("消息发送完成");  
 Console.WriteLine("输入回车退出...");  
 Console.ReadLine();  
 }  
 }  
}  
```
ConsumerLimit.Consumer.MyConsumer

```csharp
using System;  
using System.Collections.Generic;  
using System.Text;  
using System.Threading;  
using RabbitMQ.Client;  
  
namespace ConsumerLimit.Consumer  
{  
 public class MyConsumer:DefaultBasicConsumer  
 {  
 private readonly IModel  _channel;  
  
 public MyConsumer(IModel channel):base(channel)  
 {  
  _channel = channel;  
 }  
  
 public override void HandleBasicDeliver(string consumerTag, ulong deliveryTag, bool redelivered, string exchange, string routingKey,  
 IBasicProperties properties, ReadOnlyMemory<byte> body)  
 {  
 Console.WriteLine();  
 Console.WriteLine("====================");  
 Console.WriteLine($"接收到消息：{Encoding.UTF8.GetString(body.ToArray())}");  
 Console.WriteLine($"consumerTag = {consumerTag}");  
 Console.WriteLine($"deliveryTag = {deliveryTag}");  
 Console.WriteLine($"redelivered = {redelivered}");  
 Console.WriteLine($"exchange = {exchange}");  
 Console.WriteLine($"routingKey = {routingKey}");  
 Console.WriteLine($"正在模拟业务操作...");  
 Thread.Sleep(2000);  
 Console.WriteLine("业务处理完毕");  
 _channel.BasicAck(deliveryTag,false);  
 Console.WriteLine("====================");  
 Console.WriteLine();  
 }  
 }  
}  
```
ConsumerLimit.Consumer.Program
```csharp
using System;  
using System.Text;  
using System.Threading;  
using RabbitMQ.Client;  
using RabbitMQ.Client.Events;  
  
namespace ConsumerLimit.Consumer  
{  
 class Program  
 {  
 static void Main(string\[\] args)  
 {  
 Console.WriteLine("\*\*\*\*\*\*\*\*\*\* Consumer Limit Consumer \*\*\*\*\*\*\*\*\*\*");  
  
 var connectionFactory = new ConnectionFactory()  
 {  
 HostName = "127.0.0.1",  
 Port = 5672,  
 UserName = "admin",  
 Password = "admin",  
 VirtualHost = "/"  
 };  
  
 using var connection = connectionFactory.CreateConnection();  
 using var channel = connection.CreateModel();  
  
 var exchangeName = "consumer _limit _exchange";  
 var routingKey = "order.#";  
 var queueName = "consumer _limit _queue";  
  
 channel.ExchangeDeclare(exchangeName, ExchangeType.Topic, true, false, null);  
 channel.QueueDeclare(queueName, true, false, false, null);  
 channel.QueueBind(queueName, exchangeName, routingKey, null);  
  
 channel.BasicConsume(queueName, false, new MyConsumer(channel));  
 channel.BasicQos(prefetchSize:0,prefetchCount:1,global:false);  
  
 Console.WriteLine("输入回车退出...");  
 Console.ReadLine();  
 }  
 }  
}  
```
# [](#消息的ACK与重回队列 "消息的ACK与重回队列")消息的ACK与重回队列

## [](#消费端的手工ACK和NACK "消费端的手工ACK和NACK")消费端的手工ACK和NACK

*   ACK=消息已经成功处理了
*   NACK=消息我处理失败了(Broker会进行重新投递)

使用场景：

*   消费端进行消费的时候，如果由于业务异常可以进行NACK，当尝试到足够的次数都一直处理失败，则返回记录日志后续做补偿，然后返回ACK
*   由于服务器宕机等严重问题，Broker即没收到ACK也没有收到NACK，那么Broker也会进行重新推送消息，这时如果处理完消息，返回ACK可以保障Broker知道消费端已经成功消费

## [](#消费端的重回队列 "消费端的重回队列")消费端的重回队列

*   消费端重回队列是为了对没有处理成功的消息，把消息重新会递给Broker
*   一般在实际应用中，都会关闭重回队列，也就是设置为False

## [](#代码示例-4 "代码示例")代码示例

### [](#创建项目-4 "创建项目")创建项目

创建两个控制台应用程序

```csharp

AckSample.Consumer  
AckSample.Producer  
``
再分别通过nuget引入`RabbitMQ.Client`

在`AckSample.Consumer`中创建类`MyConsumer.cs`

### [](#具体代码-4 "具体代码")具体代码

AckSample.Producer.Program

```csharp

using System;  
using System.Collections.Generic;  
using System.Text;  
using RabbitMQ.Client;  
  
namespace AckSample.Producer  
{  
 class Program  
 {  
 static void Main(string\[\] args)  
 {  
 Console.WriteLine("\*\*\*\*\*\*\*\*\*\* ACK Sample Producer \*\*\*\*\*\*\*\*\*\*");  
  
 var connectionFactory = new ConnectionFactory()  
 {  
 HostName = "127.0.0.1",  
 Port = 5672,  
 UserName = "admin",  
 Password = "admin",  
 VirtualHost = "/"  
 };  
  
 using var connection = connectionFactory.CreateConnection();  
 using var channel = connection.CreateModel();  
  
 var exchangeName = "ack _sample _exchange";  
 var routingKey = "order.saved";  
  
 var random =new Random();  
  
 for (var i = 0; i < 10; i++)  
 {  
 var properties = channel.CreateBasicProperties();  
 properties.DeliveryMode = 2;  
 properties.ContentEncoding = "UTF-8";  
 properties.Headers = new Dictionary<string, object>() {{"num", random.Next(0, 10).ToString()}};  
  
 var message = $"Hello RabbitMQ For ACK  ->  {i}";  
 var body = Encoding.UTF8.GetBytes(message);  
  
 channel.BasicPublish(exchangeName, routingKey, properties, body);  
 }  
  
 Console.WriteLine("输入回车退出...");  
 Console.ReadLine();  
 }  
 }  
}  
```

AckSample.Consumer.MyConsumer

```csharp
using System;  
using System.Collections.Generic;  
using System.Text;  
using System.Threading;  
using RabbitMQ.Client;  
using Console = System.Console;  
  
namespace AckSample.Consumer  
{  
 public class MyConsumer:DefaultBasicConsumer  
 {  
 private readonly IModel _channel;  
  
 public MyConsumer(IModel channel):base(channel)  
 {  
 _channel = channel;  
 }  
  
 public override void HandleBasicDeliver(string consumerTag, ulong deliveryTag, bool redelivered, string exchange, string routingKey,  
 IBasicProperties properties, ReadOnlyMemory<byte> body)  
 {  
 Console.WriteLine();  
 Console.WriteLine("====================");  
 var stringNum = properties.Headers\["num"\];  
 var byteNum = stringNum as byte\[\];  
 Console.WriteLine($"接收到消息  num={Encoding.UTF8.GetString(byteNum)}  {Encoding.UTF8.GetString(body.ToArray())}");  
 Console.WriteLine("......模拟业务操作......");  
 var num = int.Parse(Encoding.UTF8.GetString(byteNum));  
 if (num % 2 == 0)  
 {  
 Console.WriteLine("......业务处理失败......");  
 _channel.BasicNack(deliveryTag, false, true);  
 }  
 else  
 {  
 Console.WriteLine("......业务处理成功......");  
 _channel.BasicAck(deliveryTag,false);  
 }  
 Console.WriteLine("====================");  
 Console.WriteLine();  
 Thread.Sleep(2000);  
 }  
 }  
}  
```   
AckSample.Consumer.Program
```csharp
using System;  
using RabbitMQ.Client;  
  
namespace AckSample.Consumer  
{  
 class Program  
 {  
 static void Main(string\[\] args)  
 {  
 Console.WriteLine("\*\*\*\*\*\*\*\*\*\* ACK Sample Consumer \*\*\*\*\*\*\*\*\*\*");  
  
 var connectionFactory = new ConnectionFactory()  
 {  
 HostName = "127.0.0.1",  
 Port = 5672,  
 UserName = "admin",  
 Password = "admin",  
 VirtualHost = "/"  
 };  
  
 using var connection = connectionFactory.CreateConnection();  
 using var channel = connection.CreateModel();  
  
 var exchangeName = "ack _sample _exchange";  
 var queueName = "ack _sample _queue";  
 var routingKey = "order.saved";  
  
 channel.ExchangeDeclare(exchangeName, ExchangeType.Topic, true, false, null);  
 channel.QueueDeclare(queueName, true, false, false, null);  
 channel.QueueBind(queueName,exchangeName,routingKey);  
  
 channel.BasicConsume(queueName, false, new MyConsumer(channel));  
  
 Console.WriteLine("输入回车退出...");  
 Console.ReadLine();  
 }  
 }  
}  
```
# [](#TTL消息 "TTL消息")TTL消息

主要就是两点，TTL可以针对消息本身也可以针对消息队列

消息本身通过消息的`Properties`中设置`Expiration`属性来设置过期时间

Queue通过声明的时候在`arguments`字典参数里添加`x-message-ttl`这个键值对来设置进入该消息队列的消息有效期

# [](#DLX–死信队列-Dead-Letter-Exchange "DLX–死信队列(Dead-Letter-Exchange)")DLX–死信队列(Dead-Letter-Exchange)

利用DLX，当消息在一个队列变成死信(dead message)之后，它能被重新publish到另一个Exchange，这个Exchange就是DLX

消息编程死信的情况：

*   消息被拒绝(basic.reject/basic.nack)，并且requeue=false(不再重回队列)
*   消息TTL过期
*   队列达到最大长度

死信队列

*   DLX也是一个正常的Exchange，和一般的Exchange没有区别，它能在仍和的队列上被指定，实际上就是设置某个队列的属性
*   当这个队列中有死信时，RabbitMQ就会自动的将这个消息重新发布到设置的Exchange上去，进而被路由到另一个队列
*   可以监听这个队列中消息做相应的处理，这个特性可以弥补RabbitMQ以前支持的immediate参数的功能

死信队列设置：

*   首先需要设置死信队列的exchange和queue，然后进行绑定
    *   Exchange：dlx.exchange
    *   Queue：dlx.queue
    *   RoutingKey：#
*   然后进行正常声明交换机、队列、绑定，只不过需要在队列上的arguments字典上加一个键值对：`x-dead-letter-exchange:dlx.exchange`

# [](#ASP-NET-Core做消费者 "ASP.NET Core做消费者")ASP.NET Core做消费者

主要思路：创建一个`HostedService`服务类，继承`BackgroundService`，`override ExecuteAsync`方法，然后在里面做消息监听，最后在`Startup.ConfigureServices`中注册这个`HostedService`

## [](#代码示例-5 "代码示例")代码示例

```csharp
using System;  
using System.Collections.Generic;  
using System.Linq;  
using System.Threading;  
using System.Threading.Tasks;  
using Microsoft.Extensions.Hosting;  
using Microsoft.Extensions.Logging;  
using RabbitMQ.Client;  
using WebSiteConsumerSample.Consumers;  
  
// ReSharper disable UnusedMember.Global  
// ReSharper disable InconsistentNaming  
  
namespace WebSiteConsumerSample.BackgroundServices  
{  
 public class ConsumeRabbitMQHostedService : BackgroundService  
 {  
 private readonly ILogger<ConsumeRabbitMQHostedService>  _logger;  
 private readonly ILogger<SolutionMessageConsumer>  _consumerLogger;  
 private IConnection  _connection;  
 private IModel  _channel;  
  
 private string  _exchangeName;  
 private string  _queueName;  
 private string  _routingKey;  
  
 public ConsumeRabbitMQHostedService(ILogger<ConsumeRabbitMQHostedService> logger,ILogger<SolutionMessageConsumer> consumerLogger)  
 {  
  _logger = logger;  
  _consumerLogger = consumerLogger;  
 InitRabbitMq();  
 }  
  
 private void InitRabbitMq()  
 {  
 var connectionFactory = new ConnectionFactory()  
 {  
 HostName = "127.0.0.1",  
 Port = 5672,  
 UserName = "admin",  
 Password = "admin",  
 VirtualHost = "/"  
 };  
  
  _connection = connectionFactory.CreateConnection();  
  _channel =  _connection.CreateModel();  
  
 var exchangeName = "dimsum _solution _exchange";  
 var queueName = "dimsum _solution _queue";  
 var routingKey = "solution.#";  
  
  _exchangeName = exchangeName;  
  _queueName = queueName;  
  _routingKey = routingKey;  
  
 _channel.ExchangeDeclare(exchangeName, ExchangeType.Topic, true, false, null);  
 _channel.QueueDeclare(queueName, true, false, false, null);  
 _channel.QueueBind(queueName, exchangeName, routingKey, null);  
 }  
  
 protected override async Task ExecuteAsync(CancellationToken stoppingToken)  
 {  
 await Task.CompletedTask;  
 stoppingToken.ThrowIfCancellationRequested();  
 _channel.BasicConsume( _queueName, false, new SolutionMessageConsumer( _channel,  _consumerLogger));  
 }  
  
 public override void Dispose()  
 {  
 _channel.Dispose();  
  _connection.Dispose();  
 base.Dispose();  
 }  
 }  
}  
```
在`Startup.ConfigureServices`中添加

1  

services.AddHostedService<ConsumeRabbitMQHostedService>();