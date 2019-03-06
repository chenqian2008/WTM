/**
 * @author 冷 (https://github.com/LengYXin)
 * @email lengyingxin8966@gmail.com
 * @create date 2018-09-12 18:52:27
 * @modify date 2018-09-12 18:52:27
 * @desc [description] .
 */
import * as React from 'react';
import { message, notification, List, Row, Col, Button } from 'antd';
import { action, computed, observable, runInAction } from 'mobx';
import { Request } from 'utils/Request';
import RequestFiles from 'utils/RequestFiles';
import lodash from 'lodash';
import { Help } from 'utils/Help';
/**
 * 搜索 参数
 */
interface IonSearchParams {
  /** 搜索条件 */
  // search?: Object,
  /** 排序 字符 */
  SortInfo?: string,
  /** 页码 */
  Page?: number,
  /** 条数 */
  Limit?: number
}
export default class Store {
  /** 数据 ID 索引 */
  protected IdKey = 'id';
  /** url 地址 */
  protected Urls: WTM.IUrls = {

  };
  /**  详情 */
  @observable
  details: any = {};
  /** Ajax   */
  Request = new Request();
  /** 数据列表 */
  @observable dataSource = {
    Count: 0,
    Data: [],
    Page: 1,
    Limit: 10,
    PageCount: 1
  }
  /**
   * 当前页面搜索参数
   */
  searchParams = {};
  /** 多选行 key */
  @observable selectedRowKeys = [];

  /** 页面动作 */
  @observable pageState = {
    /** 导入窗口 */
    visiblePort: false,
    loading: false,//数据加载
  }
  /**
   *  修改页面动作状态
   * @param key 
   * @param value 
   */
  @action.bound
  onPageState(key: "loading" | "visiblePort", value: boolean) {
    const prevVal = this.pageState[key];
    if (prevVal == value) {
      return
    }
    this.pageState[key] = value;
  }
  /**
   * 多选 行 
   * @param selectedRowKeys 选中的keys
   */
  @action.bound
  onSelectChange(selectedRowKeys) {
    this.selectedRowKeys = selectedRowKeys
  }
  /**
   * 加载数据 列表
   * @param search 搜索条件 
   * @param SortInfo 排序字段
   * @param Page 页码
   * @param Limit 数据条数
   */
  async onSearch(params?: IonSearchParams) {
    try {
      if (this.pageState.loading == true) {
        return //message.warn('数据正在加载中')
      }
      params = {
        // search: {},
        SortInfo: "",
        Page: 1,
        Limit: 10,
        ...params,
      }
      this.searchParams = params;
      this.onPageState("loading", true);
      const method = this.Urls.search.method;
      const url = this.Urls.search.url;
      const res = await this.Request[method](url, params).map(data => {
        if (data.Data) {
          // 设置 一个 key 默认 去 idkey 中的值，没有则创建 一个 guid
          data.Data = lodash.map(data.Data, obj => {
            lodash.set(obj, 'key', lodash.get(obj, this.IdKey, Help.GUID()))
            return obj
          })
        }
        return data
      }).toPromise()
      runInAction(() => {
        this.dataSource = {
          // ...this.dataSource,
          ...res,
          Limit: params.Limit
        }
      })
      return res
    } catch (error) {
      console.error(error)
      message.error("获取数据出错")
    } finally {
      this.onPageState("loading", false)
    }
  }
  /**
   * 详情
   * @param params 数据实体
   */
  async onDetails(params) {
    const method = this.Urls.details.method;
    const url = this.Urls.details.url;
    const res = await this.Request[method](url, params).toPromise();
    // 设置详情
    runInAction(() => { this.details = res; })
    return res || {}
  }
  /**
   * 添加数据
   * @param params 数据实体
   */
  async onInsert(params) {
    const method = this.Urls.insert.method;
    const url = this.Urls.insert.url;
    const res = await this.Request[method](url, { Entity: { ...this.details, ...params } }).toPromise()
    notification.success({ message: "添加成功" });
    this.onSearch()
    return res
  }
  /**
   * 更新数据
   * @param params 数据实体
   */
  async onUpdate(params) {
    const method = this.Urls.update.method;
    const url = this.Urls.update.url;
    const res = await this.Request[method](url, { Entity: { ...this.details, ...params } }).toPromise();
    notification.success({ message: "修改成功" })
    this.onSearch(this.searchParams)
    return res
  }
  /**
   * 删除
   * @param ids 
   */
  async onDelete(ids: string[]) {
    try {
      const method = this.Urls.delete.method;
      const url = this.Urls.delete.url;// + "/" + data[this.IdKey];
      const res = await this.Request[method](url, ids).toPromise()
      message.success('删除成功')
      this.onSelectChange([]);
      // 刷新数据
      this.onSearch();
      return res
    } catch (error) {
      message.error('删除失败')
    }
  }
  /**
   * 导入
   * @param UploadFileId 
   */
  async onImport(UploadFileId) {
    const method = this.Urls.import.method;
    const url = this.Urls.import.url;
    try {
      const res = await this.Request[method](url, { UploadFileId }).toPromise();
      message.success('导入成功')
      return res
    } catch (error) {
      console.log(error);
      this.onErrorMessage("导入失败", [{ value: lodash.get(error, 'Entity.Import'), key: null, FileId: lodash.get(error, 'Entity.ErrorFileId') }])
    }
  }
  /**
   * 导出
   * @param params 筛选参数
   */
  async onExport(params = this.searchParams) {
    await RequestFiles.download({
      url: this.Urls.export.url,
      method: this.Urls.export.method,
      body: params
    })
  }
  /**
   * 导出
   * @param params 筛选参数
   */
  async onExportIds() {
    if (this.selectedRowKeys.length > 0) {
      await RequestFiles.download({
        url: this.Urls.exportIds.url,
        method: this.Urls.exportIds.method,
        body: [...this.selectedRowKeys]
      })
    }
  }
  /**
  * 数据模板
  */
  async onTemplate() {
    await RequestFiles.download({
      url: this.Urls.template.url,
      method: this.Urls.template.method
    })
  }
  /**
   * 错误提示
   * @param message 
   * @param dataSource 
   */
  onErrorMessage(message, dataSource?: { key: string, value: string, FileId?: string }[]) {
    notification.error({
      duration: 5,
      message: message,
      description: dataSource && dataSource.length > 0 && <List
        itemLayout="horizontal"
        dataSource={dataSource}
        renderItem={item => (
          <List.Item>
            <Row style={{ width: "100%" }}>
              {/* <Col span={10}>{item.key}</Col> */}
              <Col span={14}>{item.value}</Col>
              {item.FileId && <Col span={10}>
                <Button type="primary" onClick={e => {
                  RequestFiles.download({ url: RequestFiles.onFileDownload(item.FileId, "/"), method: "get" })
                }}>下载错误文件</Button>
              </Col>}
            </Row>
          </List.Item>
        )}
      />
    })
  }
}
