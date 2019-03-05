import { Col, message } from 'antd';
import { DialogForm, FormItem, InfoShellLayout } from 'components/dataView';
import { DesError } from 'components/decorators'; //错误
import lodash from 'lodash';
import { toJS } from 'mobx';
import { observer } from 'mobx-react';
import * as React from 'react';
import Store from '../store'; //页面状态
import Models from './models'; //模型
/**
 * 添加
 */
@DesError
@observer
export class InsertForm extends React.Component<any, any> {
    // static onFormSubmit = (values) => {
    //     return Store.onInsert(values)
    // }
    // 创建模型
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
@DesError
@observer
export class UpdateForm extends React.Component<{ Details: Function | Object }, any> {
    static onFormSubmit = (values) => {
        return Store.onUpdate(values)
    }
    state = {
        loading: true,
        details: {}
    }
    async componentDidMount() {
        const params = lodash.isFunction(this.props.Details) ? this.props.Details() : this.props.Details;
        const details = await Store.onDetails(params);
        this.setState({
            loading: false,
            details
        })
    }
    // 创建模型
    models = Models.editModels(this.props);
    render() {
        // item 的 props
        const props = {
            ...this.props,
            // 模型
            models: this.models,
            // 默认值
            defaultValues: this.state.details,
        }
        return <InfoShellLayout loading={this.state.loading}>
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
@DesError
@observer
export class InfoForm extends React.Component<{ Details: Function | Object }, any> {
    state = {
        loading: true,
        details: {}
    }
    async componentDidMount() {
        const params = lodash.isFunction(this.props.Details) ? this.props.Details() : this.props.Details;
        const details = await Store.onDetails(params);
        this.setState({
            loading: false,
            details
        })
    }
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
            // 默认值
            defaultValues: this.state.details,
        }
        return <InfoShellLayout loading={this.state.loading}>
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
