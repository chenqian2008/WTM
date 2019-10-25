
import { Icon, Tabs } from 'antd';
import LayoutSpin from "components/other/LayoutSpin";
import GlobalConfig from 'global.config';
import lodash from 'lodash';
import { action, observable, runInAction } from 'mobx';
import { observer } from 'mobx-react';
import * as React from 'react';
import { Item, Menu, MenuProvider } from 'react-contexify';
import { matchRoutes } from 'react-router-config';
import { fromEvent } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import Store from 'store/index';
import './index.less';

/**
 * tabs 页面布局
 */
export default class App extends React.Component {
    render() {
        return <TabsPages {...this.props} />
    }
}
@observer
class TabsPages extends React.Component<any, any> {
    TabsPagesStore = new TabsPagesStore(this.props.route.routes);
    componentDidMount() {
        this.TabsPagesStore.pushTabPane(this.props.location.pathname);
    }
    componentWillUnmount() {
        this.TabsPagesStore.componentWillUnmount();
    }
    componentDidUpdate() {
        this.TabsPagesStore.pushTabPane(this.props.location.pathname);
        // console.log("TCL: TabsPages -> componentDidUpdate -> this.props", this.props)
    }
    onChange(event) {
        if (!lodash.eq(this.props.location.pathname, event)) {
            this.props.history.replace(event)
        }
    }
    onEdit(event) {
        const path = this.TabsPagesStore.onClosable(event);
        if (lodash.eq(this.props.location.pathname, event)) {
            this.onChange(path)
        }
    }
    /**
     * 关闭
     * @param type 其他，当前，全部 
     * @param event 
     */
    onClose(type: "Other" | "Current" | "All", event) {
        this.onChange(this.TabsPagesStore.onClose(type, event))
    }
    getDisabled(event) {
        return event.props.pathname === '/'
    }
    render() {
        const tabPane = this.TabsPagesStore.tabPane;
        const height = this.TabsPagesStore.height;
        return (
            <>
                <Tabs
                    activeKey={this.props.location.pathname}
                    // size="small"
                    className={'app-layout-tabs'}
                    // tabPosition={lodash.get(GlobalConfig, "tabPosition", "top") as any}
                    onChange={this.onChange.bind(this)}
                    // animated={GlobalConfig.tabsAnimated}
                    type="editable-card"
                    onEdit={this.onEdit.bind(this)}
                >
                    {tabPane.map(item => {
                        const router = item.router;
                        const props = { ...this.props, match: router.match };
                        return <Tabs.TabPane
                            tab={<MenuProvider id="TabPane" component="span" data={item}>{renderIconTitle({ Icon: item.icon, Text: item.title })}</MenuProvider>}
                            key={item.pathname}
                            closable={item.closable}
                            style={{ height: height }}>
                            <React.Suspense fallback={<LayoutSpin />}>
                                {React.createElement(router.component, props)}
                            </React.Suspense>
                        </Tabs.TabPane>
                    })}
                </Tabs>
                <Menu id='TabPane' animation="pop" style={{ minWidth: 100 }}>
                    <Item disabled={this.getDisabled} onClick={this.onClose.bind(this, 'Current')}><span><Icon type="close" /></span> 关闭当前</Item>
                    <Item onClick={this.onClose.bind(this, 'Other')}><span><Icon type="close" /></span> 关闭其他</Item>
                    <Item onClick={this.onClose.bind(this, 'All')}><span><Icon type="close" /></span> 关闭全部</Item>
                </Menu>
            </>
        );
    }
}
class TabsPagesStore {
    constructor(private routes) {
    }
    componentWillUnmount() {
        this.resize.unsubscribe();
    }
    @observable height = this.getHeight();
    @observable tabPane = [{
        title: '首页',
        pathname: "/",
        closable: false,
        icon: "home",
        router: this.getRoutes("/")
    }];
    @action
    pushTabPane(pathname) {
        const router = this.getRoutes(pathname);
        if (lodash.some(this.tabPane, item => lodash.eq(item.pathname, pathname))) return;
        const menu = lodash.find(Store.Meun.ParallelMenu, ['Url', pathname]);
        const title = lodash.get(menu, 'Text', "Null")
        const icon = lodash.get(menu, 'Icon', "appstore")
        this.tabPane.push({
            title: title,//renderIconTitle(menu || { Text: "NULL", Icon: "appstore", Id: Help.GUID() }),
            pathname,
            closable: true,
            icon,
            router
        });
    }
    @action
    onClosable(pathname) {
        const index = lodash.findIndex(this.tabPane, ['pathname', pathname]);
        const path = lodash.get(this.tabPane, `[${index - 1}].pathname`, "/");
        lodash.remove(this.tabPane, ['pathname', pathname]);
        return path
    }
    /**
    * 关闭
    * @param type 其他，当前，全部 
    * @param event 
    */
    @action
    onClose(type: "Other" | "Current" | "All", event) {
        let path = "/";
        switch (type) {
            case 'Other':
                this.tabPane = [{
                    title: '首页',
                    pathname: "/",
                    closable: false,
                    icon: "home",
                    router: this.getRoutes("/")
                }];
                this.pushTabPane(event.props.pathname);
                path = event.props.pathname;
                break;
            case 'Current':
                path = this.onClosable(event.props.pathname);
                break;
            case 'All':
                this.tabPane = [{
                    title: '首页',
                    pathname: "/",
                    closable: false,
                    icon: "home",
                    router: this.getRoutes("/")
                }];
                break;
        }
        return path;
    }
    getHeight() {
        return window.innerHeight - 104//(lodash.some(["top", "bottom"], data => lodash.eq(data, GlobalConfig.tabPosition)) ? 90 : 50);
    }
    getRoutes(pathname) {
        const router = matchRoutes(this.routes, pathname);
        return {
            component: router[0].route.component,
            match: router[0].match
        }
    }
    resize = fromEvent(window, "resize").pipe(debounceTime(200)).subscribe(e => {
        const height = this.getHeight()
        if (this.height != height) {
            runInAction(() => this.height = height)
        }
    });
}
function renderIconTitle(menu) {
    let icon = null;
    icon = <Icon type={menu.Icon || 'appstore'} />
    return <>{icon}<span>{menu.Text}</span> </>
}
