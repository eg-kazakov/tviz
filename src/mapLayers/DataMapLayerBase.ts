import {
    circleMarker,
    CircleMarker,
    CircleMarkerOptions,
    FeatureGroup,
    LatLngBounds,
    LatLngLiteral,
    Map as LMap
} from 'leaflet';

const opacityActive = 0.8;
const opacityInActive = 0.3;

export function createCircleMarker(coord: LatLngLiteral, color: string): CircleMarker {
    // Property zIndexOffset is not listed in leaflet CircleMarkerOptions ts description
    const options: object = {
        radius: 4,
        weight: 1,
        color: '#606060',
        fillColor: color,
        fillOpacity: opacityActive,
        zIndexOffset: 10,
    };
    return circleMarker(coord, options as CircleMarkerOptions);
}

export abstract class DataMapLayerBase {
    protected readonly __map: LMap;
    protected readonly __markerToSourceMap: Map<CircleMarker, {[key: string]: string}> = new Map();
    protected readonly __selectedMarkers: Set<CircleMarker> = new Set();
    protected readonly __csvHeader: string[];
    protected __features!: FeatureGroup;
    protected __isVisible: boolean = true;
    protected __isActive: boolean = false;

    readonly chunkColName: string;
    readonly layerName: string;
    abstract readonly typeNamePrefix: string;

    protected constructor(map: LMap, name: string, csvHeader: string[], chunkColName: string) {
        this.__map = map;
        this.__csvHeader = csvHeader;
        this.layerName = name;
        this.chunkColName = chunkColName;
    }

    get isVisible() {
        return this.__isVisible;
    }

    set isVisible(isVisible: boolean) {
        if (this.__isVisible === isVisible || !this.__features) return;

        if (isVisible) this.__features.addTo(this.__map);
        else this.__features.remove();
        this.__isVisible = isVisible;
    }

    get isActive() {
        return this.__isActive;
    }

    set isActive(isActive: boolean) {
        if (this.__isActive === isActive) return;

        if (isActive) {
            this.__features.bringToFront();
            this.__features.setStyle({opacity: opacityActive, fillOpacity: opacityActive});
        } else {
            this.__features.bringToBack();
            this.__features.setStyle({opacity: opacityInActive, fillOpacity: opacityInActive});
            this.resetSelection();
        }

        this.__isActive = isActive;
    }

    fitMap() {
        this.__map.fitBounds(this.__features.getBounds());
    }

    getBounds(): LatLngBounds {
        return this.__features.getBounds();
    }

    clearMap() {
        this.__features.remove();
        this.__selectedMarkers.clear();
        this.__markerToSourceMap.clear();
    }

    getSelectionData(): string[][] {
        if (this.__selectedMarkers.size < 1) return [];

        const result = [];
        for (const marker of this. __selectedMarkers) {
            if (this.__markerToSourceMap.has(marker)) {
                const csvRowObj = this.__markerToSourceMap.get(marker);
                if (csvRowObj) result.push(this.__csvHeader.map(colName => csvRowObj[colName]));
            }
        }
        return result;
    }

    resetSelection() {
        this.__selectedMarkers.forEach(mrk => this.__makeMarkerUnSelected(mrk));
    }

    protected __toggleMarkerSelected(marker: CircleMarker) {
        if (!this.__selectedMarkers.has(marker)) {
            this.__makeMarkerSelected(marker);
        } else {
            this.__makeMarkerUnSelected(marker);
        }
    }

    private __makeMarkerSelected(marker: CircleMarker) {
        if (!this.__isActive) return;

        marker.setRadius(marker.getRadius() * 2);
        this.__selectedMarkers.add(marker);
    }

    private __makeMarkerUnSelected(marker: CircleMarker) {
        marker.setRadius(marker.getRadius() / 2);
        this.__selectedMarkers.delete(marker);
    }
}
