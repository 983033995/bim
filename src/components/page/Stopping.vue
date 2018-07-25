<template>
    <div>
        <el-row :gutter="20">
            <el-col :span="6">
                <el-card shadow="hover" class="mgb20">
                    <div class="doorImg icon iconfont icon-tingchechang1"></div>
                    <el-button type="primary" plain @click="payCard()">刷卡</el-button>
                </el-card>
            </el-col>
        </el-row>
    </div>
</template>

<script>
    export default {
        name: 'stopping',
        data() {
            return {
                name: localStorage.getItem('ms_username')
            }
        },
        methods: {
            payCard () {
                this.$message({
                    message: '刷卡成功，欢迎光临',
                    type: 'success',
                    center: true,
                    customClass: 'myMessages',
                    duration: 2000
                });
            }
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
        color #FF8247
        background-color #FFFACD
        border-radius 8px
    .el-button
        width 100%
        margin-top 15px
</style>
