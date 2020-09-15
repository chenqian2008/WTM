using System;
using System.Collections.Generic;
using System.Drawing;
using System.Drawing.Imaging;
using System.IO;
using System.Linq;
using System.Text.Json;
using System.Text.RegularExpressions;
using System.Web;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Diagnostics;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Localization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using WalkingTec.Mvvm.Core;
using WalkingTec.Mvvm.Core.Extensions;
using WalkingTec.Mvvm.Core.Models;
using WalkingTec.Mvvm.Core.Support.FileHandlers;
using WalkingTec.Mvvm.Core.Support.Json;
using WalkingTec.Mvvm.Mvc.Model;

namespace WalkingTec.Mvvm.Mvc
{
    [AllRights]
    [ActionDescription("Framework")]
    public class _FrameworkController : BaseController
    {

        [HttpPost]
        public IActionResult Selector(string _DONOT_USE_VMNAME
            , string _DONOT_USE_KFIELD
            , string _DONOT_USE_VFIELD
            , string _DONOT_USE_FIELD
            , bool _DONOT_USE_MULTI_SEL
            , string _DONOT_USE_SEL_ID
            , string _DONOT_USE_SUBMIT
        )
        {
            var listVM = CreateVM(_DONOT_USE_VMNAME, null, null, true) as IBasePagedListVM<TopBasePoco, ISearcher>;

            if (listVM is IBasePagedListVM<TopBasePoco, ISearcher>)
            {
                RedoUpdateModel(listVM);
            }

            listVM.SearcherMode = ListVMSearchModeEnum.Selector;
            listVM.RemoveActionColumn();
            listVM.RemoveAction();

            ViewBag.TextName = _DONOT_USE_KFIELD;
            ViewBag.ValName = _DONOT_USE_VFIELD;
            ViewBag.FieldName = _DONOT_USE_FIELD;
            ViewBag.MultiSel = _DONOT_USE_MULTI_SEL;
            ViewBag.SelId = _DONOT_USE_SEL_ID;
            ViewBag.SubmitFunc = _DONOT_USE_SUBMIT;

            #region 获取选中的数据
            ViewBag.SelectData = "[]";
            if (listVM.Ids?.Count > 0)
            {
                var originNeedPage = listVM.NeedPage;
                listVM.NeedPage = false;
                listVM.SearcherMode = ListVMSearchModeEnum.Batch;
                Regex r = new Regex("<script>.*?</script>");
                ViewBag.SelectData = r.Replace((listVM as IBasePagedListVM<TopBasePoco, BaseSearcher>).GetDataJson(), "");
                listVM.IsSearched = false;
                listVM.SearcherMode = ListVMSearchModeEnum.Selector;
                listVM.NeedPage = originNeedPage;
            }
            #endregion

            return PartialView(listVM);
        }

        [ActionDescription("GetEmptyData")]
        public IActionResult GetEmptyData(string _DONOT_USE_VMNAME)
        {
            var listVM = CreateVM(_DONOT_USE_VMNAME, null, null, true) as IBasePagedListVM<TopBasePoco, BaseSearcher>;
            string data = listVM.GetSingleDataJson(null, false);
            var rv = new ContentResult
            {
                ContentType = "application/json",
                Content = data
            };
            return rv;
        }


        /// <summary>
        /// 获取分页数据
        /// </summary>
        /// <param name="_DONOT_USE_VMNAME"></param>
        /// <param name="_DONOT_USE_CS"></param>
        /// <returns></returns>
        [HttpPost]
        [ActionDescription("GetPagingData")]
        public IActionResult GetPagingData(string _DONOT_USE_VMNAME, string _DONOT_USE_CS)
        {
            var qs = new Dictionary<string, object>();
            foreach (var item in Request.Form.Keys)
            {
                qs.Add(item, Request.Form[item]);
            }
            //LogDebug.Info($"QueryString:{JsonConvert.SerializeObject(qs)}");
            //var vmType = Type.GetType(_DONOT_USE_VMNAME);
            //var vmCreater = vmType.GetConstructor(Type.EmptyTypes);
            //var listVM = vmCreater.Invoke(null) as BaseVM;
            WtmContext.CurrentCS = (string.IsNullOrEmpty(_DONOT_USE_CS) == true) ? "default" : _DONOT_USE_CS;
            var listVM = CreateVM(_DONOT_USE_VMNAME, null, null, true) as IBasePagedListVM<TopBasePoco, BaseSearcher>;
            listVM.FC = qs;
            if (listVM is IBasePagedListVM<TopBasePoco, ISearcher>)
            {
                RedoUpdateModel(listVM);
                var rv = new ContentResult
                {
                    ContentType = "application/json",
                    Content = $@"{{""Data"":{listVM.GetDataJson()},""Count"":{listVM.Searcher.Count},""Msg"":""success"",""Code"":{StatusCodes.Status200OK}}}"
                };
                return rv;
            }
            else
            {
                throw new Exception("Invalid Vm Name");
            }
        }


        /// <summary>
        /// 单元格编辑
        /// </summary>
        /// <param name="_DONOT_USE_VMNAME"></param>
        /// <param name="id">实体主键</param>
        /// <param name="field">属性名</param>
        /// <param name="value">属性值</param>
        /// <returns></returns>
        [HttpPost]
        public IActionResult UpdateModelProperty(string _DONOT_USE_VMNAME, Guid id, string field, string value)
        {
            if (value == null && Microsoft.Extensions.Primitives.StringValues.IsNullOrEmpty(Request.Form[nameof(value)]))
            {
                value = string.Empty;
            }
            var vm = CreateVM(_DONOT_USE_VMNAME, id, null, true) as IBaseCRUDVM<TopBasePoco>;
            vm.Entity.SetPropertyValue(field, value);
            DC.SaveChanges();
            return Json("Success");
        }

        #region Import/Export Excel

        /// <summary>
        /// Download Excel
        /// </summary>
        /// <param name="_DONOT_USE_VMNAME"></param>
        /// <param name="_DONOT_USE_CS"></param>
        /// <returns></returns>
        [HttpPost]
        [ActionDescription("Export")]
        public IActionResult GetExportExcel(string _DONOT_USE_VMNAME, string _DONOT_USE_CS = "default")
        {
            var qs = new Dictionary<string, object>();
            foreach (var item in Request.Query.Keys)
            {
                qs.Add(item, Request.Query[item]);
            }
            foreach (var item in Request.Form)
            {
                if (qs.ContainsKey(item.Key) == false)
                {
                    qs.Add(item.Key, item.Value);
                }
            }
            var instanceType = Type.GetType(_DONOT_USE_VMNAME);

            WtmContext.CurrentCS = (string.IsNullOrEmpty(_DONOT_USE_CS) == true) ? "default" : _DONOT_USE_CS;
            var listVM = CreateVM(_DONOT_USE_VMNAME) as IBasePagedListVM<TopBasePoco, ISearcher>;

            listVM.FC = qs;
            if (listVM is IBasePagedListVM<TopBasePoco, ISearcher>)
            {
                RedoUpdateModel(listVM);

                listVM.SearcherMode = listVM.Ids != null && listVM.Ids.Count > 0 ? ListVMSearchModeEnum.CheckExport : ListVMSearchModeEnum.Export;

                var data = listVM.GenerateExcel();
                HttpContext.Response.Cookies.Append("DONOTUSEDOWNLOADING", "0", new Microsoft.AspNetCore.Http.CookieOptions() { Path = "/", Expires = DateTime.Now.AddDays(2) });

                return File(data, "application/vnd.ms-excel", $"Export_{instanceType.Name}_{DateTime.Now.ToString("yyyy-MM-dd")}.xls");
            }
            else
            {
                throw new Exception("Invalid Vm Name");
            }
        }

        /// <summary>
        /// Download Excel Template
        /// </summary>
        /// <returns></returns>
        [HttpGet]
        [ActionDescription("DownloadTemplate")]
        public IActionResult GetExcelTemplate(string _DONOT_USE_VMNAME, string _DONOT_USE_CS = "default")
        {
            WtmContext.CurrentCS = _DONOT_USE_CS ?? "default";
            var importVM = CreateVM(_DONOT_USE_VMNAME) as IBaseImport<BaseTemplateVM>;
            var qs = new Dictionary<string, string>();
            foreach (var item in Request.Query.Keys)
            {
                qs.Add(item, Request.Query[item]);
            }
            importVM.SetParms(qs);
            var data = importVM.GenerateTemplate(out string fileName);
            HttpContext.Response.Cookies.Append("DONOTUSEDOWNLOADING", "0", new Microsoft.AspNetCore.Http.CookieOptions() { Domain = "/", Expires = DateTime.Now.AddDays(2) });
            return File(data, "application/vnd.ms-excel", fileName);
        }

        #endregion

        [AllowAnonymous]
        [ActionDescription("ErrorHandle")]
        public IActionResult Error()
        {
            var ex = HttpContext.Features.Get<IExceptionHandlerPathFeature>();
            ActionLog log = new ActionLog();
            log.LogType = ActionLogTypesEnum.Exception;
            log.ActionTime = DateTime.Now;
            log.ITCode = WtmContext.LoginUserInfo?.ITCode ?? string.Empty;

                var controllerDes = ex.Error.TargetSite.DeclaringType.GetCustomAttributes(typeof(ActionDescriptionAttribute), false).Cast<ActionDescriptionAttribute>().FirstOrDefault();
                var actionDes = ex.Error.TargetSite.GetCustomAttributes(typeof(ActionDescriptionAttribute), false).Cast<ActionDescriptionAttribute>().FirstOrDefault();
                var postDes = ex.Error.TargetSite.GetCustomAttributes(typeof(HttpPostAttribute), false).Cast<HttpPostAttribute>().FirstOrDefault();
                //给日志的多语言属性赋值
                log.ModuleName = controllerDes?.GetDescription(ex.Error.TargetSite.DeclaringType) ?? ex.Error.TargetSite.DeclaringType.Name.Replace("Controller", string.Empty);
                log.ActionName = actionDes?.GetDescription(ex.Error.TargetSite.DeclaringType) ?? ex.Error.TargetSite.Name;
                if (postDes != null)
                {
                    log.ActionName += "[P]";
                }
                log.ActionUrl = ex.Path;
                log.IP = HttpContext.Connection.RemoteIpAddress.ToString();
                log.Remark = ex.Error.ToString();
                if (string.IsNullOrEmpty(log.Remark) == false && log.Remark.Length > 2000)
                {
                    log.Remark = log.Remark.Substring(0, 2000);
                }
                DateTime? starttime = HttpContext.Items["actionstarttime"] as DateTime?;
                if (starttime != null)
                {
                    log.Duration = DateTime.Now.Subtract(starttime.Value).TotalSeconds;
                }
                GlobalServices.GetRequiredService<ILogger<ActionLog>>().Log<ActionLog>( LogLevel.Error, new EventId(), log, null, (a, b) => {
                    return a.GetLogString();
                });
            
            var rv = string.Empty;
            if (ConfigInfo.IsQuickDebug == true)
            {
                rv = ex.Error.ToString().Replace(Environment.NewLine, "</br>");
            }
            else
            {
                rv = ex.Error.Message.Replace(Environment.NewLine, "</br>"); ;
            }
            return BadRequest(rv);
        }

        [HttpPost]
        [ActionDescription("UploadFileRoute")]
        public IActionResult Upload([FromServices] WtmFileProvider fp, SaveFileModeEnum? sm = null, string groupName = null, bool IsTemprory = true, string _DONOT_USE_CS = "default")
        {
            var fh = fp.CreateFileHandler(sm?.ToString(), _DONOT_USE_CS);
            var FileData = Request.Form.Files[0];
            var file = fh.Upload(FileData.FileName, FileData.Length, FileData.OpenReadStream());
            return Json(new { Code = 200, Data = new { Id = file.GetID(), Name = file.FileName } });
        }

        [HttpPost]
        [ActionDescription("UploadFileRoute")]
        public IActionResult UploadImage([FromServices] WtmFileProvider fp, SaveFileModeEnum? sm = null, string groupName = null, bool IsTemprory = true, string _DONOT_USE_CS = "default", int? width = null, int? height = null)
        {
            if (width == null && height == null)
            {
                return Upload(fp, sm, groupName, IsTemprory, _DONOT_USE_CS);
            }
            var FileData = Request.Form.Files[0];

            Image oimage = Image.FromStream(FileData.OpenReadStream());
            if (oimage == null)
            {
                return Json(new {Code=404, Data = new { Id = string.Empty, Name = string.Empty } });
            }
            if (width == null)
            {
                width = height * oimage.Width / oimage.Height;
            }
            if (height == null)
            {
                height = width * oimage.Height / oimage.Width;
            }
            MemoryStream ms = new MemoryStream();
            oimage.GetThumbnailImage(width.Value, height.Value, null, IntPtr.Zero).Save(ms, System.Drawing.Imaging.ImageFormat.Png);
            ms.Position = 0;

            var fh = fp.CreateFileHandler(sm?.ToString(), _DONOT_USE_CS);
            var file = fh.Upload(FileData.FileName, ms.Length, ms);
            oimage.Dispose();
            ms.Dispose();
            return Json(new { Code = 200, Data = new { Id = file.GetID(), Name = file.FileName } });
        }

        [HttpPost]
        [ActionDescription("UploadForLayUIRichTextBox")]
        public IActionResult UploadForLayUIRichTextBox([FromServices] WtmFileProvider fp, string _DONOT_USE_CS = "default")
        {
            var fh = fp.CreateFileHandler(null, _DONOT_USE_CS);
            var FileData = Request.Form.Files[0];
            var file = fh.Upload(FileData.FileName, FileData.Length, FileData.OpenReadStream());
            if(file != null)
            {
                string url = $"/_Framework/GetFile?id={file.GetID()}&stream=true&_DONOT_USE_CS={CurrentCS}";
                return Content($"{{\"code\": 0 , \"msg\": \"\", \"data\": {{\"src\": \"{url}\"}}}}");

            }
            else
            {
                return Content($"{{\"code\": 1 , \"msg\": \"{Program._localizer["UploadFailed"]}\", \"data\": {{\"src\": \"\"}}}}");

            }

        }

        [ActionDescription("GetFileName")]
        public IActionResult GetFileName([FromServices] WtmFileProvider fp, Guid id, string _DONOT_USE_CS = "default")
        {
            var fh = fp.CreateFileHandler(null, _DONOT_USE_CS);
            return Ok(fh.GetFileName(id.ToString()));
        }

        [ActionDescription("GetFile")]
        public IActionResult GetFile([FromServices] WtmFileProvider fp, string id, bool stream = false, string _DONOT_USE_CS = "default", int? width = null, int? height = null)
        {
            var fh = fp.CreateFileHandler(null, _DONOT_USE_CS);
            var file = fh.GetFile(id);
            Stream rv = null;
            rv = file.DataStream;
            try
            {
                Image oimage = Image.FromStream(rv);
                if (oimage != null && (width != null || height != null))
                {
                    if (width == null)
                    {
                        width = oimage.Width * height / oimage.Height;
                    }
                    if (height == null)
                    {
                        height = oimage.Height * width / oimage.Width;
                    }
                    var ms = new MemoryStream();
                    oimage.GetThumbnailImage(width.Value, height.Value, null, IntPtr.Zero).Save(ms, System.Drawing.Imaging.ImageFormat.Png);
                    rv.Dispose();
                    rv = ms;
                }
                else
                {

                }
            }
            catch { }
            var ext = file.FileExt.ToLower();
            var contenttype = "application/octet-stream";
            if (ext == "pdf")
            {
                contenttype = "application/pdf";
            }
            if (ext == "png" || ext == "bmp" || ext == "gif" || ext == "tif" || ext == "jpg" || ext == "jpeg")
            {
                contenttype = $"image/{ext}";
            }
            if (ext == "mp4")
            {
                contenttype = $"video/mpeg4";
            }
            rv.Position = 0;
            if (stream == false)
            {
                return File(rv, contenttype, file.FileName ?? (Guid.NewGuid().ToString() + ext));
            }
            else
            {
                rv.CopyToAsync(Response.Body);
                return new EmptyResult();
            }
        }

        [ActionDescription("ViewFile")]
        public IActionResult ViewFile([FromServices] WtmFileProvider fp, string id, string width, string _DONOT_USE_CS = "default")
        {
            var fh = fp.CreateFileHandler(null, _DONOT_USE_CS);
            var file = fh.GetFile(id);
            string html = string.Empty;
            if (file.FileExt.ToLower() == "pdf")
            {
                html = $@"
            <object  classid=""clsid:CA8A9780-280D-11CF-A24D-444553540000"" width=""100%"" height=""100%"" border=""0""
            id=""FileObject"" name=""pdf"" VIEWASTEXT>
            <param name=""toolbar"" value=""false"">
            <param name=""_Version"" value=""65539"">
            <param name=""_ExtentX"" value=""20108"">
            <param name=""_ExtentY"" value=""10866"">
            <param name=""_StockProps"" value=""0"">
            <param name=""SRC"" value=""/_Framework/GetFile?id={id}&stream=true"">
           </object>
            ";
            }
            else
            {
                html = $@"<img id='FileObject' style='{(string.IsNullOrEmpty(width) ? "" : $"width:{width}px")}'  border=0 src='/_Framework/GetFile?id={id}&stream=true&_DONOT_USE_CS={_DONOT_USE_CS}'/>";
            }
            return Content(html);

        }

        public IActionResult OutSide(string url)
        {
            url = HttpUtility.UrlDecode(url);
            string pagetitle = string.Empty;
            var menu = Utils.FindMenu(url);
            if (menu == null)
            {
            }
            else
            {
                if (menu.ParentId != null)
                {
                    var pmenu = GlobaInfo.AllMenus.Where(x => x.ID == menu.ParentId).FirstOrDefault();
                    if (pmenu != null)
                    {
                        pagetitle = pmenu.PageName + " - ";
                    }
                }
                pagetitle += menu.PageName;
            }
            if (WtmContext.IsAccessable(url))
            {
                return Content($@"<title>{pagetitle}</title>
<iframe src='{url}' frameborder='0' class='layadmin-iframe'></iframe>");
            }
            else
            {
                throw new Exception(Program._localizer["NoPrivilege"]);
            }
        }

        /// <summary>
        /// 移除没有权限访问的菜单
        /// </summary>
        /// <param name="menus">菜单列表</param>
        /// <param name="info">用户信息</param>
        private void RemoveUnAccessableMenu(List<Menu> menus, LoginUserInfo info)
        {
            if (menus == null)
            {
                return;
            }

            List<Menu> toRemove = new List<Menu>();
            //如果没有指定用户信息，则用当前用户的登录信息
            if (info == null)
            {
                info = WtmContext.LoginUserInfo;
            }
            //循环所有菜单项
            foreach (var menu in menus)
            {
                //判断是否有权限，如果没有，则添加到需要移除的列表中
                var url = menu.Url;
                if (!string.IsNullOrEmpty(url) && url.StartsWith("/_framework/outside?url="))
                {
                    url = url.Replace("/_framework/outside?url=", "");
                }
                if (!string.IsNullOrEmpty(url) && WtmContext.IsAccessable(url) == false)
                {
                    toRemove.Add(menu);
                }
                //如果有权限，则递归调用本函数检查子菜单
                else
                {
                    RemoveUnAccessableMenu(menu.Children, info);
                }
            }
            //删除没有权限访问的菜单
            foreach (var remove in toRemove)
            {
                menus.Remove(remove);
            }
        }

        /// <summary>
        /// RemoveEmptyMenu
        /// </summary>
        /// <param name="menus"></param>
        private void RemoveEmptyMenu(List<Menu> menus)
        {
            if (menus == null)
            {
                return;
            }
            List<Menu> toRemove = new List<Menu>();
            //循环所有菜单项
            foreach (var menu in menus)
            {
                RemoveEmptyMenu(menu.Children);
                if ((menu.Children == null || menu.Children.Count == 0) && (menu.Url == null))
                {
                    toRemove.Add(menu);
                }
            }
            foreach (var remove in toRemove)
            {
                menus.Remove(remove);
            }
        }

        private void LocalizeMenu(List<Menu> menus)
        {
            if (menus == null)
            {
                return;
            }
            //循环所有菜单项
            foreach (var menu in menus)
            {
                LocalizeMenu(menu.Children);
                if (Core.Program._Callerlocalizer[menu.Title].ResourceNotFound == true)
                {
                    menu.Title = Core.Program._localizer[menu.Title];
                }
                else
                {
                    menu.Title = Core.Program._Callerlocalizer[menu.Title];
                }
            }
        }

        /// <summary>
        /// genreate menu
        /// </summary>
        /// <param name="menus"></param>
        /// <param name="resultMenus"></param>
        /// <param name="quickDebug"></param>
        private void GenerateMenuTree(List<SimpleMenu> menus, List<Menu> resultMenus, bool quickDebug = false)
        {
            resultMenus.AddRange(menus.Where(x => x.ParentId == null).Select(x => new Menu()
            {
                Id = x.ID,
                Title = x.PageName,
                Url = x.Url,
                Order = x.DisplayOrder,
                ICon = quickDebug && string.IsNullOrEmpty(x.Icon) ? $"_wtmicon _wtmicon-{(string.IsNullOrEmpty(x.Url) ? "folder" : "file")}" : x.Icon
            })
            .OrderBy(x => x.Order)
            .ToList());

            foreach (var menu in resultMenus)
            {
                var temp = menus.Where(x => x.ParentId == menu.Id).Select(x => new Menu()
                {
                    Id = x.ID,
                    Title = x.PageName,
                    Url = x.Url,
                    Order = x.DisplayOrder,
                    ICon = quickDebug && string.IsNullOrEmpty(x.Icon) ? $"_wtmicon _wtmicon-{(string.IsNullOrEmpty(x.Url) ? "folder" : "file")}" : x.Icon
                })
                .OrderBy(x => x.Order)
                .ToList();
                if (temp.Count() > 0)
                {
                    menu.Children = temp;
                    foreach (var item in menu.Children)
                    {
                        item.Children = menus.Where(x => x.ParentId == item.Id).Select(x => new Menu()
                        {
                            Title = x.PageName,
                            Url = x.Url,
                            Order = x.DisplayOrder,
                            ICon = quickDebug && string.IsNullOrEmpty(x.Icon) ? $"_wtmicon _wtmicon-{(string.IsNullOrEmpty(x.Url) ? "folder" : "file")}" : x.Icon
                        })
                        .OrderBy(x => x.Order)
                        .ToList();

                        if (item.Children.Count() == 0)
                            item.Children = null;
                    }
                }
            }
        }

        [HttpGet]
        public IActionResult Menu()
        {
            if (WtmContext.ConfigInfo.IsQuickDebug == true)
            {
                var resultMenus = new List<Menu>();
                GenerateMenuTree(GlobaInfo.AllMenus, resultMenus, true);
                RemoveEmptyMenu(resultMenus);
                LocalizeMenu(resultMenus);
                return Content(JsonSerializer.Serialize(new { Code = 200, Msg = string.Empty, Data = resultMenus }, new JsonSerializerOptions()
                {
                    IgnoreNullValues = true
                }), "application/json");
            }
            else
            {
                var resultMenus = new List<Menu>();
                GenerateMenuTree(GlobaInfo.AllMenus.Where(x => x.ShowOnMenu == true).ToList(), resultMenus);
                RemoveUnAccessableMenu(resultMenus, WtmContext.LoginUserInfo);
                RemoveEmptyMenu(resultMenus);
                LocalizeMenu(resultMenus);
                return Content(JsonSerializer.Serialize(new { Code = 200, Msg = string.Empty, Data = resultMenus }, new JsonSerializerOptions()
                {
                    IgnoreNullValues = true
                }), "application/json");
            }
        }

        [AllowAnonymous]
        public IActionResult IsAccessable(string url)
        {
            url = HttpUtility.UrlDecode(url);
            if (WtmContext.LoginUserInfo == null)
            {
                return Unauthorized();
            }
            else
            {
                bool canAccess = WtmContext.IsAccessable(url);
                return Ok(canAccess);
            }
        }

        [AllowAnonymous]
        [ResponseCache(Duration = 3600)]
        public string GetGithubStarts()
        {
            return WtmContext.ReadFromCache<string>("githubstar", () =>
            {
                var s = ConfigInfo.Domains["github"].CallAPI<github>("/repos/dotnetcore/wtm").Result;
                return s==null? "" :s.stargazers_count.ToString();
            }, 1800);
        }

        [AllowAnonymous]
        [ResponseCache(Duration = 3600)]
        public ActionResult GetGithubInfo()
        {
            var rv = WtmContext.ReadFromCache<string>("githubinfo", () =>
            {               
                var s = ConfigInfo.Domains["github"].CallAPI<github>("/repos/dotnetcore/wtm").Result;
                return JsonSerializer.Serialize(s);
            }, 1800);
            return Content(rv, "application/json");
        }

        [AllowAnonymous]
        [ResponseCache(Duration = 3600)]
        public string Redirect()
        {
            return "";
        }

        private class github
        {
            public int stargazers_count { get; set; }
            public int forks_count { get; set; }
            public int subscribers_count { get; set; }
            public int open_issues_count { get; set; }
        }

        [AllowAnonymous]
        public ActionResult GetVerifyCode()
        {
            int codeW = 80;
            int codeH = 30;
            int fontSize = 16;
            string chkCode = string.Empty;
            Color[] color = { Color.Black, Color.Red, Color.Blue, Color.Green, Color.Orange, Color.Brown, Color.DarkBlue, Color.PaleGreen };
            string[] font = { "Times New Roman" };
            char[] character = { '1', '2', '3', '4', '5', '6', '7', '8', '9', 'a', 'b', 'd', 'e', 'f', 'h', 'k', 'm', 'n', 'r', 'x', 'y', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'J', 'K', 'L', 'M', 'N', 'P', 'R', 'S', 'T', 'W', 'X', 'Y' };
            //生成验证码字符串
            Random rnd = new Random();
            for (int i = 0; i < 4; i++)
            {
                chkCode += character[rnd.Next(character.Length)];
            }
            //写入Session用于验证码校验，可以对校验码进行加密，提高安全性
            HttpContext.Session.Set<string>("verify_code", chkCode);

            //创建画布
            Bitmap bmp = new Bitmap(codeW, codeH);
            Graphics g = Graphics.FromImage(bmp);
            g.Clear(Color.Linen);

            //画噪线
            for (int i = 0; i < 3; i++)
            {
                int x1 = rnd.Next(codeW);
                int y1 = rnd.Next(codeH);
                int x2 = rnd.Next(codeW);
                int y2 = rnd.Next(codeH);

                Color clr = color[rnd.Next(color.Length)];
                g.DrawLine(new Pen(clr), x1, y1, x2, y2);
            }
            //画验证码
            for (int i = 0; i < chkCode.Length; i++)
            {
                string fnt = font[rnd.Next(font.Length)];
                Font ft = new Font(fnt, fontSize);
                Color clr = color[rnd.Next(color.Length)];
                g.DrawString(chkCode[i].ToString(), ft, new SolidBrush(clr), (float)i * 18, (float)0);
            }
            //将验证码写入图片内存流中，以image/png格式输出
            MemoryStream ms = new MemoryStream();
            try
            {
                bmp.Save(ms, ImageFormat.Png);
                return File(ms.ToArray(), "image/jpeg");
            }
            catch (Exception)
            {
                return null;
            }
            finally
            {
                g.Dispose();
                bmp.Dispose();
            }
        }

        [Public]
        public Dictionary<string, string> GetScriptLanguage()
        {
            Dictionary<string, string> rv = new Dictionary<string, string>();
            rv.Add("DONOTUSE_Text_LoadFailed", Program._localizer["LoadFailed"]);
            rv.Add("DONOTUSE_Text_SubmitFailed", Program._localizer["SubmitFailed"]);
            rv.Add("DONOTUSE_Text_PleaseSelect", Program._localizer["PleaseSelect"]);
            rv.Add("DONOTUSE_Text_FailedLoadData", Program._localizer["FailedLoadData"]);
            return rv;
        }

        [AllRights]
        [HttpPost]
        [ActionDescription("UploadForLayUIUEditor")]
        public IActionResult UploadForLayUIUEditor([FromServices] WtmFileProvider fp, string _DONOT_USE_CS = "default")
        {
            var fh = fp.CreateFileHandler(null, _DONOT_USE_CS);
            IWtmFile file = null;
            if (Request.Form.Files != null && Request.Form.Files.Count() > 0)
            {
                //通过文件流方式上传附件
                var FileData = Request.Form.Files[0];
                file = fh.Upload(FileData.FileName, FileData.Length, FileData.OpenReadStream());
            }
            else if (Request.Form.Keys != null && Request.Form.ContainsKey("FileID"))
            {
                //通过Base64方式上传附件
                var FileData = Convert.FromBase64String(Request.Form["FileID"]);
                MemoryStream MS = new MemoryStream(FileData);
                file = fh.Upload("SCRAWL_" + DateTime.Now.ToString("yyyyMMddHHmmssttt") + ".jpg", FileData.Length, MS);
                MS.Dispose();
            }



            if (file != null)
            {
                string url = $"/_Framework/GetFile?id={file.GetID()}&stream=true&_DONOT_USE_CS={CurrentCS}";
                return Content($"{{\"Code\": 200 , \"Msg\": \"success\", \"Data\": {{\"src\": \"{url}\",\"FileName\":\"{file.FileName}\"}}}}");

            }
            else
            {
                return Content($"{{\"code\": 1 , \"msg\": \"{Program._localizer["UploadFailed"]}\", \"data\": {{\"src\": \"\"}}}}");

            }


        }

        [Public]
        [ActionDescription("加载UEditor配置文件")]
        [ResponseCache(Duration = 3600)]
        [HttpGet]
        public IActionResult UEditorOptions()
        {
            if (ConfigInfo.UEditorOptions == null)
                throw new Exception($"Unregistered service: {nameof(ConfigInfo.UEditorOptions)}");
            return Json(ConfigInfo.UEditorOptions);
        }

        [Public]
        public IActionResult SetLanguage(string culture)
        {
            Response.Cookies.Append(
                CookieRequestCultureProvider.DefaultCookieName,
                CookieRequestCultureProvider.MakeCookieValue(new RequestCulture(culture)),
                new CookieOptions { Expires = DateTimeOffset.UtcNow.AddYears(1) }
            );

            return FFResult().AddCustomScript("location.reload();");
        }
    }

}
