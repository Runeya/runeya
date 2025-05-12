import { ref } from 'vue';
import axios from '../helpers/axios';
import Service from './service';
import Socket from '../helpers/Socket';

function Stack() {
  /** @type {import('vue').Ref<import('./service').default[]>} */
  this.services = ref([]);
  Socket.on('conf:update', (/** @type {string[]} */data) => {
    if (data.length) {
      data.forEach((label) => {
        const service = this.services.value.find((_service) => _service.label === label);
        if (service) service.fetch();
      });
    }
  });
}

Stack.prototype.loadServices = async function () {
  /** @type {{data: import('./service').default[]}} */
  const { data: services } = await axios.get('/stack/services');
  
  // Keep track of current services by label for reference preservation
  const existingServicesByLabel = {};
  this.services.value.forEach(service => {
    existingServicesByLabel[service.label] = service;
  });
  
  // Update or create services
  const updatedServices = services.filter((s) => s).map((serviceData) => {
    if (existingServicesByLabel[serviceData.label]) {
      // Update existing service
      existingServicesByLabel[serviceData.label].updateFields(serviceData);
      return existingServicesByLabel[serviceData.label];
    } else {
      // Create new service
      return new Service(serviceData);
    }
  });
  
  this.services.value = updatedServices;
  return this.services.value;
};

Stack.prototype.scenarios = async function (type, data) {
  const { data: flows } = await axios.get('/red/flows');
  return flows.filter(flow => {
    if (type === 'services' && flow.launchType === type) {
      return flow.services.split(',').includes(data)
    }
    return false
  });
};

Stack.prototype.getEnvironment = async function () {
  const { data: environment } = await axios.get('/stack/environment');
  return environment;
};

Stack.prototype.getAdditionalThemes = async function () {
  const { data: additionalThemes } = await axios.get('/stack/additional-themes');
  return additionalThemes;
};

Stack.prototype.getEnvironments = async function () {
  const { data: environments } = await axios.get('/stack/environments');
  return environments;
};
/** @param {string} environment */
Stack.prototype.changeEnvironment = async function (environment) {
  const { data: environments } = await axios.post('/stack/environment', { environment });
  return environments;
};

Stack.prototype.shouldSetup = async function () {
  const { data: shouldSetup } = await axios.get('/crypto/should-setup');
  return shouldSetup;
};

/** @param {{label: string, color: string, bgColor: string}} environment */
Stack.prototype.createEnvironment = async function (environment) {
  const { data: environments } = await axios.post('/stack/environment/create', { environment });
  return environments;
};

Stack.prototype.getAllConfsPath = async function () {
  const { data: paths } = await axios.get('/stack/all-confs-path');
  return paths;
};
/** @param {string} path */
Stack.prototype.selectConf = async function (path) {
  await axios.post('/stack/select-conf/', { path });
};
/** @param {string} path */
Stack.prototype.deleteConf = async function (path) {
  await axios.post('/stack/delete-conf/', { path });
};

/** @param {{label?: string, enabled?: boolean}[]} services */
Stack.prototype.launchServices = async function (services) {
  await axios.post('/stack/choose', services);
  return this.loadServices();
};
/** @param {string} label */
Stack.prototype.getService = async function (label) {
  if (!this.services.value.length) await this.loadServices();
  return this.services.value.filter((service) => service.label === label).pop();
};

/**
 * Restart all enabled services
 * @returns {Promise<void>}
 */
Stack.prototype.restartAllServices = async function () {
  await axios.get('/stack/restart-all');
  return this.loadServices();
};

/**
 * Restart the complete Stack Monitor application
 * @returns {Promise<void>}
 */
Stack.prototype.restartApplication = async function () {
  try {
    await axios.get('/system/restart');
    // Note: The connection will probably be cut here as the server terminates
    console.log('Application restarting...');
  } catch (error) {
    console.error('Error while restarting the application:', error);
    throw error;
  }
};

Stack.prototype.getAvailableEditors = async function () {
  const { data: editors } = await axios.get('/editors/available-editors');
  return editors;
};

Stack.prototype.getEnabledServices = async function () {
  if (!this.services.value.length) await this.loadServices();
  return this.services.value.filter((service) => service.enabled);
};

export default new Stack();
