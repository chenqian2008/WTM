import { Input, Switch, Icon, Select, Upload, message, Modal } from 'antd';
import * as React from 'react';
import UploadImg from 'components/form/uploadImg';
import Store from '../store';
export default {
    /** ITCode */
    ITCode: <Input placeholder="请输入 ITCode" />,
    /** Password */
    Password: <Input placeholder="请输入 Password" />,
    /** Email */
    Email: <Input placeholder="请输入 Email" />,
    /** Name */
    Name: <Input placeholder="请输入 Name" />,
    /** IsValid */
    IsValid: <Switch checkedChildren={<Icon type="check" />} unCheckedChildren={<Icon type="close" />} />,
    /** 照片 */
    PhotoId: UploadImg,
    /** 性别 */
    Sex: <Select placeholder="性别" >
        <Select.Option value="0">男</Select.Option>
        <Select.Option value="1">女</Select.Option>
    </Select>
}