var chartDom = document.getElementById("main");
var myChart = echarts.init(chartDom, null, );
var rootStyles = getComputedStyle(document.documentElement);
var parentMaps = new Array(); // 维护一个 array，用于记录地图路径
option = null;
// myChart.showLoading();

// 把css变量抓过来，方便修改
var mainColor = rootStyles.getPropertyValue('--mainColor');
var textColor = rootStyles.getPropertyValue('--textColor');
var borderColor = rootStyles.getPropertyValue('--borderColor');
var spotColor = rootStyles.getPropertyValue('--spotColor');
var locSpotColor = rootStyles.getPropertyValue('--locSpotColor');
var activeColor = rootStyles.getPropertyValue('--activeColor');

// 判断当前操作系统是否为移动设备
var os = function () {
    var ua = navigator.userAgent,
        isWindowsPhone = /(?:Windows Phone)/.test(ua),
        isSymbian = /(?:SymbianOS)/.test(ua) || isWindowsPhone,
        isAndroid = /(?:Android)/.test(ua),
        isFireFox = /(?:Firefox)/.test(ua),
        isChrome = /(?:Chrome|CriOS)/.test(ua),
        isTablet = /(?:iPad|PlayBook)/.test(ua) || (isAndroid && !/(?:Mobile)/.test(ua)) || (isFireFox && /(?:Tablet)/.test(ua)),
        isPhone = /(?:iPhone)/.test(ua) && !isTablet,
        isPc = !isPhone && !isAndroid && !isSymbian;
    return {
        isTablet: isTablet,
        isPhone: isPhone,
        isAndroid: isAndroid,
        isPc: isPc
    };
}();

option = {
    title:{
        top: 10,
        left: os.isPc?'center':10,
        textAlign: os.isPc?undefined:'left',
        text: '毕业蹭饭地图',
        textStyle: {
            color: textColor,
            fontSize: 25,
            fontWeight: 'normal',
        },
        subtextStyle: {
            color: textColor,
            fontSize: 15,
            fontWeight: 'normal',
        },
        triggerEvent: true,
    },
    textStyle: {
        textBorderColor: borderColor,
        textBorderWidth: 2,
    },
    backgroundColor: borderColor,
    toolbox: {//工具栏
        top: os.isPc?10:undefined,
        bottom: os.isPc?undefined:10,
        left: os.isPc?10:undefined,
        right: os.isPc?undefined:10,
        orient: os.isPc?'horizontal':'vertical',
        itemSize: 24,
        itemGap: 12,
        feature: {
            myReturn:{
                title: '返回',
                icon: 'image://./images/return.svg',
                onclick: function () {
                    if(parentMaps.length > 0) 
                        changeMap(parentMaps.pop());
                },
            },
            dataView: { 
                show: false,
                title: '数据视图',
                readOnly: true,
                optionToContent: function(opt) {
                    var colName  = "学校位置";
                    var typeName = "姓名";
                    var dataview = opt.toolbox[0].feature.dataView;
                    var table = '<div style="position:absolute;top: 5px;left: 0px;right: 0px;line-height: 1.4em;text-align:center;font-size:14px;">'+dataview.title+'</div>'
                    table += getTable(opt,colName,typeName);
                    return table;
                }
            },
            saveAsImage: {
                title: '保存图片',
                icon: 'image://./images/download.svg',
                pixelRatio: 7,
                iconStyle:{
                    color: '#fff',
                },
                color: '#fff',
            },
        },
        iconStyle: {
            borderColor: borderColor,
            color: textColor,
        },
        showTitle: false,
        tooltip:{
            show: os.isPc,
            position: undefined,
            formatter: function (param) {
                return '<div>' + param.title + '</div>'; // 自定义的 DOM 结构
            },
        },
        emphasis:{
            iconStyle:{
                borderColor: borderColor,
                color: activeColor,
            }
        },
    },
    tooltip: {//提示框
        hideDelay: 300,
        borderColor : '#fff',
    },
    // labelLayout: {
    //     hideOverlap: true,
    // },
    geo: {//地图
        label: {emphasis:{show: false}},// 我也不明白 这是哪里来的
        roam: true,//移动缩放
        scaleLimit: {
            min: 1,
            max: 10,
        },
        itemStyle: {
            areaColor: midColor(spotColor, mainColor, 0),
            borderColor: midColor(spotColor, mainColor, 2/5),
            // borderWidth: 0,
        },
        emphasis: {
            itemStyle: {
                areaColor: activeColor,
            }
        },
        regions: getRegionsColor(),
        tooltip: {
            position: os.isPc ? undefined:'top',
        }
    },
    series: [
        {
            type: 'graph',
            // name: '连线',
            coordinateSystem: 'geo',
            symbolSize: 3,
            itemStyle: {
                color: spotColor
            },
            lineStyle: {
                color: spotColor,
                curveness: -0.2
            },
            silent: true,
            data: dataTemp,
            links: linksTemp,
        },
        {
            type: 'scatter',
            // name: '学校',
            dimensions: ['经度','纬度','姓名','位置'],
            encode: {tooltip: [2,3]},
            coordinateSystem: 'geo',
            symbol: 'pin',
            symbolSize: 30,
            label: {
                formatter: '{b}',
                show: true,
                width: os.isPc? 80:40,
                overflow: "truncate",
            },
            itemStyle: {color: spotColor},
            emphasis: {
                label: {
                    width: 100,
                }
            },
            data: dataTemp,
        },
        {   
            type: 'scatter',
            // name: '定位',
            dimensions: ['经度','纬度'],
            encode: {tooltip: [0,1]},
            coordinateSystem: 'geo',
            symbol: 'pin',
            symbolSize: 30,
            label: {
                formatter: '{b}',
                show: true,
            },
            itemStyle: {color: locSpotColor},
            data: [],
        },
    ],
    legend: {},//图例：series拥有name时显示
};
changeMap('china');

// 改变地图
function changeMap(newPlace) {
    if(newPlace != 'china'){
        option.title.subtext = '山师大附中 2018 级 3 班'+' - '+newPlace+(mapData[newPlace]?' '+mapData[newPlace]+' 人':'')
        option.geo.zoom = 1;
        option.geo.center = undefined;

        option.toolbox.feature.myReturn.show = true;
    }
    else{
        option.title.subtext = '山东师范大学附属中学 2018 级 3 班';
        option.geo.zoom = 2.5;
        option.geo.center = [117,35.5];
        option.toolbox.feature.myReturn.show = false;
    }
    option.geo.map = newPlace;
    myChart.setOption(option, true);    //去除了缩放动画
}

// 按下
myChart.on('click', function (params) {
    if (params.componentType === 'geo'){
        if (params.name == '南海诸岛') {
            params.name = '海南';
        }else if (params.name == 'China') {
            params.name = 'china';
        }
        if (echarts.getMap(params.name)) {
            parentMaps.push(option.geo.map);
            changeMap(params.name);
        }
        return;
    }
    if (params.componentType === 'series') {
        if (option.geo.map == 'china' && echarts.getMap(params.value[3][0])) {
            parentMaps.push(option.geo.map);
            changeMap(params.value[3][0]);
        }else if(option.geo.map == '山东' && params.value[3][1] == '济南市'){
            parentMaps.push(option.geo.map);
            changeMap('济南市');
        }
        return;
    }
    if (params.componentType === 'title'){
        var answer=prompt(
            "关于：\n"+
            "    1. Trigger: 学校标记、地区地图等\n"+
            "    2. 停留或长按 Trigger 查看详细信息\n"+
            "    3. 点击 Trigger 进入下一级地图\n\n"+
            " - 图表使用 Echarts 制作\n"+
            " - 地图源于网络 不具有参考意义\n"+
            " - 联系方式: 鸿 微信号："
        ,"wx1575989756"); 
        if(answer=='wx1575989756'){
            return;
        }
        else if(answer=='sth' || answer=='史天鸿' || answer=='?' || answer=='？'){
            alert("请输入如下代码：\n"+
                " - 数据 (或 data)\n"+
                " - 世界 (或 world)\n"+
                " - 浏览器 (或 browser)\n"
            );
        }
        else if(answer=='data' || answer=='数据') {
            option.toolbox.feature.dataView.show = true;
            myChart.setOption(option);
        }
        else if(answer=='world' || answer=='世界') {
            parentMaps.push(option.geo.map);
            changeMap('world');
        }
        else if(answer=='browser' || answer=='浏览器') {
            alert('浏览器信息: \n'+navigator.userAgent)
        }
        return;
    }
});

// 获取我的位置
if (navigator.geolocation && os.isPc) {
    navigator.geolocation.getCurrentPosition(successCallback);
}
function successCallback(position) {
    option.series[1].data.push({
        name: '我的位置', 
        value: [position.coords.longitude.toFixed(4), position.coords.latitude.toFixed(4)]
    });
    myChart.setOption(option);
}

//数据视图
function getTable(opt){
    var axisData = opt.series[0].data;//获取图形的data数组
    var series = opt.series;//获取series
    var num = 0;//记录序号
    var table = '<table class="bordered"><thead><tr>'
        + '<th>学校位置</th>'
        + '<th>学校位置</th>'
        + '<th>学校</th>'
        + '<th>姓名</th>'
        + '</tr></thead><tbody>';
    for (var i = 0, l = axisData.length; i < l; i++) {
        num += 1;
        table += '<tr>'
            + '<td>' //学校位置
                + series[0].data[i].value[3][0]+'省'
                + '</td><td>'
                + series[0].data[i].value[3][1]
            + '</td>'
            + '<td>' + series[0].data[i].name + '</td>'//学校
            + '<td>' + series[0].data[i].value[2] + '</td>'//姓名
            + '</tr>';
    }
    table += '</tr></tbody></table>';
    return table;
}

// 获取色阶  这一部分可以使用 visulMap + seriesIndex 实现
//           下面是AI的, 本人比较懒, 不想重新写
function midColor(color1, color2, weight) {
    var p = weight > 1 ? 1 : weight < 0 ? 0 : weight;
    var w1 = 0.04 + p * 0.4;
    var w2 = 1 - w1;
    var r1 = parseInt(color1.slice(1, 3), 16);
    var g1 = parseInt(color1.slice(3, 5), 16);
    var b1 = parseInt(color1.slice(5, 7), 16);
    var r2 = parseInt(color2.slice(1, 3), 16);
    var g2 = parseInt(color2.slice(3, 5), 16);
    var b2 = parseInt(color2.slice(5, 7), 16);
    var r = Math.round(r1 * w1 + r2 * w2);
    var g = Math.round(g1 * w1 + g2 * w2);
    var b = Math.round(b1 * w1 + b2 * w2);
    return "#" + ("0" + r.toString(16)).slice(-2) + ("0" + g.toString(16)).slice(-2) + ("0" + b.toString(16)).slice(-2);
}

//各个地区颜色 及 tooltip
function getRegionsColor(){
    var regionsColor = [];
    for(var key in mapData){
        regionsColor.push({
            name:key,
            itemStyle:{
                areaColor: midColor(spotColor, mainColor, mapData[key]/5),
            },
            tooltip:{
                formatter(params){
                    return '<span style="display:inline-block;margin-right:4px;border-radius:10px;width:10px;height:10px;background-color:'+ 
                        midColor(spotColor, mainColor, mapData[params.name]/5)
                        +';"></span> '
                        + params.name 
                        + '<span style="float:right;margin-left:20px;font-size:14px;color:#666;font-weight:900">' 
                        + mapData[params.name] + '人</span>';
                    // return params.name + '&nbsp&nbsp<b>' + mapData[params.name] + '人</b>';
                }
            }
        });
    }
    regionsColor.push({    //隐藏海南诸岛
        name:'南海诸岛',
        itemStyle:{
            opacity:0
        }
    })
    return regionsColor;
}

// function checkUrl() {
//     var url = window.location.href;
//     if (url.indexOf('#') == -1) return 'china';
//     option.geo.zoom = 1;
//     option.geo.left = 'center';
//     place = url.substring(url.indexOf('#') + 1);
//     place = decodeURI(place);
//     console.log(place);
//     if (MAPS.indexOf(place) != -1) {
//         parentMaps.push('china');
//         return place;
//     }
//     else return 'china';
// };
// option.geo.map = checkUrl();