import { mount } from '@vue/test-utils';
import LayerControl from '../../src/components/LayerControl.vue';

describe('LayerControl.vue', () => {
    it('renders a layer control', () => {
        const wrapper = mount(LayerControl);
        console.log(wrapper.html());
    })
});
