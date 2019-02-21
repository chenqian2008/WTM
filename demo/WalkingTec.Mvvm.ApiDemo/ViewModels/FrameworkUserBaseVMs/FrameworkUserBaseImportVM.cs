﻿using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;
using WalkingTec.Mvvm.Core;
using WalkingTec.Mvvm.Core.Extensions;
using WalkingTec.Mvvm.Core;


namespace WalkingTec.Mvvm.ApiDemo.ViewModels.FrameworkUserBaseVMs
{
    public class FrameworkUserBaseTemplateVM : BaseTemplateVM
    {
        [Display(Name = "账号")]
        public ExcelPropety ITCode_Excel = ExcelPropety.CreateProperty<FrameworkUserBase>(x => x.ITCode);
        [Display(Name = "密码")]
        public ExcelPropety Password_Excel = ExcelPropety.CreateProperty<FrameworkUserBase>(x => x.Password);
        [Display(Name = "邮箱")]
        public ExcelPropety Email_Excel = ExcelPropety.CreateProperty<FrameworkUserBase>(x => x.Email);
        [Display(Name = "姓名")]
        public ExcelPropety Name_Excel = ExcelPropety.CreateProperty<FrameworkUserBase>(x => x.Name);
        [Display(Name = "性别")]
        public ExcelPropety Sex_Excel = ExcelPropety.CreateProperty<FrameworkUserBase>(x => x.Sex);
        [Display(Name = "手机")]
        public ExcelPropety CellPhone_Excel = ExcelPropety.CreateProperty<FrameworkUserBase>(x => x.CellPhone);
        [Display(Name = "座机")]
        public ExcelPropety HomePhone_Excel = ExcelPropety.CreateProperty<FrameworkUserBase>(x => x.HomePhone);
        [Display(Name = "住址")]
        public ExcelPropety Address_Excel = ExcelPropety.CreateProperty<FrameworkUserBase>(x => x.Address);
        [Display(Name = "邮编")]
        public ExcelPropety ZipCode_Excel = ExcelPropety.CreateProperty<FrameworkUserBase>(x => x.ZipCode);
        [Display(Name = "是否有效")]
        public ExcelPropety IsValid_Excel = ExcelPropety.CreateProperty<FrameworkUserBase>(x => x.IsValid);
        [Display(Name = "角色")]
        public ExcelPropety UserRoles_Excel = ExcelPropety.CreateProperty<FrameworkUserBase>(x => x.UserRoles);
        [Display(Name = "用户组")]
        public ExcelPropety UserGroups_Excel = ExcelPropety.CreateProperty<FrameworkUserBase>(x => x.UserGroups);

	    protected override void InitVM()
        {
            UserRoles_Excel.DataType = ColumnDataType.ComboBox;
            UserRoles_Excel.ListItems = DC.Set<FrameworkRole>().GetSelectListItems(LoginUserInfo.DataPrivileges, null, y => y.RoleName);
            UserGroups_Excel.DataType = ColumnDataType.ComboBox;
            UserGroups_Excel.ListItems = DC.Set<FrameworkGroup>().GetSelectListItems(LoginUserInfo.DataPrivileges, null, y => y.GroupName);
        }

    }

    public class FrameworkUserBaseImportVM : BaseImportVM<FrameworkUserBaseTemplateVM, FrameworkUserBase>
    {

    }

}
