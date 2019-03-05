import { Button, Divider, Dropdown, Menu, message, Modal, Popconfirm, Row } from 'antd';
import { DialogForm, Visible } from 'components/dataView';
import { DesError } from 'components/decorators';
import lodash from 'lodash';
import { observer } from 'mobx-react';
import * as React from 'react';
import { EnumAuthorizeActions, onAuthorizeActions } from 'store/system/authorize';
import Store from '../store';
import { TestForm } from './details';
/**
 * 动作事件
 */
export const ActionEvents = {
    onTest(event: React.MouseEvent<HTMLButtonElement, MouseEvent>) {
        event.preventDefault();
        event.stopPropagation();
    },
    /**
     * 添加
     */
    onAdd() {
        Store.onModalShow({}, "Insert")
    },
    /**
     * 详情
     * @param data 
     */
    onInfo(data) {
        Store.onModalShow(data, "Info")
    },
    /**
     * 修改
     * @param data 
     */
    onUpdate(data) {
        Store.onModalShow(data, "Update")
    },
    /**
     * 导入
     */
    onImport() {
        Store.onPageState("visiblePort", true)
    },
    /**
     * 导出
     */
    onExport() {
        Store.onExport()
    },
    /**
     * 批量导出
     */
    onExportIds() {
        Store.onExportIds()
    },
    /**
     * 删除
     * @param data 
     */
    onDelete(data) {
        Store.onDelete([lodash.get(data, Store.IdKey)])
    },
    /**
    * 删除
    */
    onDeleteList() {
        const length = Store.selectedRowKeys.length
        if (length > 0) {
            Modal.confirm({
                title: `确定删除 ${length} 条数据?`,
                onOk: async () => {
                    Store.onDelete([...Store.selectedRowKeys])
                },
                onCancel() { },
            });
        }
    },
    /**
     * 多选修改
     */
    onUpdateList() {
        if (Store.selectedRowKeys.length == 1) {
            Store.onModalShow(lodash.find(Store.dataSource.Data, ['key', lodash.head(Store.selectedRowKeys)]), "Update")
        } else {
            message.warn("请选择一条数据")
        }
    }
}
/**
 * 表格 所有 动作
 */
@DesError
@observer
class PageAction extends React.Component<any, any> {
    render() {
        const { selectedRowKeys, Actions } = Store;
        const deletelength = selectedRowKeys.length;
        const disabled = deletelength < 1;
        return (
            <Row className="data-view-page-action">
                <DialogForm
                    title="弹个框"
                    onFormSubmit={(err, values) => {
                        // 没有错误 提交 数据
                        if (!err) {
                            // return Store.Request.post("", values).toPromise()
                            return new Promise((resolve, reject) => {
                                // 2秒后 返回 treu 关闭窗口
                                lodash.delay(resolve, 2000, true)
                            })
                        }
                    }}>
                    <TestForm />
                </DialogForm>
                <Divider type="vertical" />
                <Visible visible={onAuthorizeActions(Store, EnumAuthorizeActions.insert)}>
                    <Button icon="plus" type="primary" onClick={ActionEvents.onAdd} >新建</Button>
                </Visible>
                <Visible visible={onAuthorizeActions(Store, EnumAuthorizeActions.update)}>
                    <Divider type="vertical" />
                    <Button icon="edit" onClick={ActionEvents.onUpdateList} disabled={disabled}>修改</Button>
                </Visible>
                <Visible visible={onAuthorizeActions(Store, EnumAuthorizeActions.delete)}>
                    <Divider type="vertical" />
                    <Button icon="delete" onClick={ActionEvents.onDeleteList} disabled={disabled}> 删除  </Button>
                </Visible>
                <Visible visible={onAuthorizeActions(Store, EnumAuthorizeActions.import)}>
                    <Divider type="vertical" />
                    <Button icon="folder-add" onClick={ActionEvents.onImport}>导入</Button>
                </Visible>
                <Visible visible={onAuthorizeActions(Store, EnumAuthorizeActions.export)}>
                    <Divider type="vertical" />
                    <Dropdown overlay={<Menu>
                        <Menu.Item>
                            <a onClick={ActionEvents.onExport}>导出全部</a>
                        </Menu.Item>
                        <Menu.Item disabled={disabled}>
                            <a onClick={ActionEvents.onExportIds}>导出勾选</a>
                        </Menu.Item>
                    </Menu>}>
                        <Button icon="download" >导出</Button>
                    </Dropdown>
                </Visible>

            </Row>
        );
    }
}
/**
 * 表格 行 动作
 */
@DesError
@observer
class RowAction extends React.Component<{
    /** 数据详情 */
    data: any;
    [key: string]: any;
}, any> {
    render() {
        const { Actions } = Store;
        const { data } = this.props
        return (
            <Row className="data-view-row-action">
                <a onClick={() => { ActionEvents.onInfo(data) }} >详情</a>
                <Visible visible={onAuthorizeActions(Store, EnumAuthorizeActions.update)}>
                    <Divider type="vertical" />
                    <a onClick={() => { ActionEvents.onUpdate(data) }} >修改</a>
                </Visible>
                <Visible visible={onAuthorizeActions(Store, EnumAuthorizeActions.delete)}>
                    <Divider type="vertical" />
                    <Popconfirm title="确定删除?" onConfirm={() => { ActionEvents.onDelete(data) }} >
                        <a >删除</a>
                    </Popconfirm>
                </Visible>
            </Row>
        );
    }
}
export default {
    /**
     * 页面动作
     */
    pageAction: PageAction,
    /**
     * 数据行动作
     */
    rowAction: RowAction
}