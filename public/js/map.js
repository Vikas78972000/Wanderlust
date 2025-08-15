maptilersdk.config.apiKey = window.mapToken;

const map = new maptilersdk.Map({
    container: 'map',
    style: maptilersdk.MapStyle.STREETS,
    center: window.coordinates,
    zoom: 6
});

const popup = new maptilersdk.Popup({ offset: 25 })
    .setLngLat(window.coordinates)
    .setHTML(`
        <h6>${window.listingData.title}</h6>
        <p>Exact location will be provided after booking.</p>
    `);

new maptilersdk.Marker({ color: 'red' })
    .setLngLat(window.coordinates)
    .setPopup(popup)
    .addTo(map);
