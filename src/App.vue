<template>
    <div class="tviz-app">
        <div class="control-panel">
            <!-- Name: <input v-model="name" type="text"> -->
            <!-- <hello-component :name="name" :initialEnthusiasm="5" /> -->
            <div v-for="layer in layers" v-bind:key="layer">{{ layer }}</div>
            <input type="file" @change="importCsv" :disabled="false">
        </div>
        <div class="map-panel"></div>
    </div>
</template>

<script lang="ts">
    // import HelloComponent from './components/Hello.vue';
    import {map as lMap, Map as Lmap, circleMarker, CircleMarker, featureGroup, tileLayer, 
        DomEvent, polyline, Polyline, LatLng, LatLngExpression} from 'leaflet';
    import Vue from 'vue';
    import {parse as csvFileParse} from 'papaparse';
    import {Component} from 'vue-property-decorator'

    class ColorRotator {
        __index: number = 0;
        static __colorWheel: string[] = ['#ffe600', '#04ffe2', '#b3ff00', '#0421ff', '#ffa600', '#11ff04'];
        nextColor(): string {
            if (this.__index >= ColorRotator.__colorWheel.length) {
                this.__index = 0;
            }
            return ColorRotator.__colorWheel[this.__index++];
        }
    }

    @Component
    export default class App extends Vue {
        layers: String[] = [];
        isInProgress: Boolean = false;
        map: Lmap|null = null;

        importCsv(event: Event) {
            const fileInput = <HTMLInputElement>event.target;
            if(!fileInput.files) return;

            const file = fileInput.files[0];
            if (this.layers.some(l => l === file.name)) return;

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
                        const segments: Map<String, LatLngExpression[]> = results.data.reduce(
                            (acc, row) => {
                                if (!acc.has(row.segment_id)) {
                                    acc.set(row.segment_id, []);
                                }
                                acc.get(row.segment_id).push([parseFloat(row.lat), parseFloat(row.lon)]);
                                return acc;
                            },
                            new Map());

                        const lines: Polyline[] = [];
                        const markers: CircleMarker[] =  [];
                        const colorer = new ColorRotator();
                        for(const [segmentId, coords] of segments.entries()){
                            const color = colorer.nextColor();
                            lines.push(polyline(coords, {color}));
                            for (const coord of coords){
                                markers.push(this.__createCircleMarker(coord, color));
                            }
                        }
                        const lineLayer = featureGroup(lines).addTo(this.map);
                        const markersLayer = featureGroup(markers).addTo(this.map);  
                        this.map.fitBounds(markersLayer.getBounds());    
                    } else {
                        console.log('GPS mode');
                        const markers = results.data.map(row => 
                            this.__createCircleMarker([parseFloat(row.lat), parseFloat(row.lon)], '#aaaaaa'));
                        const markersLayer = featureGroup(markers).addTo(this.map);   
                        this.map.fitBounds(markersLayer.getBounds());                    
                    }

                    this.layers.push(file.name);
                    this.isInProgress = false;
                },
                error: () => {
                    this.isInProgress = false;
                },
            });
        }

        mounted() {
            this.map = lMap(<HTMLElement>this.$el.querySelector('.map-panel')).setView([51.505, -0.09], 13);
            tileLayer(
                'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
                {
                    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
                    subdomains: ['a','b','c']
                }
            ).addTo(this.map);
        }

        __createCircleMarker(coord: LatLngExpression, color: string): CircleMarker{
            return circleMarker(coord,{
                    radius: 4,
                    weight: 1,
                    color: '#606060',
                    fillColor: color,
                    fillOpacity: 0.8,
            });
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
