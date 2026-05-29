/**
 * 安全防护模块 - Security Module
 * 功能：禁止选中/复制/右键/快捷键/爬虫抓取/攻击爆破/网页篡改
 * 版本：2.0
 */
(function () {
  'use strict';

  // ==================== 1. 禁止文本选中 ====================
  document.addEventListener('selectstart', function (e) {
    e.preventDefault();
    return false;
  });

  // ==================== 2. 禁止复制 ====================
  document.addEventListener('copy', function (e) {
    e.preventDefault();
    return false;
  });

  document.addEventListener('cut', function (e) {
    e.preventDefault();
    return false;
  });

  // ==================== 3. 禁止右键菜单 ====================
  document.addEventListener('contextmenu', function (e) {
    e.preventDefault();
    return false;
  });

  // ==================== 4. 禁止拖拽（防止拖拽选中/保存图片等） ====================
  document.addEventListener('dragstart', function (e) {
    e.preventDefault();
    return false;
  });

  // ==================== 5. 禁止键盘快捷键（DevTools / 保存 / 打印 / 查看源码） ====================
  document.addEventListener('keydown', function (e) {
    // F12
    if (e.keyCode === 123) {
      e.preventDefault();
      return false;
    }
    // Ctrl+Shift+I / Ctrl+Shift+J / Ctrl+Shift+C (DevTools)
    if (e.ctrlKey && e.shiftKey && (e.keyCode === 73 || e.keyCode === 74 || e.keyCode === 67)) {
      e.preventDefault();
      return false;
    }
    // Ctrl+U (查看源码)
    if (e.ctrlKey && e.keyCode === 85) {
      e.preventDefault();
      return false;
    }
    // Ctrl+S (保存页面)
    if (e.ctrlKey && e.keyCode === 83) {
      e.preventDefault();
      return false;
    }
    // Ctrl+P (打印)
    if (e.ctrlKey && e.keyCode === 80) {
      e.preventDefault();
      return false;
    }
    // Ctrl+C (复制)
    if (e.ctrlKey && e.keyCode === 67) {
      e.preventDefault();
      return false;
    }
    // Ctrl+A (全选)
    if (e.ctrlKey && e.keyCode === 65) {
      // 允许输入框内全选
      var tag = e.target.tagName.toLowerCase();
      if (tag !== 'input' && tag !== 'textarea') {
        e.preventDefault();
        return false;
      }
    }
  });

  // ==================== 6. 鼠标悬停链接隐藏URL显示 ====================
  // 页面加载时处理所有静态链接
  function hideLinkUrls() {
    var links = document.querySelectorAll('a');
    links.forEach(function (a) {
      if (a.href && !a.hasAttribute('data-href')) {
        a.setAttribute('data-href', a.href);
        a.removeAttribute('href');
      }
    });
  }

  // 鼠标悬停时动态移除href
  document.addEventListener('mouseover', function (e) {
    var target = e.target;
    while (target && target !== document) {
      if (target.tagName === 'A' && target.href && target.getAttribute('href') !== '#') {
        target.setAttribute('data-href', target.href);
        target.removeAttribute('href');
      }
      target = target.parentElement;
    }
  }, true);

  // 鼠标移出时恢复href
  document.addEventListener('mouseout', function (e) {
    var target = e.target;
    while (target && target !== document) {
      if (target.tagName === 'A' && target.hasAttribute('data-href') && !target.hasAttribute('href')) {
        target.href = target.getAttribute('data-href');
      }
      target = target.parentElement;
    }
  }, true);

  // 点击时通过window.open跳转
  document.addEventListener('click', function (e) {
    var target = e.target;
    while (target && target !== document) {
      if (target.tagName === 'A' && target.hasAttribute('data-href')) {
        var href = target.getAttribute('data-href');
        var linkTarget = target.getAttribute('target') || '_self';
        if (href && href !== '#') {
          e.preventDefault();
          window.open(href, linkTarget);
        }
        return;
      }
      target = target.parentElement;
    }
  }, true);

  // MutationObserver 处理动态添加的链接
  var linkObserver = new MutationObserver(function (mutations) {
    mutations.forEach(function (mutation) {
      mutation.addedNodes.forEach(function (node) {
        if (node.nodeType === 1) {
          if (node.tagName === 'A' && node.href) {
            node.setAttribute('data-href', node.href);
            node.removeAttribute('href');
          }
          if (node.querySelectorAll) {
            var childLinks = node.querySelectorAll('a');
            childLinks.forEach(function (a) {
              if (a.href && !a.hasAttribute('data-href')) {
                a.setAttribute('data-href', a.href);
                a.removeAttribute('href');
              }
            });
          }
        }
      });
    });
  });
  linkObserver.observe(document.documentElement, { childList: true, subtree: true });

  // ==================== 7. DOM篡改监测 ====================
  var tamperObserver = new MutationObserver(function (mutations) {
    mutations.forEach(function (mutation) {
      if (mutation.type === 'childList' && mutation.removedNodes.length > 0) {
        if ((mutation.target === document.body || mutation.target === document.documentElement) &&
            document.body.children.length === 0) {
          location.reload();
        }
      }
    });
  });
  tamperObserver.observe(document.documentElement, {
    childList: true,
    subtree: true
  });

  // ==================== 8. 控制台保护 ====================
  // 检测DevTools打开
  var devtoolsOpen = false;
  var threshold = 160;
  var checkDevTools = function () {
    var widthThreshold = window.outerWidth - window.innerWidth > threshold;
    var heightThreshold = window.outerHeight - window.innerHeight > threshold;
    if (widthThreshold || heightThreshold) {
      if (!devtoolsOpen) {
        devtoolsOpen = true;
        // 清空控制台
        if (window.console) {
          console.clear();
          console.log('%cStop!', 'color: red; font-size: 50px; font-weight: bold;');
          console.log('%cThis is a protected page. Please close developer tools.', 'font-size: 18px;');
        }
      }
    } else {
      devtoolsOpen = false;
    }
  };
  setInterval(checkDevTools, 1000);

  // ==================== 9. 初始化 ====================
  document.addEventListener('DOMContentLoaded', function () {
    hideLinkUrls();
  });

  // 立即处理已存在的链接
  if (document.readyState === 'interactive' || document.readyState === 'complete') {
    hideLinkUrls();
  }

})();
