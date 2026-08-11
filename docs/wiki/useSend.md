# useSend 发送

## XRequest已废弃，推荐使用 hook-fetch（https://jsonlee12138.github.io/hook-fetch/）

## 背景介绍

基于 `ant-design-x` 的 `XRequest`，`XStream`，我们进行了深入的学习和讨论。

在复刻 `XStream` 后，针对更通用的 **控制请求数据** 和 **中断请求** 的场景，我们将 `ant-design-x` 的 `XRequest` 进行了重构，将其拆分成 **`前端终止场景`** 和 **`请求终止场景`**

两种场景 分别对应

- hooks `useSend` -- 前端终止场景
- 工具类 `XRequest` -- 请求终止场景

**🍒 两者可以单独拆开使用，组合使用可实现 `useXStream`，下面是他们的使用示例**

只需要传一个 `开始方法` ，即可获得 对应的 **loading** 状态，以及 对应的 **finish** 方法。

单个控制，代码不超过 10 行

## 代码示例

### XRequest-base

```vue
<docs>
---
title: XRequest 【单独】 基础用法
---

这样你就简单的使用 `XRequest` 控制了 请求的发起 和 中断请求中的状态。
简单的 `new XRequest()`，实例化对象，然后 `.send()` 开始请求， `.abort()` 停止请求。

我们可以在 `控制台` 查看到，流式请求 **请求被终止**。
</docs>

<script setup lang="ts">
import { XRequest } from 'vue-element-plus-x';

const str = ref('');

const sse = new XRequest({
  baseURL: 'https://node-test.element-plus-x.com',
  onMessage: (msg: { data: string }) => {
    console.log('onMessage:', msg);
    str.value += `
    ${msg.data}`;
  }
});
</script>

<template>
  <div class="container">
    <div class="btn-list">
      <el-button
        @click="
          () => {
            str = '';
            sse.send('/api/sse');
          }
        "
      >
        发起请求
      </el-button>

      <el-button @click="sse.abort()">
        取消请求
      </el-button>
    </div>

    <div>{{ str }}</div>
  </div>
</template>

```

### XRequest-use

```vue
<docs>
---
title: XRequest【单独】 全部属性
---

在 `new XRequest()` 中传入对应的配置项

`transformer` 可以对内应的响应数据进行转换处理，还提供了很多配置的 `回调方法`，供开发者使用。

大家也可在 `控制台` 查看 回调方法的打印
</docs>

<script setup lang="ts">
import { XRequest } from 'vue-element-plus-x';

const str = ref('');

const sse = new XRequest({
  baseURL: 'https://node-test.element-plus-x.com',
  type: 'fetch',
  transformer: e => {
    console.log('transformer:', e);
    const a = e.trim().split('\n');
    const r = a.pop();
    return r;
  },
  onMessage: msg => {
    console.log('onMessage:', msg);
    str.value += `\n${msg}`;
  },
  onError: (es, e) => {
    console.log('onError:', es, e);
  },
  onOpen: () => {
    console.log('onOpen');
  },
  onAbort: messages => {
    console.log('onAbort', messages);
  },
  onFinish: data => {
    console.log('onFinish:', data);
  }
});
</script>

<template>
  <div class="container">
    <div class="btn-list">
      <el-button
        @click="
          () => {
            str = '';
            sse.send('/api/sse');
          }
        "
      >
        发起请求
      </el-button>

      <el-button @click="sse.abort()">
        取消请求
      </el-button>
    </div>

    <div>{{ str }}</div>
  </div>
</template>

```

### useSend-XRequest

```vue
<docs>
---
title: useSend & XRequest【组合使用】
---
</docs>

<script setup lang="ts">
import { Promotion, Refresh } from '@element-plus/icons-vue';
import { useSend, XRequest } from 'vue-element-plus-x';

const str = ref<string>('');
let finish = () => {};

const sse = new XRequest({
  baseURL: 'https://node-test.element-plus-x.com',
  type: 'fetch',
  transformer: e => {
    console.log('transformer:', e);
    const a = e.trim().split('\n');
    const r = a.pop();
    return r;
  },
  onMessage: msg => {
    console.log('onMessage:', msg);
    str.value += `\n${msg}`;
  },
  onError: (es, e) => {
    console.log('onError:', es, e);
  },
  onOpen: () => {
    console.log('onOpen');
  },
  onAbort: messages => {
    console.log('onAbort', messages);
  },
  onFinish: data => {
    console.log('onFinish:', data);
    // 这里调用的时候，会报 eslint 错误，说我们在使用前未定义
    // 'finish' was used before it was defined.
    // 我们只有在 上面定义一个 finish 空方法，在下面进行赋值
    // 其实这里就是执行，useSend 的 finish 方法
    finish();
  }
});

function startFn() {
  str.value = '';
  sse.send('/api/sse');
}

// useSend 的 abort 和 finish 是一样的方法。
// 为了体现 这边 xrequest 请求，支持手动中断，和 结束回调。
// 所以 也在 useSend 中，也暴露了一个名字叫 finish 的方法。
const {
  send,
  loading,
  abort,
  finish: _finish
} = useSend({
  sendHandler: startFn,
  abortHandler: sse.abort
});

// 给顶层变量赋值
finish = _finish;
</script>

<template>
  <div class="btn-list">
    <el-button
      v-if="!loading"
      color="#c2306a"
      round
      plain
      size="large"
      @click="send"
    >
      <el-icon><Promotion /></el-icon>
    </el-button>

    <el-button
      v-if="loading"
      color="#c2306a"
      round
      plain
      size="large"
      @click="abort"
    >
      <el-icon class="is-loading">
        <Refresh />
      </el-icon>
    </el-button>

    <div>{{ str }}</div>
  </div>
</template>

```

### useSend-base

```vue
<docs>
---
title: useSend 【单独】 基础用法
---

这个案例可以很好看出，这个 hooks 不与后端请求做交互，只是控制简单的 `loading` 状态。

`send` 方法 触发 `sendHandler` 回调
`finish` 方法 结束 loading 状态
</docs>

<script setup lang="ts">
import { useSend } from 'vue-element-plus-x';

const { send, finish, loading } = useSend({
  sendHandler: startFn
});

async function startFn() {
  // 在这里做一个 异步操作，可以是发请求
  console.log('开始模拟请求');
}
</script>

<template>
  <div class="container">
    <div class="btn-list">
      <el-button :disabled="loading" type="primary" @click="send">
        {{ loading ? '加载中...' : '模拟请求' }}
      </el-button>

      <el-button :disabled="!loading" @click="finish">
        结束请求
      </el-button>
    </div>
  </div>
</template>

```

### useSend-use

```vue
<docs>
---
title: useSend 【单独】 使用场景
---

`sendHandler` 和 `abortHandler` 是两个函数，分别对应 `开始` 和 `中断` 的回调。

`abort` 方法 触发 `abortHandler` 回调

`abort` 方法 同时也会 结束 loading 状态
</docs>

<script setup lang="ts">
import {
  Aim,
  Loading,
  Microphone,
  Promotion,
  Refresh,
  VideoCamera,
  VideoPause,
  VideoPlay
} from '@element-plus/icons-vue';
import { useSend } from 'vue-element-plus-x';

const { send, abort, loading } = useSend({
  sendHandler: startFn,
  abortHandler: () => {
    ElMessage.info('自定义语音按钮，结束录音！');
  }
});

const {
  send: send1,
  abort: abort1,
  loading: loading1
} = useSend({
  sendHandler: startFn,
  abortHandler: () => {
    ElMessage.info('自定义发送按钮，结束发送！');
  }
});

const {
  send: send2,
  abort: abort2,
  loading: loading2
} = useSend({
  sendHandler: startFn,
  abortHandler: () => {
    ElMessage.info('自定义播放按钮，结束播放！');
  }
});

const {
  send: send3,
  abort: abort3,
  loading: loading3
} = useSend({
  sendHandler: startFn,
  abortHandler: () => {
    ElMessage.info('自定义录制按钮，结束录制！');
  }
});

const type = ref('voice');

function startFn() {
  if (type.value === 'voice') {
    // 在这里做一个 异步操作，可以是发请求
    ElMessage.success('自定义语音按钮，开始录音！');
  }
  else if (type.value === 'sender') {
    ElMessage.success('自定义发送按钮，开始发送文本！');
  }
  else if (type.value === 'read') {
    ElMessage.success('自定义播放，开始播放啦！');
  }
  else if (type.value === 'record') {
    ElMessage.success('自定义录制，开始录制啦！');
  }
}
</script>

<template>
  <div class="btn-list">
    <!-- 语音按钮 -->
    <el-button
      v-if="!loading"
      color="#9145c8"
      circle
      size="large"
      @click="
        () => {
          type = 'voice';
          send();
        }
      "
    >
      <el-icon><Microphone /></el-icon>
    </el-button>

    <el-button
      v-if="loading"
      color="#9145c8"
      circle
      size="large"
      @click="
        () => {
          type = 'voice';
          abort();
        }
      "
    >
      <el-icon class="is-loading">
        <Loading />
      </el-icon>
    </el-button>

    <!-- 发送按钮 -->
    <el-button
      v-if="!loading1"
      color="#c2306a"
      round
      plain
      size="large"
      @click="
        () => {
          type = 'sender';
          send1();
        }
      "
    >
      <el-icon><Promotion /></el-icon>
    </el-button>

    <el-button
      v-if="loading1"
      color="#c2306a"
      round
      plain
      size="large"
      @click="
        () => {
          type = 'sender';
          abort1();
        }
      "
    >
      <el-icon class="is-loading">
        <Refresh />
      </el-icon>
    </el-button>

    <!-- 播放按钮 -->
    <el-button
      v-if="!loading2"
      size="large"
      type="success"
      color="#ff7f7f"
      @click="
        () => {
          type = 'read';
          send2();
        }
      "
    >
      <el-icon style="font-size: 20px; color: #fff">
        <VideoPlay />
      </el-icon>
    </el-button>

    <el-button
      v-if="loading2"
      size="large"
      type="success"
      color="#ff7f7f"
      @click="
        () => {
          type = 'read';
          abort2();
        }
      "
    >
      <el-icon style="font-size: 20px; color: #fff" class="is-loading">
        <VideoPause />
      </el-icon>
    </el-button>

    <!-- 录制按钮 -->
    <el-button
      v-if="!loading3"
      size="large"
      circle
      color="#fff884"
      @click="
        () => {
          type = 'record';
          send3();
        }
      "
    >
      <el-icon style="color: #104674">
        <VideoCamera />
      </el-icon>
    </el-button>

    <el-button
      v-if="loading3"
      size="large"
      circle
      color="#fff884"
      @click="
        () => {
          type = 'record';
          abort3();
        }
      "
    >
      <el-icon style="color: #104674" class="is-loading">
        <Aim />
      </el-icon>
    </el-button>
  </div>
</template>

```

## API 参考

有了对状态的控制，我们可以很方便的，自定义一些按钮的加载状态

知道了 `useSend` 的基本用法后，既然有 `前端加载状态` 的控制，那一定少不了 `请求状态` 控制。接下来我们来介绍一下 工具类 `XRequest` 的简单用法。

::: warning
这里我们为了让大家方便阅读文档，看到请求，简单的写了一个 node 服务。这个案例中，💩 请不要疯狂点击。会疯狂请求接口，请大家节制一点。💩 我们没做任何安全处理 🙉 因为不会

这也可以反向让大家知道更了解，工具类 `XRequest` 的用法，只对 `请求` 处理。
:::

下面介绍一下，`useSend` 和 `useSendStream` 相互结合的用法

**使用 `useSend` 对前端进行状态控制，使用 `useSendStream` 对后端进行状态控制**

## 配置参数 和 返回钩子

#### - `useSend`

- **参数**

| 参数名       | 说明       | 类型         |
| ------------ | ---------- | ------------ |
| sendHandler  | send 方法  | `() => void` |
| abortHandler | abort 方法 | `() => void` |

- **返回值**

| 属性名  | 说明                   | 类型         |
| ------- | ---------------------- | ------------ |
| send    | 开始 加载状态 支持回调 | `() => void` |
| abort   | 中断 加载状态 支持回调 | `() => void` |
| loading | 加载状态               | `boolean`    |
| finish  | 结束 加载状态          | `() => void` |

#### - `XRequest`

- **参数**

| 配置参数名  | 说明                                         | 类型                                                   |
| ----------- | -------------------------------------------- | ------------------------------------------------------ |
| baseURL     | 基础请求地址                                 | `string`                                               |
| type        | 请求类型，默认 SSE                           | `BaseSSEProps<T = string>.type?: SSEType \| undefined` |
| transformer | transformer 回调，在这里可以对数据做解析处理 | `(e: string) => string \| undefined`                   |
| onMessage   | 请求中的回调                                 | `(msg: string \| undefined) => void`                   |
| onError     | 请求报错的回调                               | `(es: EventSource, e: Event) => void`                  |
| onOpen      | SSE Open 状态                                | `SSEWithSSEProps.onOpen?: (() => void) \| undefined`   |
| onAbort     | 请求被终止的回调                             | `(messages: (string \| undefined)[]) => void`          |
| onFinish    | 请求结束的回调                               | `(data: (string \| undefined)[]) => void`              |

- **返回值**

| 属性名 | 说明         | 类型                                                                                                                                     |
| ------ | ------------ | ---------------------------------------------------------------------------------------------------------------------------------------- |
| send   | 开始请求接口 | `XRequest<string \| undefined>.send(url: string, options?: EventSourceInit \| BaseFetchOptions): Promise<XRequest<string \| undefined>>` |
| abort  | 中断请求     | `XRequest<string \| undefined>.abort(): void`                                                                                            |

## 总结

`useSend` 可以让用户更方便在前端展示和控制， **加载中** 状态。是一种对 `loading` 状态的封装方案
接受 `发送回调` 和一个`中断回调` ，提供 `发送` ，`中断 loading 状态` ，`结束 loading 状态` ，返回 `loading` 状态。

`XRequest` 是一个请求的封装，提供了更便捷的请求方式，接受一个 `请求配置` ，返回一个 `请求响应` 对象。
---

