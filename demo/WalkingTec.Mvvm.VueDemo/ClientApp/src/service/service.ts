/**
 * server封装，所有请求都走这里
 * option = {
 *      url:请求地址
 *      method: 'post' // 请求方式，post\get\put\delete
 *      data: {}, // 参数
 * }
 * service(option)
            .then(data => {
                console.log('then', data);
            })
            .catch(data => {
                console.log('catch', data);
            });
 */

import axios from "axios";
import config from "@/config/index";
import { Notification } from "element-ui"; // Message,
import cookie from "@/util/cookie.js";
import { contentType } from "@/config/enum";
type AxiosType = AxiosResponse & {
    result_code?: string;
};
// 返回参数数据类型
function getData(originalData) {
    const data = {};
    for (const key in originalData || {}) {
        if (
            originalData[key] !== null &&
            originalData[key] !== undefined &&
            originalData[key] !== ""
        ) {
            data[key] = originalData[key];
        }
    }
    return data;
}
// formdata请求
function serviceFormData(url, option, configs) {
    const datas = new FormData();
    Object.keys(option.data).forEach(key => {
        datas.append(key, option.data[key]);
    });
    return axios
        .post(url, datas, { headers: configs, responseType: "arraybuffer" })
        .then(response => response.data)
        .catch(errors => console.log(errors));
}
const service = (option, serverHost?) => {
    // config.serverHost
    const url = serverHost ? serverHost : "" + option.url;
    const req = {
        method: option.method,
        url: url,
        data: {},
        params: {},
        headers: {
            "Content-Type": contentType.json
        }
    };
    const data = getData(option.data);
    if (option.method === "post") {
        // 针对参数类型是对象（包含数组）
        req.data = data;
        req.headers["Content-Type"] = contentType.form;
        req["transformRequest"] = [
            function(data) {
                let ret = "";
                for (const it in data) {
                    ret +=
                        encodeURIComponent(it) +
                        "=" +
                        encodeURIComponent(data[it]) +
                        "&";
                }
                if (ret !== "") {
                    ret = ret.substr(0, ret.length - 1);
                }
                return ret;
            }
        ];
    } else {
        req.params = data;
    }
    if (option.isBuffer) {
        req["responseType"] = "arraybuffer";
    }
    // formdata格式
    if (option.contentType === contentType.multipart) {
        req.headers["Content-Type"] = contentType.multipart;
        return serviceFormData(url, option, req.headers);
    }
    return axios({ ...req })
        .then((res: AxiosType) => {
            const response = res.data;
            if (option.isBuffer) {
                return response;
            }
            // if (response.result_code !== "success") {
            //     //session 过期刷新页面
            //     if (response.result_code === "authentication_fail") {
            //         location.reload();
            //         return Promise.resolve({});
            //     }
            //     return Promise.reject(res);
            // }
            return response;
        })
        .catch(res => {
            console.log("error", res);
            let msg = "接口错误";
            if (res.response && res.response.data.Message) {
                msg = res.response.data.Message[0];
            } else if (res.data) {
                msg = res.data.message;
            } else if (res.message) {
                msg = res.message;
            }
            Notification.error({
                title: "错误",
                message: msg
            });
            throw res;
        });
};
export default service;
