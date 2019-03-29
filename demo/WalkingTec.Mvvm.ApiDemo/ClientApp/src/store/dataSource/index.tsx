/**
 * @author 冷 (https://github.com/LengYXin)
 * @email lengyingxin8966@gmail.com
 * @create date 2018-09-12 18:52:27
 * @modify date 2018-09-12 18:52:27
 * @desc [description] .
 */
import * as React from 'react';
import { message, notification, List, Row, Col, Button } from 'antd';
import { action, computed, observable, runInAction, toJS } from 'mobx';
import { Request } from 'utils/Request';
import RequestFiles from 'utils/RequestFiles';
import lodash from 'lodash';
import { Help } from 'utils/Help';
import globalConfig from 'global.config';
import { BindAll } from 'lodash-decorators';
import { map, filter } from 'rxjs/operators';
import { AjaxRequest } from 'rxjs/ajax';
import { Observable, Subject } from 'rxjs';
declare type PageStoreOptions = {
  /** api 列表 */
  Apis: WTM.IUrls,
  IdKey?: string,
  Target?: string,
};
/**
 * 搜索 参数
 */
export declare type ISearchParams = {
  /** 搜索条件 */
  // search?: Object,
  /** 排序 字符 */
  SortInfo?: string,
  /** 页码 */
  Page?: number,
  /** 条数 */
  Limit?: number
};
@BindAll()
export default class PageStore {
  public options: PageStoreOptions = {
    Apis: {},
    IdKey: "ID",
    Target: globalConfig.target,
  };
  constructor(options: PageStoreOptions) {
    this.options = { ...this.options, ...options };
    this.Observable = new PageObservable(this, this.options);
    this.DataSource = new DataSource(this, this.options);
    this.PageState = new PageState(this, this.options);
  }
  /** 数据 */
  DataSource: DataSource;
  /** 状态 */
  PageState: PageState;
  /** 数据管道  */
  Observable: PageObservable;// = new PageObservable(this, this.options);
  /** 搜索 */
  async onSearch(params?: ISearchParams) {
    this.PageState.tableLoading = true;
    const res = await this.Observable.onSearch(params);
    this.DataSource.tableList = res;
    this.PageState.tableLoading = false;
    return res;
  }
  /** 详情 */
  async onDetails(params) {
    const res = await this.Observable.onDetails(params);
    this.DataSource.details = res;
    return res;
  }
  /** 添加 */
  async onInsert(params) {
    const res = await this.Observable.onInsert(params);
    notification.success({ message: "操作成功" });
    this.onSearch();
    return res;
  }
  /** 修改 */
  async onUpdate(params) {
    const res = await this.Observable.onUpdate(this.DataSource.details, params);
    notification.success({ message: "操作成功" });
    this.onSearch();
    return res;
  }
  /**
   * 删除
   * @param params 
   */
  async onDelete(params: string[]) {
    try {
      if (!lodash.isArray(params)) {
        if (lodash.isObject(params)) {
          params = lodash.get(params, this.options.IdKey);
        }
        params = [params as any];
      }
      const res = await this.Observable.onDelete(params)
      message.success('删除成功')
      this.DataSource.selectedRowKeys = [];
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
    try {
      const res = await this.Observable.onImport(UploadFileId);
      message.success('导入成功')
      return res
    } catch (error) {
      console.log(error);
    }
  }
  /**
   * 导出
   * @param params 筛选参数
   */
  async onExport(params?) {
    await RequestFiles.download({
      ...this.options.Apis.export,
      url: Request.compatibleUrl(this.options.Target, this.options.Apis.export.url),
      body: { ...this.DataSource.searchParams, ...params }
    })
  }
  /**
   * 导出
   * @param params 筛选参数
   */
  async onExportIds(ids = this.DataSource.selectedRowKeys) {
    await RequestFiles.download({
      ...this.options.Apis.exportIds,
      url: Request.compatibleUrl(this.options.Target, this.options.Apis.exportIds.url),
      body: ids
    })
  }
  /**
  * 数据模板
  */
  async onTemplate() {
    await RequestFiles.download({
      ...this.options.Apis.template,
      url: Request.compatibleUrl(this.options.Target, this.options.Apis.template.url)
    })
  }
}
/**
 * 页面数据管道
 */
class PageObservable {
  constructor(private PageStore: PageStore, private options: PageStoreOptions) {
  }
  /**
   * Ajax 
   */
  Request = new Request(this.PageStore.options.Target);
  /**
   * 搜索
   * @param params 
   */
  onSearch(params) {
    params = {
      SortInfo: "",
      Page: 1,
      Limit: lodash.get(globalConfig, 'Limit', 10),
      ...params,
    }
    return this.Request.ajax({ ...this.options.Apis.search, body: params }).pipe(
      map(data => {
        if (data.Data) {
          // 设置 一个 key 默认 去 idkey 中的值，没有则创建 一个 guid
          data.Data = lodash.map(data.Data, obj => {
            lodash.set(obj, 'key', lodash.get(obj, this.options.IdKey, Help.GUID()))
            return obj
          })
        }
        return {
          Count: 0,
          Data: [],
          Page: 1,
          PageCount: 1,
          ...data,
          Limit: params.Limit
        }
      })
    ).toPromise();
  };
  /**
   * 详情
   * @param params 
   */
  onDetails(params) {
    //  字符串 为 ID 转换成 对象 匹配 /***/{ID} 
    if (lodash.isString(params)) {
      params = lodash.set({}, this.options.IdKey, params);
    }
    return this.Request.ajax({ ...this.options.Apis.details, body: params }).toPromise();
  };
  /**
   * 添加数据
   * @param params 数据实体
   */
  onInsert(params) {
    return this.Request.ajax({ ...this.options.Apis.insert, body: params }).toPromise();
  };
  /**
   * 修改
   * @param details 
   * @param params 
   */
  onUpdate(details, params) {
    let isUpdate = false;
    lodash.map(params, (value, key) => {
      if (!isUpdate) {
        if (!lodash.isEqual(value, lodash.get(details, key))) {
          isUpdate = true
        }
      }
    })
    if (isUpdate) {
      return this.Request.ajax({ ...this.options.Apis.update, body: params }).toPromise();
    }
    return true
  }
  /**
   * 删除
   * @param ids 
   */
  onDelete(ids: string[]) {
    return this.Request.ajax({ ...this.options.Apis.delete, body: ids }).toPromise()
  }
  /**
   * 导入
   * @param UploadFileId 
   */
  onImport(UploadFileId) {
    return this.Request.ajax({ ...this.options.Apis.import, body: UploadFileId }).toPromise();
  }
}
/**
 * 页面状态
 */
class PageState {
  constructor(private PageStore: PageStore, private options: PageStoreOptions) {
  }
  @observable
  private _tableLoading;
  /**
   * table 加载状态
   */
  @computed
  public get tableLoading() {
    return this._tableLoading;
  }
  public set tableLoading(value) {
    this._tableLoading = value;
  }
  @observable
  private _visiblePort;
  /**
   * 导入 visible
   */
  @computed
  public get visiblePort() {
    return this._visiblePort;
  }
  public set visiblePort(value) {
    this._visiblePort = value;
  }
}
class DataSource {
  constructor(private PageStore: PageStore, private options: PageStoreOptions) {
  }
  // 表格数据
  @observable
  private _tableList;
  // 详情数据
  @observable
  private _details;
  // 搜索参数
  @observable
  private _searchParams;
  // 选择的行 数据
  @observable
  private _selectedRowData: any[];
  @observable
  private _selectedRowKeys: string[];
  /**
  * 表格数据
  */
  @computed
  public get tableList(): {
    Count: number,
    Data: any[],
    Limit: number,
    Page: number,
    PageCount: number
  } {
    return this._tableList || {
      Count: 0,
      Data: [],
      Page: 1,
      Limit: globalConfig.Limit,
      PageCount: 1
    };
  }
  public set tableList(value) {
    this._tableList = value;
  }
  /**
  * 详情
  */
  @computed
  public get details() {
    return this._details;
  }
  public set details(value) {
    this._details = value;
  }
  /**
   * 搜索参数
   */
  @computed
  public get searchParams() {
    return this._searchParams;
  };
  public set searchParams(value) {
    this._searchParams = value;
  };
  /**
   * 选择的 行 数据
   */
  @computed
  public get selectedRowData() {
    return toJS(this._selectedRowData) || [];
  }
  /**
  * 选择的 行 数据 keys
  */
  @computed
  public get selectedRowKeys() {
    return toJS(this._selectedRowKeys) || [];
  }
  public set selectedRowKeys(value) {
    this._selectedRowKeys = value;
    this._selectedRowData = lodash.filter(this._tableList, item => lodash.includes(value, lodash.get(item, this.options.IdKey)));
  }
}