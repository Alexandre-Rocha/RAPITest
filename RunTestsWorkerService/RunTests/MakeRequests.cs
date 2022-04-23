﻿using Microsoft.EntityFrameworkCore;
using ModelsLibrary.Models;
using ModelsLibrary.Models.AppSpecific;
using ModelsLibrary.Models.EFModels;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using RunTestsWorkerService.Utils;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Text;
using System.Threading.Tasks;
using Microsoft.AspNetCore.WebUtilities;
using System.Diagnostics;
using ModelsLibrary.Models.Language;
using RunTestsWorkerService.RunModels;
using System.Threading;

namespace RunTestsWorkerService.RunTests
{
	public class MakeRequests
	{
		public static async Task Make(CompleteTest firstTestSetup, Api api)
		{
			List<Task> tasks = new List<Task>();
			Dictionary<string, List<long>> stressTestResults = new Dictionary<string, List<long>>();

			HttpUtils httpUtils = HttpUtils.GetInstance();

			AutoGeneratedTests auto = new AutoGeneratedTests(firstTestSetup.GeneratedTests, httpUtils);
			tasks.Add(auto.Run());

			foreach (Workflow workflow in firstTestSetup.Workflows)
			{
				RunWorkflow twf = new RunWorkflow(workflow, httpUtils);
				tasks.Add(twf.Run());

				if(workflow.StressTest != null)
				{
					StressTests stressTests = new StressTests(workflow, httpUtils, workflow.StressTest.Threads, workflow.StressTest.Count, workflow.StressTest.Delay);
					tasks.Add(stressTests.Run().ContinueWith(dic => {
						stressTestResults = dic.Result;
					}));
				}
				
			}

			await Task.WhenAll(tasks);

			SetupStressResults(firstTestSetup, stressTestResults);

			WriteReport(firstTestSetup, api);
		}

		private static void SetupStressResults(CompleteTest firstTestSetup, Dictionary<string, List<long>> stressTestResults)
		{
			foreach (Workflow workflow in firstTestSetup.Workflows)
			{
				if (workflow.StressTest != null)
				{
					foreach (Test test in workflow.Tests)
					{
						if (stressTestResults.ContainsKey(test.TestID))
						{
							test.StressTimes = stressTestResults.GetValueOrDefault(test.TestID);
						}
					}
				}
			}
		}

		public static void WriteReport(CompleteTest firstTestSetup, Api api)
		{
			ModelsLibrary.Models.Report report = new ModelsLibrary.Models.Report();
			report.Errors = GetAllErrors(firstTestSetup.Workflows, firstTestSetup.GeneratedTests);
			report.WorkflowResults = firstTestSetup.Workflows;
			report.Warnings = firstTestSetup.MissingTests.Count();
			report.MissingTests = firstTestSetup.MissingTests;
			report.date = DateTime.Now;
			report.GeneratedTests = firstTestSetup.GeneratedTests;

			ModelsLibrary.Models.EFModels.Report r = new ModelsLibrary.Models.EFModels.Report();
			r.ReportFile = Encoding.Default.GetBytes(JsonSerialization.SerializeToJsonModed(report));
			r.ReportDate = report.date;
			r.ApiId = api.ApiId;

			api.Report.Add(r);
		}

		private static int GetAllErrors(List<Workflow> workflow, List<Test> generatedTests)
		{
			int errors = 0;
			foreach(Workflow work in workflow)
			{
				foreach(Test test in work.Tests)
				{
					foreach(Result result in test.TestResults)
					{
						if (!result.Success) errors++;
					}
				}
			}
			foreach (Test test in generatedTests)
			{
				foreach (Result result in test.TestResults)
				{
					if (!result.Success) errors++;
				}
			}
			return errors;
		}
		
	}
}
