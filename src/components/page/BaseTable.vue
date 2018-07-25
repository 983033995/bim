<template>
    <div class="userTable">
        <el-table
            :data="tableData"
            border
            style="width: 100%">
            <el-table-column
            prop="id"
            label="序号"
            width="180">
            </el-table-column>
            <el-table-column
            prop="user_name"
            label="用户名"
            width="180">
            </el-table-column>
            <el-table-column
            prop="login_name"
            label="登录名">
            </el-table-column>
            <el-table-column
            prop="status"
            label="状态">
            </el-table-column>
            <el-table-column
            prop="date"
            label="创建时间">
            </el-table-column>
            <el-table-column label="操作" width="180">
                <template slot-scope="scope">
                    <el-button size="small" @click="handleEdit(scope.$index, scope.row)">权限管理</el-button>
                    <el-button size="small" type="info" @click="handleDelete(scope.$index, scope.row)">{{ scope.row.status === '禁用' ? '启用' : '禁用' }}</el-button>
                </template>
            </el-table-column>
        </el-table>

        <!-- 权限弹出框 -->
        <el-dialog :title="powerTitle" :visible.sync="editVisible" width="30%">
            <el-form ref="form" :model="power" label-width="50px">
                <el-form-item label="门禁">
                    <el-checkbox-group v-model="power.doorType">
                        <el-checkbox v-for="(item) of power.doorList" :key="item.card_no" :label="item.card_address"></el-checkbox>
                    </el-checkbox-group>
                </el-form-item>
                <el-form-item label="停车场">
                    <el-checkbox-group v-model="power.carType">
                        <el-checkbox v-for="(item) of power.carList" :key="item.card_no" :label="item.card_address"></el-checkbox>
                    </el-checkbox-group>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="editVisible = false">取 消</el-button>
                <el-button type="primary" @click="saveEdit">确 定</el-button>
            </span>
        </el-dialog>

        <!-- 删除提示框 -->
        <el-dialog title="提示" :visible.sync="delVisible" width="300px" center>
            <div class="del-dialog-cnt">是否确定{{ offOn }}</div>
            <span slot="footer" class="dialog-footer">
                <el-button @click="delVisible = false">取 消</el-button>
                <el-button type="primary" @click="deleteRow">确 定</el-button>
            </span>
        </el-dialog>
      </div>
</template>

<script>
  export default {
    name: 'basetable',
    data() {
      return {
        currentUserId: '',
        tableData: [{
            id: 1,
            date: '2016-05-02',
            user_name: 'admin',
            login_name: 'admin',
            status: '禁用'
        }, {
            id: 2,
            date: '2016-05-02',
            user_name: 'admin',
            login_name: 'admin',
            status: '启用'
        }, {
            id: 3,
            date: '2016-05-02',
            user_name: 'admin',
            login_name: 'admin',
            status: '启用'
        }, {
            id: 4,
            date: '2016-05-02',
            user_name: 'admin',
            login_name: 'admin',
            status: '禁用'
        }],
        editVisible: false,
        delVisible: false,
        form: {
            id: '',
            date: '',
            user_name: '',
            login_name: ''
        },
        idx: -1,
        power: {
            doorType: [],
            doorList: [],
            carType: [],
            carList: []
        },
        powerTitle: '',
        offOn: ''
      }
    },
    methods: {
        handleEdit(index, row) {
            console.log(index)
            console.log(row)
            this.idx = index;
            this.powerTitle = row.user_name + '的权限配置'
            this.currentUserId = row.id
            const item = this.tableData[index];
            this.$axios.get('api/getpower?userid='+this.currentUserId).then( res => {
                console.log(res)
                const data = res.data
                this.power.doorList = data.doorList
                this.power.carList = data.carList
            })

            this.editVisible = true;
        },
        handleDelete(index, row) {
            this.idx = index;
            let isStatus
            row.status === '启用' ? isStatus = '禁用' : isStatus = '启用'
            this.offOn = isStatus + row.user_name;
            this.delVisible = true;
        },
        // 保存编辑
        saveEdit() {
            this.$axios.post('api/editpower',{doorType: this.power.doorType, carType: this.power.carType, userid: this.currentUserId}).then( res => {
                let data = res.data
                if (data.msg === 0 || data.msg === '0') {
                    this.$message.error(data.resultModel)
                }else{
                    this.$message({
                        message: data.resultModel,
                        type: 'success'
                    });
                    this.editVisible = false;
                }
            })
        },
        // 确定删除
        deleteRow(){
            this.tableData[this.idx].status === '启用' ? this.tableData[this.idx].status = '禁用' : this.tableData[this.idx].status = '启用';
            this.$message.success(this.offOn + '成功');
            this.delVisible = false;
        }
    }
  }
</script>

<style lang="stylus" scoped>
</style>
