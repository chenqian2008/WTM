﻿import { columnsRender, columnsRenderImg, AgGrid } from 'components/dataView';
import { DesError } from 'components/decorators';
import React from 'react';
import Store from '../store';
import Action from './action';
import { Switch, Icon } from 'antd';
/**
 * 列 信息配置
 * 完整参数列表 https://ant.design/components/table-cn/#components-table-demo-dynamic-settings
 * dataIndex:属性名称 区分大小写
 * title:表格显示的中文标题
 */
// const columns = [

//     {
//         dataIndex: "ITCode",
//         title: "账号",
//         render: columnsRender
//     },

//     {
//         dataIndex: "Name",
//         title: "姓名",
//         render: columnsRender
//     },

//     {
//         dataIndex: "Sex",
//         title: "性别",
//         render: columnsRender
//     },

//     {
//         dataIndex: "PhotoId",
//         title: "照片",
//         render: columnsRenderImg
//     },

//     {
//         dataIndex: "IsValid",
//         title: "是否有效",
//         render: columnsRender
//     },

//     {
//         dataIndex: "RoleName_view",
//         title: "角色",
//         render: columnsRender
//     },

//     {
//         dataIndex: "GroupName_view",
//         title: "用户组",
//         render: columnsRender
//     }

// ]

/**
 * 表格
 */
@DesError
export default class extends React.Component<any, any> {
    render() {
        return <AgGrid
            Store={Store}
            columnDefs={[
                {
                    headerName: "账号", field: "ITCode", checkboxSelection: true, headerCheckboxSelection: true
                },
                {
                    headerName: "姓名", field: "Name",
                },
                {
                    headerName: "性别", field: "Sex",
                },
                {
                    headerName: "照片", field: "PhotoId", cellRenderer: "columnsRenderImg"
                },
                {
                    headerName: "是否有效", field: "IsValid",cellRenderer: "columnsRenderBoolean"
                },
                {
                    headerName: "角色", field: "RoleName_view",
                },
                {
                    headerName: "用户组", field: "GroupName_view",
                },
            ]}
            rowHeight={110}
            frameworkComponents={{
                columnsRenderImg: (props) => {
                    return columnsRenderImg(props.value, props.data)
                },
                columnsRenderBoolean: (props) => {
                    return props.value ? <Switch checkedChildren={<Icon type="check" />} unCheckedChildren={<Icon type="close" />} disabled defaultChecked /> : <Switch checkedChildren={<Icon type="check" />} unCheckedChildren={<Icon type="close" />} disabled />
                }
            }}
        />
    }
}
