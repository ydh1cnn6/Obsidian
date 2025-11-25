function getGeoLocationInfo() {
	//https://r.inews.qq.com/api/ip2city	城市-中文
	//https://api.vore.top/api/IPdata?ip=	城市-中文
	
	//腾讯api	月配额6000，并发5
	//https://lbs.qq.com/dev/console/quota/account 配额
	//https://apis.map.qq.com/ws/location/v1/ip?key=4ZVBZ-DTUWJ-SBYFC-XVAZF-PBVWV-HZFST		
	
	

    return fetch('https://r.inews.qq.com/api/ip2city')
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json(); // return json data
      })
      .then(json => {
				  
        // check if the data exist
        if (
          json.city
        ) {
					
            // get regionName
		    let country_city = { country: '', city: '' }; // 改用 let 声明

			country_city = {
			  country: json?.country || "", // 确保属性名明确
			  city: json?.city || ""
			};

		return country_city;
        } else {
          throw new Error('Some expected fields are missing in the JSON data');
        }
      })
      .catch(error => {
        console.error('Error fetching location data:', error);
        return ''; // return empty string when error
      });
  }


async function getGeoLocationInfo() {
  try {
    // 使用 Obsidian 内置的 requestUrl（无 CORS 限制）
    const response = await requestUrl({
      url: "https://r.inews.qq.com/api/ip2city",
      method: "GET"
    });

    const json = response.json; // requestUrl 的响应数据在 .json 字段中

    // 检查数据是否存在
    if (json?.city) {
	  console.log("获取地理位置成功：", json);
      return {
        country: json.country || "",
        city: json.city || ""
      };
    } else {
      throw new Error("返回数据中缺少城市信息");
    }
  } catch (error) {
    console.error("获取地理位置失败：", error);
    // 错误时也返回对象（保持类型一致）
    return { country: "", city: "" };
  }
}
module.exports = getGeoLocationInfo;