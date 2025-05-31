import { reactive } from "vue";
import axios from "../helpers/axios";


const config = reactive({
  ready: false,
  isloading: false,
  pluginsUrl: '',
  init: async () => {
    const {data: _config} = await axios.get('/config')
    config.pluginsUrl = _config.pluginsUrl
    config.ready = true;
  }
})

export default config;