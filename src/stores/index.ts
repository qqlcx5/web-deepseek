import { createPinia } from 'pinia';
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate';

const store = createPinia();

store.use(piniaPluginPersistedstate);

export default store;

// export * from './modules/chat';
export * from './modules/app';
export * from './modules/design';
export * from './modules/layout';
export * from './modules/system';
export * from './modules/user';
export * from './modules/workspace';
export * from './modules/model';
export * from './modules/message';
export * from './modules/settings';
export * from './modules/conversation';
export * from './modules/attachment';
