/**
 * 背景交互粒子模块 - Background Particles Module
 * 功能：背景浮动粒子，可与鼠标/触摸交互（靠近排斥/远离吸引），自动适配黑白主题
 * 版本：1.0
 */
(function () {
  'use strict';

  // ==================== Canvas 初始化 ====================
  var canvas = document.createElement('canvas');
  canvas.id = 'bg-particles-canvas';
  canvas.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:-1;';
  // 插入到 body 最前面（在 fireworks canvas 之下）
  var firstChild = document.body.firstChild;
  if (firstChild) {
    document.body.insertBefore(canvas, firstChild);
  } else {
    document.body.appendChild(canvas);
  }
  var ctx = canvas.getContext('2d');

  // ==================== 配置参数 ====================
  var config = {
    particleCount: 50,          // 粒子总数（桌面端）
    mobileParticleCount: 25,    // 移动端粒子数
    particleMinRadius: 1,       // 粒子最小半径
    particleMaxRadius: 3,       // 粒子最大半径
    connectDistance: 140,       // 粒子连线距离
    mouseRadius: 120,           // 鼠标影响半径
    mouseForce: 0.8,            // 鼠标斥力强度
    moveSpeed: 0.3,             // 粒子移动速度
    lineOpacity: 0.08,          // 连线透明度
    colorDark: {                // 暗色主题颜色
      particle: 'rgba(160, 140, 255, 0.6)',
      line: 'rgba(160, 140, 255, '
    },
    colorLight: {               // 亮色主题颜色
      particle: 'rgba(100, 100, 140, 0.5)',
      line: 'rgba(100, 100, 140, '
    }
  };

  // ==================== 粒子存储 ====================
  var particles = [];
  var mouseX = -1000;
  var mouseY = -1000;
  var mouseActive = false;
  var isMobile = false;

  // ==================== 主题检测 ====================
  var currentColors = config.colorDark;

  function updateTheme() {
    var isDark = true;
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
      isDark = false;
    }
    var theme = document.documentElement.getAttribute('data-theme') || document.body.getAttribute('data-theme');
    if (theme === 'light') isDark = false;
    if (theme === 'dark') isDark = true;
    currentColors = isDark ? config.colorDark : config.colorLight;
  }

  if (window.matchMedia) {
    window.matchMedia('(prefers-color-scheme: light)').addEventListener('change', updateTheme);
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', updateTheme);
  }

  var themeOb = new MutationObserver(function () { updateTheme(); });
  themeOb.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
  themeOb.observe(document.body, { attributes: true, attributeFilter: ['data-theme'] });

  // ==================== Canvas 尺寸适配 ====================
  function resizeCanvas() {
    var dpr = window.devicePixelRatio || 1;
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    isMobile = window.innerWidth <= 768;

    // 调整粒子数量
    var targetCount = isMobile ? config.mobileParticleCount : config.particleCount;
    if (particles.length !== targetCount) {
      initParticles(targetCount);
    }
  }

  // ==================== 粒子类 ====================
  function Particle(w, h) {
    this.x = Math.random() * w;
    this.y = Math.random() * h;
    this.vx = (Math.random() - 0.5) * config.moveSpeed;
    this.vy = (Math.random() - 0.5) * config.moveSpeed;
    this.radius = config.particleMinRadius + Math.random() * (config.particleMaxRadius - config.particleMinRadius);
    // 随机初始位置偏移
    this.originX = this.x;
    this.originY = this.y;
  }

  Particle.prototype.update = function (w, h) {
    // 基础运动
    this.x += this.vx;
    this.y += this.vy;

    // 边界反弹
    if (this.x < 0 || this.x > w) { this.vx = -this.vx; this.x = Math.max(0, Math.min(w, this.x)); }
    if (this.y < 0 || this.y > h) { this.vy = -this.vy; this.y = Math.max(0, Math.min(h, this.y)); }

    // 速度微调（保持活力）
    this.vx += (Math.random() - 0.5) * 0.01;
    this.vy += (Math.random() - 0.5) * 0.01;
    // 限制速度
    var speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
    var maxSpeed = config.moveSpeed * 2;
    if (speed > maxSpeed) {
      this.vx = (this.vx / speed) * maxSpeed;
      this.vy = (this.vy / speed) * maxSpeed;
    }

    // 鼠标交互（靠近时排斥）
    if (mouseActive) {
      var dx = this.x - mouseX;
      var dy = this.y - mouseY;
      var dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < config.mouseRadius && dist > 0) {
        var force = (1 - dist / config.mouseRadius) * config.mouseForce;
        this.vx += (dx / dist) * force * 0.1;
        this.vy += (dy / dist) * force * 0.1;
      }
    }
  };

  Particle.prototype.draw = function (ctx) {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = currentColors.particle;
    ctx.fill();
  };

  // ==================== 粒子初始化 ====================
  function initParticles(count) {
    particles = [];
    for (var i = 0; i < count; i++) {
      particles.push(new Particle(window.innerWidth, window.innerHeight));
    }
  }

  // ==================== 绘制连线 ====================
  function drawConnections() {
    for (var i = 0; i < particles.length; i++) {
      for (var j = i + 1; j < particles.length; j++) {
        var dx = particles[i].x - particles[j].x;
        var dy = particles[i].y - particles[j].y;
        var dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < config.connectDistance) {
          var opacity = (1 - dist / config.connectDistance) * config.lineOpacity;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = currentColors.line + opacity.toFixed(3) + ')';
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    }
  }

  // ==================== 动画循环 ====================
  function animate() {
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

    var w = window.innerWidth;
    var h = window.innerHeight;

    for (var i = 0; i < particles.length; i++) {
      particles[i].update(w, h);
      particles[i].draw(ctx);
    }

    drawConnections();
    requestAnimationFrame(animate);
  }

  // ==================== 鼠标事件 ====================
  function onMouseMove(e) {
    mouseX = e.clientX;
    mouseY = e.clientY;
    mouseActive = true;
  }

  function onMouseLeave() {
    mouseActive = false;
  }

  // ==================== 触摸事件 ====================
  function onTouchMove(e) {
    if (e.touches.length > 0) {
      mouseX = e.touches[0].clientX;
      mouseY = e.touches[0].clientY;
      mouseActive = true;
    }
  }

  function onTouchEnd() {
    mouseActive = false;
  }

  // ==================== 初始化 ====================
  function init() {
    updateTheme();
    resizeCanvas();
    initParticles(isMobile ? config.mobileParticleCount : config.particleCount);
    animate();

    // 鼠标事件
    document.addEventListener('mousemove', onMouseMove, { passive: true });
    document.addEventListener('mouseleave', onMouseLeave);

    // 触摸事件
    document.addEventListener('touchmove', onTouchMove, { passive: true });
    document.addEventListener('touchend', onTouchEnd);
    document.addEventListener('touchcancel', onTouchEnd);

    // 窗口缩放
    window.addEventListener('resize', function () {
      resizeCanvas();
      initParticles(isMobile ? config.mobileParticleCount : config.particleCount);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
