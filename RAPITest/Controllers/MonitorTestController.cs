using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using System.IO;
using System.Security.Claims;
using System.Threading.Tasks;
using RAPITest.Attributes;
using Microsoft.AspNetCore.Http.Features;
using Microsoft.Extensions.Configuration;
using System.Linq;
using System.Net.Http;
using System.Collections.Generic;
using RAPITest.Models;
using System;
using Newtonsoft.Json.Linq;
using System.Text.Json;
using System.Text;
using Microsoft.EntityFrameworkCore;
using ModelsLibrary.Models.EFModels;
using Newtonsoft.Json;
using ModelsLibrary.Models.AppSpecific;
using RAPITest.Utils;
using RabbitMQ.Client;
using RabbitMQ.Client.Exceptions;
using System.Threading;

namespace RAPITest.Controllers
{
	[Authorize]
	[ApiController]
	[Route("[controller]/[action]")]
	public class MonitorTestController : Controller
	{
		private readonly ILogger<MonitorTestController> _logger;
		private readonly RAPITestDBContext _context;
		private readonly string RabbitMqHostName;
		private readonly int RabbitMqPort;

		public MonitorTestController(ILogger<MonitorTestController> logger, RAPITestDBContext context, IConfiguration config)
		{
			_logger = logger;
			_context = context;
			RabbitMqHostName = config.GetValue<string>("RabbitMqHostName");
			RabbitMqPort = config.GetValue<int>("RabbitMqPort");
		}

		[HttpGet]
		public IActionResult GetUserAPIs() 
		{
			var userId = User.FindFirstValue(ClaimTypes.NameIdentifier); // will give the user's userId

			List<UserInfoAPI> allAPIS = new List<UserInfoAPI>();

			List<Api> apis = _context.Api.Where(a => a.UserId == userId).ToList();
			apis = apis.FindAll(api => !(Encoding.Default.GetString(api.Tsl).Equals("") && !api.RunGenerated));

			foreach(Api api in apis)
			{
				UserInfoAPI userInfoAPI = new UserInfoAPI();
				userInfoAPI.APITitle = api.ApiTitle;
				userInfoAPI.NextTest = api.NextTest.GetValueOrDefault();
				userInfoAPI.ApiId = api.ApiId;

				ModelsLibrary.Models.EFModels.Report report = _context.Report.Where(r => r.ApiId == api.ApiId).OrderByDescending(r => r.ReportDate).FirstOrDefault();
				if(report != null)
				{
					string text = Encoding.Default.GetString(report.ReportFile);
					if(text[0] == '{')
					{
						//valid report
						ModelsLibrary.Models.Report re = JsonConvert.DeserializeObject<ModelsLibrary.Models.Report>(text);
						userInfoAPI.Errors = re.Errors;
						userInfoAPI.Warnings = re.Warnings;
						userInfoAPI.LatestReport = report.ReportDate;
					}
					else
					{
						//error report
						userInfoAPI.ErrorMessages = text.Split('\n').ToList();
					}
				}

				allAPIS.Add(userInfoAPI);
			}

			return Ok(allAPIS);
		}
		
		[HttpGet]
		public IActionResult DownloadReport([FromQuery] int apiId)   
		{
			var userId = User.FindFirstValue(ClaimTypes.NameIdentifier); // will give the user's userId

			ModelsLibrary.Models.EFModels.Report report = _context.Report.Where(r => r.ApiId == apiId).OrderByDescending(r => r.ReportDate).FirstOrDefault();
			if (report == null) return NotFound();

			string rep = Encoding.Default.GetString(report.ReportFile);
			return Ok(rep);
		}

		[HttpPut]
		public IActionResult ChangeApiTitle([FromQuery] int apiId, [FromQuery] string newTitle)
		{
			var userId = User.FindFirstValue(ClaimTypes.NameIdentifier); // will give the user's userId
			using (_context)
			{
				ModelsLibrary.Models.EFModels.Api api = _context.Api.Where(a => a.ApiId == apiId).FirstOrDefault();
				if (api == null) return NotFound();
				api.ApiTitle = newTitle;
				_context.SaveChanges();
			}
			return Ok();
		}

        [HttpPut]
        [DisableRequestSizeLimit]
        [DisableFormValueModelBinding]
        public IActionResult ChangeApi(IFormCollection data, [FromQuery] int apiId, [FromQuery] string newTitle )

        //public IActionResult ChangeApi([FromQuery] int apiId, [FromQuery] string newTitle, [FromBody] Dictionary<string, string> body, IFormCollection data)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier); // will give the user's userId
            using (_context)
            {
                ModelsLibrary.Models.EFModels.Api api = _context.Api.Where(a => a.ApiId == apiId).FirstOrDefault();
                if (api == null) return NotFound();

                Console.WriteLine("ChangeApi");

                Console.WriteLine("--------");
                Console.WriteLine(data);
                Console.WriteLine("--------");

                //string tslString = body.ContainsKey("tslString") ? body["tslString"] : null;
                //string specString = body.ContainsKey("specString") ? body["specString"] : null;

                Console.WriteLine(newTitle);

                //byte[] tslStringBytes = tslString != null ? Encoding.Default.GetBytes(tslString) : null;
                //byte[] specStringBytes = specString != null ? Encoding.Default.GetBytes(specString) : null;

                api.ApiTitle = newTitle;
                //api.ApiSpecification = specStringBytes;
                //api.Tsl = tslStringBytes;

                //_context.SaveChanges();




                //--------

                List<IFormFile> files = data.Files.ToList();

                foreach (var key in data.Keys)
                {
                    Console.WriteLine($"{key}: {data[key]}");
                }


                //var userId = User.FindFirstValue(ClaimTypes.NameIdentifier); // will give the user's userId
                using (_context)
                {
                    //Api newApi = _context.Api.OrderByDescending(x => x.ApiId).FirstOrDefault();

                    api.RunGenerated = data["rungenerated"] == "true";

                    List<IFormFile> tsls = new List<IFormFile>();
                    List<IFormFile> externalDlls = new List<IFormFile>();

                    foreach (var formFile in files)
                    {
                        if (formFile.Length > 0)
                        {
                            if (formFile.Name.Contains("tsl_"))
                            {
                                tsls.Add(formFile);
                            }
                            else if (formFile.Name.Contains("apiSpecification"))
                            {
                                using (var ms = new MemoryStream())
                                {
                                    formFile.CopyTo(ms);
                                    api.ApiSpecification = ms.ToArray();
                                }
                            }
                            else if (formFile.Name.Contains("dictionary"))
                            {
                                using (var ms = new MemoryStream())
                                {
                                    formFile.CopyTo(ms);
                                    api.Dictionary = ms.ToArray();
                                }
                            }
                            else
                            {
                                externalDlls.Add(formFile);
                            }
                        }
                    }

                    string filesConcatenated = "";
                    using (var ms = new MemoryStream())
                    {
                        foreach (IFormFile tsl in tsls)
                        {
                            using (var reader = new StreamReader(tsl.OpenReadStream()))
                            {
                                filesConcatenated += reader.ReadToEnd();
                            }
                        }
                    }

                    api.Tsl = Encoding.Default.GetBytes(filesConcatenated);

                    //radioButtons: [button1H, button12H, button24H, button1W, button1M, buttonNever] 
                    switch (data["interval"])
                    {
                        case "1 hour":
                            api.NextTest = DateTime.Now.AddHours(1);
                            api.TestTimeLoop = 1;
                            break;
                        case "12 hours":
                            api.NextTest = DateTime.Now.AddHours(12);
                            api.TestTimeLoop = 12;
                            break;
                        case "24 hours":
                            api.NextTest = DateTime.Now.AddDays(1);
                            api.TestTimeLoop = 24;
                            break;
                        case "1 week":
                            api.NextTest = DateTime.Now.AddDays(7);
                            api.TestTimeLoop = 168;
                            break;
                        default:  //Never
                            break;
                    }
                    int identityId = api.ApiId;

                    foreach (IFormFile external in externalDlls)
                    {
                        ExternalDll externalDll = new ExternalDll();
                        externalDll.ApiId = identityId;
                        using var ms = new MemoryStream();
                        external.CopyTo(ms);
                        externalDll.Dll = ms.ToArray();
                        externalDll.FileName = external.FileName;

                        _context.ExternalDll.Add(externalDll);
                    }
                    _context.SaveChanges();

                    Sender1(identityId, data["runimmediately"] == "true");

                    //--------




                }
                return Ok();
            }
        }

        //-------

        public void Sender1(int apiId, bool runImmediately)
        {
            var factory = new ConnectionFactory() { HostName = RabbitMqHostName, Port = RabbitMqPort };   //as longs as it is running in the same machine
            using (var connection = CreateConnection1(factory))
            using (var channel = connection.CreateModel())
            {
                channel.QueueDeclare(queue: "setup",
                                     durable: false,
                                     exclusive: false,
                                     autoDelete: false,
                                     arguments: null);

                string message = apiId + "|" + runImmediately;
                var body = Encoding.UTF8.GetBytes(message);

                channel.BasicPublish(exchange: "",
                                     routingKey: "setup",
                                     basicProperties: null,
                                     body: body);

                _logger.LogInformation("[x] Sent {0} ", message);
            }
        }

        private IConnection CreateConnection1(ConnectionFactory connectionFactory)
        {
            while (true)
            {
                try
                {
                    _logger.LogInformation("Attempting to connect to RabbitMQ....");
                    IConnection connection = connectionFactory.CreateConnection();
                    return connection;
                }
                catch (BrokerUnreachableException e)
                {
                    _logger.LogInformation("RabbitMQ Connection Unreachable, sleeping 5 seconds....");
                    Thread.Sleep(5000);
                }
            }
        }








        //-------

        [HttpGet]
		public IActionResult ReturnReport([FromQuery] int apiId) 
		{
			var userId = User.FindFirstValue(ClaimTypes.NameIdentifier); // will give the user's userId

			IOrderedQueryable<ModelsLibrary.Models.EFModels.Report> reports = _context.Report.Include(report => report.Api).Where(r => r.ApiId == apiId).OrderByDescending(r => r.ReportDate);
			ModelsLibrary.Models.EFModels.Report report = reports.FirstOrDefault();
			if (report == null) return NotFound();

            VisualizeReportModel v = new VisualizeReportModel();
			v.Report = Encoding.Default.GetString(report.ReportFile);
			v.ApiName = report.Api.ApiTitle;

			List<DateTime> dateTimes = new List<DateTime>();

			reports.AsEnumerable().ToList().ForEach(x => dateTimes.Add(x.ReportDate));

			v.AllReportDates = dateTimes;

			return Ok(v);
		}

        [HttpGet]
        public IActionResult ReturnTsl([FromQuery] int apiId)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier); // will give the user's userId

            IOrderedQueryable<ModelsLibrary.Models.EFModels.Report> reports = _context.Report.Include(report => report.Api).Where(r => r.ApiId == apiId).OrderByDescending(r => r.ReportDate);
            ModelsLibrary.Models.EFModels.Report report = reports.FirstOrDefault();
            if (report == null) return NotFound();

            ModelsLibrary.Models.EFModels.Api api = report.Api;

			string tsl = Encoding.Default.GetString(api.Tsl);
            Console.WriteLine(tsl);

			String tslS = new String(tsl);

			IActionResult ok = Ok(tslS);

			Console.WriteLine(ok.ToString());

            return Ok(tslS);
        }

        //----

        [HttpGet]
        public IActionResult ReturnDictionary([FromQuery] int apiId)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier); // will give the user's userId

            IOrderedQueryable<ModelsLibrary.Models.EFModels.Report> reports = _context.Report.Include(report => report.Api).Where(r => r.ApiId == apiId).OrderByDescending(r => r.ReportDate);
            ModelsLibrary.Models.EFModels.Report report = reports.FirstOrDefault();
            if (report == null) return NotFound();

            ModelsLibrary.Models.EFModels.Api api = report.Api;

            if (api.Dictionary == null || api.Dictionary.Length == 0)
            {
                return NotFound();
            }

            string dict = Encoding.Default.GetString(api.Dictionary);
            Console.WriteLine(dict);

            String dictS = new String(dict);

            IActionResult ok = Ok(dictS);

            Console.WriteLine(ok.ToString());


            return Ok(dictS);
        }

        [HttpGet]
        public IActionResult ReturnDll([FromQuery] int apiId)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier); // will give the user's userId

            IOrderedQueryable<ModelsLibrary.Models.EFModels.Report> reports = _context.Report.Include(report => report.Api).Where(r => r.ApiId == apiId).OrderByDescending(r => r.ReportDate);
            ModelsLibrary.Models.EFModels.Report report = reports.FirstOrDefault();
            if (report == null) return NotFound();

            ModelsLibrary.Models.EFModels.Api api = report.Api;

            var dllEntries = _context.ExternalDll
                            .Where(dll => dll.ApiId == apiId)
                            .Select(dll => new
                            {
                                dll.FileName,
                                DllContent = Convert.ToBase64String(dll.Dll) // Convert binary data to Base64
                            })
                            .ToList();

            // Check if any entries were found
            if (dllEntries == null || !dllEntries.Any())
            {
                return NotFound();
            }

            return Ok(dllEntries);
        }


        //----

        [HttpGet]
        public IActionResult ReturnSpec([FromQuery] int apiId)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier); // will give the user's userId

            IOrderedQueryable<ModelsLibrary.Models.EFModels.Report> reports = _context.Report.Include(report => report.Api).Where(r => r.ApiId == apiId).OrderByDescending(r => r.ReportDate);
            ModelsLibrary.Models.EFModels.Report report = reports.FirstOrDefault();
            if (report == null) return NotFound();

            ModelsLibrary.Models.EFModels.Api api = report.Api;

            string spec = Encoding.Default.GetString(api.ApiSpecification);
            Console.WriteLine(spec);

            String specS = new String(spec);

            IActionResult ok = Ok(specS);

            Console.WriteLine(ok.ToString());

            return Ok(specS);
        }

        [HttpGet]
		public IActionResult ReturnReportSpecific([FromQuery] int apiId, DateTime date)
		{
			var userId = User.FindFirstValue(ClaimTypes.NameIdentifier); // will give the user's userId

			IOrderedQueryable<ModelsLibrary.Models.EFModels.Report> reports = _context.Report.Include(report => report.Api).Where(r => r.ApiId == apiId).OrderByDescending(r => r.ReportDate);
			ModelsLibrary.Models.EFModels.Report report = reports.Where(x => x.ReportDate.Date == date.Date && x.ReportDate.Hour == date.Hour && x.ReportDate.Minute == date.Minute && x.ReportDate.Second == date.Second).FirstOrDefault();
			if (report == null) return NotFound();

			VisualizeReportModel v = new VisualizeReportModel();
			v.Report = Encoding.Default.GetString(report.ReportFile);
			v.ApiName = report.Api.ApiTitle;

			List<DateTime> dateTimes = new List<DateTime>();

			reports.AsEnumerable().ToList().ForEach(x => dateTimes.Add(x.ReportDate));

			v.AllReportDates = dateTimes;

			return Ok(v);
		}

		[HttpGet]
		public IActionResult GenerateMissingTestsTSL([FromQuery] int apiId)
		{
			var userId = User.FindFirstValue(ClaimTypes.NameIdentifier); // will give the user's userId

			IOrderedQueryable<ModelsLibrary.Models.EFModels.Report> reports = _context.Report.Include(report => report.Api).Where(r => r.ApiId == apiId).OrderByDescending(r => r.ReportDate);
			ModelsLibrary.Models.EFModels.Report report = reports.FirstOrDefault();
			if (report == null) return NotFound();

			ModelsLibrary.Models.Report rep = Newtonsoft.Json.JsonConvert.DeserializeObject<ModelsLibrary.Models.Report>(Encoding.Default.GetString(report.ReportFile));

			List<Workflow> workflows = new List<Workflow>();
			Workflow w = new Workflow();
			w.Tests = rep.MissingTests;
			w.WorkflowID = "MissingTestsTSL";
			
			workflows.Add(w);

			List<ModelsLibrary.Models.Workflow_D> file = TSLGenerator.GenerateTSL(workflows);

			return Ok(file);
		}

		[HttpDelete]
		public IActionResult RemoveApi([FromQuery] int apiId)
		{
			var userId = User.FindFirstValue(ClaimTypes.NameIdentifier); // will give the user's userId
			Api api = _context.Api.Include(api => api.ExternalDll).Include(api => api.Report).Where(a => a.UserId == userId && a.ApiId == apiId).FirstOrDefault();
			if (api == null) return NotFound();

			_context.Api.Remove(api);
			_context.SaveChanges();
			return Ok();
		}

		[HttpGet]
		public IActionResult RunNow([FromQuery] int apiId)
		{
			var userId = User.FindFirstValue(ClaimTypes.NameIdentifier); // will give the user's userId
			Api api = _context.Api.Include(api => api.ExternalDll).Include(api => api.Report).Where(a => a.UserId == userId && a.ApiId == apiId).FirstOrDefault();
			if (api == null) return NotFound();

			Sender(apiId);
			return Ok();
		}

		public void Sender(int apiId)
		{
			var factory = new ConnectionFactory() { HostName = RabbitMqHostName, Port = RabbitMqPort };   //as longs as it is running in the same machine
			using (var connection = factory.CreateConnection())
			using (var channel = connection.CreateModel())
			{
				channel.QueueDeclare(queue: "run",
									 durable: false,
									 exclusive: false,
									 autoDelete: false,
									 arguments: null);

				string message = apiId + "";
				var body = Encoding.UTF8.GetBytes(message);

				channel.BasicPublish(exchange: "",
									 routingKey: "run",
									 basicProperties: null,
									 body: body);

				_logger.LogInformation("[x] Sent {0} ", message);
			}
		}
	}
}
