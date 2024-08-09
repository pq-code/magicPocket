import { onUnmounted, ref, onMounted, nextTick, computed } from 'vue';

import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { RectAreaLightHelper } from "three/examples/jsm/helpers/RectAreaLightHelper";
import { RectAreaLightUniformsLib } from "three/examples/jsm/lights/RectAreaLightUniformsLib";



export default function useInitializeScene() {
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

  // 默认设置
  const defaultSetting = {
    antialias: true, // true/false表示是否开启反锯齿
    alpha: false, // true/false 表示是否可以设置背景色透明
    precision: 'highp', // highp/mediump/lowp 表示着色精度选择
    premultipliedAlpha: true, // true/false 表示是否可以设置像素深度（用来度量图像的分辨率）
    preserveDrawingBuffer: true, // true/false 表示是否保存绘图缓冲
    maxLights: 4, // 最大灯光数
    stencil: false, // false/true 表示是否使用模板字体或图案
  }
  //获取窗口数据
  const getWH = () => {
    width = window.innerWidth
    height = window.innerHeight
  }
  const initialization = (options) => {
    return new Promise((res, rej) => {
    // 创建渲染器对象
    renderer = new THREE.WebGLRenderer(options || defaultSetting);

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
    // controls.maxDistance = 110; // 缩放
    // controls.minDistance = 50;

    // controls.minAzimuthAngle = -90; // radians 旋转
    // controls.maxAzimuthAngle = 30; // radians

    controls.minPolarAngle = - 0; // radians
    controls.maxPolarAngle = Math.PI; // radians

    // 创建环境光
    rectLight  = new THREE.AmbientLight(0x444444);// 柔和的白光
    scene.add( rectLight );

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
      // 构建成功
      res(renderer)
    })
  }

  onUnmounted(() => {
      // 清理资源
      renderer.dispose();
      window.removeEventListener('resize', threeOnWindowResize);
  })


  return {
    scene,
    renderer,
    camera,
    controls,
    rectLight,
    threeOnWindowResize,
    initialization
  }
}


