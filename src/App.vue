<template>
    <div class="tviz-app">
        <div class="control-panel">
            <layer-control
                    v-for="layer in layers"
                    :key="layer.name"
                    :mapLayer="layer"
                    :active="layer === activeLayer"
            ></layer-control>
            <input type="file" @change="importCsv" :disabled="isInProgress">
        </div>
        <div class="map-panel"></div>
    </div>
</template>

<script lang="ts">
    import {map as lMap, Map as Lmap, tileLayer} from 'leaflet';
    import Vue from 'vue';
    import {Component} from 'vue-property-decorator';
    import LayerControl from './components/LayerControl';
    import {TrajectorySegment} from './TrajectorySegment';
    import {SegmentsMapLayer} from './mapLayers/SegmentsMapLayer';
    import {GPSMapLayer} from './mapLayers/GPSMapLayer';
    import {MapLayerBase} from './mapLayers/MapLayerBase';
    import {loadCsv, CsvData} from './csvLoader';

    @Component ({components: {LayerControl}})
    export default class App extends Vue {
        private __map!: Lmap;
        // ToDo: Use index or id???
        activeLayer: MapLayerBase|null = null;
        layers: MapLayerBase[] = [];
        isInProgress: boolean = false;

        importCsv(event: Event) {
            const fileInput = <HTMLInputElement>event.target;
            if(!fileInput.files) return;

            const file = fileInput.files[0];
            if (this.layers.some(l => l.sourceName === file.name)) return;

            console.log(`File ${file.name}: ${file.size} bytes.`);
            this.isInProgress = true;
            loadCsv(file)
                .then((csvResult: CsvData) => {
                    console.log(`Loaded: ${csvResult.data.length} rows`);

                    if(!this.__map) return;

                    const headersSet = new Set(csvResult.fields);
                    if (!headersSet.has('lat') || !headersSet.has('lat')) {
                        console.error(`Unsupported format: ${csvResult.fields.join(', ')}`);
                        return;
                    }

                    let newLayer: MapLayerBase;
                    if (headersSet.has('segment_id')) {
                        console.log('Segments mode');
                        const segments: TrajectorySegment[] = csvResult.data.reduce(
                            (acc: TrajectorySegment[], row) => {
                                const latLng = {lat: parseFloat(row.lat), lng: parseFloat(row.lon)};
                                if (acc.length < 1 || acc[acc.length - 1].segmentId != row.segment_id) {
                                    acc.push(new TrajectorySegment(row.segment_id));
                                }
                                acc[acc.length - 1].points.push(latLng);
                                return acc;
                            },
                            []);
                        newLayer = new SegmentsMapLayer(file.name, segments, this.__map);
                    } else {
                        console.log('GPS mode');
                        const coords = csvResult.data.map(row => ({
                            lat: parseFloat(row.lat),
                            lng: parseFloat(row.lon)
                        }));
                        newLayer = new GPSMapLayer(file.name, coords, this.__map);
                    }

                    if(newLayer) {
                        this.layers.push(newLayer);
                        this.activeLayer = newLayer;
                    }
                })
                .catch(err => console.error(err))
                .finally(() => this.isInProgress = false);
        }

        mounted() {
            this.$on('remove-layer', (layer: MapLayerBase) => this.layers.splice(this.layers.indexOf(layer), 1));
            this.$on('set-active-layer', (layer: MapLayerBase) => this.activeLayer = layer);

            this.__map = lMap(<HTMLElement>this.$el.querySelector('.map-panel')).setView([51.505, -0.09], 13);
            tileLayer(
                'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
                {
                    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
                    subdomains: ['a','b','c']
                }
            ).addTo(this.__map);
        }
    }
</script>

<style>
    .tviz-app {
        display: flex;
        flex-direction: row;
        justify-content: stretch;
        width: 100vw;
        height: 100vh;
    }

    .tviz-app > .control-panel {
        flex: 1 0 auto;
        box-shadow: 0 6px 12px rgba(0, 0, 0, 0.32);
        z-index: 500;
        background-color: #f2f2f2;
    }

    .tviz-app > .map-panel {
        flex: 1 1 100%;
    }
</style>
