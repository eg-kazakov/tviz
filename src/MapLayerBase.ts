import {circleMarker, CircleMarker, FeatureGroup, LatLngLiteral, Map as LMap} from 'leaflet';

export function createCircleMarker(coord: LatLngLiteral, color: string): CircleMarker {
    return circleMarker(coord, {
        radius: 4,
        weight: 1,
        color: '#606060',
        fillColor: color,
        fillOpacity: 0.8,
    });
}

export abstract class MapLayerBase{
    protected readonly __map: LMap;
    protected __features: FeatureGroup|null = null;
    readonly sourceName: String;

    protected constructor(map: LMap, name: String) {
        this.__map = map;
        this.sourceName = name;
    }

    abstract get fullTitle(): String;

    fitMap() {
        if (!this.__features) return;

        this.__map.fitBounds(this.__features.getBounds());
    }

    clearMap() {
        if (!this.__features) return;

        this.__features.remove();
        this.__features = null;
    }
}