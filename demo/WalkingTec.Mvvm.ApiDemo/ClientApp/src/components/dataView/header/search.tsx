import { Button, Col, Divider, Form, Icon, Row } from 'antd';
import { WrappedFormUtils } from 'antd/lib/form/Form';
import { DesForm, DesError } from 'components/decorators';
import lodash from 'lodash';
import { action, observable } from 'mobx';
import { observer } from 'mobx-react';
import * as React from 'react';
import Store from 'store/dataSource';
import "./style.less";

// 偏移 1维  columnCount 二维 FormItems.length
const offsetArray = [
    [0, 0, 0, 0, 0],//0
    [0, 0, 0, 0, 0],//1
    [0, 0, 0, 0, 0],//2
    [0, 0, 0, 0, 0],//3
    [24, 18, 12, 6, 24],//4
]
const colLayout = {
    xl: 6,
    lg: 8,
    md: 12
}
export interface IAppProps {
    /** 状态 */
    Store: Store;
    /** 搜索表单 items */
    FormItems: (props: WrappedFormUtils) => React.ReactNodeArray;
    /** 搜索参数替换 */
    onValueMap?: (vaule: Object) => Object;
    /** 列 个数 默认 4 个 */
    columnCount?: number;
    [key: string]: any;
}

/**
 * 装饰器
 * @param params 
 */
export function DecoratorsSearch(params: IAppProps) {
    return function (Component: any): any {
        return class extends React.Component<any, any> {
            render() {
                return <DataViewSearch {...params} {...this.props}>
                    <Component {...params} {...this.props} />
                </DataViewSearch>
            }
        }
    }
}

/**
 * 搜索标题组件 
 * 
 * 不要直接修改 wtm 组件 使用继承重写的方式修改
 */
@DesError
@DesForm
@observer
export class DataViewSearch extends React.Component<IAppProps, any> {
    Store: Store = this.props.Store;
    @observable toggle = false;
    onSubmit(e) {
        e.preventDefault();
        this.props.form.validateFields((err, values) => {
            if (!err) {
                values = this.props.onValueMap && this.props.onValueMap(values)
                this.Store.onSearch(values)
            }
        });
    }
    onReset() {
        const { resetFields } = this.props.form;
        resetFields();
        this.props.form.validateFields((err, values) => {
            if (!err) {
                this.Store.onSearch(lodash.mapValues(values, x => undefined))
            }
        });
    }
    @action.bound
    onToggle() {
        this.toggle = !this.toggle
    }
    render() {
        let items = [],
            columnCount = this.props.columnCount || 4,
            FormItems = this.props.FormItems(this.props.form),
            toggleShow = FormItems.length >= columnCount,
            colSpan = 24 / columnCount,//每列 值
            colSpanSearch = colSpan;
        // 展开收起
        if (this.toggle) {
            items = FormItems;
        } else {
            items = [...FormItems].splice(0, columnCount - 1);
        }
        const itemslength = items.length
        // 列行数
        if (itemslength > columnCount) {
            colSpanSearch = (columnCount - (itemslength % columnCount)) * colSpan
        } else {
            colSpanSearch = (columnCount - itemslength) * colSpan
        }
        return (
            <Form className="data-view-search" onSubmit={this.onSubmit.bind(this)}>
                <Row type="flex" >
                    {items.map(x => {
                        return <Col span={colSpan} key={x.key} >{x} </Col>
                    })}
                    <Col span={colSpanSearch} className="data-view-search-right" >
                        <Button icon="search" type="primary" htmlType="submit" loading={this.Store.pageState.loading}>搜索</Button>
                        <Divider type="vertical" />
                        <Button icon="retweet" onClick={this.onReset.bind(this)} loading={this.Store.pageState.loading}>重置</Button>
                        {
                            toggleShow && <>
                                <Divider type="vertical" />
                                <a className="data-view-search-toggle" onClick={this.onToggle}>
                                    {this.toggle ? <>收起 <Icon type='down' /></> : <>展开 <Icon type='up' /></>}
                                </a>
                            </>
                        }
                    </Col>
                </Row>
                <div className="data-view-search-divider"></div>
            </Form>
        );
    }
}