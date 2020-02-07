var map;
var maskData;
var popup;
var countryForm = document.getElementById('countryForm');
var zoneForm = document.getElementById('zoneForm');
//取得sidebar
var sidebar = L.control.sidebar('sidebar', {
  position: 'left'
});
//sidebarbtn
// var showSide = document.querySelector('.showSide');

//set default location
map = L.map('map').setView([23.5, 120.5], 8);
//maxZoom: 16 as the maximum zoom
map.locate({ maxZoom: 16 });
//show alert if locate error
// map.on('locationerror', onLocationError);
//find your location
map.on('locationfound', onLocationFound);
countryForm.addEventListener('change', getValue)
//執行sidebar
map.addControl(sidebar);


//建立地圖
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '<a href="https://www.openstreetmap.org/">OSM</a>',
  maxZoom: 19,
}).addTo(map);


// Show sidebar
sidebar.show();
addBar();


//取得JSON
var xhr = new XMLHttpRequest();
xhr.open('get', 'https://raw.githubusercontent.com/kiang/pharmacies/master/json/points.json?fbclid=IwAR3XtDf10Tocq8nHU3kLdEtLvAb_yBIPum9i_t2m_wsHMV41ZdufKpWjDu4');
xhr.send(null);
xhr.onload = function () {
  maskData = JSON.parse(xhr.responseText);
  countrySelect();
  getdata();
}

//篩選重複的市
function countrySelect() {
  let country;
  let countryAry = [];
  for (let i = 0; i < maskData.features.length; i++) {
    let countryStr = maskData.features[i].properties.address.substring(0, 3);
    countryAry.push(countryStr);
  }
  // let zoneStr = maskData.features[i].properties.address.substring(0, 6);
  country = countryAry.filter(function (value, index, arr) {
    return arr.indexOf(value) === index;
  });
  updateSelect(country);
}
function updateSelect(country) {
  let str;
  for (let i = 0; i < country.length; i++) {
    str += `<option value="${country[i]}">${country[i]}</option>`
  }
  countryForm.innerHTML = str;
}
// function zoneSelect(e) {
//   let val = e.target.value;
//   let str;
//   let ary;
//   for (let i = 0; i < maskData.features.length; i++) {
//     let countryStr = maskData.features[i].properties.address.substring(0, 3);
//     let zoneStr = maskData.features[i].properties.address.substring(3, 6);
//     ary.push(zoneStr);
//   }
//   aryNoDuplicate = ary.filter(function (value, index, arr) {
//     return arr.indexOf(value) === index;
//   });

//   for (let i = 0; i < aryNoDuplicate.length; i++) {

//     if (countryStr == val) {
//       str += `<option value="${zoneStr}">${zoneStr}</option>`
//     }
//   }
//   zoneForm.innerHTML = str;
// }


//locate
function onLocationFound(e) {
  var radius = e.accuracy;

  L.marker(e.latlng).addTo(map)
    .bindPopup("You are within " + radius + " meters from this point").openPopup();
  L.circle(e.latlng, radius).addTo(map);
}


//alert location error
function onLocationError(e) {
  e.message = "無法使用GPS抓取您的位置，請開啟GPS功能後，重新整理。"
  alert(e.message);
}

function getValue(e) {
  let val = e.target.value;
  getdata(val);
}

//取得data
// function getdata(countryUser) {
function getdata() {
  let dataFilter = [];
  // let dataFilter = [{
  //   //geometry 經緯度
  //   geometry: '',
  //   //地點
  //   address: '',
  //   //藥局名稱
  //   name: '',
  //   //藥局電話
  //   tel: '',
  //   //口罩 大人
  //   mask_adult: '',
  //   //口罩 小孩
  //   mask_child: '',
  //   //更新時間
  //   updated: '',
  //   //開放時間
  //   available: ''
  // }]
  for (let i = 0; i < maskData.features.length; i++) {
    //
    let zone = maskData.features[i].properties.address.substring(0, 3);
    // if (countryUser === zone) {
    dataFilter.push({
      geometry: maskData.features[i].geometry.coordinates.reverse(),
      address: maskData.features[i].properties.address,
      name: maskData.features[i].properties.name,
      tel: maskData.features[i].properties.phone,
      mask_adult: maskData.features[i].properties.mask_adult,
      mask_child: maskData.features[i].properties.mask_child,
      updated: maskData.features[i].properties.updated,
      available: maskData.features[i].properties.available
    })
    // }
  }
  setMarker(dataFilter)
}

var markers = new L.MarkerClusterGroup().addTo(map);
function setMarker(dataFilter) {
  // let locatCenter = [];
  // let locatCenterReQ = [];
  for (let i = 0; i < dataFilter.length; i++) {
    markers.addLayer(L.marker(dataFilter[i].geometry)//.addTo(map)
      //彈出視窗
      .bindPopup(`
    <div class="l-popupWrap">
      <h2 class="l-popup__name">${dataFilter[i].name}</h2>
      <ul class="l-popup__detail">
        <li>藥局電話：${dataFilter[i].tel}</li>
        <li>地點：${dataFilter[i].address}</li>
        <li>更新時間：${dataFilter[i].updated == "" ? '無資料' : dataFilter[i].updated}</li>
      </ul>
      <input type="button" value="成人口罩 ${dataFilter[i].mask_adult} 個" class="">
      <input type="button" value="兒童口罩 ${dataFilter[i].mask_child} 個" class="">
    </div>
    `));


    // 取得location中間值
    // locatCenterReQ.push({
    //   x: dataFilter[i].geometry[0],
    //   y: dataFilter[i].geometry[1]
    // });
  }
  // let resortX = locatCenterReQ.sort(function (a, b) { return b.x - a.x; });
  // let resortY = locatCenterReQ.sort(function (a, b) { return b.y - a.y; });
  // locatCenter = [resortX[Math.floor(resortX.length / 2)].x, resortY[Math.floor(resortY.length / 2)].y];
  // map.setView(locatCenter, 14);
  // map.addLayer(markers);
}

function getRecentlocat() {
  console.log(map.locate());
}

//add sidebarsettingBtn
function addBar() {
  let sideBarBtn = document.querySelector('.leaflet-control-zoom');
  sideBarBtn.innerHTML = `
  <a class="leaflet-control-zoom-in" href="#" title="Zoom in" role="button" aria-label="Zoom in">+</a>
  <a class="leaflet-control-zoom-out" href="#" title="Zoom out" role="button" aria-label="Zoom out">−</a>
  <a class="showSideBtn" href="#" role="button"><i class="fas fa-bars"></i></a>
  `
  let showSideBtn = document.querySelector('.showSideBtn');
  showSideBtn.addEventListener('click', toggleSideBar);
}
function toggleSideBar() {
  sidebar.toggle();
  let showSideBtn = document.querySelector('.showSideBtn');
  showSideBtn.classList.toggle("sideBtn--ani");
}