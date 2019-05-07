﻿using System;
using Microsoft.AspNetCore.Razor.TagHelpers;
using WalkingTec.Mvvm.Core;

namespace WalkingTec.Mvvm.TagHelpers.LayUI
{
    public enum UploadTypeEnum { AllFiles, ImageFile, ZipFile, ExcelFile, WordFile, PDFFile, TextFile }

    [HtmlTargetElement("wt:upload", Attributes = REQUIRED_ATTR_NAME, TagStructure = TagStructure.WithoutEndTag)]
    public class UploadTagHelper : BaseFieldTag
    {
        public int FileSize { get; set; }

        public UploadTypeEnum UploadType { get; set; }

        public int? ThumbWidth { get; set; }

        public int? ThumbHeight { get; set; }

        public string CustomType { get; set; }

        public override void Process(TagHelperContext context, TagHelperOutput output)
        {
            output.TagName = "button";
            output.Attributes.Add("id", Id + "button");
            output.Attributes.Add("name", Id + "button");
            output.Attributes.Add("class", "layui-btn layui-btn-sm");
            output.Attributes.Add("type", "button");
            output.TagMode = TagMode.StartTagAndEndTag;
            output.Content.SetHtmlContent("选择文件");
            string ext = "";
            if (string.IsNullOrEmpty(CustomType))
            {
                switch (UploadType)
                {
                    case UploadTypeEnum.AllFiles:
                        ext = "";
                        break;
                    case UploadTypeEnum.ImageFile:
                        ext = "jpg|jpeg|gif|bmp|png|tif";
                        break;
                    case UploadTypeEnum.ZipFile:
                        ext = "zip";
                        break;
                    case UploadTypeEnum.ExcelFile:
                        ext = "xls|xlsx";
                        break;
                    case UploadTypeEnum.PDFFile:
                        ext = "pdf";
                        break;
                    case UploadTypeEnum.WordFile:
                        ext = "doc|docx";
                        break;
                    case UploadTypeEnum.TextFile:
                        ext = "txt";
                        break;
                }
            }
            else
            {
                ext = CustomType;
            }
            var vm = context.Items["model"] as BaseVM;
            var url = "/_Framework/Upload?1=1";
            if(UploadType == UploadTypeEnum.ImageFile)
            {
                url = "/_Framework/UploadImage?1=1";
                if(ThumbWidth != null)
                {
                    url += "&width=" + ThumbWidth;
                }
                if(ThumbHeight != null)
                {
                    url += "&height=" + ThumbHeight;
                }
            }
            if (vm != null)
            {
                url += $"&_DONOT_USE_CS={vm.CurrentCS}";
            }

            output.PreElement.SetHtmlContent($@"
<label id='{Id}label'></label>
");
            output.PostElement.SetHtmlContent($@"
<input type='hidden' id='{Id}' name='{Field.Name}' value='{Field.Model}' {(Field.Metadata.IsRequired ? " lay-verify=required" : string.Empty)} />
<script>
    function {Id}DoDelete(fileid){{
        $('#{Id}').parents('form').append(""<input type='hidden' id='DeletedFileIds' name='DeletedFileIds' value='""+fileid+""' />"");
        $('#{Id}label').html('');
        $('#{Id}').val('');
    }}
    var index = 0;
 
    //普通图片上传
    var uploadInst = layui.upload.render({{
        elem: '#{Id}button'
        ,url: '{url}'
        ,size: {FileSize}
        ,accept: 'images'
        ,exts: '{ext}'
        ,before: function(obj){{
            index = layui.layer.load(2);
        }}
        ,done: function(res){{
            layui.layer.close(index);
            if(res.Data.Id == ''){{
                layui.layer.msg('上传失败');
            }}
            else{{
                $('#{Id}').val(res.Data.Id);
                var del = ""<button class='layui-btn layui-btn-sm layui-btn-danger' type='button' id='{Id}del' style='color:white'>""+res.Data.Name+""  删除</button>"";
                $('#{Id}label').html(del);
                $('#{Id}del').on('click',function(){{
                    {Id}DoDelete(res.Data.Id);
                }});
            }}
        }}
        ,error: function(){{
            layui.layer.close(index);
        }}
    }});
</script>
");
            if (Field.Model != null && Field.Model.ToString() != Guid.Empty.ToString())
            {
                var geturl = $"/_Framework/GetFileName/{Field.Model}";
                if(vm != null)
                {
                    geturl += $"?_DONOT_USE_CS={vm.CurrentCS}";
                }
                output.PostElement.AppendHtml($@"
<script>
    $.ajax({{
        cache: false,
        type: 'GET',
        url: '{geturl}',
        async: false,
        success: function(data) {{
            var del = ""<button class='layui-btn layui-btn-sm layui-btn-danger' type='button' id='{Id}del' style='color:white'>""+data+""  删除</button>"";
            $('#{Id}label').html(del);
            $('#{Id}del').on('click',function(){{
                {Id}DoDelete('{Field.Model}');
            }});
        }}
    }});
</script>
");
            }
            base.Process(context, output);

        }
    }
}
