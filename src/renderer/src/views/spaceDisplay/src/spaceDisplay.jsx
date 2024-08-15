import { defineComponent, ref, onMounted, nextTick, computed } from 'vue';
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { RectAreaLightHelper } from "three/examples/jsm/helpers/RectAreaLightHelper";
import { RectAreaLightUniformsLib } from "three/examples/jsm/lights/RectAreaLightUniformsLib";
// 引入gltf模型加载库GLTFLoader.js
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

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
        let renderer // 渲染器
        let camera // 摄像机
        let controls // 控制器
        let rectLight // 灯光
        let threeOnWindowResize // 窗口大小

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
                receiveShadow: true, // 物体阴影
                castShadow: true, // 灯光阴影
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
            // renderer.setClearColor(0xb9d3ff, 1); //设置背景颜色
            renderer.setAnimationLoop(animation); // 设置动画

             // 初始化透视相机
            camera = new THREE.PerspectiveCamera(s, width / height, 0.1, 1000)
            camera.position.set(200, 200, 200); //设置相机位置
            camera.lookAt(scene.position); //设置相机方向(指向的场景对象)

            controls = new OrbitControls(camera, renderer.domElement);//创建控件对象
            // 启用惯性
            controls.enableDamping = true;
            // 相机向外移动极限
            // controls.maxDistance = 110; // 缩放
            // controls.minDistance = 50;

            // controls.minAzimuthAngle = -90; // radians 旋转
            // controls.maxAzimuthAngle = 30; // radians

            controls.minPolarAngle = - 0; // radians
            controls.maxPolarAngle = Math.PI; // radians

            // 创建矩形灯光
            rectLight = new THREE.RectAreaLight(0xffffff, 4, 300, 200);
            rectLight.position.set(0, 130, 0);
            rectLight.rotation.x = -Math.PI / 2;
            rectLight.castShadow = true; // 启用阴影投射

            scene.add(rectLight);

            // 灯光辅助线
            scene.add(new RectAreaLightHelper(rectLight));
            RectAreaLightUniformsLib.init();

            // 设置画面动态缩放
            threeOnWindowResize = function () {
                getWH()
                // 重置渲染器输出画布canvas尺寸
                renderer.setSize(width, height);
                // 全屏情况下：设置观察范围长宽比aspect为窗口宽高比
                camera.aspect = width / height;
                camera.updateProjectionMatrix();
            };

            window.addEventListener('resize', threeOnWindowResize);
        }
        // 渲染
        init()

        // 地面
        const geoFloor = new THREE.BoxGeometry(2000, 0.1, 2000);
        // 材质
        const matStdFloor = new THREE.MeshPhysicalMaterial(
            {
                color: 0x808080,
                roughness: 0.1, // 减小粗糙度以获得更平滑的表面
                metalness: 0.5, // 增加金属感以获得更好的反射
                clearcoat: 0.5, // 清漆层也可以增强反射效果
                clearcoatRoughness: 0.05, // 清漆层的粗糙度
                castShadow: true
            });
        // 创建网格对象
        const mshStdFloor = new THREE.Mesh(geoFloor, matStdFloor);
        scene.add(mshStdFloor);
        // 设置接收阴影的投影面
        mshStdFloor.receiveShadow = true;


       // 创建GLTF加载器对象
        const loader = new GLTFLoader();
        loader.load( '/staticWarehouse/3dModel/su7/scene.gltf', function ( gltf ) {
            console.log('控制台查看加载gltf文件返回的对象结构',gltf);
            console.log('gltf对象场景属性', gltf.scene);
            gltf.scene.scale.set(40, 40, 40); // 设置模型在x、‌y、‌z轴上的缩放比例为20
            // 返回的场景对象gltf.scene插入到threejs场景中
            scene.add(gltf.scene);
        })

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
            window.removeEventListener('resize', threeOnWindowResize);
        })

        return () => (
            // 容器
            renderResult.value
        );
    },
});

export default RenderEngine;
