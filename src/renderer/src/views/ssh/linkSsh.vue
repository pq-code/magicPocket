<script setup lang='ts'>
import { reactive } from "vue"

// let isPassword = ref(true)
let from = reactive({
  password:'',
  keyPassword: '',
  userName: '',
  keyUrl:''
})

const handleGetPath = (key) =>{
  console.log(key)
}

const working = () => {

}
</script>

<template>
  <div class="ssh-centre">
      <div class="ssh-centre-title">
        <div class="title">ssh自动脚本</div>
        <div class="select">
          <el-form :inline="true" :model="from" label-width="auto">
              <el-form-item label="用户名">
                <el-input v-model="from.userName" style="width: 240px" placeholder="请输ssh用户名"></el-input>
              </el-form-item>
              <el-form-item label="密码">
                <el-input  v-model="from.password"
                style="width: 240px"
                type="password"
                placeholder="请输ssh入密码"
                show-password></el-input>
              </el-form-item>
              <el-form-item label="key密码">
                <el-input  v-model="from.keyPassword"
                style="width: 240px"
                type="password"
                placeholder="请输ssh入密码"
                show-password></el-input>
              </el-form-item>
              <el-form-item label="keyUrl">
                <el-input v-model="from.keyUrl" style="width: 240px" placeholder="请选输入文件夹地址">
                  <template #suffix>
                    <el-icon  style="cursor: pointer;"
                        @click="handleGetPath('snapPath')"><Folder /></el-icon>
                  </template>
                </el-input>
              </el-form-item>
              <el-form-item label="项目地址">
                <el-input v-model="from.keyUrl" style="width: 240px"
                  placeholder="请选输入文件夹地址"
                  @change="handleGetPath"
                >
                  <template #suffix>
                    <el-icon  style="cursor: pointer;"
                        @click="handleGetPath('snapPath')"><Folder /></el-icon>
                  </template>
                </el-input>
              </el-form-item>
              <el-form-item label="config文件地址">
                <el-input v-model="from.keyUrl" style="width: 240px" placeholder="请选输入文件夹地址">
                  <template #suffix>
                    <el-icon  style="cursor: pointer;"
                        @click="handleGetPath('snapPath')"><Folder /></el-icon>
                  </template>
                </el-input>
              </el-form-item>
              <el-button type="" v-debounce @click="working">重制</el-button>
             <el-button type="primary" v-debounce @click="working">保存配置</el-button>
             <el-button type="success" v-debounce @click="working">运行</el-button>
          </el-form>
        </div>
      </div>
      <div class="ssh-centre-main">
        <div class="main"></div>
      </div>
  </div>
</template>

<style scoped lang="less">
 .ssh-centre {
  padding: 10px;
  height: calc(100% - 20px);
  display: flex;
  flex-direction: column;
  .ssh-centre-title{
    background: #fff;
    min-height: 80px;
    padding: 10px;
    .title {
      font-size: 1.5rem;
    }
  }

  .ssh-centre-main {
    flex: 1;
    padding: 10px;
    background: #e4e4e4;
    display: flex;
    .main {
      width: 100%;
      height: 100%;
      background: #f7f7f7;
      overflow: auto;
    }
  }
 }
</style>
