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
    graphic: [{//标题
        type: 'text', // 图形类型为文本
        left: 'center', // 文本水平居中
        top: 15, // 文本距离顶部的距离
        style: { // 文本样式设置
            text: '{a|毕业蹭饭地图}\n\n{b|山东师大附中 2018 级 3 班}',
            rich: {
                a: {
                    fontSize: '22px',
                    fill: textColor, // 字体颜色
                    stroke: borderColor, // 描边颜色
                    lineWidth: 2, // 描边宽度
					textAlign: 'center',// 内容居中
                },
                b: {
                    fontSize: '15px',
                    fill: textColor, // 字体颜色
                    stroke: borderColor, // 描边颜色
                    lineWidth: 2, // 描边宽度
                },
            },
        },
        z:99,
      }],
    toolbox: {//工具栏
        top: 15,
        left: 15,
        // orient: 'horizontal', //vertical
        itemSize: 28,
        feature: {
            myReturn:{
                show: false,
                icon: 'M20,11H7.4l4.3-4.3c0.4-0.4,0.4-1,0-1.4s-1-0.4-1.4,0L3.6,11.6c-0.4,0.4-0.4,1,0,1.4l6.7,6.7c0.4,0.4,1,0.4,1.4,0s0.4-1,0-1.4L7.4,13H20c0.6,0,1-0.4,1-1S20.6,11,20,11z',
                onclick: function () {
                    if(parentMaps.length > 0){
                        changeMap(parentMaps[parentMaps.length - 1]);
                        var popPlace=parentMaps.pop();
						option.graphic[0].style.text = 
							'{a|毕业蹭饭地图}\n\n{b|山东师大附中 2018 级 3 班'+(popPlace=='china'?'':' - '+popPlace)+'}';
                    } 
                }
            },
            dataView: { 
                show: false,
                title: '',
                readOnly: true,
                optionToContent: function(opt) {
                    var colName  = "学校位置";
                    var typeName = "姓名";
                    var dataview = opt.toolbox[0].feature.dataView;  //获取dataview
                    var table = '<div style="position:absolute;top: 5px;left: 0px;right: 0px;line-height: 1.4em;text-align:center;font-size:14px;">'+dataview.title+'</div>'
                    table += getTable(opt,colName,typeName);
                    return table;
                }
            },
        },
        iconStyle: {
            normal: {
                borderColor: borderColor,
                color: '#fff'
            }
        },
    },
    tooltip: {//提示框
        hideDelay: 300,
        borderColor : '#fff',
    },
    geo: {//地图
        label: {emphasis:{show: false}},
        roam: true,//移动缩放
        scaleLimit: {
            min: 1,
            max: 10,
        },
        itemStyle: {
            normal: {
                areaColor: midColor(spotColor, mainColor, 0),
                borderColor: midColor(spotColor, mainColor, 2/5),
                // borderWidth: 0,
            },
            emphasis: {
                areaColor: activeColor,
            },
        },
        regions: getRegionsColor(),
    },
    series: [
        {
            // name: '学校',
            dimensions: ['经度','纬度','姓名','位置'],
            encode: {tooltip: [2,3]},
            type: 'scatter',
            coordinateSystem: 'geo',
            data: dataTemp,
            symbol: 'pin',
            symbolSize: 30,
            label: {
                formatter: '{b}',
                show: true,
            },
            itemStyle: {color: spotColor},
            // emphasis:{ 
            //     focus: 'self',//与roam冲突
            // }
        },
        {   
            // name: '定位',
            dimensions: ['经度','纬度'],
            encode: {tooltip: [0,1]},
            type: 'scatter',
            coordinateSystem: 'geo',
            data: [],
            symbol: 'pin',
            symbolSize: 30,
            label: {
                formatter: '{b}',
                show: true,
            },
            itemStyle: {color: locSpotColor},
        },
    ],
    legend: {
        bottom: 5
    },
};
if (option && typeof option === "object") {
    changeMap('china');
}

// 改变地图
function changeMap(newPlace) {
    if(newPlace != 'china'){
        option.graphic[0].style.text =
			'{a|毕业蹭饭地图}\n\n{b|山东师大附中 2018 级 3 班 - '+newPlace+'}';
        option.geo.zoom = 1;
        option.geo.left = 'center';
        option.toolbox.feature.myReturn.show = true;
    }
    else{
        option.graphic[0].style.text =
			'{a|毕业蹭饭地图}\n\n{b|山东师大附中 2018 级 3 班}';
        option.geo.zoom = 2.5;
        option.geo.left = -100;
        option.toolbox.feature.myReturn.show = false;
    }
    option.geo.map = newPlace;
    myChart.setOption(option, true);    //去除了缩放动画
}

// 按下
myChart.on('click', function (params) {
    if (params.name == '南海诸岛') {
        params.name = '海南';
    }else if (params.name == 'China') {
        params.name = 'china';
    }
    if (echarts.getMap(params.name)) {
        parentMaps.push(option.geo.map);
        changeMap(params.name);
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
    }
    if (params.componentType === 'graphic'){
        var answer=prompt(
            "关于：\n"+
            "1. 点击学校橙色标记，列出该学校的同学名单\n"+
            "2. 点击省/市地图，进入到相应省/市的地图\n"+
            "3. 点击返回按钮回到上一级/关于/重置地图\n"+
            "4. 图表使用 echarts 制作，地图资源源于网络\n\n"+
            "联系方式：鸿 微信号："
        ,"wx1575989756"); 
        if(answer=='wx1575989756'){
            return;
        }
        else if(answer=='sth' || answer=='史天鸿' || answer=='?' || answer=='？'){
            alert("请输入如下代码：\n - 数据（或data）\n - 世界（或world）");
        }
        else if(answer=='data' || answer=='数据') {
            option.toolbox.feature.dataView.show = true;
            myChart.setOption(option);
        }
        else if(answer=='world' || answer=='世界') {
            parentMaps.push(option.geo.map);
            changeMap('world');
        }
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

//获取颜色阶级
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

//各个地区颜色
function getRegionsColor(){
    var regionsColor = [];
    for(var key in mapData){
        regionsColor.push({
            name:key,
            itemStyle:{
                normal: {
                    areaColor: midColor(spotColor, mainColor, mapData[key]/5)
                },
            }
        });
    }
    regionsColor.push({    //隐藏海南诸岛
        name:'南海诸岛',
        itemStyle:{
            normal:{opacity:0}
        }
    })
    return regionsColor;
}
// 由于拖拽地图也会触发 click 事件，所以这里判断一下鼠标按下和抬起的位置坐标变化
// var downX, downY;
// $('#main').mousedown(function (e) {
//     downX = e.pageX;
//     downY = e.pageY;
// });
// $('#main').mouseup(function (e) {
//     var upX = e.pageX;
//     var upY = e.pageY;
//     var dltX = Math.abs(upX - downX);
//     var dltY = Math.abs(upY - downY);
//     if (dltX <= 5 && dltY <= 5 && parentMaps.length > 0) {
//         changeMap(parentMaps[parentMaps.length - 1]);
//         parentMaps.pop();
//     }
// });
// 

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