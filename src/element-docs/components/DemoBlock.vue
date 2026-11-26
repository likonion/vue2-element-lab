<template>
  <div
    class="demo-block"
    :class="[blockClass, { hover: hovering, 'is-expanded': isExpanded }]"
    @mouseenter="hovering = true"
    @mouseleave="hovering = false"
  >
    <div class="source">
      <slot name="source"></slot>
    </div>

    <div class="meta" ref="meta">
      <div class="description" v-if="$slots.default">
        <slot></slot>
      </div>
      <div class="highlight" ref="highlight">
        <slot name="highlight"></slot>
      </div>
    </div>

    <div class="demo-block-control">
      <button
        type="button"
        class="control-toggle"
        @click="isExpanded = !isExpanded"
      >
        <i :class="iconClass"></i>
        <span>{{ controlText }}</span>
      </button>

      <div class="control-actions">
        <button
          type="button"
          class="action-chip"
          :class="{ copied }"
          @click.stop="copyCode"
        >
          <i :class="copied ? 'el-icon-check' : 'el-icon-document-copy'"></i>
          <span>{{ copied ? '已复制' : '复制代码' }}</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'DemoBlock',
  props: {
    slug: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      hovering: false,
      isExpanded: false,
      copied: false
    }
  },
  computed: {
    blockClass() {
      const normalized = this.slug === 'infiniteScroll' ? 'infinite-scroll' : this.slug
      return `demo-zh-CN demo-${this.slug} demo-${normalized}`
    },
    iconClass() {
      return this.isExpanded ? 'el-icon-arrow-up' : 'el-icon-arrow-down'
    },
    controlText() {
      return this.isExpanded ? '收起代码' : '查看源码'
    },
    codeArea() {
      return this.$refs.meta
    },
    codeAreaHeight() {
      const desc = this.$el.getElementsByClassName('description')[0]
      const hl = this.$el.getElementsByClassName('highlight')[0]
      if (desc && hl) {
        return desc.clientHeight + hl.clientHeight + 24
      }
      return hl ? hl.clientHeight : 0
    }
  },
  watch: {
    isExpanded(val) {
      if (!this.codeArea) return
      this.codeArea.style.height = val ? `${this.codeAreaHeight + 1}px` : '0'
    }
  },
  methods: {
    async copyCode() {
      const codeEl = this.$refs.highlight && this.$refs.highlight.querySelector('code')
      const text = codeEl ? codeEl.textContent : ''
      if (!text) return

      try {
        if (navigator.clipboard && navigator.clipboard.writeText) {
          await navigator.clipboard.writeText(text)
        } else {
          const textarea = document.createElement('textarea')
          textarea.value = text
          textarea.style.position = 'fixed'
          textarea.style.opacity = '0'
          document.body.appendChild(textarea)
          textarea.select()
          document.execCommand('copy')
          document.body.removeChild(textarea)
        }
        this.copied = true
        this.$message.success('示例代码已复制到剪贴板')
        setTimeout(() => {
          this.copied = false
        }, 1800)
      } catch (_) {
        this.$message.error('复制失败，请手动展开代码复制')
      }
    }
  }
}
</script>

<style lang="scss">
.demo-block {
  border: 1px solid #e6eaf2;
  border-radius: 10px;
  transition: box-shadow 0.2s ease, border-color 0.2s ease;
  background-color: #ffffff;
  margin-bottom: 24px;
  overflow: hidden;

  &.hover {
    border-color: #d6dfee;
    box-shadow: 0 4px 16px rgba(15, 23, 42, 0.05);
  }

  code {
    font-family: "JetBrains Mono", Menlo, Monaco, Consolas, monospace;
  }

  .demo-button {
    float: right;
  }

  .source {
    padding: 24px 26px;
  }

  .meta {
    background-color: #f8fafc;
    border-top: 1px solid #edf0f7;
    overflow: hidden;
    height: 0;
    transition: height 0.22s ease;
  }

  .description {
    padding: 14px 18px;
    box-sizing: border-box;
    border: 1px solid #e6eaf2;
    border-radius: 8px;
    font-size: 13.5px;
    line-height: 1.7;
    color: #475569;
    word-break: break-word;
    margin: 12px 14px 4px;
    background-color: #ffffff;

    p {
      margin: 0;
      line-height: 1.75;
    }

    code {
      color: #2563eb;
      background-color: #eff6ff;
      margin: 0 3px;
      display: inline-block;
      padding: 0 6px;
      font-size: 12px;
      border-radius: 4px;
      line-height: 20px;
    }
  }

  .highlight {
    pre {
      margin: 0;
      overflow-x: auto;
    }

    code.hljs {
      margin: 0;
      border: none;
      max-height: none;
      border-radius: 0;
      background: #f8fafc;
      padding: 16px 22px;
      font-size: 12.5px;
      line-height: 1.75;

      &::before {
        content: none;
      }
    }
  }

  .demo-block-control {
    border-top: 1px solid #edf0f7;
    height: 42px;
    padding: 0 14px;
    background-color: #fcfdff;
    display: flex;
    align-items: center;
    justify-content: space-between;
    user-select: none;
  }

  .control-toggle {
    border: none;
    background: transparent;
    color: #64748b;
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 5px 10px;
    border-radius: 6px;
    transition: all 0.15s ease;

    i {
      font-size: 13px;
    }

    &:hover {
      color: #2563eb;
      background: #eff6ff;
    }
  }

  .control-actions {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .action-chip {
    border: 1px solid #e2e8f0;
    background: #ffffff;
    color: #64748b;
    font-size: 12px;
    padding: 4px 10px;
    border-radius: 6px;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    gap: 5px;
    transition: all 0.15s ease;

    &:hover {
      color: #2563eb;
      border-color: #bfdbfe;
      background: #eff6ff;
    }

    &.copied {
      color: #15803d;
      border-color: #bbf7d0;
      background: #f0fdf4;
    }
  }
}
</style>
