/**
 * @des vue plugin
 *
 */

import Vue from 'vue';
import { remote, shell, ipcRenderer } from 'electron';

const plugin = {};

plugin.install = (Vue) => {
    const { prototype } = Vue;

    prototype.$remote = remote;
    prototype.$current = remote.getCurrentWindow();
    prototype.$shell = shell;
    prototype.$ipcRenderer = ipcRenderer;
};

Vue.use(plugin);
