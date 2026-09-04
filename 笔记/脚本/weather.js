

// km/h 转 m/s
function kmhToMs(kmh) {
    return kmh / 3.6;
}

// m/s 转 km/h
function msToKmh(ms) {
    return ms * 3.6;
}

function getNowTime(){
	// 创建一个Date对象，表示当前时刻
	const now = new Date();

	// 获取各个时间组件
	const year = now.getFullYear();
	const month = String(now.getMonth() + 1).padStart(2, '0'); // 月份需要+1
	const day = String(now.getDate()).padStart(2, '0');
	const hours = String(now.getHours()).padStart(2, '0');
	const minutes = String(now.getMinutes()).padStart(2, '0');
	const seconds = String(now.getSeconds()).padStart(2, '0');
	// 组合成常见的日期时间字符串
	const dateString = `${year}-${month}-${day}`; // 例如："2024-9-25"
	const timeString = `${hours}:${minutes}:${seconds}`; // 例如："14:30:45"
	const fullString = `${dateString} ${timeString}`; // 例如："2024-9-25 14:30:45"
	
	return [dateString,timeString,fullString];
}

//根据​​米/秒 (m/s)​​ 判断蒲福风级
function getWindForceLevel(ms) {
    if (ms <= 0.2) {
        return { level: 0, description: "无风", cnDescription: "静风" };
    } else if (ms <= 1.5) {
        return { level: 1, description: "Calm", cnDescription: "软风" };
    } else if (ms <= 3.3) {
        return { level: 2, description: "Light air", cnDescription: "轻风" };
    } else if (ms <= 5.4) {
        return { level: 3, description: "Light breeze", cnDescription: "微风" };
    } else if (ms <= 7.9) {
        return { level: 4, description: "Gentle breeze", cnDescription: "和风" };
    } else if (ms <= 10.7) {
        return { level: 5, description: "Moderate breeze", cnDescription: "清劲风" };
    } else if (ms <= 13.8) {
        return { level: 6, description: "Strong breeze", cnDescription: "强风" };
    } else if (ms <= 17.1) {
        return { level: 7, description: "Moderate gale", cnDescription: "疾风" };
    } else if (ms <= 20.7) {
        return { level: 8, description: "Fresh gale", cnDescription: "大风" };
    } else if (ms <= 24.4) {
        return { level: 9, description: "Strong gale", cnDescription: "烈风" };
    } else if (ms <= 28.4) {
        return { level: 10, description: "Whole gale", cnDescription: "狂风" };
    } else if (ms <= 32.6) {
        return { level: 11, description: "Storm", cnDescription: "暴风" };
    } else if (ms <= 36.9) {
        return { level: 12, description: "Hurricane", cnDescription: "飓风" };
    } else if (ms <= 41.4) {
        return { level: 13, description: "Hurricane", cnDescription: "飓风" };
    } else if (ms <= 46.1) {
        return { level: 14, description: "Hurricane", cnDescription: "飓风" };
    } else if (ms <= 50.9) {
        return { level: 15, description: "Hurricane", cnDescription: "飓风" };
    } else if (ms <= 56.0) {
        return { level: 16, description: "Hurricane", cnDescription: "飓风" };
    } else if (ms <= 61.2) {
        return { level: 17, description: "Hurricane", cnDescription: "飓风" };
    } else {
        return { level: -1, description: "Beyond scale", cnDescription: "超强飓风" }; // 超出标准表
    }
}



async function getWeather(result) {
    let city = '';
	let country = '';
	let IP = '';
	let ipCountryOrProv = result.country || '';
	let ipCity = result.city || '';
	
	let lat = result.location?.lat ?? null;
	let lng = result.location?.lng ?? null;
	
    city = result.city || ''; // 安全访问属性（避免未定义报错）
	country = result.country || ''; // 安全访问属性（避免未定义报错）
	IP = result.ip || ''; // 安全访问属性（避免未定义报错）

    // 检查国家是否为"China"且城市非空
    if (country !== 'China' || country !== '中国' || (city === '' || city === '南京市')) {
        city = 'NanJing'; // 默认使用南京
		country = 'China'
    }
	
	
	
	
	//彩云天气	共10000次免费使用
	//8YT27WcbgjheCGHC	秘钥
	//101.6656,39.2072	经纬度
	//realtime			场景		参考接口文档(https://platform.caiyunapp.com/api/manage?mode=weather)
	// https://api.caiyunapp.com/v2.6/8YT27WcbgjheCGHC/101.6656,39.2072/realtime
	
	
	//中国天气网的接口	https://cy.weather.com.cn/?channel=2
	//https://cy.weather.com.cn/api/v1/delivery?platform=1&area_id=101190107	查询天气
	//https://weizui-weather.oss-cn-beijing.aliyuncs.com/content/9-18-17-16/static/js/index-BCrDheyC.js	城市代码在里面
	

	//准确性待验证，目前看有些数据大多准确，但可能需要验证。（数据源：https://gitee.com/smalltrees/API/blob/master/XiaomiWeather.md  有对应码表之类的，注意查看）
	//https://weatherapi.market.xiaomi.com/wtr-v3/weather/all?latitude=0&longitude=0&isLocated=true&locationKey=weathercn:101190101&days=5&appKey=weather20151024&sign=zUFJoAR2ZVrDy1vF3D07&isGlobal=false&locale=zh_cn
	//南京	101190101
	//南京.溧水	101190102
	//南京.高淳	101190103
	//南京.江宁	101190104
	//南京.六合	101190105
	//南京.江浦	101190106
	//南京.浦口	101190107
	
	//"浦口": {"AREAID": "101190107",},	(中国天气网的数据)
	//"玄武": {"AREAID": "101190108",},
	//"雨花台": {"AREAID": "101190113",}


	//百度api:	ak=bXUhheJeBlvHspEr1fWaAl473iBV5Fa1
	//https://api.map.baidu.com/weather/v1/?district_id=320102&data_type=all&ak=bXUhheJeBlvHspEr1fWaAl473iBV5Fa1

    const url = `https://wttr.in/${city}?format=j1`

    let output = fetch(url)
        .then((res) => res.json())
        .then((data) => {
			console.log("查询天气成功：",country,",",city)
            const getWeatherIcon = (desc) => {
                desc = desc.toLowerCase();
                // Emoji映射（通用方案）
                if (desc.includes('sunny') || desc.includes('clear')) return '☀️';
                if (desc.includes('cloud') || desc.includes('overcast')) return '☁️';
                if (desc.includes('partlycloudy')) return '⛅️';
                if (desc.includes('rain')) return '🌧️';
                if (desc.includes('heavysnow')) return '❄️';
                if (desc.includes('lightsnow')) return '🌨';
                if (desc.includes('fog') || desc.includes('mist')) return '🌫️';
                if (desc.includes('storm')) return '⛈️';
                return '🌡️'; // 默认图标
            };


            // console.log(data)

            // CURRENT WEATHER
            //let currentWeather = data.current_condition[0]

            // CURRENT WEATHER CONDITION FORMAT
            // FeelsLikeC: "11"
            // FeelsLikeF: "52"
            // cloudcover: "75"
            // humidity: "88"
            // lang_ru: [{…}]
            // localObsDateTime: "2021-11-04 03:45 PM"
            // observation_time: "01:45 PM"
            // precipInches: "0.0"
            // precipMM: "0.0"
            // pressure: "1024"
            // pressureInches: "30"
            // temp_C: "12"
            // temp_F: "54"
            // uvIndex: "4"
            // visibility: "6"
            // visibilityMiles: "3"
            // weatherCode: "116"
            // weatherDesc: [{…}]
            // weatherIconUrl: [{…}]
            // winddir16Point: "SE"
            // winddirDegree: "140"
            // windspeedKmph: "19"
            // windspeedMiles: "12"
						
						
			
			
            let weather = data.weather[0]//1、2分别是明天、后天的天气
            // TODAY WEATHER
            // 0:today, 1:tomorrow, 2:after tomoroon
            // astronomy: Array(1 item)
            // avgtempC: "11"
            // avgtempF: "52"
            // date: "2021-11-04"
            // hourly: (8) [{…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}]
            // maxtempC: "15"
            // maxtempF: "58"
            // mintempC: "10"
            // mintempF: "49"
            // sunHour: "8.8"
            // totalSnow_cm: "0.0"
            // uvIndex: "1"

            let astronomy = data.weather[0].astronomy[0]
            // ASTRONOMY FORMAT
            // moon_illumination: "7"
            // moon_phase: "Waxing Crescent"
            // moonrise: "05:29 AM"
            // moonset: "04:04 PM"
            // sunrise: "06:29 AM"
            // sunset: "04:07 PM"

            


            // 获取当前时间
            const now = new Date();
            const currentHour = now.getHours(); // 获取当前小时数（0-23）[6,7](@ref)

            // 计算当前时间对应的3小时间隔的索引
            // 例如：当前小时为2，则索引为0（0-2点）；小时为5，则索引为1（3-5点）
            const index = Math.min(
                Math.floor(currentHour / 3), // 计算当前小时属于哪个3小时区间
                weather.hourly.length - 1 // 确保索引不超过数组范围
            );

			//console.log("currentHour："+currentHour);
			console.log("index："+index,"；hoursMean：",index*3+"-"+(index*3+2));
			//console.log("weather.hourly[index]："+JSON.stringify(weather.hourly[index]));
            // 获取对应的天气对象
            let currentWeather = weather.hourly[index];
			const maxUv = Math.max(...weather.hourly.map(hour => hour.uvIndex));
			let currentUv = currentWeather.uvIndex
			//获取当前天气的更新时间
			let currentWeather_time = ((parseInt(currentWeather.time,10)/300)*3).toString().padStart(2, '0')//格式00、03、06。。。。21
			if(! isNaN(currentWeather_time)){
				if(currentWeather_time > 12 ) currentWeather_time = (currentWeather_time -12)+":00 PM";
				else currentWeather_time=currentWeather_time+":00 AM";
			}
			//获取系统当前时间
			let nowTime = getNowTime()[2];
			//获取天气图标
            const weatherIcon = getWeatherIcon(currentWeather.weatherDesc[0].value);
			
			
			//风力等级转换
			let windSpeedMs = kmhToMs(currentWeather.windspeedKmph);
			let windLevelInfo = getWindForceLevel(windSpeedMs);
			
            const output_text = `
##### Current
coordinates: "${lat}, ${lng}"
IP: ${IP}
IP归属地: ${ipCountryOrProv}
IP归属城市: ${ipCity}
Country: ${country}
City: ${city}
Weather: ${weatherIcon}
uvIndex(1-15): ${currentUv}
Temperature(℃): ${currentWeather.tempC}
CurrentWeatherTime: ${currentWeather_time}
GetWeatherTime: ${nowTime}
Feels Like(℃): ${currentWeather.FeelsLikeC}
Pressure(hPa): ${currentWeather.pressure}
Humidity(%): ${currentWeather.humidity}
WindSpeed: ${windLevelInfo.level}
WindSpeedDesc: ${windLevelInfo.cnDescription}
##### Day
TempRange(℃): ${weather.mintempC}-${weather.maxtempC}
SunHour: ${weather.sunHour}h
Sunrise: ${astronomy.sunrise}
Sunset: ${astronomy.sunset}`

            return output_text
        })

    return output
}

module.exports = getWeather