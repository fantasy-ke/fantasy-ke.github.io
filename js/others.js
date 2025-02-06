/*
* 一些自定义的其他 JS 函数
**/

// 随机跳转到博客中的一篇文章

console.log(' %c Fantasyke‘ke %c ' + '5.0.0' + ' %c https://blog.fantasyke.cn/', 'background:#35495e ; padding: 1px; border-radius: 3px 0 0 3px;  color: #fff', 'background:#ff9a9a ; padding: 1px; border-radius: 0 3px 3px 0;  color: #fff', 'background:unset ; padding: 1px; border-radius: 0 3px 3px 0;  color: #fff')

function randomPost() {
    fetch('/sitemap_index.xml')
        .then(res => res.text())
        .then(str => (new window.DOMParser()).parseFromString(str, "text/xml"))
        .then(data => {
            let ls = data.querySelectorAll('url loc');
            while (true) {
                let url = ls[Math.floor(Math.random() * ls.length)].innerHTML;
                // 去掉末尾的 .html
                url = url.replace(/\index.html$/, '');
                // 确保 URL 包含 /posts/ 路径
                if (url.includes('/posts/') && location.href !== url) {
                    location.href = url;
                    return;
                }
            }
        });
}

// 顶部导航栏的显示与隐藏
document.addEventListener('pjax:complete', tonav);
document.addEventListener('DOMContentLoaded', tonav);
//响应pjax
function tonav() {
    var nameContainer = document.querySelector("#nav #name-container");
    var menusItems = document.querySelector("#nav .menus_items");
    var position = $(window).scrollTop();

    $(window).scroll(function () {
        var scroll = $(window).scrollTop();

        if (scroll > position + 5) {
            nameContainer.classList.add("visible");
            menusItems.classList.remove("visible");
        } else if (scroll < position - 5) {
            nameContainer.classList.remove("visible");
            menusItems.classList.add("visible");
        }

        position = scroll;
    });

    // 初始化 page-name
    document.getElementById("page-name").innerText = document.title.split(" | LiuShen's Blog")[0];
}

// 切换表格的显示模式，夜间和白天模式
function switchPostChart() {
    let color = document.documentElement.getAttribute('data-theme') === 'light' ? '#4C4948' : 'rgba(255,255,255,0.7)'
    if (document.getElementById('posts-chart') && postsOption) {
        try {
            let postsOptionNew = postsOption
            postsOptionNew.title.textStyle.color = color
            postsOptionNew.xAxis.nameTextStyle.color = color
            postsOptionNew.yAxis.nameTextStyle.color = color
            postsOptionNew.xAxis.axisLabel.color = color
            postsOptionNew.yAxis.axisLabel.color = color
            postsOptionNew.xAxis.axisLine.lineStyle.color = color
            postsOptionNew.yAxis.axisLine.lineStyle.color = color
            postsOptionNew.series[0].markLine.data[0].label.color = color
            postsChart.setOption(postsOptionNew)
        } catch (error) {
            console.log(error)
        }
    }
    if (document.getElementById('tags-chart') && tagsOption) {
        try {
            let tagsOptionNew = tagsOption
            tagsOptionNew.title.textStyle.color = color
            tagsOptionNew.xAxis.nameTextStyle.color = color
            tagsOptionNew.yAxis.nameTextStyle.color = color
            tagsOptionNew.xAxis.axisLabel.color = color
            tagsOptionNew.yAxis.axisLabel.color = color
            tagsOptionNew.xAxis.axisLine.lineStyle.color = color
            tagsOptionNew.yAxis.axisLine.lineStyle.color = color
            tagsOptionNew.series[0].markLine.data[0].label.color = color
            tagsChart.setOption(tagsOptionNew)
        } catch (error) {
            console.log(error)
        }
    }
    if (document.getElementById('categories-chart') && categoriesOption) {
        try {
            let categoriesOptionNew = categoriesOption
            categoriesOptionNew.title.textStyle.color = color
            categoriesOptionNew.legend.textStyle.color = color
            if (!categoryParentFlag) { categoriesOptionNew.series[0].label.color = color }
            categoriesChart.setOption(categoriesOptionNew)
        } catch (error) {
            console.log(error)
        }
    }
}

// 切换夜间模式和白天模式
function switchNightMode() {
    document.querySelector('body').insertAdjacentHTML('beforeend', '<div class="Cuteen_DarkSky"><div class="Cuteen_DarkPlanet"></div></div>'),
        setTimeout(function () {
            document.querySelector('body').classList.contains('DarkMode') ? (document.querySelector('body').classList.remove('DarkMode'), localStorage.setItem('isDark', '0'), document.getElementById('modeicon').setAttribute('xlink:href', '#icon-moon')) : (document.querySelector('body').classList.add('DarkMode'), localStorage.setItem('isDark', '1'), document.getElementById('modeicon').setAttribute('xlink:href', '#icon-sun')),
                setTimeout(function () {
                    document.getElementsByClassName('Cuteen_DarkSky')[0].style.transition = 'opacity 3s';
                    document.getElementsByClassName('Cuteen_DarkSky')[0].style.opacity = '0';
                    setTimeout(function () {
                        document.getElementsByClassName('Cuteen_DarkSky')[0].remove();
                    }, 1e3);
                }, 2e3)
        })
    const nowMode = document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light'
    if (nowMode === 'light') {
        btf.activateDarkMode()
        btf.saveToLocal.set('theme', 'dark', 2)
        GLOBAL_CONFIG.Snackbar !== undefined && btf.snackbarShow(GLOBAL_CONFIG.Snackbar.day_to_night)
        document.getElementById('modeicon').setAttribute('xlink:href', '#icon-sun')
    } else {
        btf.activateLightMode()
        btf.saveToLocal.set('theme', 'light', 2)
        GLOBAL_CONFIG.Snackbar !== undefined && btf.snackbarShow(GLOBAL_CONFIG.Snackbar.night_to_day)
        document.querySelector('body').classList.add('DarkMode'), document.getElementById('modeicon').setAttribute('xlink:href', '#icon-moon')
    }
    // handle some cases
    typeof utterancesTheme === 'function' && utterancesTheme()
    typeof FB === 'object' && window.loadFBComment()
    window.DISQUS && document.getElementById('disqus_thread').children.length && setTimeout(() => window.disqusReset(), 200)
    switchPostChart()
}

// 切换全屏状态的函数
function toggleFullScreen() {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch((error) => {
            console.error(`Error attempting to enable full-screen mode: ${error.message} (${error.name})`);
        });
    } else {
        if (document.exitFullscreen) {
            document.exitFullscreen().catch((error) => {
                console.error(`Error attempting to exit full-screen mode: ${error.message} (${error.name})`);
            });
        }
    }
}

// 小猫的显示和隐藏
function toggleLive2dVisibility() {
    const live2dContainer = document.getElementById('live2d-widget');
    if (live2dContainer.style.display === 'block' || live2dContainer.style.display === '') {
        live2dContainer.style.display = 'none'; // 显示Live2D模型
    } else {
        live2dContainer.style.display = 'block'; // 隐藏Live2D模型
    }
}

//动态标题
var OriginTitile = document.title;
var titleTime;
document.addEventListener('visibilitychange', function () {
    if (document.hidden) {
        //离开当前页面时标签显示内容
        document.title = '👀跑哪里去了~';
        clearTimeout(titleTime);
    } else {
        //返回当前页面时标签显示内容
        document.title = '🐖抓到你啦～';
        //两秒后变回正常标题
        titleTime = setTimeout(function () {
            document.title = OriginTitile;
        }, 2000);
    }
});

// // 侧栏时间
// function loadDigitClock() {
//     var digitClockElement = document.getElementById("digit-clock");

//     // 检查 digit-clock 元素是否存在，并且是否已经包含 id 为 "clock" 的元素
//     if (digitClockElement && !digitClockElement.querySelector("#clock")) {
//         // 侧栏时间
//         var _time10 = Array.from(Array(10)).map((n, i) => i);
//         var _time6 = _time10.slice(0, 6);
//         var _time3 = _time10.slice(0, 3);
//         var _Structure = [
//             [_time3, _time10],
//             [_time6, _time10],
//             [_time6, _time10]
//         ];
//         var clock = document.createElement('div');
//         clock.id = 'clock';
        
//         digitClockElement.appendChild(clock);
//         var digitGroups = [];
//         _Structure.forEach(digits => {
//             var digitGroup = document.createElement('div');
//             digitGroup.classList.add('digit-group');
//             clock.appendChild(digitGroup);
//             digitGroups.push(digitGroup);
//             digits.forEach(digitList => {
//                 var digit = document.createElement('div');
//                 digit.classList.add('digit');
//                 digitList.forEach(n => {
//                     var ele = document.createElement('div');
//                     ele.classList.add('digit-number');
//                     ele.innerText = n;
//                     digit.appendChild(ele);
//                 });
//                 digitGroup.appendChild(digit);
//             });
//         });

//         requestAnimationFrame(update);

//         function update() {
//             requestAnimationFrame(update);
//             var date = new Date();
//             var time = [date.getHours(), date.getMinutes(), date.getSeconds()].
//                 map(n => `0${n}`.slice(-2).split('').map(e => +e)).
//                 reduce((p, n) => p.concat(n), []);
//             time.forEach((n, i) => {
//                 var digit = digitGroups[Math.floor(i * 0.5)].children[i % 2].children;
//                 Array.from(digit).forEach((e, i2) => e.classList[i2 === n ? 'add' : 'remove']('bright'));
//             });
//         }
//     }
// }

// umami 统计分析工具
//(function() {
//    var currentDomain = window.location.hostname;
//    if (currentDomain.includes('liushen.fun')) {
//        var script = document.createElement('script');
//        script.src = "https://um.xxx.fun/script.js"; // 这个需要你自己看着改改
//        script.setAttribute('data-website-id', '11111111111111111111111111111111111111');
//        script.async = true; // 将script的async属性设置为true，实现异步加载
//        document.head.appendChild(script);
//        console.log('========成功加载 [blog.liushen.fun] 统计分析工具代码========');
//    } else { // 比如本地调试，就不需要统计了，要不然会发现统计页面很多来自本地localhost
//        console.log('========当前网站不需要加载统计分析工具========');
//    }
//})();


// Fetch IP 地址信息
function fetchIpLocation() {
    // 尝试从 localStorage 中获取缓存数据
    const cachedData = localStorage.getItem('ipLocation');
    const cachedTime = localStorage.getItem('ipLocationTime');

    // 检查缓存是否存在且未过期（12小时 = 12 * 60 * 60 * 1000 毫秒）
    const now = Date.now();
    if (cachedData && cachedTime && (now - cachedTime < 12 * 60 * 60 * 1000)) {
        return Promise.resolve(JSON.parse(cachedData)); // 返回缓存数据
    }

    // 如果没有缓存或已过期，进行网络请求
    return fetch('https://api.nsmao.net/api/ip/query?key=Sti1GeJNxWrbfDcGvr3UuPMSBl')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            // 缓存请求结果和当前时间
            localStorage.setItem('ipLocation', JSON.stringify(data));
            localStorage.setItem('ipLocationTime', now.toString());
            return data;
        })
        .catch(error => {
            console.error('Error:', error);
            return null;
        });
}

// 计算两点之间的距离
function getDistance(e1, n1, e2, n2) {
    const R = 6371;
    const { sin, cos, asin, PI, hypot } = Math;
    let getPoint = (e, n) => {
        e *= PI / 180;
        n *= PI / 180;
        return { x: cos(n) * cos(e), y: cos(n) * sin(e), z: sin(n) };
    };

    let a = getPoint(e1, n1);
    let b = getPoint(e2, n2);
    let c = hypot(a.x - b.x, a.y - b.y, a.z - b.z);
    let r = asin(c / 2) * 2 * R;
    return Math.round(r);
}

// 显示欢迎信息
function showWelcome(ipLocation) {
    if (!ipLocation || !ipLocation.data) {
        console.error('ipLocation data is not available.');
        return;
    }

    let dist = getDistance(113.48, 23.18, ipLocation.data.lng, ipLocation.data.lat);
    let pos = ipLocation.data.country;
    let ip = ipLocation.ip;
    let posdesc;

    // 以下的代码需要根据新API返回的结果进行相应的调整
    switch (ipLocation.data.country) {
        case "日本":
        posdesc = "よろしく，一起去看樱花吗";
        break;
    case "美国":
        posdesc = "Let us live in peace!";
        break;
    case "英国":
        posdesc = "想同你一起夜乘伦敦眼";
        break;
    case "俄罗斯":
        posdesc = "干了这瓶伏特加！";
        break;
    case "法国":
        posdesc = "C'est La Vie";
        break;
    case "德国":
        posdesc = "Die Zeit verging im Fluge.";
        break;
    case "澳大利亚":
        posdesc = "一起去大堡礁吧！";
        break;
    case "加拿大":
        posdesc = "拾起一片枫叶赠予你";
        break;
    case "中国":
        pos = ipLocation.data.prov + " " + ipLocation.data.city + " " + ipLocation.data.district;
        switch (ipLocation.data.prov) {
            case "北京市":
                posdesc = "北——京——欢迎你~~~";
                break;
            case "天津市":
                posdesc = "讲段相声吧";
                break;
            case "河北省":
                posdesc = "山势巍巍成壁垒，天下雄关铁马金戈由此向，无限江山";
                break;
            case "山西省":
                posdesc = "展开坐具长三尺，已占山河五百余";
                break;
            case "内蒙古自治区":
                posdesc = "天苍苍，野茫茫，风吹草低见牛羊";
                break;
            case "辽宁省":
                posdesc = "我想吃烤鸡架！";
                break;
            case "吉林省":
                posdesc = "状元阁就是东北烧烤之王";
                break;
            case "黑龙江省":
                posdesc = "很喜欢哈尔滨大剧院";
                break;
            case "上海市":
                posdesc = "众所周知，中国只有两个城市";
                break;
            case "江苏省":
                switch (ipLocation.data.city) {
                    case "南京市":
                        posdesc = "这是我挺想去的城市啦";
                        break;
                    case "苏州市":
                        posdesc = "上有天堂，下有苏杭";
                        break;
                    default:
                        posdesc = "散装是必须要散装的";
                        break;
                }
                break;
            case "浙江省":
                switch (ipLocation.data.city) {
                    case "杭州市":
                        posdesc = "东风渐绿西湖柳，雁已还人未南归";
                        break;
                    default:
                        posdesc = "望海楼明照曙霞,护江堤白蹋晴沙";
                        break;
                }
                break;
            case "河南省":
                switch (ipLocation.data.city) {
                    case "郑州市":
                        posdesc = "豫州之域，天地之中";
                        break;
                    case "信阳市":
                        posdesc = "品信阳毛尖，悟人间芳华";
                        break;
                    case "南阳市":
                        posdesc = "臣本布衣，躬耕于南阳此南阳非彼南阳！";
                        break;
                    case "驻马店市":
                        posdesc = "峰峰有奇石，石石挟仙气嵖岈山的花很美哦！";
                        break;
                    case "开封市":
                        posdesc = "刚正不阿包青天";
                        break;
                    case "洛阳市":
                        posdesc = "洛阳牡丹甲天下";
                        break;
                    default:
                        posdesc = "可否带我品尝河南烩面啦？";
                        break;
                }
                break;
            case "安徽省":
                posdesc = "蚌埠住了，芜湖起飞";
                break;
            case "福建省":
                posdesc = "井邑白云间，岩城远带山";
                break;
            case "江西省":
                posdesc = "落霞与孤鹜齐飞，秋水共长天一色";
                break;
            case "山东省":
                posdesc = "遥望齐州九点烟，一泓海水杯中泻";
                break;
            case "湖北省":
                switch (ipLocation.data.city) {
                    case "黄冈市":
                        posdesc = "红安将军县！辈出将才！";
                        break;
                    case "武汉市":
                        posdesc = "你想去长江游泳嘛？";
                        break;
                    default:
                        posdesc = "来碗热干面~";
                        break;
                }
                break;
            case "湖南省":
                posdesc = "74751，长沙斯塔克";
                break;
            case "广东省":
                switch (ipLocation.data.city) {
                    case "广州市":
                        posdesc = "看小蛮腰，喝早茶了嘛~";
                        break;
                    case "深圳市":
                        posdesc = "今天你逛商场了嘛~";
                        break;
                    case "阳江市":
                        posdesc = "阳春合水！博主家乡~ 欢迎来玩~";
                        break;
                    default:
                        posdesc = "来两斤福建人~";
                        break;
                }
                break;
            case "广西壮族自治区":
                posdesc = "桂林山水甲天下";
                break;
            case "海南省":
                posdesc = "朝观日出逐白浪，夕看云起收霞光";
                break;
            case "四川省":
                posdesc = "康康川妹子";
                break;
            case "贵州省":
                posdesc = "茅台，学生，再塞200";
                break;
            case "云南省":
                posdesc = "玉龙飞舞云缠绕，万仞冰川直耸天";
                break;
            case "西藏自治区":
                posdesc = "躺在茫茫草原上，仰望蓝天";
                break;
            case "陕西省":
                posdesc = "来份臊子面加馍";
                break;
            case "甘肃省":
                posdesc = "羌笛何须怨杨柳，春风不度玉门关";
                break;
            case "青海省":
                posdesc = "牛肉干和老酸奶都好好吃";
                break;
            case "宁夏回族自治区":
                posdesc = "大漠孤烟直，长河落日圆";
                break;
            case "新疆维吾尔自治区":
                posdesc = "驼铃古道丝绸路，胡马犹闻唐汉风";
                break;
            case "台湾省":
                posdesc = "我在这头，大陆在那头";
                break;
            case "香港特别行政区":
                posdesc = "永定贼有残留地鬼嚎，迎击光非岁玉";
                break;
            case "澳门特别行政区":
                posdesc = "性感荷官，在线发牌";
                break;
            default:
                posdesc = "带我去你的城市逛逛吧！";
                break;
        }
        break;
        default:
            posdesc = "带我去你的国家逛逛吧";
            break;
    }

    // 根据本地时间切换欢迎语
    let timeChange;
    let date = new Date();
    if (date.getHours() >= 5 && date.getHours() < 11) timeChange = "<span>🌤️ 早上好，快趁机多睡点懒觉！</span>";
    else if (date.getHours() >= 11 && date.getHours() < 13) timeChange = "<span>☀️ 中午好，记得午休喔~</span>";
    else if (date.getHours() >= 13 && date.getHours() < 17) timeChange = "<span>🕞 下午好，饮茶先啦！</span>";
    else if (date.getHours() >= 17 && date.getHours() < 19) timeChange = "<span>🚶‍♂️ 下班啦！主打一个不听老板话~</span>";
    else if (date.getHours() >= 19 && date.getHours() < 24) timeChange = "<span>🌙 晚上好，来一起熬夜吧呜😭</span>";
    else timeChange = "夜深了，早点休息，少熬夜";

    let welcomeInfoElement = document.getElementById("welcome-info");

    if (welcomeInfoElement) {
        welcomeInfoElement.innerHTML =
            `嗷嗷！热烈欢迎🤪！来自<br><b><span style="color: var(--default-bg-color)">${pos}</span></b><br> 的铁铁，你好呀！😝<br>${posdesc}🍂<br>你目前距博主约 <b><span style="color: var(--default-bg-color)">${dist}</span></b> 公里！<br>你的网络IP为：<b><span style="font-size: 15px;">${ip}</span></b><br>${timeChange} <br>`;
    } else {
        console.log("Pjax无法获取元素");
    }
}

// 判断是否存在 "welcome-info" 元素
function isWelcomeInfoAvailable() {
    let welcomeInfoElement = document.getElementById("welcome-info");
    return welcomeInfoElement !== null;
}

// Pjax 完成后调用的处理函数
function handlePjaxComplete(ipLocation) {
    if (isWelcomeInfoAvailable()) {
        showWelcome(ipLocation);
    }
}

// 加载时调用
function onLoad() {
    fetchIpLocation().then(ipLocation => {
        if (isWelcomeInfoAvailable()) {
            showWelcome(ipLocation);
        }
        document.addEventListener("pjax:complete", () => handlePjaxComplete(ipLocation));
    });
}

// 绑定 window.onload 事件
window.onload = onLoad;
