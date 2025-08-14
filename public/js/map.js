maptilersdk.config.apiKey = mapToken;

const map = new maptilersdk.Map({
  container: 'map',
  style: maptilersdk.MapStyle.STREETS,
  center: coordinates,
  zoom: 6
});

const popup = new maptilersdk.Popup({ offset: 25 })
  .setLngLat(coordinates)
  .setHTML(`
    <h6>${listingData.title}</h6>
    <p>Exact location will be provided after booking.</p>
  `);

new maptilersdk.Marker({ color: 'red' })
  .setLngLat(coordinates)
  .setPopup(popup)
  .addTo(map);
