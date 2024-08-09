import { defineComponent, ref, onMounted, nextTick, computed } from 'vue';
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { RectAreaLightHelper } from "three/examples/jsm/helpers/RectAreaLightHelper";
import { RectAreaLightUniformsLib } from "three/examples/jsm/lights/RectAreaLightUniformsLib";

const RenderEngine = defineComponent({
  props: {
    modelValue: {
      type: Object,
      default: () => {}
    },
    listData: {
      type: Array,
      default: () => []
    }
  },

  model: {
    prop: 'modelValue',
    event: 'update:modelValue',
    },

    setup(props, { emit }) {
        // 创建场景对象Scene
        let scene = new THREE.Scene();
        let renderer
        let camera // 摄像机
        let controls // 控制器
        let rectLight // 灯光

        // 窗口数据
        let width = window.innerWidth; //窗口宽度
        let height = window.innerHeight; //窗口高度
        let k = width / height; //窗口宽高比
        let s = 100; //三维场景显示范围控制系数，系数越大，显示的范围越大
        //获取窗口数据
        const getWH = () => {
            width = window.innerWidth
            height = window.innerHeight
        }

        const init = () => {
            // 创建渲染器对象
            renderer = new THREE.WebGLRenderer({
                antialias: true, // true/false表示是否开启反锯齿
                alpha: false, // true/false 表示是否可以设置背景色透明
                precision: 'highp', // highp/mediump/lowp 表示着色精度选择
                premultipliedAlpha: true, // true/false 表示是否可以设置像素深度（用来度量图像的分辨率）
                preserveDrawingBuffer: true, // true/false 表示是否保存绘图缓冲
                maxLights: 4, // 最大灯光数
                stencil: false, // false/true 表示是否使用模板字体或图案
            });

            function animation(time) {
                // const mesh = scene.getObjectByName( 'meshKnot' );
                // mesh.rotation.y = time / 1000;
                renderer.render(scene, camera);// 使用渲染器将相机视野内的场景渲染到画布上
            }

            // 设置渲染器输出画布canvas
            renderer.setSize(width, height);//设置渲染区域尺寸
            renderer.setPixelRatio(window.devicePixelRatio);// 根据设备的像素比设置渲染的清晰度
            renderer.setClearColor(0xb9d3ff, 1); //设置背景颜色
            renderer.setAnimationLoop(animation); // 设置动画

             // 初始化透视相机
            camera = new THREE.PerspectiveCamera(s, width / height, 0.1, 1000)
            camera.position.set(40, 130, - 50); //设置相机位置
            camera.lookAt(scene.position); //设置相机方向(指向的场景对象)

            controls = new OrbitControls(camera, renderer.domElement);//创建控件对象
            // 启用惯性
            controls.enableDamping = true;
            // 相机向外移动极限
            controls.maxDistance = 110; // 缩放
            controls.minDistance = 50;

            controls.minAzimuthAngle = -90; // radians 旋转
            controls.maxAzimuthAngle = 30; // radians

            controls.minPolarAngle = - 0; // radians
            controls.maxPolarAngle = Math.PI; // radians

            // 创建灯光
            rectLight = new THREE.RectAreaLight(0xffffff, 4, 200, 60);
            rectLight.position.set(16, 30, 0);
            scene.add(rectLight);

            scene.add(new RectAreaLightHelper(rectLight));

            RectAreaLightUniformsLib.init();

            // 设置画面动态缩放
            let onWindowResize = function () {
                getWH()
                // 重置渲染器输出画布canvas尺寸
                renderer.setSize(width, height);
                // 全屏情况下：设置观察范围长宽比aspect为窗口宽高比
                camera.aspect = width / height;
                camera.updateProjectionMatrix();
            };

            window.addEventListener('resize', onWindowResize);
        }
        // 渲染
        init()

        // 地面
        const geoFloor = new THREE.BoxGeometry(2000, 0.1, 2000);
        // 材质
        const matStdFloor = new THREE.MeshPhysicalMaterial({ color: 0x808080, roughness: 0, metalness: 0.1, clearcoat: 0 });
        // 创建网格对象
        const mshStdFloor = new THREE.Mesh(geoFloor, matStdFloor);
        scene.add(mshStdFloor);

        // 渲染结果缓存
        const renderResult = computed(() => {
            return (
                <div id='spaceDisplay'/>
            )
        });
        // 渲染结果挂载
        onMounted(() => {
            let lx = document.getElementById('spaceDisplay');
            lx?.appendChild(renderer.domElement);
        })

        onUnmounted(() => {
            // 清理资源
            renderer.dispose();
            window.removeEventListener('resize', onWindowResize);
        })

        return () => (
            // 容器
            renderResult.value
        );
    },
});

export default RenderEngine;
