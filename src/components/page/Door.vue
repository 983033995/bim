<template>
    <div>
        <el-row :gutter="20">
            <el-col :span="6" v-for="item of doorList" :key="item.card_no">
                <el-card shadow="hover" class="mgb20">
                    <div class="doorImg icon iconfont icon-menjin"></div>
                    <el-tag type="info" v-text="item.card_address"></el-tag>
                    <el-button type="primary" plain @click="payCard(item.card_no)">刷卡</el-button>
                </el-card>
            </el-col>
        </el-row>
    </div>
</template>

<script>
    export default {
        name: 'door',
        data() {
            return {
                userId: localStorage.getItem('ms_userid'),
                userName: localStorage.getItem('ms_username'),
                userType: localStorage.getItem('ms_usertype'),
                doorList: []
            }
        },
        computed: {
            role() {
                return this.userType === '1' || this.userType === 1 ? '超级管理员' : '普通用户';
            }
        },
        methods: {
            payCard (cardNo) {
                let carInfo = {
                    'card_no': cardNo,
                    'user_id': this.user_id
                }
                this.$axios.post('api/paycard', carInfo).then( res => {
                    const data = res.data
                    if ( data.msg === '0' || data.msg === 0 ) {
                        this.$message.error(data.resultModel)
                    } else {
                        this.$message({
                            message: data.resultModel,
                            type: 'success',
                            center: true,
                            customClass: 'myMessages'
                        });                        
                    }
                })
            },
            getDoor () {
                this.$axios.get('api/getDoor').then(res => {
                    const data = res.data
                    this.doorList = data
                })
            }
        },
        created () {
            this.getDoor()
        }
    }

</script>


<style lang="stylus" scoped>
    .doorImg
        width 100%
        height 150px
        line-height 150px
        font-size 7rem
        text-align center
        color #8B4726
        background-color #F5F5DC
        border-radius 8px
    .el-button
        width 100%
        margin-top 15px
    .el-tag
        margin-top 10px
        display block
        text-align center
</style>
