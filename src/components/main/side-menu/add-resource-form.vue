<template>
    <Form
        v-if="!isLoading"
        ref="formCustom"
        class="comp-add-resource-form"
        :model="formData"
        :rules="ruleInline"
        label-position="left"
        :label-width="40"
    >
        <FormItem
            label="学段"
            prop="stageId"
        >
            <Select
                v-model="formData.stageId"
                style="width: 200px"
                :capture="false"
                @on-change="onStageChange"
            >
                <Option
                    v-for="item in options.stage"
                    :key="item.wdStageId"
                    :value="item.wdStageId"
                >
                    {{ item.stageName }}
                </Option>
            </Select>
        </FormItem>
        <FormItem
            label="学科"
            prop="subjectId"
        >
            <Select
                v-model="formData.subjectId"
                style="width: 200px"
                @on-change="onSubjectChange"
            >
                <Option
                    v-for="item in options.subject"
                    :key="item.wdSubjectId"
                    :value="item.wdSubjectId"
                >
                    {{ item.subjectName }}
                </Option>
            </Select>
        </FormItem>
        <FormItem
            label="版本"
            prop="versionId"
        >
            <Select
                v-model="formData.versionId"
                style="width: 200px"
                @on-change="onVersionChange"
            >
                <Option
                    v-for="item in options.version"
                    :key="item.id"
                    :value="item.id"
                >
                    {{ item.name }}
                </Option>
            </Select>
        </FormItem>
        <FormItem
            label="分册"
            prop="fascicleId"
        >
            <Select
                v-model="formData.fascicleId"
                style="width: 200px"
                @on-change="onFascicleChange"
            >
                <Option
                    v-for="item in options.fascicle"
                    :key="item.id"
                    :value="item.id"
                >
                    {{ item.name }}
                </Option>
            </Select>
        </FormItem>
    </Form>
</template>
<script>
import { mapActions, mapState, mapMutations } from 'vuex';

export default {
    data() {
        return {
            formData: {
                stageId: '',
                subjectId: '',
                versionId: '',
                fascicleId: '',
            },
            ruleInline: {
                stageId: [
                    {
                        required: true,
                        message: '请选择学段',
                        trigger: 'change',
                        // type: 'number',
                    },
                ],
                subjectId: [
                    {
                        required: true,
                        message: '请选择学科',
                        trigger: 'change',
                        // type: 'number',
                    },
                ],
                versionId: [
                    {
                        required: true,
                        message: '请选择版本',
                        trigger: 'change',
                        type: 'number',
                    },
                ],
                fascicleId: [
                    {
                        required: true,
                        message: '请选择分册',
                        trigger: 'change',
                        type: 'number',
                    },
                ],
            },

            isLoading: true,
        };
    },
    computed: {
        ...mapState({
            options: state => state.textbook.options,
        }),
    },

    created() {
        this.getData();
    },
    // updated() {
    //     this.getOptionsAsync();
    // },
    methods: {
        getData() {
            this.getStageOptionAsync().then(() => {
                this.isLoading = false;
            });
        },
        ...mapActions([
            'getStageOptionAsync',
            'getSubjectOptionAsync',
            'getVersionOptionAsync',
            'getFascicleOptionAsync',
        ]),
        ...mapMutations([
            'selectStage',
            'selectSubject',
            'selectVersion',
            'selectFascicle',
        ]),
        onStageChange(val) {
            console.log(val);
            this.formData.subjectId = '';
            this.formData.versionId = '';
            this.formData.fascicleId = '';

            this.selectStage(val);
            this.getSubjectOptionAsync();
        },
        onSubjectChange(val) {
            this.formData.versionId = '';
            this.formData.fascicleId = '';

            this.selectSubject(val);
            this.getVersionOptionAsync();
        },
        onVersionChange(val) {
            this.formData.fascicleId = '';

            this.selectVersion(val);
            this.getFascicleOptionAsync();
        },
        onFascicleChange(val) {
            this.selectFascicle(val);
        },
        validate() {
            return new Promise((resolve, reject) => {
                this.$refs.formCustom.validate((valid) => {
                    if (valid) {
                        resolve(this.formData);
                    } else {
                        reject();
                    }
                });
            });
        },
        reset() {
            this.$refs.formCustom.resetFields();
        },
    },
};
</script>

<style lang="less">
.comp-add-resource-form {
    .ivu-form-item {
        margin: 7px 24px 20px 16px;
    }

    .ivu-form-item-label:before {
        display: none;
    }

    .ivu-select-dropdown {
        max-height: 145px;
    }
}
</style>
