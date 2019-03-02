<template>
    <div class="tviz-app">
        <div class="control-panel">
            <layer-control
                    v-for="layer in layers"
                    :key="layer.name"
                    :mapLayer="layer"
            ></layer-control>
            <input type="file" @change="importCsv" :disabled="false">
        </div>
        <div class="map-panel"></div>
    </div>
</template>

<script lang="ts">
    import {map as lMap, Map as Lmap, tileLayer} from 'leaflet';
    import Vue from 'vue';
    import {parse as csvFileParse} from 'papaparse';
    import {Component} from 'vue-property-decorator';
    import LayerControl from './components/LayerControl';
    import {TrajectorySegment} from "./TrajectorySegment";
    import {SegmentsMapLayer} from "./SegmentsMapLayer";
    import {GPSMapLayer} from "./GPSMapLayer";
    import {MapLayerBase} from "./MapLayerBase";

    @Component ({components: {LayerControl}})
    export default class App extends Vue {
        layers: MapLayerBase[] = [];
        isInProgress: boolean = false;
        map: Lmap|null = null;

        importCsv(event: Event) {
            const fileInput = <HTMLInputElement>event.target;
            if(!fileInput.files) return;

            const file = fileInput.files[0];
            fileInput.files = null;
            if (this.layers.some(l => l.sourceName === file.name)) return;

            console.log(`File ${file.name}: ${file.size} bytes.`);
            this.isInProgress = true;
            csvFileParse(file, {
                header: true,
                skipEmptyLines: true,
                // worker: true,
                // step(results) {
                //     console.log("Row:", results.data);
                // }
                complete: results => {
                    console.log('Finished:', results.data);
                    if(!this.map) return;

                    const headersSet = new Set(results.meta.fields);
                    if (!headersSet.has('lat') || !headersSet.has('lat')) {
                        console.error(`Unsupported format: ${results.meta.fields.join(', ')}`);
                        return;
                    }

                    if (headersSet.has('segment_id')) {
                        console.log('Segments mode');
                        const segments: TrajectorySegment[] = results.data.reduce(
                            (acc: TrajectorySegment[], row) => {
                                const latLng = {lat: parseFloat(row.lat), lng: parseFloat(row.lon)};
                                if (acc.length < 1 || acc[acc.length - 1].segmentId != row.segment_id) {
                                    acc.push(new TrajectorySegment(row.segment_id));
                                }
                                acc[acc.length - 1].points.push(latLng);
                                return acc;
                            },
                            []);
                        this.layers.push(new SegmentsMapLayer(file.name, segments, this.map));
                    } else {
                        console.log('GPS mode');
                        const coords = results.data.map(row => ({
                            lat: parseFloat(row.lat),
                            lng: parseFloat(row.lon)
                        }));
                        this.layers.push(new GPSMapLayer(file.name, coords, this.map));
                    }
                    this.isInProgress = false;
                },
                error: () => {
                    this.isInProgress = false;
                },
            });
        }

        mounted() {
            this.$on('remove-layer', (layer: MapLayerBase) => this.layers.splice(this.layers.indexOf(layer), 1));

            this.map = lMap(<HTMLElement>this.$el.querySelector('.map-panel')).setView([51.505, -0.09], 13);
            tileLayer(
                'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
                {
                    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
                    subdomains: ['a','b','c']
                }
            ).addTo(this.map);
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
    }

    .tviz-app > .map-panel {
        flex: 1 1 100%;
    }
</style>
