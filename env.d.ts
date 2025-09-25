/// <reference types="vite/client" />
/// <reference types="vue-media-upload" />

declare module '*.vue' {
  import { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}
