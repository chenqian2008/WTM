/**
 * @author 冷 (https://github.com/LengYXin)
 * @email lengyingxin8966@gmail.com
 * @create date 2018-07-24 05:02:33
 * @modify date 2018-07-24 05:02:33
 * @desc [description]
 */
import Exception from 'ant-design-pro/lib/Exception';
import { LocaleProvider, Skeleton } from 'antd';
import zhCN from 'antd/lib/locale-provider/zh_CN';
import lodash from 'lodash';
import { observer } from 'mobx-react';
import Pages from 'pages/index';
import Animate from 'rc-animate';
import * as React from 'react';
import Loadable from 'react-loadable';
import { renderRoutes } from 'react-router-config';
import { BrowserRouter } from 'react-router-dom';
import Store from 'store/index';
import Layout from "./layout/index";
import Home from "./pages/home";
import Login from "./pages/login";
import System from "./pages/system";
import globalConfig from 'global.config';
import { Help } from 'utils/Help';

@observer
class Entrance extends React.Component<any, any> {
    componentDidMount() {
        // console.clear()
    }
    render() {
        // 用户登陆菜单加载完成进入主界面
        if (Store.User.isLogin) {
            return <Layout {...this.props} />
        }
        return <Login {...this.props} />

    }
}
@observer
export default class RootRoutes extends React.Component<any, any> {
    /**
     * 路由列表
     */
    public routes: any[] = [
        {
            /**
             * 主页布局 
             */
            path: "/",
            component: Entrance,
            //  业务路由
            routes: [
                {
                    path: "/",
                    exact: true,
                    component: this.createCSSTransition(Home)
                },
                {
                    path: "/system",
                    exact: true,
                    component: this.createCSSTransition(System)
                },
                ...this.initRouters(),
                // 404  首页
                {
                    component: this.createCSSTransition(NoMatch)
                }
            ]
        }
    ];
    /**
     * 初始化路由数据
     */
    initRouters() {
        return lodash.map(Pages, (component: any, key) => {
            if (typeof component === "object") {
                return {
                    "path": component.path,
                    "component": this.Loadable(component.component)
                };
            }
            return {
                "path": "/" + key,
                "component": this.Loadable(component)
            };
        })
    }

    // 组件加载动画
    Loading = (props) => {
        if (props.error) {
            return <div>Error! {props.error}</div>;
        } else if (props.timedOut) {
            return <div>Taking a long time...</div>;
        } else if (props.pastDelay) {
            return <>
                <Skeleton active />
                <Skeleton active />
                <Skeleton active />
                <Skeleton active />
                <Skeleton active />
            </>
        } else {
            return <div></div>;
        }
    };
    /**
     * 
     * @param Component 组件
     * @param Animate 路由动画
     * @param Loading 组件加载动画
     * @param cssTranParams 路由动画参数
     */
    Loadable(Component, Animate = true, Loading = this.Loading, cssTranParams = { content: true, classNames: "fade" }) {
        if (!Loading) {
            Loading = (props) => this.Loading(props);
        }
        const loadable = Loadable({ loader: Component, loading: Loading });
        if (Animate) {
            return this.createCSSTransition(loadable, cssTranParams.content, cssTranParams.classNames);
        }
        return loadable;
    };
    /**
     * 过渡动画
     * @param Component 组件
     * @param content 
     * @param classNames 动画
     */
    createCSSTransition(Component: any, content = true, classNames = "fade") {
        return class extends React.PureComponent {
            render() {
                return <Animate transitionName={classNames}
                    transitionAppear={true} component="" key={lodash.get(this, 'props.location.pathname', Help.GUID())}>
                    <div className="app-animate-content" key="app-animate-content" >
                        <Component {...this.props} />
                    </div>
                </Animate  >
            }
        }
    };
    render() {
        document.title = globalConfig.default.title;
        // react-dom.development.js:492 Warning: Provider: It is not recommended to assign props directly to state because updates to props won't be reflected in state. In most cases, it is better to use props directly.
        return (
            <LocaleProvider locale={zhCN}>
                <BrowserRouter >
                    {renderRoutes(this.routes)}
                </BrowserRouter>
            </LocaleProvider>
        );
    }

}
class NoMatch extends React.Component<any, any> {
    render() {
        return <Exception type="404" desc={<h3>无法匹配 <code>{this.props.location.pathname}</code></h3>} />
    }
}