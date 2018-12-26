﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using WalkingTec.Mvvm.Mvc;
using WalkingTec.Mvvm.Mvc.Admin.ViewModels.FrameworkUserVms;
using WalkingTec.Mvvm.Core.Extensions;
using WalkingTec.Mvvm.Core;
using Microsoft.AspNetCore.Http;
using System.ComponentModel;

// For more information on enabling Web API for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace WalkingTec.Mvvm.ApiDemo
{
    /// <summary>
    /// 用户
    /// </summary>
    [ApiController]
    [Route("api/user")]
    [Public]
    public class UserController : BaseApiController
    {

        // GET: api/<controller>
        [HttpPost("Search")]
        public string Search(FrameworkUserSearcher searcher)
        {
            var vm = CreateVM<FrameworkUserListVM>();
            vm.Searcher = searcher;
            vm.DoSearch();
            return vm.GetJson();
        }

        // GET api/<controller>/5
        [HttpGet("{id}")]
        public FrameworkUserBase Get(Guid id)
        {
            var vm = CreateVM<FrameworkUserVM>(id);
            return vm.Entity;
        }

        // POST api/<controller>
        [HttpPost("Add")]
        public IActionResult Add(FrameworkUserVM vm)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }
            else
            {
                vm.DoAdd();
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }
                else
                {
                    return Ok(vm.Entity);
                }
            }

        }

        // PUT api/<controller>/5
        [HttpPut("Edit")]
        public IActionResult Edit(FrameworkUserVM vm)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }
            else
            {
                vm.DoEdit(true);
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }
                else
                {
                    return Ok(vm.Entity);
                }
            }
        }

        // DELETE api/<controller>/5
        [HttpGet("Delete/{id}")]
        public IActionResult Delete(Guid id)
        {
            var vm = CreateVM<FrameworkUserVM>(id);
            vm.DoDelete();
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }
            else
            {
                return Ok(vm.Entity);
            }

        }

        [HttpPost("ExportExcel")]
        [ActionDescription("导出")]
        public IActionResult ExportExcel(FrameworkUserSearcher searcher)
        {
            var vm = CreateVM<FrameworkUserListVM>();
                vm.Searcher = searcher;
                vm.SearcherMode = ListVMSearchModeEnum.Export;
            var data = vm.GenerateExcel();
            return File(data, "application/vnd.ms-excel", $"Export_FrameworkUser_{DateTime.Now.ToString("yyyy-MM-dd")}.xls");
        }

        [HttpPost("ExportExcelByIds")]
        [ActionDescription("导出")]
        public IActionResult ExportExcelByIds(List<Guid> ids)
        {
            var vm = CreateVM<FrameworkUserListVM>();
            if (ids != null && ids.Count > 0)
            {
                vm.Ids = ids;
                vm.SearcherMode = ListVMSearchModeEnum.CheckExport;
            }
            var data = vm.GenerateExcel();
            return File(data, "application/vnd.ms-excel", $"Export_FrameworkUser_{DateTime.Now.ToString("yyyy-MM-dd")}.xls");
        }

    }
}
