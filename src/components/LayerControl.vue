<template>
    <div class="layer-control"
        :class="{active}"
        @click="setActive"
    >
        <input v-model="isVisible"
            type="checkbox"
            @click.stop=""
        >
        <div class="layer-control-name"
            :title="name"
        >
            {{ name }}
        </div>
        <button class="layer-control-button"
            @click.stop="fitMap"
        >
            &#10536;&#10538;
        </button>
        <button class="layer-control-button"
            @click.stop="removeLayer"
        >
            &#10062;
        </button>
    </div>
</template>

<script lang="ts">
    import Vue from 'vue';
    import {Component, Prop, Watch} from 'vue-property-decorator';
    import {MapLayerBase} from '../mapLayers/MapLayerBase';

    @Component
    export default class LayerControl extends Vue {
        @Prop()
        readonly mapLayer!: MapLayerBase;

        @Prop({default: false})
        active!: boolean;

        get name(): string {
            return this.mapLayer.fullTitle;
        }

        get isVisible():boolean {
            return this.mapLayer.isVisible;
        }

        set isVisible(isVisible: boolean) {
            this.mapLayer.isVisible = isVisible;
        }

        removeLayer() {
            this.mapLayer.clearMap();
            this.$parent.$emit('remove-layer', this.mapLayer);
        }

        fitMap() {
            this.mapLayer.fitMap();
        }

        setActive() {
            this.$parent.$emit('set-active-layer', this.mapLayer);
        }

        mounted() {
            this.mapLayer.isActive = this.active;
            this.fitMap();
        }

        @Watch('active')
        private __onActiveChange(isActive: boolean) {
            this.mapLayer.isActive = isActive;
        }
    }
</script>

<style>
    .layer-control {
        font-size: 0.9em;
        display: flex;
        align-items: center;
        padding: 0.6em 0.2em 0.6em 0;
        border-bottom: solid 1px #C8C8C8;
        background-color: #ffffff;
    }

    .layer-control.active {
        background-color: #e6e6e6;
    }

    .layer-control:hover {
        background-color: #C8C8C8;
    }

    .layer-control > .layer-control-name {
        flex: 1 1 auto;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }

    .layer-control > .layer-control-button {
        font-size: inherit;
        padding: 0;
    }

    .layer-control > :not(:last-child){
        margin-right: 0.1em;
    }
</style>
