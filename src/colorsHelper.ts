export class ColorRotator {
    private static __colorWheel: string[] = ['#ffe600', '#04ffe2', '#b3ff00', '#0421ff', '#ffa600', '#11ff04'];
    private __index: number = 0;

    nextColor(): string {
        if (this.__index >= ColorRotator.__colorWheel.length) {
            this.__index = 0;
        }
        return ColorRotator.__colorWheel[this.__index++];
    }
}
