const restaurants = window.RESTAURANTS || [];
const defaultCenter = [1.2782, 124.8780];
const map = L.map('map', {zoomControl: true}).setView(defaultCenter, 16);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19,
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);

const markers = new Map();
let userLocation = null;
let userLocationMarker = null;
let userAccuracyCircle = null;
const markerIcon = L.divIcon({
  className: 'food-marker-wrap',
  html: '<div class="food-marker">🍴</div>',
  iconSize: [38,42],
  iconAnchor: [19,40]
});

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, c => ({
    '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
  }[c]));
}
function directionsUrl(restaurant) {
  const destination = `${Number(restaurant.latitude)},${Number(restaurant.longitude)}`;
  const route = userLocation ? `${userLocation.lat},${userLocation.lng};${destination}` : destination;
  return `https://www.openstreetmap.org/directions?engine=fossgis_osrm_car&route=${encodeURIComponent(route)}`;
}
function renderList() {
  const list = document.getElementById('restaurantList');
  list.innerHTML = restaurants.map(r => `
    <button class="place-item" type="button" data-id="${Number(r.id)}" data-name="${escapeHtml(r.nama)}">
      <div class="place-thumb">${r.foto ? `<img src="assets/uploads/${encodeURIComponent(r.foto)}" alt="${escapeHtml(r.nama)}">` : '<span>🍜</span>'}</div>
      <div class="place-info"><strong>${escapeHtml(r.nama)}</strong><span>${escapeHtml(r.kategori || 'Rumah Makan')}</span>
      <small>★ ${r.reviews?.length ? (r.reviews.reduce((s,v)=>s+Number(v.rating),0)/r.reviews.length).toFixed(1) : 'Belum ada rating'} · ${r.reviews?.length || 0} ulasan</small></div>
      <span class="chevron">›</span>
    </button>`).join('');
  document.getElementById('placeCount').textContent = `${restaurants.length} tempat ditemukan`;
  document.querySelectorAll('.place-item').forEach(button => button.addEventListener('click', () => {
    const r = restaurants.find(item => String(item.id) === button.dataset.id);
    const marker = markers.get(button.dataset.id);
    if (marker) { map.flyTo(marker.getLatLng(), 18); marker.openTooltip(); }
    if (r) showDetail(r.id);
  }));
}
function showDetail(id) {
  const r = restaurants.find(item => Number(item.id) === Number(id));
  if (!r) return;
  const modal = document.getElementById('detailModal');
  const content = document.getElementById('detailContent');
  modal.classList.remove('hidden');
  const reviews = r.reviews || [];
  const avg = reviews.length ? (reviews.reduce((s,v)=>s+Number(v.rating),0)/reviews.length).toFixed(1) : null;
  const photo = r.foto
    ? `<img class="detail-photo" src="assets/uploads/${encodeURIComponent(r.foto)}" alt="${escapeHtml(r.nama)}">`
    : `<div class="detail-photo placeholder-photo">🍜<span>Foto belum tersedia</span></div>`;
  const reviewHtml = reviews.length ? reviews.map(v => `
    <div class="review"><div class="review-head"><strong>${escapeHtml(v.nama_pengunjung)}</strong>
    <span>${'★'.repeat(Number(v.rating))}${'☆'.repeat(5-Number(v.rating))}</span></div>
    <p>${escapeHtml(v.komentar)}</p><small>${escapeHtml(v.created_at)}</small></div>`).join('')
    : '<p class="muted">Belum ada ulasan untuk tempat ini.</p>';
  content.innerHTML = `${photo}<div class="detail-body">
    <div class="eyebrow">${escapeHtml(r.kategori || 'Rumah Makan')}</div>
    <h2>${escapeHtml(r.nama)}</h2>
    <div class="rating-line"><span class="stars">★</span><strong>${avg ? `${avg} / 5` : 'Belum ada rating'}</strong><span class="muted">(${reviews.length} ulasan)</span></div>
    <p class="detail-address">📍 ${escapeHtml(r.alamat)}</p>
    <p>${escapeHtml(r.deskripsi || 'Belum ada deskripsi.')}</p>
    <div class="hours"><span>Jam operasional</span><strong>${escapeHtml(r.jam_buka || '--:--')} – ${escapeHtml(r.jam_tutup || '--:--')}</strong></div>
    <a class="direction-button" data-restaurant-id="${Number(r.id)}" target="_blank" rel="noopener" href="${directionsUrl(r)}">Petunjuk arah dari lokasi saya ↗</a>
    <section class="reviews-section"><h3>Ulasan pengunjung</h3>${reviewHtml}</section>
    <p class="muted static-note">Versi GitHub Pages menampilkan data statis. Pengiriman ulasan dan pengelolaan data memerlukan backend PHP/MySQL.</p>
    </div>`;
}
restaurants.forEach(r => {
  const lat = Number(r.latitude), lng = Number(r.longitude);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return;
  const marker = L.marker([lat,lng], {icon:markerIcon}).addTo(map);
  marker.bindTooltip(escapeHtml(r.nama), {direction:'top'});
  marker.on('click', () => showDetail(r.id));
  markers.set(String(r.id), marker);
});
renderList();

let markersEnabled = true;
const markerToggleControl = L.control({position:'topright'});
markerToggleControl.onAdd = function() {
  const container = L.DomUtil.create('div','leaflet-bar marker-toggle-control');
  const button = L.DomUtil.create('button','',container);
  button.type = 'button';
  button.setAttribute('aria-pressed','true');
  button.innerHTML = '<span class="toggle-indicator"></span><span class="toggle-label">Nonaktifkan titik</span>';
  L.DomEvent.disableClickPropagation(container);
  L.DomEvent.on(button,'click',() => {
    markersEnabled = !markersEnabled;
    markers.forEach(marker => {
      if (markersEnabled && !map.hasLayer(marker)) marker.addTo(map);
      else if (!markersEnabled && map.hasLayer(marker)) map.removeLayer(marker);
    });
    button.setAttribute('aria-pressed',String(markersEnabled));
    button.querySelector('.toggle-label').textContent = markersEnabled ? 'Nonaktifkan titik' : 'Aktifkan titik';
  });
  return container;
};
markerToggleControl.addTo(map);

document.getElementById('searchInput').addEventListener('input', e => {
  const q = e.target.value.toLowerCase().trim();
  let visible = 0;
  document.querySelectorAll('.place-item').forEach(item => {
    const show = item.dataset.name.toLowerCase().includes(q);
    item.style.display = show ? '' : 'none';
    if (show) visible++;
  });
  document.getElementById('placeCount').textContent = `${visible} tempat ditemukan`;
});
document.querySelectorAll('[data-close]').forEach(el => el.addEventListener('click', () => document.getElementById('detailModal').classList.add('hidden')));
document.addEventListener('keydown', e => { if (e.key === 'Escape') document.getElementById('detailModal').classList.add('hidden'); });

const locateControl = L.control({position:'topright'});
locateControl.onAdd = function() {
  const div = L.DomUtil.create('div','leaflet-bar user-locate-control');
  const button = L.DomUtil.create('button','',div);
  button.type = 'button';
  button.title = 'Tampilkan lokasi saya';
  button.setAttribute('aria-label','Tampilkan lokasi saya');
  button.innerHTML = '◎';
  L.DomEvent.disableClickPropagation(div);
  L.DomEvent.on(button,'click',locateUser);
  return div;
};
locateControl.addTo(map);
function locateUser() {
  if (!navigator.geolocation) { alert('Browser ini tidak mendukung fitur lokasi.'); return; }
  map.getContainer().classList.add('locating');
  navigator.geolocation.getCurrentPosition(position => {
    map.getContainer().classList.remove('locating');
    userLocation = {lat:position.coords.latitude,lng:position.coords.longitude};
    const point = [userLocation.lat,userLocation.lng];
    if (userLocationMarker) map.removeLayer(userLocationMarker);
    if (userAccuracyCircle) map.removeLayer(userAccuracyCircle);
    userLocationMarker = L.circleMarker(point,{radius:9,color:'#fff',weight:3,fillColor:'#2678e8',fillOpacity:1})
      .addTo(map).bindTooltip('Lokasi saya',{direction:'top'});
    userAccuracyCircle = L.circle(point,{radius:Math.max(position.coords.accuracy || 30,25),color:'#2678e8',weight:1,fillColor:'#2678e8',fillOpacity:.10}).addTo(map);
    map.flyTo(point,Math.max(map.getZoom(),16));
    const currentLink = document.querySelector('#detailContent .direction-button');
    if (currentLink) {
      const selected = restaurants.find(item => Number(item.id) === Number(currentLink.dataset.restaurantId));
      if (selected) currentLink.href = directionsUrl(selected);
    }
  }, error => {
    map.getContainer().classList.remove('locating');
    const message = error.code === 1 ? 'Izin lokasi ditolak. Izinkan akses lokasi pada pengaturan browser.'
      : error.code === 2 ? 'Lokasi belum dapat ditentukan. Pastikan GPS/lokasi perangkat aktif.'
      : 'Permintaan lokasi melewati batas waktu. Coba lagi.';
    alert(message);
  }, {enableHighAccuracy:true,timeout:15000,maximumAge:30000});
}
