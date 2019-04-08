﻿import { Col } from 'antd';
import { DialogForm, DialogFormDes, DialogFormSubmit, FormItem, InfoShellLayout, DialogLoadData, } from 'components/dataView';
import { DesError } from 'components/decorators'; //错误
import lodash from 'lodash';
import { observer } from 'mobx-react';
import * as React from 'react';
import Store from '../store'; //页面状态
import Models from './models'; //模型
import { bool } from 'prop-types';

@DialogFormDes({
    onFormSubmit(values) {
        return Store.onInsert(values)
    }
})
@observer
export class InsertForm extends React.Component<any, any> {
    models = Models.editModels(this.props);
    render() {
        const props = {
            ...this.props,
            models: this.models,
        }
        const groupvalue = this.props.form.getFieldValue("DpType") || '0';
        const Isgroup = lodash.eq(groupvalue, '0')
        const Isall = lodash.eq(this.props.form.getFieldValue("IsAll") || 'true', 'true')
        console.log(this.props.form.getFieldValue("DpType"))
        return <InfoShellLayout>
            <FormItem {...props} fieId="DpType" layout="row" value='{groupvalue}' />
            <FormItem {...props} fieId="Entity.TableName" />
            <FormItem {...props} fieId="IsAll" value={Isall} />
            <FormItem {...props} fieId="SelectedActionIDs" hidden={Isall} />
            <FormItem {...props} fieId="UserItCode" hidden={Isgroup}/>
            <FormItem {...props} fieId="Entity.GroupId" hidden={!Isgroup}/>
        </InfoShellLayout>
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
export class UpdateForm extends React.Component<WTM.FormProps, any> {
    // 创建模型
    models = Models.editModels(this.props);
    render() {
        const { form } = this.props;
        const { getFieldDecorator } = form;
        const props = {
            ...this.props,
            models: this.models,
        }
        getFieldDecorator('Entity.ID', { initialValue: lodash.get(this.props.defaultValues, 'Entity.ID') })
        const Isgroup = lodash.eq(this.props.form.getFieldValue("DpType") || '0', '0')
        const Isall = lodash.eq(this.props.form.getFieldValue("IsAll") || 'true', 'true')
        return <InfoShellLayout>
            <FormItem {...props} fieId="DpType" layout="row"  />
            <FormItem {...props} fieId="Entity.TableName" />
            <FormItem {...props} fieId="IsAll" />
            <FormItem {...props} fieId="SelectedActionIDs" hidden={Isall} />
            <FormItem {...props} fieId="UserItCode" hidden={Isgroup} />
            <FormItem {...props} fieId="Entity.GroupId" hidden={!Isgroup} />
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
export class InfoForm extends React.Component<WTM.FormProps, any> {
    models = Models.editModels(this.props);
    render() {
        const props = {
            ...this.props,
            models: this.models,
            display: true,
        }
        const Isgroup = lodash.eq(this.props.form.getFieldValue("DpType") || '0', '0')
        const Isall = lodash.eq(this.props.form.getFieldValue("IsAll") || 'true', 'true')
        return <InfoShellLayout>
            <FormItem {...props} fieId="DpType" layout="row"  />
            <FormItem {...props} fieId="Entity.TableName" />
            <FormItem {...props} fieId="IsAll"  />
            <FormItem {...props} fieId="SelectedActionIDs" hidden={Isall} />
            <FormItem {...props} fieId="UserItCode" hidden={Isgroup} />
            <FormItem {...props} fieId="Entity.GroupId" hidden={!Isgroup} />
        </InfoShellLayout>
    }
}
