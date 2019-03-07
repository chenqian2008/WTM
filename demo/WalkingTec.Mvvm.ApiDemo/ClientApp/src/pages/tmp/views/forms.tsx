import { Col } from 'antd';
import { DialogForm, DialogFormDes, DialogFormSubmit, FormItem, InfoShellLayout, DialogLoadData, } from 'components/dataView';
import { DesError } from 'components/decorators'; //错误
import lodash from 'lodash';
import { observer } from 'mobx-react';
import * as React from 'react';
import Store from '../store'; //页面状态
import Models from './models'; //模型
/**
 * 添加
 */
@DialogFormDes({
    onFormSubmit(values) {
        return Store.onInsert(values)
    },
    // onlogLoadData(props) {
    //     return Store.onDelete([])
    // }
})
@observer
export class InsertForm extends React.Component<any, any> {
    /** 装饰 函数 为 DialogFormSubmit submit 函数 */
    // test = '测试 我是 当前类 属性'
    // @DialogFormSubmit()
    // onTest(values) {
    //     console.log(this, values)
    //     return Store.onUpdate(values)
    // }
    // @DialogLoadData()
    // onTes2t() {
    //     return Store.onDetails(Store)
    // }
    models = Models.editModels(this.props);
    render() {
        // item 的 props
        const props = {
            ...this.props,
            // 模型
            models: this.models,
        }
        return (
            <InfoShellLayout>
                <Col span={24}>
                    <DialogForm>
                        <InsertForm />
                    </DialogForm>
                </Col>
                <FormItem {...props} fieId="ITCode" />
                <FormItem {...props} fieId="Password" />
                <FormItem {...props} fieId="Email" />
                <FormItem {...props} fieId="Name" />
                <FormItem {...props} fieId="Sex" />
                <FormItem {...props} fieId="UserGroups" />
                <FormItem {...props} fieId="UserRoles" layout="row" />
                <FormItem {...props} fieId="PhotoId" layout="row" />
                <FormItem {...props} fieId="CreateTime" layout="row" />
                <FormItem {...props} fieId="Date2" layout="row" />
            </InfoShellLayout>
        )
    }
}
/**
 * 修改表单
 */
@DialogFormDes({
    onFormSubmit(values) {
        return Store.onUpdate(values)
    },
    onLoadData(values, props) {
        return Store.onDetails(values)
    }
})
@observer
export class UpdateForm extends React.Component<{ loadData: Function | Object }, any> {
    // 创建模型
    models = Models.editModels(this.props);
    render() {
        // item 的 props
        const props = {
            ...this.props,
            // 模型
            models: this.models,
        }
        return <InfoShellLayout>
            <FormItem {...props} fieId="ITCode" />
            <FormItem {...props} fieId="Password" disabled />
            <FormItem {...props} fieId="Email" />
            <FormItem {...props} fieId="Name" />
            <FormItem {...props} fieId="Sex" />
            <FormItem {...props} fieId="UserGroups" />
            <FormItem {...props} fieId="UserRoles" layout="row" disabled />
            <FormItem {...props} fieId="PhotoId" layout="row" />
            <FormItem {...props} fieId="CreateTime" layout="row" />
        </InfoShellLayout>
    }
}
/**
 * 详情
 */
@DialogFormDes({
    onLoadData(values, props) {
        return Store.onDetails(values)
    }
})
@observer
export class InfoForm extends React.Component<{ loadData: Function | Object }, any> {
    // 创建模型
    models = Models.editModels(this.props);
    render() {
        // item 的 props
        const props = {
            ...this.props,
            // 模型
            models: this.models,
            // 禁用
            display: true,
        }
        return <InfoShellLayout >
            <FormItem {...props} fieId="ITCode" />
            <FormItem {...props} fieId="Password" />
            <FormItem {...props} fieId="Email" />
            <FormItem {...props} fieId="Name" />
            <FormItem {...props} fieId="Sex" />
            <FormItem {...props} fieId="UserGroups" />
            <FormItem {...props} fieId="UserRoles" layout="row" />
            <FormItem {...props} fieId="PhotoId" layout="row" />
        </InfoShellLayout>
    }
}
