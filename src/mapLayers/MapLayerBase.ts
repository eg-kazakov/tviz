import {circleMarker, CircleMarker, CircleMarkerOptions, FeatureGroup, LatLngLiteral, Map as LMap} from 'leaflet';

const opacityActive = 0.8;
const opacityInActive = 0.3;

export function createCircleMarker(coord: LatLngLiteral, color: string): CircleMarker {
    return circleMarker(coord, <CircleMarkerOptions>{
        radius: 4,
        weight: 1,
        color: '#606060',
        fillColor: color,
        fillOpacity: opacityActive,
        zIndexOffset: 10
    });
}

export abstract class MapLayerBase {
    protected readonly __map: LMap;
    protected readonly __markerToSourceMap: Map<CircleMarker, any> = new Map();
    protected readonly __selectedMarkers: Set<CircleMarker> = new Set();
    protected readonly __csvHeader: string[];
    protected __features: FeatureGroup|null = null;
    protected __isVisible: boolean = true;
    protected __isActive: boolean = false;
    readonly sourceName: String;

    protected constructor(map: LMap, name: String, csvHeader: string[]) {
        this.__map = map;
        this.sourceName = name;
        this.__csvHeader = csvHeader;
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

    get isActive(){
        return this.__isActive;
    }

    set isActive(isActive: boolean) {
        if(this.__isActive === isActive || !this.__features) return;

        if(isActive) {
            this.__features.bringToFront();
            this.__features.setStyle({opacity: opacityActive, fillOpacity: opacityActive});
        }
        else {
            this.__features.bringToBack();
            this.__features.setStyle({opacity: opacityInActive, fillOpacity: opacityInActive});
            this.__selectedMarkers.forEach(m => this.__makeMarkerUnSelected(m))
        }

        this.__isActive = isActive;
    }

    fitMap() {
        if (!this.__features) return;

        this.__map.fitBounds(this.__features.getBounds());
    }

    clearMap() {
        if (!this.__features) return;

        this.__features.remove();
        this.__selectedMarkers.clear();
        this.__markerToSourceMap.clear();
        this.__features = null;
    }

    getSelectionData(): string[][] {
        if(this.__selectedMarkers.size < 1) return [];

        const result = [this.__csvHeader];
        for (const marker of this. __selectedMarkers) {
            if (this.__markerToSourceMap.has(marker)) {
                const csvRowObj = this.__markerToSourceMap.get(marker);
                result.push(this.__csvHeader.map(colName => csvRowObj[colName]))
            }
        }
        return result;
    }

    __toggleMarkerSelected(marker: CircleMarker){
        if (!this.__selectedMarkers.has(marker)) {
            this.__makeMarkerSelected(marker);
        } else {
            this.__makeMarkerUnSelected(marker);
        }
    }

    __makeMarkerSelected(marker: CircleMarker) {
        marker.setRadius(marker.getRadius() * 2);
        this.__selectedMarkers.add(marker)
    }

    __makeMarkerUnSelected(marker: CircleMarker) {
        marker.setRadius(marker.getRadius() / 2);
        this.__selectedMarkers.delete(marker)
    }
}
