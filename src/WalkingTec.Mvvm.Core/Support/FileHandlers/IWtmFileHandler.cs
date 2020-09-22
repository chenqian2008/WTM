using System;
using System.Collections.Generic;
using System.IO;
using System.Text;
using WalkingTec.Mvvm.Core.Models;

namespace WalkingTec.Mvvm.Core.Support.FileHandlers
{
    public interface IWtmFileHandler
    {
        IWtmFile Upload(string fileName, long fileLength, Stream data, string subdir=null, string extra=null);
        IWtmFile GetFile(string id, bool withData = true);

        void DeleteFile(string id);
        string GetFileName(string id);
    }
}
