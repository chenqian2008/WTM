import { Input } from 'antd';
import Form, { GetFieldDecoratorOptions, WrappedFormUtils } from 'antd/lib/form/Form';
import { FormItemProps } from 'antd/lib/form/FormItem';
import { ToImg } from 'components/dataView';
import GlobalConfig from 'global.config'; //全局配置
import lodash from 'lodash';
import { observer } from 'mobx-react';
import * as React from 'react';
const formItemLayout = { ...GlobalConfig.formItemLayout };//布局
const formItemLayoutRow = { ...GlobalConfig.formItemLayoutRow };
/**
 * 表单item
 */
interface IFormItemProps {
    fieId: string;
    /** 模型 */
    models?: {
        [key: string]: {
            label: string,
            rules: any[],
            formItem: React.ReactNode
        };
    };
    /** 禁用 控件输入更改 */
    disabled?: boolean;
    /** 禁用 组件 显示 span */
    display?: boolean;
    /** 默认值 */
    defaultValues?: Object;
    /** Form.Item 的 props */
    formItemProps?: FormItemProps;
    /** 装饰器参数  */
    decoratorOptions?: GetFieldDecoratorOptions;
    /** 布局类型 row 整行 span 24 */
    layout?: "row";
    /** 覆盖默认渲染 */
    render?: (data: any, fieId: string) => React.ReactNode;
    [key: string]: any;
}
@observer
export class FormItem extends React.Component<IFormItemProps, any> {
    static wtmType = "FormItem";
    render() {
        const { form = {}, fieId, models, decoratorOptions, formItemProps, defaultValues, disabled, display, render, layout } = this.props;
        const { getFieldDecorator }: WrappedFormUtils = form;
        // 获取模型 item
        const model = lodash.get(models, fieId) || { rules: [], label: `未获取到模型(${fieId})`, formItem: <Input placeholder={`未获取到模型(${fieId})`} /> };
        let options: GetFieldDecoratorOptions = {
            rules: model.rules,
            ...decoratorOptions
        };
        // 获取默认值 默认值，禁用，显示 span 
        if (typeof defaultValues === "object") {
            options.initialValue = lodash.get(defaultValues, fieId);
        }
        let renderItem = null;
        // 重写渲染
        if (typeof render === "function") {
            renderItem = render(options.initialValue, fieId);
        } else {
            // 禁用显示 span
            if (typeof display === "boolean") {
                renderItem = itemToRender(options.initialValue, model.formItem)
            } else {
                renderItem = getFieldDecorator && getFieldDecorator(this.props.fieId, options)(model.formItem);
                // 禁用 输入控件
                if (typeof disabled === "boolean") {
                    renderItem = React.cloneElement(renderItem, { disabled: true })
                }
            }
        }
        // 布局
        let itemlayout = layout == "row" ? formItemLayoutRow : formItemLayout;//整行
        return <Form.Item label={model.label} {...itemlayout}  {...formItemProps}>
            {renderItem}
        </Form.Item >
    }
}
function itemToRender(value, formItem) {
    let render = null;
    // 数据 是 obj 类型转换 为 json 字符串，防止 react 报错
    if (typeof value === "object") {
        value = value && JSON.stringify(value);
    }
    switch (lodash.get(formItem, "type.wtmType")) {
        case "UploadImg":
            render = <ToImg fileID={value} />
            break;
        default:
            render = <span>{value}</span>
            break;
    }
    return render
}