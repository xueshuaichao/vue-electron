<template>
    <div>
        <!-- <button
            type="primary"
            @click="isModalShow.select = !isModalShow.select"
        >
            toggle
        </button> -->
        <Modal
            v-model="isModalShow.select"
            title="创建教材版本信息"
            width="312"
            :closable="false"
            :mask-closable="false"
        >
            <add-resource-form ref="form" />
            <div slot="footer">
                <Button
                    type="primary"
                    size="large"
                    long
                    :loading="loading"
                    @click="setupTextbook"
                >
                    开启资源之路
                </Button>
            </div>
        </Modal>
    </div>
</template>

<script>
import { mapActions } from 'vuex';
import AddResourceForm from '../main/side-menu/add-resource-form.vue';

export default {
    components: {
        AddResourceForm,
    },
    data() {
        return {
            isModalShow: {
                select: true,
            },
            loading: false,
        };
    },
    methods: {
        setupTextbook() {
            this.$refs.form.validate().then((conf) => {
                this.addTextbook(conf);
            });
        },
        ...mapActions(['addTextbook']),
    },
};
</script>
