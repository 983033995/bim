<template>
  <div class="model_box" ref="model_box">
    <!-- 模型渲染版块 -->
    <div class="iframBox" v-loading="loading" element-loading-text="模型渲染中...">
      <iframe allowFullScreen=true name="bimComponentModelPage" id="bimComponentModelPage" style="width: 100%; height: 100%;" frameborder="0" scrolling="no"></iframe>
    </div>
    <!-- 控件区域 -->
    <div class="controlMenu">
      <div 
        class="controlBar"
        v-for="(item, index) in controlBar"
        :key="index"
        @click="handleControl($event, index, item.single)"
        :class="{controlCurrent: controlBarIndex[index]}"
      >
        <div class="icon" v-html="item.icon"></div>
        <div class="words" :class="{controlCurrent: controlBarIndex[index]}" v-text="item.info"></div>
        <div class="controlMaster" v-if="item.master === true">
          <div
            v-for="(itemBar, indexBar) in item.masterInfo"
            :key="indexBar"
            @click="handleControl($event, '', itemBar.masterSingle)"
          >
            <span v-html="itemBar.masterIcon"></span>
            {{itemBar.infoName}}
          </div>
        </div>
      </div>
      <div class="controlBarRight">
        开关
        <div class="mySwitch" @click="handleSwitch()">
          <div class="switchBtn" ref="switchBtn">
            <div v-text="on_off"></div>
          </div>
        </div>
      </div>
    </div>
    <!-- 构建信息弹出层 -->
    <transition name="products">
    <div class="productInfo" v-show="statusControl">
      信息
    </div>
    </transition>
  </div>
</template>

<script>
  export default {
    data() {
      return {
        // 加载状态
        loading: true,
        // 控制按钮
        controlBar: [{
          info: "视图",
          single: "camera",
          icon: "<i class='icon iconfont icon-dshitu'></i>",
          master: true,
          masterInfo: [{
            infoName: "正视图",
            masterIcon: "<i class='icon iconfont icon-qianshitu'></i>",
            masterSingle: "setCameraFront"
          }, {
            infoName: "左视图",
            masterIcon: "<i class='icon iconfont icon-zuoshitu'></i>",
            masterSingle: "setCameraLeft"
          }, {
            infoName: "右视图",
            masterIcon: "<i class='icon iconfont icon-youshitu'></i>",
            masterSingle: "setCameraRight"
          }, {
            infoName: "后视图",
            masterIcon: "<i class='icon iconfont icon-houshitu'></i>",
            masterSingle: "setCameraBack"
          }, {
            infoName: "顶视图",
            masterIcon: "<i class='icon iconfont icon-dingshitu'></i>",
            masterSingle: "setCameraTop"
          }, {
            infoName: "底视图",
            masterIcon: "<i class='icon iconfont icon-dishitu'></i>",
            masterSingle: "setCameraBottom"
          }, {
            infoName: "默认视图",
            masterIcon: "<i class='icon iconfont icon-dshitu'></i>",
            masterSingle: "setCameraIsometric"
          }]
        },// {
          // info: "标注",
          // icon: "<i class='icon iconfont icon-biaozhu'></i>",
          // master: false,
          // single: "label"
        // },
         {
          info: "定位",
          icon: "<i class='icon iconfont icon-dingwei1'></i>",
          master: false,
          single: "location"
        }, {
          info: "平移",
          icon: "<i class='icon iconfont icon-pingyi'></i>",
          master: false,
          single: "handmove"
        }, {
          info: "旋转",
          icon: "<i class='icon iconfont icon-xuanzhuan1'></i>",
          master: false,
          single: "rotation"
        }, {
          info: "缩放",
          icon: "<i class='icon iconfont icon-icon-'></i>",
          master: false,
          single: "zoomto"
        }, {
          info: "剖切",
          icon: "<i class='icon iconfont icon-pouqie'></i>",
          master: false,
          single: "sectioning"
        }, {
          info: "测量",
          icon: "<i class='icon iconfont icon-celiang'></i>",
          master: false,
          single: "measure"
        }, {
          info: "框选",
          icon: "<i class='icon iconfont icon-region'></i>",
          master: false,
          single: "choosebox"
        }, {
          info: "轴网",
          icon: "<i class='icon iconfont icon-wangge1'></i>",
          master: false,
          single: "znet"
        }
        // , {
        //   info: "快照",
        //   icon: "<i class='icon iconfont icon-wangge1'></i>",
        //   master: false,
        //   single: "znet"
        // }
        ],
        // 控制按钮的选中状态设置
        controlBarIndex: [],
        // 项目ID
        projectId: 'P1622',
        // 3D视图iframe的宽高信息
        oIframeInfo: {
          width: "",
          height: ""
        },
        viewerMid: "",
        // 模型信息
        modelParms: {
          // ModelInfo: {"191c3937-d137-4d43-8b2b-12b5a5fcbba8": "hidden",
          //   "a554ebdf-e6ff-4f85-b854-0ee804ef74a6": "hidden",
          //   "a391ed0c-c017-4008-8751-5d43a66ec1d5": "hidden"},
          ModelInfo: {
            "3d9ee9c2-0246-462b-8a4a-0a1312cb2170": "hidden"
          },
          bZoomTo: false,
          mClr: "0.1-0.5-1.0-0.1"
        },
        //声明模型浏览器对象
        _tiViewer: "",
        // 模型对象信息弹出层状态控制
        statusControl: false,
        // 设备信息
        properties: [],
        // 后台登陆tooken
        tooken: '',
        // 需要控制的设备ID
        testIotid: "IkEk1dq1KfthKX9pF6J50010711100",
        // 控制设备的状态
        iotidInfo: [],
        switchVal: true,
        on_off: '开'
      }
    },
    methods: {
      SetTiViewer(iFrame) {
        //构造一个form对象，向渲染服务器提交模型初始化请求
        let iFrameDomObj = iFrame;
        iFrameDomObj.src = "about:blank";
        let iFrameDoc = iFrameDomObj.contentWindow.document;
        //向渲染服务器请求创建模型浏览器的指令
        let sUrl = "http://139.159.246.200:4110" + "/Home/BimEmbed?&Refresh=" + new Date().getTime()
      
        let sHtml = '<form action="' + sUrl +'" method="post" target="_self" id="bim_post" >'
        //设置模型空间参数
        sHtml += '<input id="u" name="u" type="hidden" value="' + "rel://" + this.projectId + "\\combine.gemsproj" + '" />';
        //设置模型浏览器宽度
        sHtml += '<input id="w" name="w" type="hidden" value="' + this.oIframeInfo.width + '" />';
        //设置模型浏览器高度
        sHtml += '<input id="h" name="h" type="hidden" value="' + (this.oIframeInfo.height -70) + '" />';
        //设置要访问的模型ID，以","分隔
        sHtml += '<input id="v" name="v" type="hidden" value="' + this.modelParms.ModelInfo + '" />';
        // sHtml +=
        //   '      <input id="v" name="v" type="hidden" value="' +
        //   this.modelParms.ModelInfo +
        //   '" />';
        sHtml += "</form>";

        iFrameDoc.write(sHtml);
        iFrameDoc.getElementById("bim_post").submit();
        let self = this;
        this._tiViewer = new TiViewer(iFrameDomObj);
        this._tiViewer.register(function() {
          self.getModleExample()
          // 初始化工具栏
          self._tiViewer.tiCmd({
            cmd: "setConfig",
            data: {
              // 是否显示轴网
              HideGrid: true,
              // 是否显示标注列表
              labels: false,
              // 是否显示快照列表
              snapshots: false,
              // 是否为构件连续选择模式
              bSelectInstMode: false,
              // 是否禁止鼠标选择
              bDisableMouseSelect: false,
              // 是否允许创建快照
              bPermitCreateSnapshot: true,
              // 是否允许分享快照
              bPermitShareSnapshot: true,
              // 保存标注的回调函数
              bOnSaveLabelFileCallback: false,
              // 是否显示工具栏
              bShowToolbar: false
            }
          })
          let view = self._tiViewer
          // 创建用户信息
          view.setUserName(sessionStorage.getItem('ms_username'))
          view.onNotify = function (param) {
            // 左键点击（返回点击的x和y轴坐标点）
            if (param.func === "onMouseDown") {
              console.log(param)
            }
            //右键点击（还会返回构建实例的ID）
            if (param.func === "OnContextMenu") {
              console.log(param)
            }
          }
          view.onCancelSelect = function (Message) {
            console.log(Message)
          }
          // 选择构件实例
          view.onSelect = function (Message) {
            let messageInfo = Message[0].split("_")
            let iotId = messageInfo[1]
            //self.statusControl = true
            console.log(Message)

            // if (Message !== null && Message.length === 1) {
            //   self.$axios.get(`/api/bim-api/device/properties/query?iotId=${Message}`).then(res => {
            //     let data = res.data
            //     if (data.code === 200) {
            //       let info = data.data
            //       console.log(info)
            //       self.properties = info
            //       self.statusControl = true
            //     }
            //   })
            // }
          }
          // 创建标注
          view.onSave = function (username, GUID, title, content, isNew) {
            console.log(username)
            console.log(GUID)
            console.log(title)
            console.log(content)
            console.log(isNew)
          }
          // 截图url回调
          view.onSnapshot = function(data1){
            console.log(232323)
            console.log(data1)
            self.model_edit.napshot = `http://139.159.246.200:4110/${data1}`
          }
          // 标注修改/删除回调函数
          view.onLimitLabel = function (msg) {
            console.log(msg)
          }
        })
      },
      selectNode () {
        let viewModelInfo = this.modelParms.ModelInfo
        for(let i in viewModelInfo){
          viewModelInfo[i] = "solid"
        }
        setTimeout(() => {
          this._tiViewer.setDisplayMode(this.modelParms)
        },200)
      },
      // 对模型的其它控制
      mouseModle (type) {
        this._tiViewer.tiCmd({
          cmd: 'mouse-mode',
          data: type
        })
      },
      // 点击控件
      handleControl (e, index, single) {
        let view = this._tiViewer
        e.stopPropagation()
        console.log(this.controlBarIndex[index])
        switch (single) {
          case "camera":
            return false
            break
          // 正视图
          case "setCameraFront":
            view.setCameraFront()
            break
          // 左视图
          case "setCameraLeft":
            view.setCameraLeft()
            break
          // 右视图
          case "setCameraRight":
            view.setCameraRight()
            break
          // 后视图
          case "setCameraBack":
            view.setCameraBack()
            break
          // 顶视图
          case "setCameraTop":
            view.setCameraTop()
            break
          // 底视图
          case "setCameraBottom":
            view.setCameraBottom()
            break
          // 默认视图
          case "setCameraIsometric":
            view.setCameraIsometric()
            break
          // 标注
          case "label":
            view.createFile("filename")
            break
          // 定位
          case "location":
            // this.getModleExample()
            view.zoomToTarget()
            break
          // 平移
          case "handmove":
            this.controlBarIndex[index] === true ? this.mouseModle('rotate') : view.setMouseModeMove()
            break
          // 旋转
          case "rotation":
            view.setMouseModeRotate()
            break
          // 缩放
          case "zoomto":
            this.controlBarIndex[index] === true ? this.mouseModle('rotate') : this.mouseModle('scale')
            break
          // 剖切
          case "sectioning":
            view.toggleClip()
            break
          // 测量
          case "measure":
            view.toggleLinearMeasure()
            break
          // 框选
          case "choosebox":
            this.controlBarIndex[index] === true ? this.mouseModle('rotate') : this.mouseModle('select')
            break
          // 轴网
          case "znet":
            view.toggleGrid()
            break
        }
        if (this.controlBarIndex[index] === true) {
          this.controlBarIndex = []
          this.initControlBar()
        }else{
          this.controlBarIndex = []
          this.initControlBar()
          this.controlBarIndex[index] = true
        }

      },
      // 屏幕快照(创建快照后会在截图回调中得到快照地址)
      setSnapsot () {
        this._tiViewer.getSnapshot()
      },
      // 初始化控制按钮控件状态
      initControlBar () {
        let controlBar_L = this.controlBar.length
        for (let i = 0; i < controlBar_L; i++) {
          this.controlBarIndex.push(false)
        }
      },
      // 获取所有模型MID
      getModleMid () {
        let self = this
        this.$axios.post('/ms/vanke-vbim-users/user/testUserLogin',{accountName: "zhanght",userPwd: "iop*1234."}).then(res => {
          console.log(res)
        })
        this.$axios.get('/ms/vanke-vbim-designsyn/model/allModelMid',{
          params:{
            projectId: this.projectId
          }
        }).then(res=>{
          let resArr = res.data.data;
          console.log(resArr)
          // resArr.forEach(item => {
          //   self.modelParms.ModelInfo[item] = "hidden"
          // })
          // 注入模型数据，建模
          setTimeout(() => {
            this.selectNode()
            setTimeout(() => {
              self._tiViewer.setCameraIsometric()
              this.loading = false
            },500)
          },500)
        })
      },
      // 开关滑块
      handleSwitch () {
        let self = this
        console.log(self.iotidInfo)
        // this.switchVal = !this.switchVal
        // let iotStatus = {
        //   iotId: this.testIotid
        // }
        // this.$axios.post("/api/bim-api/device/properties/set", iotStatus).then(res => {
        //   console.log(res)
        // })
      },
      // 获取设备属性状态
      getProductStatus () {
        let self = this
        self.$axios.get(`/api/bim-api/device/properties/query?iotId=${self.testIotid}`).then(res => {
          let data = res.data
          console.log(data)
          if (data.code === 200) {
            let info = data.data
            console.log(info)
            let propertiesInfo = {}
            propertiesInfo['iotId'] = self.testIotid
            for ( let i in info) {
              propertiesInfo[i] = info[i]["value"]
            }
            self.iotidInfo = propertiesInfo
            console.log(self.iotidInfo)
          }
        })
      },
      // 判断设备是开还是关
      lampSwitch () {
        let self = this
        let lamp = self.iotidInfo
        let lampStatus
        for ( let i in lamp) {
          if (lamp[i] === 0 || lamp[i] === "0") {
            self.switchVal = false
          }else{
            lself.switchVal = true
          }
        }
      },
      // 控制视图颜色
      setProductColor (colorVal) {
        let self = this
        self._tiViewer.tiCmd({
          "cmd": "setElementColor",
          "data": [{
            "VIEWID": "3d9ee9c2-0246-462b-8a4a-0a1312cb2170",
            "VIEWCOLOR": "1.0-1.0-1.0-1.0",
            "e": [
              {
                "id": "514d4078-809a-4e08-afa0-f6e62c4244ed-000810f1",
                "clr": "1.0-1.0-1.0-1.0"
              }
            ],
            "instances": [
              {
                "INSID": "514d4078-809a-4e08-afa0-f6e62c4244ed-000813b6_514d4078-809a-4e08-afa0-f6e62c4244ed-000810f1_3d9ee9c2-0246-462b-8a4a-0a1312cb2170",
                "INSCOLOR": colorVal
              }
            ]
          }, {
            "VIEWID": "3d9ee9c2-0246-462b-8a4a-0a1312cb2170",
            "VIEWCOLOR": "1.0-1.0-1.0-1.0",
            "instances": [
              {
                "INSID": "514d4078-809a-4e08-afa0-f6e62c4244ed-000813b9_514d4078-809a-4e08-afa0-f6e62c4244ed-000810f1_3d9ee9c2-0246-462b-8a4a-0a1312cb2170",
                "INSCOLOR": colorVal
              }
            ]
          }, {
            "VIEWID": "3d9ee9c2-0246-462b-8a4a-0a1312cb2170",
            "VIEWCOLOR": "1.0-1.0-1.0-1.0",
            "instances": [
              {
                "INSID": "514d4078-809a-4e08-afa0-f6e62c4244ed-000813b7_514d4078-809a-4e08-afa0-f6e62c4244ed-000810f1_3d9ee9c2-0246-462b-8a4a-0a1312cb2170",
                "INSCOLOR": colorVal
              }
            ]
          }, {
            "VIEWID": "3d9ee9c2-0246-462b-8a4a-0a1312cb2170",
            "VIEWCOLOR": "1.0-1.0-1.0-1.0",
            "instances": [
              {
                "INSID": "514d4078-809a-4e08-afa0-f6e62c4244ed-000813b8_514d4078-809a-4e08-afa0-f6e62c4244ed-000810f1_3d9ee9c2-0246-462b-8a4a-0a1312cb2170",
                "INSCOLOR": colorVal
              }
            ]
          }]
        })
      },
      // 选择模型中构件实例
      getModleExample () {
        let self = this
        self._tiViewer.tiCmd({
          "cmd": "selectByElementInfo",
          "data": {
            "names": ["4ad57404-43b0-44c6-8f69-77b3fe1f54c2-00050886_7df92551-2df1-4152-acb3-190eadda3be1-0004e07c_3d9ee9c2-0246-462b-8a4a-0a1312cb2170"],
            "op": "replace"
          }
        })
      }
    },
    mounted() {
      let self = this
      // 初始化iframe窗口
      let Oiframe = document.getElementById("bimComponentModelPage");
      let viewWidth = window.innerWidth-350
      let viewHeight = window.innerHeight-200
      self.oIframeInfo.width = viewWidth
      self.oIframeInfo.height = viewHeight
      self.$refs.model_box.style.height = viewHeight+"px"
      self.SetTiViewer(Oiframe);

      // 注入模型数据，建模
      setTimeout(() => {
        self._tiViewer.setDisplayMode(self.modelParms)
        self.selectNode()
        setTimeout(() => {
          self._tiViewer.setCameraIsometric()
          self.loading = false
          //self.switchVal = true
        },500)
      },500)
      // 控制区的控件状态
      self.initControlBar()

      // 初始获取需要控制开关的设备的状态
      self.getProductStatus()
      // 初始化开关状态
      setTimeout( () => {
        self.lampSwitch()
      },500)
      // 实时更新设备状态信息
      setInterval(() => {
        self.getProductStatus()
        self.lampSwitch()
      },3000)
    },
    watch: {
      switchVal () {
        let self = this
        if (this.switchVal === true) {
          this.on_off = "开"
          this.$refs.switchBtn.classList.remove("close")
          this.$refs.switchBtn.classList.add("open")
          this.setProductColor("1.0-0.1-0.1-1.0")
        }else{
          this.on_off = "关"
          this.$refs.switchBtn.classList.remove("open")
          this.$refs.switchBtn.classList.add("close")
          this.setProductColor("1.0-1.0-1.0-1.0")
        }
      }
    }
  }
</script>

<style lang="stylus" scoped>
.model_box
  width 100%
  position relative
  .iframBox
    width 100%
    height 100%
    overflow hidden
  .projectButton
    position absolute
    top 0
    left 20%
    z-index 999
  .viewButton
    position absolute
    top 0
    left 30%
    z-index: 999
  .controlMenu
    width 100%
    height 40px
    line-height 40px
    position absolute
    bottom -40px
    left 0
    background-color #fff
    .controlCurrent
      color #409EFF !important
    .controlBar:hover,
    .controlBar:hover .words
      color #409EFF !important
    .controlBar:hover .controlMaster
      display block
    .controlBar .controlMaster div:hover
      background-color #555
      color  #fff
    .controlBar
      padding 0 15px
      float left
      position relative
      cursor pointer
      .icon
        width 14px
        height 14px
        line-height 14px
        text-align center
        font-size 12px
        margin 6px auto 0 auto
      .words
        height 20px
        line-height 20px
        color #333
        text-align center
        font-size 11px
      .controlMaster
        padding 2px 2px
        width auto
        position absolute
        bottom 40px
        left 0
        font-size 11px
        background-color #fff
        display none
        div
          white-space nowrap
          padding 0 3px
          line-height 25px
    .controlBarRight
      width auto
      float right
      font-size 13px
      .mySwitch
        width 40px
        height 20px
        background-color #dcdfe6
        border-radius 10px
        overflow hidden
        position relative
        cursor pointer
        margin 10px 30px 10px 5px
        float right
        .open
          right 0px !important
          transition all linear .5s
          -moz-transition all linear .5s
          -ms-transition all linear .5s
          -webkit-transition all linear .5s
        .close
          right 20px !important
          transition all linear .5s
          -moz-transition all linear .5s
          -ms-transition all linear .5s
          -webkit-transition all linear .5s
        .switchBtn
          width 100%
          height 100%
          border-radius 10px
          background-color rgb(19, 206, 102)
          overflow hidden
          position absolute
          top 0
          right 0px
          div
            width 20px
            height 20px
            border-radius 10px
            background-color #ffffff
            float right
            line-height 20px
            text-align center
            font-size 11px !important
  .products-enter-to
    animation fadeInRight linear 1s
  .products-leave-to
    animation fadeOutLeft linear 1s
  .productInfo
    width 200px
    height 100%
    background #fff
    position absolute
    top 0 
    right 0
</style>
