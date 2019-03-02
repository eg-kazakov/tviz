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
    protected __isVisible: boolean = true;
    readonly sourceName: String;

    protected constructor(map: LMap, name: String) {
        this.__map = map;
        this.sourceName = name;
    }

    abstract get fullTitle(): String;

    get isVisible(){
        return this.__isVisible;
    }

    set isVisible(isVisible: boolean){
        if(this.__isVisible === isVisible || !this.__features) return;

        if (isVisible) this.__features.addTo(this.__map);
        else this.__features.remove();
        this.__isVisible = isVisible;
    }

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