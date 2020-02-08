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
if (window.screen.width > 768) {
  sidebar.show();
}
addBar();


//取得JSON
var xhr = new XMLHttpRequest();
xhr.open('get', 'https://raw.githubusercontent.com/kiang/pharmacies/master/json/points.json?fbclid=IwAR3XtDf10Tocq8nHU3kLdEtLvAb_yBIPum9i_t2m_wsHMV41ZdufKpWjDu4');
xhr.send(null);
xhr.onload = function () {
  maskData = JSON.parse(xhr.responseText).features;
  countrySelect();
  getdata();
}

//篩選重複的市
function countrySelect() {
  let country;
  let countryAry = [];
  for (let i = 0; i < maskData.length; i++) {
    let countryStr = maskData[i].properties.address.substring(0, 3);
    countryAry.push(countryStr);
  }
  // let zoneStr = maskData[i].properties.address.substring(0, 6);
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
//   for (let i = 0; i < maskData.length; i++) {
//     let countryStr = maskData[i].properties.address.substring(0, 3);
//     let zoneStr = maskData[i].properties.address.substring(3, 6);
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
  let radius = e.accuracy;
  let currentLocat = new L.MarkerClusterGroup().addTo(map);
  currentLocat.addLayer(L.marker(e.latlng).addTo(map)
    .bindPopup("您目前的位置").openPopup());
  L.circle(e.latlng, radius).addTo(map);
  map.setView(e.latlng, 14);
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
  for (let i = 0; i < maskData.length; i++) {
    //
    let zone = maskData[i].properties.address.substring(0, 3);
    // if (countryUser === zone) {
    dataFilter.push({
      geometry: maskData[i].geometry.coordinates.reverse(),
      address: maskData[i].properties.address,
      name: maskData[i].properties.name,
      tel: maskData[i].properties.phone,
      mask_adult: maskData[i].properties.mask_adult,
      mask_child: maskData[i].properties.mask_child,
      updated: maskData[i].properties.updated,
      available: maskData[i].properties.available
    })
    // }
  }
  setMarker(dataFilter)
}

var markers = new L.MarkerClusterGroup().addTo(map);
function setMarker(dataFilter) {
  // let locatCenter = [];
  // let locatCenterReQ = [];

  //marker's color set
  let greenIcon = new L.Icon({
    iconUrl: 'https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });
  let redIcon = new L.Icon({
    iconUrl: 'https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });

  for (let i = 0; i < dataFilter.length; i++) {
    let popupBgCoAdult;
    let popupBgCoChild;
    let markerColor;
    let m_adult = dataFilter[i].mask_adult;
    let m_child = dataFilter[i].mask_child;
    //判斷popup裡的btn顏色、marker顏色
    if (m_adult + m_child >= 100) {
      markerColor = greenIcon;
    } else if (m_adult + m_child < 100 && m_adult + m_child != 0) {
      markerColor = redIcon;
    } else {
      markerColor = redIcon;
    }
    if (dataFilter[i].mask_adult >= 50) {
      popupBgCoAdult = "l-bgco--nice";
    } else if (dataFilter[i].mask_adult < 50 && dataFilter[i].mask_adult != 0) {
      popupBgCoAdult = "l-bgco--danger";
    } else {
      popupBgCoAdult = "l-bgco--none"
    }
    if (dataFilter[i].mask_child >= 50) {
      popupBgCoChild = "l-bgco--nice";
    } else if (dataFilter[i].mask_child < 50 && dataFilter[i].mask_adult != 0) {
      popupBgCoChild = "l-bgco--danger";
    } else {
      popupBgCoChild = "l-bgco--none"
    }
    markers.addLayer(L.marker(dataFilter[i].geometry, { icon: markerColor })//.addTo(map)
      //彈出視窗
      .bindPopup(`
    <div class="l-popupWrap">
      <h2 class="l-popup__name">${dataFilter[i].name}</h2>
      <ul class="l-popup__detail">
        <li><i class="fas fa-map-marker-alt"></i> <a href="https://www.google.com.tw/maps/place/${dataFilter[i].address}" target="_blank">${dataFilter[i].address}</a></li>
        <li><i class="fas fa-phone-alt"></i> <a href="tel:${dataFilter[i].tel}">${dataFilter[i].tel}</a></li>
        <li>更新時間：${dataFilter[i].updated == "" ? '無資料' : dataFilter[i].updated} - 實際以藥局發放為準</li>
      </ul>
      <div class="l-popup__inputWrap">
        <input type="button" value="成人口罩 ${dataFilter[i].mask_adult} 個" class="${popupBgCoAdult}">
        <input type="button" value="兒童口罩 ${dataFilter[i].mask_child} 個" class="${popupBgCoChild}">
      </div>
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
  <a class="showSideBtn  showSideBtn--out" href="#" role="button"><i class="fas fa-bars"></i></a>
  `
  let showSideBtnOut = document.querySelector('.showSideBtn--out');
  let showSideBtnIn = document.querySelector('.showSideBtn--in');
  showSideBtnOut.addEventListener('click', toggleSideBar);
  showSideBtnIn.addEventListener('click', toggleSideBar);
}
function toggleSideBar() {
  sidebar.toggle();
  let showSideBtnOut = document.querySelector('.showSideBtn--out');
  showSideBtnOut.classList.toggle("sideBtn--ani");
}