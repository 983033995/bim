<template>
    <div class="login-wrap">
        <div class="ms-logo">
            <img src="~@/assets/img/login_logo.png" />
        </div>
        <div class="ms-login">
            <div class="ms-title">物联网系统</div>
            <el-form :model="ruleForm" :rules="rules" ref="ruleForm" label-width="0px" class="demo-ruleForm">
                <el-form-item prop="username">
                    <el-input v-model="ruleForm.username" placeholder="请输入用户名"></el-input>
                </el-form-item>
                <el-form-item prop="password">
                    <el-input type="password" placeholder="请输入密码" v-model="ruleForm.password" @keyup.enter.native="submitForm('ruleForm')"></el-input>
                </el-form-item>
                <el-form-item prop="password">
                    <el-input type="password" placeholder="请再次输入密码" v-model="ruleForm.aginPassword" @keyup.enter.native="submitForm('ruleForm')"></el-input>
                </el-form-item>
                <div class="login-btn">
                    <el-button type="primary" @click="submitForm('ruleForm')">注册</el-button>
                </div>
            </el-form>
            <div class="register">已有账号？<router-link to="/login">点击登陆</router-link></div>
        </div>
    </div>
</template>

<script>
    export default {
        data: function(){
            return {
                ruleForm: {
                    username: '',
                    password: '',
                    aginPassword: ''
                },
                rules: {
                    username: [
                        { required: true, message: '请输入用户名', trigger: 'blur' }
                    ],
                    password: [
                        { required: true, message: '请输入密码', trigger: 'blur' }
                    ]
                }
            }
        },
        methods: {
            submitForm(formName) {
                this.$refs[formName].validate((valid) => {
                    if (valid) {
                        if (this.ruleForm.password !== this.ruleForm.aginPassword) {
                            this.$message({
                                message: '两次输入的密码不一致',
                                type: 'warning'
                            });
                            return false;
                        } else {
                            let user_password = {
                                username: this.ruleForm.username,
                                password: this.ruleForm.password
                            }
                            let url = 'api/register'
                            this.$axios.post(url,user_password).then(res => {
                                console.log(res)
                                console.log(res.msg)
                                let data = res.data
                                if (data.msg === 0 || data.msg === '0') {
                                    this.$message.error(data.resultModel)
                                }else{
                                    this.$message({
                                        message: data.resultModel,
                                        type: 'success'
                                    });
                                    setTimeout( () => {this.$router.push('/login')},2500)
                                }
                            })
                        }
                    } else {
                        this.$message({
                            message: '请填写完整信息',
                            type: 'warning'
                        });
                        return false;
                    }
                });
            }
        }
    }
</script>

<style scoped>
    .login-wrap{
        position: relative;
        width:100%;
        height:100%;
        background: url('~@/assets/img/login-img.png') 20% center no-repeat #93defe;
    }
    .ms-title{
        margin-top: 20px;
        text-align: center;
        font-size:18px;
        color: #000;

    }
    .ms-logo{
        width: 120px;
        height: 120px;
        border-radius: 100%;
        position: absolute;
        left: 65%;
        top: 50%;
        z-index: 9;
        border: 4px solid #93defe;
        background: #fff;
        margin-left: -60px;
        margin-top: -225px;
    }
    .ms-logo img{
        display: block;
        width: 60px;
        height: 60px;
        margin: 30px auto;
    }
    .ms-login{
        position: absolute;
        left:65%;
        top:50%;
        width:300px;
        height:270px;
        margin:-150px 0 0 -190px;
        padding:40px;
        border-radius: 5px;
        background: #fff;
    }
    .demo-ruleForm{
        margin-top: 35px;
    }
    .login-btn{
        text-align: center;
    }
    .login-btn button{
        width:100%;
        height:36px;
    }
    .register{
        margin-top: 10px;
        float: right;
        font-size: 12px;
    }
    .register a {
        color: #27A9E3;
        text-decoration: none;
        cursor: pointer;
    }
</style>