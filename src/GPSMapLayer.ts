import {featureGroup, LatLngLiteral, Map as LMap} from 'leaflet';
import {MapLayerBase, createCircleMarker} from './MapLayerBase';

export class GPSMapLayer extends MapLayerBase {
    constructor(name: String, points: LatLngLiteral[], map: LMap){
        super(map, name);
        this.__drawMarkers(points);
    }

    get fullTitle(): String {
        return `GPS: ${this.sourceName}`
    }

    private __drawMarkers(points: LatLngLiteral[]){
        const markers = points.map(latLng => createCircleMarker(latLng, '#aaaaaa'));
        this.__features = featureGroup(markers).addTo(this.__map);
    }
}