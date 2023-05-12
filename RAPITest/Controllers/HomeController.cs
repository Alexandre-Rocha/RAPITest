using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using System.Security.Claims;
using Newtonsoft.Json.Linq;
using System.Diagnostics.CodeAnalysis;
using ModelsLibrary.Models.EFModels;
using RAPITest.Models;
using System.Text;
using Newtonsoft.Json;

namespace RAPITest.Controllers
{
	[Authorize]
	[ApiController]
	[Route("[controller]/[action]")]
	public class HomeController : Controller
	{
		private readonly RAPITestDBContext _context;
		private readonly ILogger<HomeController> _logger;

		public HomeController(ILogger<HomeController> logger, RAPITestDBContext context, IConfiguration config)
		{
			_context = context;
			_logger = logger;
		}

		[HttpGet]
		public IActionResult GetUserDetails()   //returns some statistics about the user
		{
			_logger.LogInformation("GetUserDetails endpoint");
			var userId = User.FindFirstValue(ClaimTypes.NameIdentifier); // will give the user's userId
			AspNetUsers currentUser = _context.AspNetUsers.Find(userId);
			if (currentUser == null) return NoContent();
			HomeUserInfo ret = new HomeUserInfo();
			ret.LatestActions = new List<ApiInfo>();
			List<Api> apis = _context.Api.Where(a => a.UserId == userId).ToList();
			apis = apis.FindAll(api => !(Encoding.Default.GetString(api.Tsl).Equals("") && !api.RunGenerated));

            _logger.LogInformation("Starting foreach...");
            foreach (Api api in apis)
			{
				ApiInfo apiInfo = new ApiInfo();
				apiInfo.ApiId = api.ApiId;
				apiInfo.Title = api.ApiTitle;
				if(api.NextTest != null)
				{
					apiInfo.NextTest = api.NextTest.Value;
				}
				Report latestReport = _context.Report.Where(r => r.ApiId == api.ApiId).ToList().OrderByDescending(r => r.ReportDate).FirstOrDefault(); 
				if(latestReport != null)
				{
                    _logger.LogInformation("latestReport not null");
                    apiInfo.ReportDate = latestReport.ReportDate;

					string text = Encoding.Default.GetString(latestReport.ReportFile);
					if (text[0] == '{')
					{
                        //valid report
                        _logger.LogInformation("Valid report");
                        ModelsLibrary.Models.Report re = JsonConvert.DeserializeObject<ModelsLibrary.Models.Report>(text);
						apiInfo.Errors = re.Errors;
						apiInfo.Warnings = re.Warnings;
					}
					else
					{
                        _logger.LogInformation("Invalid report");
                        apiInfo.Errors = -1;
					}
				}
				ret.LatestActions.Add(apiInfo);
			}
            _logger.LogInformation("After foreach");
            List<LoginRecord> loginRecords = _context.LoginRecord.Where(l => l.UserId == userId).ToList();
			DateTime lastlogin = loginRecords.Count == 1 ? loginRecords.First().LoginTime : loginRecords[loginRecords.Count - 2].LoginTime;

			ret.SetupApiCount = apis.Count;
			ret.LastLogin = lastlogin;

            _logger.LogInformation("Returning...");
            return Ok(ret);
		}
	}
}