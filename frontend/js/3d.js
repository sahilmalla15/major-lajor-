/**
 * Atelier — Shared 3D Design Module
 * Ambient floating-shape WebGL background + 3D card tilt for dashboard pages.
 * Only activates on pages with <body class="theme-warm"> and a #bg3d container.
 */
(function() {
    'use strict';

    // ------------------------------------------------------------------
    // 1. AMBIENT 3D BACKGROUND
    // ------------------------------------------------------------------
    function initBackground() {
        var container = document.getElementById('bg3d');
        if (!container) return;
        if (typeof THREE === 'undefined' || typeof THREE.WebGLRenderer !== 'function') return;

        var renderer;
        try {
            renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
        } catch (e) {
            container.style.display = 'none';
            return;
        }

        var canvas = renderer.domElement;
        canvas.style.width = '100%';
        canvas.style.height = '100%';
        container.appendChild(canvas);

        var scene = new THREE.Scene();
        var camera = new THREE.PerspectiveCamera(60, 1, 0.1, 100);
        camera.position.z = 8;

        function resize() {
            var w = container.clientWidth || window.innerWidth;
            var h = container.clientHeight || window.innerHeight;
            renderer.setSize(w, h);
            renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
            camera.aspect = w / h;
            camera.updateProjectionMatrix();
        }
        resize();

        // Warm theme palette
        var palette = [0xC75B3B, 0x7A9E7E, 0xE8A598, 0x8B9DC3, 0xD4A017];

        var group = new THREE.Group();
        scene.add(group);

        var shapes = [];
        var geometryFactory = [
            function() { return new THREE.IcosahedronGeometry(0.7, 1); },
            function() { return new THREE.OctahedronGeometry(0.6, 0); },
            function() { return new THREE.TorusGeometry(0.5, 0.16, 8, 24); },
            function() { return new THREE.BoxGeometry(0.55, 0.55, 0.55); },
            function() { return new THREE.DodecahedronGeometry(0.55, 0); },
            function() { return new THREE.TorusKnotGeometry(0.45, 0.13, 40, 8, 2, 3); },
        ];

        // Scatter shapes on a loose sphere shell
        for (var i = 0; i < 9; i++) {
            var geo = geometryFactory[i % geometryFactory.length]();
            var color = palette[i % palette.length];
            var mat = new THREE.MeshPhongMaterial({
                color: color,
                emissive: color,
                emissiveIntensity: 0.05,
                wireframe: true,
                transparent: true,
                opacity: 0.12 + Math.random() * 0.14,
                depthWrite: false,
            });
            var mesh = new THREE.Mesh(geo, mat);

            var a = Math.random() * Math.PI * 2;
            var b = Math.acos(2 * Math.random() - 1);
            var r = 3 + Math.random() * 3.5;
            mesh.position.set(r * Math.sin(b) * Math.cos(a), r * Math.sin(b) * Math.sin(a), r * Math.cos(b) * 0.7 - 0.5);
            mesh.userData = {
                spin: 0.001 + Math.random() * 0.003,
                bob: 0.4 + Math.random() * 0.6,
                phase: Math.random() * Math.PI * 2,
                baseY: mesh.position.y,
            };
            group.add(mesh);
            shapes.push(mesh);
        }

        // Mouse parallax (lerped)
        var mouseX = 0, mouseY = 0, tx = 0, ty = 0;
        document.addEventListener('mousemove', function(e) {
            tx = (e.clientX / window.innerWidth - 0.5) * 2;
            ty = (e.clientY / window.innerHeight - 0.5) * 2;
        }, { passive: true });

        var rafId = null;
        function animate() {
            rafId = requestAnimationFrame(animate);
            var time = performance.now() * 0.001;

            mouseX += (tx - mouseX) * 0.04;
            mouseY += (ty - mouseY) * 0.04;

            group.rotation.y += 0.0005;
            group.rotation.x += mouseY * 0.002;
            group.rotation.y += mouseX * 0.002;

            for (var i = 0; i < shapes.length; i++) {
                var s = shapes[i];
                s.rotation.x += s.userData.spin;
                s.rotation.y += s.userData.spin * 1.4;
                s.position.y = s.userData.baseY + Math.sin(time * s.userData.bob + s.userData.phase) * 0.25;
            }

            renderer.render(scene, camera);
        }
        animate();

        window.addEventListener('resize', resize);

        // Stop the loop on page hide to save resources
        document.addEventListener('visibilitychange', function() {
            if (document.hidden) {
                if (rafId) cancelAnimationFrame(rafId);
                rafId = null;
            } else if (!rafId) {
                animate();
            }
        });
    }

    // ------------------------------------------------------------------
    // 2. 3D CARD TILT (theme-warm pages only)
    // ------------------------------------------------------------------
    function initTilt() {
        if (!document.body || !document.body.classList.contains('theme-warm')) return;

        var MAX_X = 6;   // degrees
        var MAX_Y = 6;

        document.addEventListener('mouseover', function(e) {
            var card = e.target && e.target.closest
                ? e.target.closest('.card, .stat-card, .exercise-card')
                : null;
            if (!card) return;
            card.style.transition = 'transform 0.08s ease, box-shadow 0.2s ease';
        });

        document.addEventListener('mousemove', function(e) {
            var card = e.target && e.target.closest
                ? e.target.closest('.card, .stat-card, .exercise-card')
                : null;
            if (!card) return;

            var rect = card.getBoundingClientRect();
            var px = (e.clientX - rect.left) / rect.width;  // 0..1
            var py = (e.clientY - rect.top) / rect.height;  // 0..1

            var rotY = (px - 0.5) * 2 * MAX_Y;
            var rotX = -(py - 0.5) * 2 * MAX_X;

            card.style.transition = 'transform 0.08s ease, box-shadow 0.2s ease';
            card.style.transform =
                'perspective(700px) rotateX(' + rotX.toFixed(2) + 'deg) rotateY(' + rotY.toFixed(2) + 'deg) translateY(-3px)';
            card.style.boxShadow = '0 12px 30px rgba(44, 36, 32, 0.12)';
            card.style.zIndex = '5';
        });

        document.addEventListener('mouseout', function(e) {
            var card = e.target && e.target.closest
                ? e.target.closest('.card, .stat-card, .exercise-card')
                : null;
            if (!card) return;
            card.style.transition = 'transform 0.3s ease, box-shadow 0.3s ease';
            card.style.transform = '';
            card.style.boxShadow = '';
            card.style.zIndex = '';
        });
    }

    // ------------------------------------------------------------------
    // Boot
    // ------------------------------------------------------------------
    function boot() {
        initTilt();
        initBackground();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', boot);
    } else {
        boot();
    }
})();
