/**
 * 鼠标拖尾效果模块 - Mouse Trail Module
 * 功能：鼠标移动产生渐变拖尾粒子，支持触摸滑动，自动适配黑白主题
 * 版本：1.0
 */
(function () {
  'use strict';

  // ==================== Canvas 初始化 ====================
  var canvas = document.createElement('canvas');
  canvas.id = 'trail-canvas';
  canvas.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:9999;';
  document.body.appendChild(canvas);
  var ctx = canvas.getContext('2d');

  // ==================== 配置参数 ====================
  var config = {
    maxParticles: 30,          // 粒子最大数量
    particleRadius: 2,         // 粒子半径
    trailLength: 18,           // 拖尾长度
    fadeSpeed: 0.03,           // 淡出速度
    followSpeed: 0.15,         // 跟随速度
    colorDark: '160, 140, 255', // 暗色主题颜色 (紫)
    colorLight: '100, 100, 140', // 亮色主题颜色 (灰)
    particleColor: null        // 当前粒子颜色（运行时计算）
  };

  // ==================== 粒子存储 ====================
  var particles = [];
  var mouseX = -100;
  var mouseY = -100;
  var targetX = -100;
  var targetY = -100;
  var isActive = false;

  // ==================== 主题检测 ====================
  function updateThemeColor() {
    var isDark = true;
    // 检测系统主题偏好
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
      isDark = false;
    }
    // 检查 body 或 html 的 data-theme 属性
    var theme = document.documentElement.getAttribute('data-theme') || document.body.getAttribute('data-theme');
    if (theme === 'light') isDark = false;
    if (theme === 'dark') isDark = true;

    config.particleColor = isDark ? config.colorDark : config.colorLight;
  }

  // 监听主题变化
  if (window.matchMedia) {
    window.matchMedia('(prefers-color-scheme: light)').addEventListener('change', updateThemeColor);
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', updateThemeColor);
  }

  // MutationObserver 监听 data-theme 属性变化
  var themeObserver = new MutationObserver(function () {
    updateThemeColor();
  });
  themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
  themeObserver.observe(document.body, { attributes: true, attributeFilter: ['data-theme'] });

  // ==================== Canvas 尺寸适配 ====================
  function resizeCanvas() {
    var dpr = window.devicePixelRatio || 1;
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  // ==================== 粒子类 ====================
  function Particle(x, y) {
    this.x = x;
    this.y = y;
    this.targetX = x;
    this.targetY = y;
    this.alpha = 0.8;
    this.radius = config.particleRadius;
    this.life = 1;
    this.fadeSpeed = config.fadeSpeed + Math.random() * 0.01;
  }

  Particle.prototype.update = function () {
    // 向目标位置平滑移动
    this.targetX += (this.x - this.targetX) * config.followSpeed;
    this.targetY += (this.y - this.targetY) * config.followSpeed;
    this.life -= this.fadeSpeed;
    this.alpha = Math.max(0, this.life);
  };

  Particle.prototype.draw = function (ctx) {
    if (this.alpha <= 0) return;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(' + config.particleColor + ', ' + this.alpha.toFixed(2) + ')';
    ctx.fill();
  };

  // ==================== 动画循环 ====================
  function animate() {
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

    // 更新并绘制粒子
    for (var i = particles.length - 1; i >= 0; i--) {
      var p = particles[i];
      p.update();
      p.draw(ctx);

      // 移除消亡粒子
      if (p.life <= 0) {
        particles.splice(i, 1);
      }
    }

    // 鼠标/触摸活动时生成新粒子
    if (isActive) {
      // 平滑插值目标位置
      targetX += (mouseX - targetX) * 0.3;
      targetY += (mouseY - targetY) * 0.3;

      if (particles.length < config.maxParticles) {
        var offsetX = (Math.random() - 0.5) * 4;
        var offsetY = (Math.random() - 0.5) * 4;
        particles.push(new Particle(targetX + offsetX, targetY + offsetY));
      }

      // 移动时保持拖尾长度
      if (particles.length > config.trailLength) {
        particles.splice(config.trailLength);
      }
    }

    // 更新拖尾粒子位置（历史粒子逐渐淡出）
    for (var j = particles.length - 1; j >= 0; j--) {
      if (particles[j].life < 0.3 && !isActive) {
        particles.splice(j, 1);
      }
    }

    requestAnimationFrame(animate);
  }

  // ==================== 鼠标事件 ====================
  function onMouseMove(e) {
    mouseX = e.clientX;
    mouseY = e.clientY;
    isActive = true;
  }

  function onMouseLeave() {
    isActive = false;
  }

  function onMouseEnter(e) {
    mouseX = e.clientX;
    mouseY = e.clientY;
    targetX = mouseX;
    targetY = mouseY;
    isActive = true;
  }

  // ==================== 触摸事件 ====================
  function onTouchMove(e) {
    if (e.touches.length > 0) {
      mouseX = e.touches[0].clientX;
      mouseY = e.touches[0].clientY;
      isActive = true;
    }
  }

  function onTouchEnd() {
    isActive = false;
  }

  // ==================== 初始化 ====================
  function init() {
    updateThemeColor();
    resizeCanvas();
    animate();

    // 鼠标事件
    document.addEventListener('mousemove', onMouseMove, { passive: true });
    document.addEventListener('mouseleave', onMouseLeave);
    document.addEventListener('mouseenter', onMouseEnter);

    // 触摸事件
    document.addEventListener('touchmove', onTouchMove, { passive: true });
    document.addEventListener('touchend', onTouchEnd);
    document.addEventListener('touchcancel', onTouchEnd);

    // 窗口缩放
    window.addEventListener('resize', resizeCanvas);
  }

  // 启动
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
