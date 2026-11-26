<template>
  <div class="page-changelog">
    <div class="heading">
      <div>
        <h2>更新日志</h2>
        <p class="heading-sub">Element UI 官方版本演进与变更记录</p>
      </div>
      <a
        href="https://github.com/ElemeFE/element/releases"
        target="_blank"
        rel="noopener noreferrer"
        class="releases-btn"
      >
        <i class="el-icon-link" /> GitHub Releases
      </a>
    </div>
    <ul class="timeline" ref="timeline"></ul>
    <div v-show="false">
      <ChangeLog ref="changeLog" />
    </div>
  </div>
</template>

<script>
import ChangeLog from '../docs/CHANGELOG.zh-CN.md'

export default {
  name: 'ChangelogPage',
  components: {
    ChangeLog
  },
  mounted() {
    const changeLog = this.$refs.changeLog
    if (!changeLog || !changeLog.$el) return
    const changeLogNodes = Array.from(changeLog.$el.children)
    if (changeLogNodes.length < 2) return

    let release = changeLogNodes[1].textContent.trim()
    let fragments = `<li><h3><a href="https://github.com/ElemeFE/element/releases/tag/v${release}" target="_blank" rel="noopener noreferrer">${release}</a></h3>`

    for (let i = 2; i < changeLogNodes.length; i++) {
      const node = changeLogNodes[i]
      if (node.tagName !== 'H3') {
        fragments += node.outerHTML
      } else {
        release = node.textContent.trim()
        fragments += `</li><li><h3><a href="https://github.com/ElemeFE/element/releases/tag/v${release}" target="_blank" rel="noopener noreferrer">${release}</a></h3>`
      }
    }

    fragments = fragments.replace(
      /#(\d+)/g,
      '<a href="https://github.com/ElemeFE/element/issues/$1" target="_blank" rel="noopener noreferrer">#$1</a>'
    )
    fragments = fragments.replace(
      /@([\w-]+)/g,
      '<a href="https://github.com/$1" target="_blank" rel="noopener noreferrer">@$1</a>'
    )
    this.$refs.timeline.innerHTML = `${fragments}</li>`
  }
}
</script>

<style lang="scss">
.page-changelog {
  padding-bottom: 48px;

  .heading {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 28px;

    h2 {
      font-size: 28px;
      font-weight: 600;
      color: #111827;
      margin: 0 0 4px;
    }

    .heading-sub {
      font-size: 13.5px;
      color: #64748b;
      margin: 0;
    }
  }

  .releases-btn {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 7px 14px;
    font-size: 13px;
    font-weight: 500;
    color: #2563eb;
    background: #eff6ff;
    border: 1px solid #dbeafe;
    border-radius: 8px;
    text-decoration: none;
    transition: all 0.15s;

    &:hover {
      background: #dbeafe;
    }
  }

  .timeline {
    padding: 0;
    position: relative;
    color: #475569;

    > li {
      position: relative;
      padding-bottom: 16px;
      list-style: none;
      line-height: 1.8;
      border: 1px solid #e6eaf2;
      border-radius: 12px;
      background: #ffffff;
      overflow: hidden;
      box-shadow: 0 1px 2px rgba(15, 23, 42, 0.03);

      &:not(:last-child) {
        margin-bottom: 22px;
      }
    }

    ul {
      padding: 16px 28px 8px;

      ul {
        padding: 4px 0 0 22px;

        li {
          padding-left: 0;
          color: #475569;
          word-break: normal;
          list-style: circle;
        }
      }
    }

    li li {
      font-size: 13.5px;
      list-style: disc;
      padding-left: 4px;
      padding-bottom: 4px;
      color: #334155;
      word-break: break-word;
      margin-left: 16px;
    }

    h3 {
      margin: 0;
      padding: 14px 24px;
      border-bottom: 1px solid #edf0f7;
      font-size: 17px;
      color: #111827;
      font-weight: 600;
      background: #f8fafc;

      a {
        color: #111827;
        text-decoration: none;

        &:hover {
          color: #2563eb;
        }
      }
    }

    h4 {
      margin: 0;
      font-size: 14.5px;
      padding: 14px 24px 0;
      font-weight: 600;
      color: #1e293b;
    }

    p {
      margin: 0;
    }

    em {
      position: absolute;
      right: 24px;
      font-style: normal;
      top: 16px;
      font-size: 12.5px;
      color: #94a3b8;
      font-family: Menlo, Monaco, Consolas, monospace;
    }

    a {
      color: #2563eb;
      text-decoration: none;

      &:hover {
        text-decoration: underline;
      }
    }
  }
}
</style>
