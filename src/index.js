'use strict';
import 'regenerator-runtime/runtime';
import axios from 'axios';

const registerEventHandlers = () => {
  document.addEventListener('DOMContentLoaded', displayWeatherAtLocationAsync);
  document.getElementById("down-temp").addEventListener('click', () => changeTemp(-1));
  document.getElementById("up-temp").addEventListener('click', () => changeTemp(1));
  document.getElementById("city-search-input").addEventListener("search", changeCity)
  document.getElementById("city-search-input").addEventListener("search", changeWeatherAsync);
  document.getElementById("selected-location").addEventListener("click", changeWeatherAsync);
  document.getElementById("current-location").addEventListener("click", displayWeatherAtLocationAsync);
  const skyConditions = document.getElementsByClassName("weather-dropdown-item");
  for (const condition of skyConditions){
    condition.addEventListener("click", () => toggleSky(condition.textContent))
  };
  document.getElementById("toggle-f-c").addEventListener('click', switchFAndC);
};

const FToC = (F) => {
  return (F - 32) * .5556;
};

const CToF = (C) => {
  return (C * 1.8) + 32;
};

const switchFAndC = () => {
  if (state.tempMetric === "F"){
    state.tempMetric = "C";
    setTemp();
  }else{
    state.tempMetric = "F";
    setTemp();
  }
};

const imgObject = {
  rainSky: require('/ada-project-docs/assets/rain_sky.jpg'), 
  cloudsSky: require('/ada-project-docs/assets/broken_clouds_sky.jpg'), 
  thunderstormSky: require('/ada-project-docs/assets/thunderstorm_sky.jpg'), 
  clearSky: require('/ada-project-docs/assets/clear_sky.jpg'), 
  mistSky: require('/ada-project-docs/assets/mist_sky.jpg'), 
  snowSky: require('/ada-project-docs/assets/snow_sky.jpg'), 
  winterLandscape: require('/ada-project-docs/assets/winter_landscape.png'), 
  summerLandscape: require('/ada-project-docs/assets/summer_landscape.png'), 
  springLandscape: require('/ada-project-docs/assets/spring_landscape.png'), 
  fallLandscape: require('/ada-project-docs/assets/fall_landscape.png'), 
  hottestLandscape: require('/ada-project-docs/assets/hottest_landscape.png')
};

const state = {
  tempMetric: "F",
  temperatureF: 60,
  temperatureC: 15.5568,
  cityName: 'Tokyo',
  weatherDescription: "broken clouds",
  weatherIconName: "none",
  oldIconName: "none",
  skyImg: imgObject['cloudsSky'],
  landscapeImg: imgObject['springLandscape'],
  currentLat: 35.604,
  currentLon: 139.7248 
};

const weatherMainToIcon = {"THUNDERSTORM": ["bi-cloud-lightning-rain", imgObject['thunderstormSky']], "DRIZZLE": ["bi-cloud-drizzle", imgObject['rainSky']], "RAIN": ["bi-cloud-rain", imgObject['rainSky']], "SNOW": ["bi-cloud-snow", imgObject['snowSky']], "MIST": ["bi-cloud-haze", imgObject['mistSky']], "SMOKE": ["bi-cloud-fog", imgObject['mistSky']], "HAZE": ["bi-cloud-haze", imgObject['mistSky']], "DUST": ["bi-cloud-fog", imgObject['mistSky']], "FOG": ["bi-cloud-haze", imgObject['mistSky']], "SAND": ["bi-cloud-fog", imgObject['mistSky']], "DUST": ["bi-cloud-fog", imgObject['mistSky']], "ASH": ["bi-cloud-fog", imgObject['mistSky']], "SQUALL": ["bi-cloud-fog", imgObject['mistSky']], "TORNADO": ["bi-cloud-fog", imgObject['mistSky']], "CLEAR": ["bi-sun", imgObject['clearSky']], "CLOUDS": ['bi-clouds', imgObject['cloudsSky']]};

const displayWeatherAtLocationAsync = () => {
  navigator.geolocation.getCurrentPosition(async (position) => {
  state.currentLat = position.coords.latitude;
  state.currentLon = position.coords.longitude;
  console.log("got geolocation", position)
  const weatherResponse = await getWeather(state.currentLat, state.currentLon);
  updateState(weatherResponse);
  state.cityName = await getCityName();
  updateUI();
  }, (error) => {
    if (error.code === error.PERMISSION_DENIED) {
      state.weatherIconName = "bi-clouds";
      updateUI();
      console.log("Location permission denied");
      setTimeout(() => 
      window.alert("Enable browser location access or type your city/region in the dropdown search to access current local weather information."), 2000);
    };
  });
};

const getCityName = async () => {
  try{
    const cityResponse = await axios.get("https://weather-report-server.herokuapp.com/city", {
      params: {
        lat: state.currentLat,
        lon: state.currentLon
      },
    });
    console.log("got the city name", cityResponse.data);
    return cityResponse.data.address.city || cityResponse.data.address.region || cityResponse.data.address.county;
  }catch(error){
    console.log("error with getting city", error);
  };
};

document.addEventListener('DOMContentLoaded', () => {registerEventHandlers(); displayWeatherAtLocationAsync();});

const changeTemp = (change) => {
  if (state.tempMetric === "F"){
    state.temperatureF += change;
    state.temperatureC = FToC(state.temperatureF);
  }else{
    state.temperatureC += change;
    state.temperatureF = CToF(state.temperatureC);
  }
  setTemp();
  checkTextColorChange();
  checkSeasonChange();
};

const checkSeasonChange = () => {
  if (state.temperatureF <= 32){
    document.getElementById("temp-img").src = imgObject['winterLandscape'];
  } else if (32 < state.temperatureF && state.temperatureF < 56){
    document.getElementById("temp-img").src = imgObject['fallLandscape'];
  } else if (56 <= state.temperatureF  && state.temperatureF < 75){
    document.getElementById("temp-img").src = imgObject['springLandscape'];
  } else if (75 <= state.temperatureF  && state.temperatureF < 95) {
    document.getElementById("temp-img").src = imgObject['summerLandscape'];
  }else {
    document.getElementById("temp-img").src = imgObject['hottestLandscape'];
  }
};

const checkTextColorChange = () => {
  if (state.temperatureF <= 49){
    document.getElementById("temp").style.color = "teal";
  }else if (state.temperatureF > 49 && state.temperatureF < 60){
    document.getElementById("temp").style.color = "green";
  }else if (state.temperatureF >= 60 && state.temperatureF < 70){
    document.getElementById("temp").style.color = "yellow";
  } else if (state.temperatureF >= 70 && state.temperatureF < 80){
    document.getElementById("temp").style.color = "orange";
  } else{
    document.getElementById("temp").style.color = "red";
  }
};

const changeCity = () => {
  state.cityName = document.getElementById("city-search-input").value;
  document.getElementById("city-name").textContent = state.cityName;
};

const changeWeatherAsync = async () => {
  const q = state.cityName;
  const {lat, lon} = await getLatLon(q);
  const weatherResponse = await getWeather(lat, lon)
  updateState(weatherResponse);
  updateUI();
};

const getLatLon = async (q) => {
  try{
    const response = await axios.get("https://weather-report-server.herokuapp.com/location", {
      params: {
        q
      }
    });  
    console.log('successfully got lat and lon!', response.data);
    return {lat: response.data[0].lat, lon: response.data[0].lon};
  }catch(error){
    console.log('location error', error);
  };
};

const getWeather = async (lat, lon) => {
  try{
    const response = await axios.get("https://weather-report-server.herokuapp.com/weather", {
      params: {
        lat,
        lon
      }
    });
    console.log('successfully got lat and lon!', response.data);
    return response;
  }catch(error){
    console.log('weather error!', error);
  }
};

const updateState = (weatherResponse) => {
  state.temperatureF = weatherResponse.data.current.temp;
  state.temperatureC = FToC(state.temperatureF);
  state.weatherDescription = weatherResponse.data.current.weather[0].description;
  state.oldIconName = state.weatherIconName;
  state.weatherIconName = weatherMainToIcon[weatherResponse.data.current.weather[0].main.toUpperCase()][0];
  state.skyImg = weatherMainToIcon[weatherResponse.data.current.weather[0].main.toUpperCase()][1];
  console.log('successfully stored response data!', weatherResponse.data);
};

const updateUI = () => {
  setTemp();
  document.getElementById("city-name").textContent = state.cityName;
  checkTextColorChange();
  checkSeasonChange();
  setWeatherIcon();
  setSky();
  setWeatherDescription();
  console.log('successfully updated UI!');
};

const setTemp = () => {
  if (state.tempMetric === "F"){
    document.getElementById("temp").innerHTML = `${Math.round(state.temperatureF)}&deg;`;
  }else{
    document.getElementById("temp").innerHTML = `${Math.round(state.temperatureC)}&deg;`;
  };
};

const setSky = () => {
  document.body.style.background = `url(${state.skyImg}) no-repeat top fixed`;
  document.body.style.backgroundSize = '100% 100%';
};

const setWeatherIcon = () => {
  document.getElementsByClassName("weather-icon")[1].classList.replace(state.oldIconName, state.weatherIconName);
};

const setWeatherDescription = () => {
  document.getElementById("wdescription").textContent = state.weatherDescription;
};

const toggleSky = (condition) => {
  state.weatherDescription = condition; 
  setWeatherDescription();
  state.skyImg = weatherMainToIcon[condition.toUpperCase()][1];
  setSky();
  state.oldIconName = state.weatherIconName;
  state.weatherIconName = weatherMainToIcon[condition.toUpperCase()][0];
  setWeatherIcon();
};

//Promise Chaining Versions (non-await)

// const changeWeather = () => {
//   const q = state.cityName;

  // axios.get("https://weather-report-server.herokuapp.com/location", {
  //   params: {
  //     q
  //   }
  // })
  // .then((response) => {
  //   const lat = response.data[0].lat;
  //   const lon = response.data[0].lon;
  //   console.log('success!', response.data);
  //   axios.get("https://weather-report-server.herokuapp.com/weather", {
  //     params: {
  //       lat,
  //       lon
  //     }
  //   })
    // .then((response) => {
    //   //Store response data
    //   state.temperatureF = Math.round(response.data.current.temp)
    //   state.weatherDescription = response.data.current.weather[0].description;
    //   state.oldIconName = state.weatherIconName;
    //   state.weatherIconName = weatherMainToIcon[response.data.current.weather[0].main][0];
    //   state.skyImg = weatherMainToIcon[response.data.current.weather[0].main][1];
    //   console.log('successfully stored response data!', response.data);
    // })
    // .then(() => {
    //   //Update UI
    //   document.getElementById("temp").textContent = `${state.temperatureF}&deg;`;
    //   checkTextColorChange();
    //   checkSeasonChange();
    //   setWeatherIcon()
    //   setSky();
    //   setWeatherDescription();
    //   console.log('successfully updated UI!');
    // })
    // .catch((error) => {
    //   console.log('error!', error)
    // });
//   })
//   .catch((error) => {
//     console.log('error!', error)
//   });
// }

// const displayWeatherAtLocation = () => {
//   navigator.geolocation.getCurrentPosition((position) => {
//     state.currentLat = position.coords.latitude;
//     state.currentLon = position.coords.longitude;
//     console.log("got geolocation", position)
//     axios.get("https://weather-report-server.herokuapp.com/weather", {
//         params: {
//           lat: state.currentLat,
//           lon: state.currentLon
//         },
//       })
//       .then((weatherResponse) => {
//         //Store response data
//         updateState(weatherResponse);
//         console.log('successfully stored response data!', weatherResponse.data);
//         axios.get("https://weather-report-server.herokuapp.com/city", {
//           params: {
//             lat: state.currentLat,
//             lon: state.currentLon
//           },
//         })
//         .then((cityResponse) => {
//           console.log("got the city name", cityResponse.data)

//           state.cityName = cityResponse.data.address.city || cityResponse.data.address.region || cityResponse.data.address.county
//           //Update UI
//           updateUI();
//         })
//         .catch((error) => {
//           console.log("error with getting city", error)
//         });
//       })
//       .catch((error) => {
//         console.log('error!', error)
//       });
//   }, (error) => {
//     if (error.code === error.PERMISSION_DENIED) {
//       state.weatherIconName = "bi-clouds"
//       updateUI();
//       console.log("Location permission denied");
//       setTimeout(() => 
//       window.alert("Enable browser location access or type your city/region in the dropdown search to access current local weather information."), 2000)
//     };
//   });
// }