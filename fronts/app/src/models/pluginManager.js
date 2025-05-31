import { ref } from "vue";
import axios from "../helpers/axios";

export default {
  plugins: ref([]),
  async installPlugin(url) {
    await axios.post('/plugins/install', { url });
    await this.init();
  },
  async init() {
    const  {data: _plugins} = await axios.get('/plugins');
    this.plugins.value = _plugins;
  }
}