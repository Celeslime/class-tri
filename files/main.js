var chartDom = document.getElementById("main");
var myChart = echarts.init(chartDom);
var rootStyles = getComputedStyle(document.documentElement);
// myChart.showLoading();

// 把css变量抓过来，方便修改
var mainColor = rootStyles.getPropertyValue('--mainColor');
var activeColor = rootStyles.getPropertyValue('--mapActiveColor');
var textColor = rootStyles.getPropertyValue('--textColor');
var borderColor = rootStyles.getPropertyValue('--backgroundColor');
var shadowColor = rootStyles.getPropertyValue('--shadowColor');
var spotColor = rootStyles.getPropertyValue('--spotColor');
var locSpotColor = rootStyles.getPropertyValue('--locSpotColor');

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

var option = {
    backgroundColor: borderColor,
    title:{
        top: 10,
        left: os.isPc?'center':10,
        textAlign: os.isPc?undefined:'left',
        text: '毕业蹭饭地图',
        textStyle: {
            color: textColor,
            fontSize: 25,
            fontWeight: 'normal',
            textShadowColor: shadowColor,
            textShadowBlur: 4
        },
        subtextStyle: {
            color: textColor,
            fontSize: 15,
            textShadowColor: shadowColor,
            textShadowBlur: 4
        },
        zlevel: 1,
    },
    toolbox: {//工具栏
        top: os.isPc?10:undefined,
        bottom: os.isPc?undefined:10,
        left: os.isPc?10:undefined,
        right: os.isPc?undefined:10,
        orient: os.isPc?'horizontal':'vertical',
        itemSize: 30,
        itemGap: 12,
        feature: {
            myReturn: {
                // show: false,
                title: '主页',
                icon: 'image://./images/Svg/return.svg',
                onclick: function(){
                    window.location.hash = ''
                },
            },
            myPositon: {
                show: os.isPc,
                title: '获取位置信息',
                icon: 'image://./images/Svg/position.svg',
                onclick: function () {
                    if (navigator.geolocation && os.isPc)
                        navigator.geolocation.getCurrentPosition(successCallback);
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
                icon: 'image://./images/Svg/download.svg',
                pixelRatio: 7,
                iconStyle:{
                    color: '#fff',
                },
                color: '#fff',
            },
            myQRCode: {
                show: os.isPc,
                title: 'QRCode',
                icon: 'image://./images/Svg/QRCode.svg',
                onclick: function(){
                    // 创建一个<a>标签
                    var link = document.createElement('a');
                    link.href = './images/QRCode.png';
                    link.download = 'QRCode.png'; // 设置下载文件的名称
                    // 将<a>标签添加到页面中
                    document.body.appendChild(link);
                    // 模拟点击<a>标签进行下载
                    link.click();
                    // 移除<a>标签
                    document.body.removeChild(link);
                    return;
                }
            },
            myInfo: {
                title: '关于',
                icon: 'image://./images/Svg/info.svg',
                onclick: showInfo
            },
        },
        showTitle: false,
        tooltip:{
            show: os.isPc,
            position: os.isPc ? undefined : 'left',
            formatter: function (param) {
                if(param.title=='QRCode')
                    return '<img src="./images/QRCode.png" height="120px">'
                return '<div>' + param.title + '</div>';
            },
        },
        iconStyle:{
            shadowColor: shadowColor,
            shadowBlur: 4
        },
        zlevel: 1,
    },
    tooltip: {//提示框
        hideDelay: 300,
        borderColor : '#fff',
    },
    geo: {
        map: 'china',
        roam: true, //移动与缩放，bug特别多，与很多内置功能冲突
        scaleLimit: {min: 1,max: 10},
        itemStyle: {
            areaColor: midColor(spotColor, mainColor, 0),
            borderColor: midColor(spotColor, mainColor, 2/5),
            borderJoin: 'round', //去除毛刺，可以删掉
        },
        emphasis: {
            label:{
                show: false,
            },
            itemStyle: {
                areaColor: activeColor,
            }
        },
        regions: getRegionsColor(),
        tooltip: {
            position: os.isPc ? undefined:'top',
        },
    },
    series: [
        {
            type: 'scatter',
            // name: '学校', //会在tooltip上显示
            dimensions: ['经度','纬度','姓名','位置'],
            encode: {tooltip: [2,3]},
            coordinateSystem: 'geo',
            symbol: 'pin',
            symbolSize: 30,
            label: {
                formatter: '{b}',
                show: true,
                color: textColor,
                textBorderColor: 'inherit', //inside默认值，删除在深色背景会有bug
                textBorderWidth: 2, //inside默认值，删除在深色背景会有bug
                width: os.isPc? 80:40,
                overflow: "truncate",
            },
            itemStyle: {color: spotColor},
            emphasis: {
                label: {
                    width: 130,
                }
            },
            data: spotTemp,
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
        },
        {
            type: 'graph',
            // name: '关系',
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
            data: spotTemp,
            links: linksTemp,
            show:false,
        },
    ],
    legend: {
        show: false,
    }
};
changeMap(checkUrl());
console.log(
    "关于：\n"+
    "    1. 元素: 学校标记、地区地图等\n"+
    "    2. 长按或停留 元素 查看详细信息\n"+
    "    3. 点击 元素 进入下一级地图\n\n"+
    " - 图表使用 Echarts 制作\n"+
    " - 地图源于网络 不具参考意义\n"+
    " - 联系方式: 鸿 微信号：wx1575989756\n"+
    " - Github: https://github.com/celeslime/class-tri"
);
var optionTree = {
    series:[{
        type: 'treemap',
        name: '中华人民共和国',
        data: treeTemp,
        leafDepth: 2,
        z:999,
        upperLabel: {
            show: true,
            height: 30
        },
        itemStyle: {
            borderWidth: 2,
            borderColorSaturation: 0.6
        },
        colorSaturation: [0.35, 0.5],
        levels: [{//国
            },{//省份
            },{//城市
            },{//学校
            },{//学生
                itemStyle: {
                    borderWidth: 0,
                }
            }
        ]
    }]
}
const colors = ['#FFAE57', '#FF7853', '#EA5151', '#CC3F57', '#9A2555'];
var optionSun = {
    // backgroundColor: bgColor,
    // color: colors,
    geo:{
        show:false
    },
    series: [{
        type: 'sunburst',
        // center: ['50%', '48%'],
        data: treeTemp,
        // sort: function (a, b) {
        //   if (a.depth === 1) {
        //     return b.getValue() - a.getValue();
        //   } else {
        //     return a.dataIndex - b.dataIndex;
        //   }
        // },
        label: {
        //   rotate: 'radial',
          color: '#fff'
        },
        itemStyle: {
            //透明的borderColor
            borderColor: borderColor,
            borderRadius: 3,
            borderWidth: 1
        },
        zlevel: 2,
        levels: [
          {},
          {
            r0: 0,
            r: 30,
            label: {
                width: 30,
                overflow: "truncate",
            }
          },
          {
            r0: 30,
            r: 60,
            label: {
                width: 30,
                overflow: "truncate",
            }
          },
          {
            r0: 60,
            r: 140,
            // itemStyle: {
            //   shadowBlur: 2,
            //   shadowColor: colors[2],
            //   color: 'transparent'
            // },
            label: {
            //   rotate: 'tangential',
            //   fontSize: 10,
            //   color: colors[0]
                width: 80,
                overflow: "truncate",
            }
          },
          {
            r0: 140,
            r: 145,
            // itemStyle: {
            //   shadowBlur: 80,
            //   shadowColor: colors[0]
            // },
            label: {
              position: 'outside',
            //   textShadowBlur: 5,
            //   textShadowColor: '#333'
            },
            // downplay: {
            //   label: {
            //     opacity: 0.5
            //   }
            // }
          }
        ]
    }]
};
// --------------------------------------------------------改变地图
window.addEventListener(
    "hashchange",
    function () {
        var place = checkUrl();
        console.log(">>> The hash change to: " + place);
        roamToMap(place)
    },
    false,
);
function checkUrl() {
    var url = window.location.hash;
    if (url == '') return 'china';
    place = decodeURI(url.slice(1));
    if (echarts.getMap(place)){
        return place;
    }
    else return 'china';
};
function changeMap(newPlace = 'china', flag = true) {
    setInitZoom(newPlace);
    if(newPlace == 'china'){
        option.title.subtext = '山东师范大学附属中学 2018 级 3 班';
        document.title = '毕业蹭饭地图 | 山师附中 2018 级 3 班';
    }
    else{
        option.title.subtext ='山师附中 2018 级 3 班 '
            + (newPlace=='济南市'?'山东 济南':newPlace)
            + (mapData[newPlace]?' '+mapData[newPlace]+' 人':'')
        document.title = '毕业蹭饭地图 - '+newPlace+' | 山师附中 2018 级 3 班';
    }
    option.geo.map = newPlace;
    myChart.setOption(option, flag); //去除了roam动画
}
function popMaps(){
    if(option.geo.map != 'china') {
        window.history.back();
    }
    else{
        roamToMap('china')
    }
}
function roamToMap(newPlace){
    var From_width = getCoordWidth();
    var centerTem = getCenter()
    changeMap(newPlace,true)
    var To_width = getCoordWidth();
    option.geo.zoom *= To_width/From_width
    option.geo.center = centerTem;
    option.geo.scaleLimit = undefined; //临时取消限制
    myChart.setOption(option,true);
    option.geo.scaleLimit = {min: 1,max: 10};
    //恢复为默认地图，启用动画
    changeMap(newPlace,false)
}
function returnMap(){
    setInitZoom(option.geo.map);
    // if( myChart.getOption().geo[0].zoom  == option.geo.zoom
    //  && myChart.getOption().geo[0].center== option.geo.center){
    //     window.history.back();
    //     return;
    // }
    myChart.setOption(option);
}
function setInitZoom(place){
    if(place == 'china'){
        option.geo.zoom = 2.5;
        option.geo.center = [117,35.5];
    }else{
        option.geo.zoom = 1;
        option.geo.center = undefined;
    }
}
// --------------------------------------------------------
// 按下
myChart.on('click', function (params) {
    if (params.componentType === 'geo'){//地图
        if (params.name == '南海诸岛') {
            params.name = '海南';
        }else if (params.name == 'China') {
            params.name = 'china';
        }
        if (echarts.getMap(params.name)) {
            window.location.hash = params.name;
        }
        return;
    }
    if (params.componentType === 'series' && params.seriesType === 'scatter') {//scatter
        if(params.seriesIndex == 1){//定位
            superZoom(4,params.value.slice(0,2));
            return;
        }
        if(option.geo.map == 'china' && echarts.getMap(params.value[3][0])){
            window.location.hash = params.value[3][0];
        }
        else if(option.geo.map == '山东' && params.value[3][1] == '济南市'){
            window.location.hash = '济南市';
        }
        else if(option.geo.map != params.value[3][1]) {//城市不同
            if (option.geo.map != params.value[3][0] && echarts.getMap(params.value[3][0])) {
                window.location.hash = params.value[3][0];
            }
            else if(echarts.getMap(params.value[3][1])){
                window.location.hash = params.value[3][1];
            }
            else{
                superZoom(2.5,params.value.slice(0,2));
            }
        }
        else{
            superZoom(2.5,params.value.slice(0,2));
        }
        return;
    }
});
myChart.getZr().on('click', function(event) {// 点击在了空白处
    if (!event.target) {
        returnMap();
    }
});

function showInfo(){
    var answer = prompt(
        "关于：\n"+
        "    1. 元素: 学校标记、地区地图等\n"+
        "    2. 长按或停留 元素 查看详细信息\n"+
        "    3. 点击 元素 进入下一级地图\n\n"+
        " - 图表使用 Echarts 制作\n"+
        " - 地图源于网络 不具参考意义\n"+
        " - 联系方式: 鸿 微信号："
        ,"wx1575989756"
    ); 
    if(answer=='wx1575989756'){
        return;
    }
    else if(answer=='sth' || answer=='史天鸿' || answer=='?' || answer=='？'){
        alert("请输入如下代码：\n"+
            " - 数据 (或 data)\n"+
            " - 世界 (或 world)\n"+
            " - 浏览器 (或 browser)\n"+
            ' - 项目 (或 github)\n'
        );
    }
    else if(answer=='data' || answer=='数据') {
        option.toolbox.feature.dataView.show = true;
        myChart.setOption(option);
    }
    else if(answer=='world' || answer=='世界') {
        window.location.hash = 'world';
    }
    else if(answer=='browser' || answer=='浏览器') {
        alert('浏览器信息: \n'+navigator.userAgent)
    }
    else if(answer=='github' || answer=='项目') {
        window.open('https://github.com/celeslime/class-tri');
    }
}

//获取chart当前中心坐标
function getCenter(chart = myChart){
    var center = chart.convertFromPixel(
        {seriesIndex: 0},
        [chart.getWidth()/2, chart.getHeight()/2]
    );
    return center;
}
function getCoordWidth(chart = myChart){
    var start = [0,chart.getHeight()/2];
    var end = [chart.getWidth(),chart.getHeight()/2];
    var top = chart.convertFromPixel({geoIndex: 0},start)[0];
    var bottom = chart.convertFromPixel({geoIndex: 0},end)[0];
    return bottom-top;
}
function superZoom(zoomTimes,center1){
    option.geo.zoom = myChart.getOption().geo[0].zoom;
    var zoomRate = option.geo.zoom/zoomTimes;
    if(option.geo.zoom < zoomTimes){
        option.geo.zoom = zoomTimes;
        var center2 = getCenter();
        option.geo.center = [
            center1[0]*(1-zoomRate) + center2[0]*zoomRate,
            center1[1]*(1-zoomRate) + center2[1]*zoomRate
        ];
        myChart.setOption(option);
    }
}

// 获取我的位置
function successCallback(position) {
    var positionGot = [position.coords.longitude.toFixed(4), position.coords.latitude.toFixed(4)]
    option.series[1].data=[{
        name: '我的位置', 
        value: positionGot,
    }];
    option.geo.zoom = 4;
    option.geo.center = positionGot;
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