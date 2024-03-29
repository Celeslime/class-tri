DATA = [
    //Center
    { name: '山东师范大学附属中学', value: ['母校'], loc: [117.041752,36.658272], city: '山东 济南市'},
    //济
    { name: '山东大学', value: ['刘怡诺'], loc: [117.017885,36.651971], city: '山东 济南市' },
    { name: '哈尔滨工业大学', value: ['史天鸿'], loc: [122.089909,37.540047], city: '山东 威海市' },
    { name: '山东第一医科大学', value: ['宋国欣'], loc: [116.874763,36.682832], city: '山东 济南市' },
    { name: '济南大学', value: ['李京坤'], loc: [116.974575,36.620238], city: '山东 济南市' },
    { name: '齐鲁师范学院', value: ['赵芮彤 '], loc: [117.057875,36.68372], city: '山东 济南市' },
    { name: '齐鲁工业大学', value: ['杜悦歌 '], loc: [116.810166,36.563827], city: '山东 济南市' },
    { name: '山东师范大学', value: ['刘云翼'], loc: [117.04147,36.65189], city: '山东 济南市' },
    { name: '山东财经大学', value: ['李晋洋'], loc: [117.378888,36.681088], city: '山东 济南市' },
    { name: '山东建筑大学', value: ['刘子楚','李鑫雨','李思缘','王逸飞'], loc: [117.192366,36.686465], city: '山东 济南市' },
    //烟威青
    { name: '烟台大学', value: ['蔡上朝'], loc: [121.464862,37.481883], city: '山东 烟台市' },

    { name: '中国海洋大学', value: ['袁宇博'], loc: [120.505352,36.167816], city: '山东 青岛市' },
    { name: '青岛大学', value: ['翟松亭'], loc: [120.423586,36.076821], city: '山东 青岛市' },
    { name: '青岛农业大学', value: ['贾昊琛','郑宇杨'], loc: [120.404108,36.327029], city: '山东 青岛市' },
    //...
    { name: '曲阜师范大学', value: ['韩文欢'], loc: [116.975091,35.596899], city: '山东 济宁市' },
    { name: '临沂大学', value: ['华志业'], loc: [118.298597,35.123361], city: '山东 临沂市' },
    { name: '山东石油化工学院', value: ['何正彦'], loc: [118.548233,37.477501], city: '山东 东营市' },
    { name: '山东理工大学', value: ['边培硕'], loc: [118.008295,36.815484], city: '山东 淄博市' },
    { name: '德州学院', value: ['车昱颖'], loc: [116.339471,37.476906], city: '山东 德州市' },
    { name: '山东农业大学', value: ['孔祥雨','马钰朝'], loc: [117.12296,36.200713], city: '山东 泰安市' },
    { name: '山东第二医科大学', value: ['张沛然','田子萱','张策'], loc: [119.040166,36.672282], city: '山东 潍坊市' },
    //湘鄂 苏浙
    { name: '湖南大学', value: ['姚远'], loc: [112.950693,28.186051 ], city: '湖南 长沙市' },
    { name: '湖南中医药大学', value: ['聂瑞奇'], loc: [112.900747,28.135339], city: '湖南 长沙市' },
    { name: '长江大学', value: ['刘佳怡 '], loc: [112.216311,30.340899], city: '湖北 荆州市' },
    { name: '江南大学', value: ['孙田雷'], loc: [120.285164,31.489853], city: '江苏 无锡市' },
    { name: '扬州大学', value: ['朱延捷'], loc: [119.429593,32.385202], city: '江苏 扬州市' },
    { name: '浙江传媒学院', value: ['吴潇迪'], loc: [120.350072,30.326961], city: '浙江 杭州市' },
    { name: '陕西服装工程学院', value: ['赵雅欣'], loc: [108.72519,34.309446], city: '陕西 咸阳市' },
    { name: '沈阳理工大学', value: ['高彩荀'], loc: [123.500795,41.733289], city: '辽宁 沈阳市' },
];

// scatter数据
// name: 学校 value: 0、1坐标、2[姓名]、3[省市]
var spotTemp = [];
for (var i = 0; i < DATA.length; i++) {
    if (DATA[i]['loc']) {
        spotTemp.push({
            name: DATA[i].name,
            value: DATA[i]['loc'].concat([DATA[i].value], [DATA[i].city.split(' ')]),
        });
    }
}

// 映射数据
// 省,市: 人数
var mapData = {};
for(var i=0;i<spotTemp.length;i++){
    // 省
    if(spotTemp[i].value[3][0] in mapData)
        mapData[spotTemp[i].value[3][0]] += spotTemp[i].value[2].length;
    else
        mapData[spotTemp[i].value[3][0]] = spotTemp[i].value[2].length;
    // 市
    if(spotTemp[i].value[3][1] in mapData)
        mapData[spotTemp[i].value[3][1]] += spotTemp[i].value[2].length;
    else
        mapData[spotTemp[i].value[3][1]] = spotTemp[i].value[2].length;
}

// map数据
// name: 省或市 value: 人数
var mapTemp = [[],[]];
for(var i in mapData){
    mapTemp[0].push({name:i,value:mapData[i]})
}

// link数据
// source: 0 target: i
var linksTemp = [];
for (var i = 0; i < spotTemp.length; i++) {
    linksTemp.push({
        source: 0,
        target: i,
    });
}

// tree数据（AI的，没眼看）
// 将数据处理成树状，如 山东(28)->济南市(12)->山东建筑大学(4)->某某某(1)
// 树由name、value、数组children组成
var treeTemp = [];
for (var i = 0; i < spotTemp.length; i++) {
    // 检查treeTemp里是否有name==spotTemp[i].value[3][0]
    if (treeTemp.some(item => item.name === spotTemp[i].value[3][0]+'省')) {
        // 如果有，则找到该省份，并添加一个城市
        var index = treeTemp.findIndex(item => item.name === spotTemp[i].value[3][0]+'省');
        treeTemp[index].value += spotTemp[i].value[2].length;
        // 检查 children 里是否有name==spotTemp[i].value[3][1]
        if (treeTemp[index].children.some(item => item.name === spotTemp[i].value[3][1])) {
            // 如果有，则找到该城市，并添加一个学校
            var index2 = treeTemp[index].children.findIndex(item => item.name === spotTemp[i].value[3][1]);
            treeTemp[index].children[index2].value += spotTemp[i].value[2].length;
            treeTemp[index].children[index2].children.push({
                name: spotTemp[i].name,
                value: spotTemp[i].value[2].length,
                children: spotTemp[i].value[2].map(//学生
                    (item,index)=>
                    {return {name: item, value: 1}}
                )
            })
        }
        else {
            // 如果没有，则添加一个城市
            treeTemp[index].children.push({
                name: spotTemp[i].value[3][1],
                value: spotTemp[i].value[2].length,
                children: [{//大学
                    name: spotTemp[i].name,
                    value: spotTemp[i].value[2].length,
                    children: spotTemp[i].value[2].map(//学生
                        (item,index)=>
                        {return {name: item, value: 1}}
                    )
                }]
            });
        }
    }
    else{
        // 如果没有，则添加一个省份
        treeTemp.push({
            name: spotTemp[i].value[3][0]+'省',
            value: spotTemp[i].value[2].length,
            children: [{//城市
                name: spotTemp[i].value[3][1],
                value: spotTemp[i].value[2].length,
                children: [{//大学
                    name: spotTemp[i].name,
                    value: spotTemp[i].value[2].length,
                    children: spotTemp[i].value[2].map(//学生
                        (item,index)=>
                        {return {name: item, value: 1}}
                    )
                }]
            }]
        });
    }
}