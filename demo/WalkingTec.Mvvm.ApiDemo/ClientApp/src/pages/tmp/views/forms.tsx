import { Col } from 'antd';
import { DialogForm, DialogFormDes, FormItem, InfoShellLayout } from 'components/dataView';
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
    onLoadData(values, props) {
        // return Store.onDetails(values)
        return {
            Editer: "&lt;p style=&quot;text-align:center;&quot;&gt;&lt;strong&gt;&lt;span style=&quot;color:#003ba5&quot;&gt;&lt;span style=&quot;font-size:40px&quot;&gt;阿发达安抚打发打发啊的安抚阿发阿发暗杀啊&lt;/span&gt;&lt;/span&gt;&lt;/strong&gt;&lt;/p&gt;"//'<div style="color:#00FF00;">0.0041245</div>'
        }
    }
})
@observer
export class InsertForm extends React.Component<any, any> {
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
                <FormItem {...props} fieId="Editer" layout="row" />
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
