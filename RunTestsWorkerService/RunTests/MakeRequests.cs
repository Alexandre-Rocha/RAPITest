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

namespace RunTestsWorkerService.RunTests
{
	public class MakeRequests
	{
		private static readonly HttpClient httpClient = new HttpClient();
		public async static Task Make(CompleteTest firstTestSetup, Api api)
		{
			int totalErrors = 0;
			List<Task> tasks = new List<Task>();

			foreach(Test generatedTest in firstTestSetup.GeneratedTests)
			{
				ChangeVariablePathGenerated(generatedTest);
				Task<HttpResponseMessage> task = Request(generatedTest);
				tasks.Add(task.ContinueWith(async result => { 
					totalErrors += await RunVerifications(generatedTest, result.Result);  
				}));
			}

			foreach (Workflow workflow in firstTestSetup.Workflows)
			{
				foreach(Test test in workflow.Tests)
				{
					ChangeVariablePath(workflow, test);
					Task<HttpResponseMessage> task = Request(test);
					await task;
					totalErrors += await RunVerifications(test, task.Result);
					Retain(workflow, test, task.Result);
				}
			}
			await Task.WhenAll(tasks);
			WriteReport(firstTestSetup,totalErrors, api);
		}

		private static void ChangeVariablePathGenerated(Test test)
		{
			while (true)
			{
				bool found = false;
				if (test.Path.Contains("{"))
				{
					int start = test.Path.IndexOf("{");
					int end = test.Path.IndexOf("}");
					string var = test.Path.Substring(start+1, end - start - 1);
					test.Path = test.Path.Replace("{" + var + "}", new Random().Next(10).ToString());
					found = true;
				}
				if (!found) break;
			}
		}

		private static void ChangeVariablePath(Workflow workflow, Test test)
		{
			List<string> foundVarPath = test.GetVariablePathKeys();
			foreach(string var in foundVarPath)
			{
				test.Path = test.Path.Replace("{" + var + "}", workflow.Retain.GetValueOrDefault(var).Value);
			}
		}

		private async static void Retain(Workflow workflow, Test test, HttpResponseMessage response)
		{
			if (test.Retain == null) return;
			foreach (string key in test.Retain)
			{
				Retained retained = workflow.Retain.GetValueOrDefault(key.Split('#')[0]);
				string body = await response.Content.ReadAsStringAsync();

				ALanguage language = ALanguage.GetLanguage(retained.Path);
				retained.Value = language.GetValue(retained.Path, body);
			}
		}

		private async static Task<int> RunVerifications(Test test, HttpResponseMessage response)
		{
			int totalErrors = 0;
			if (test.TestResults == null) test.TestResults = new List<Result>();
			foreach (Verification verification in test.NativeVerifications)
			{
				Result r = new Result();
				r = await verification.Verify(response);
				if (!r.Success) totalErrors++;
				test.TestResults.Add(r);
			}
			foreach (dynamic verification in test.ExternalVerifications)
			{
				Result r = new Result();
				dynamic result = await verification.Verify(response);
				r.Success = result.Success;
				r.Description = result.Description;
				r.TestName = result.TestName;
				if (!r.Success) totalErrors++;
				test.TestResults.Add(r);
			}
			return totalErrors;
		}

		public async static Task<HttpResponseMessage> Request(Test test)
		{
			var query = test.Query;
			var uri = QueryHelpers.AddQueryString(test.Server + test.Path, query);

			using (var requestMessage = new HttpRequestMessage(Convert(test.Method), uri))
			{
				if(test.Produces != null) requestMessage.Headers.Accept.Add(MediaTypeWithQualityHeaderValue.Parse(test.Produces));

				if (test.Body != null) requestMessage.Content = new StringContent(test.Body, Encoding.UTF8, test.Consumes);

				return await httpClient.SendAsync(requestMessage);
			}
		}

		public static HttpMethod Convert(Method method)
		{
			switch (method)
			{
				case (Method.Get):
					return HttpMethod.Get;
				case (Method.Post):
					return HttpMethod.Post;
				case (Method.Put):
					return HttpMethod.Put;
				case (Method.Delete):
					return HttpMethod.Delete;
			}
			return null;
		}

		public static void WriteReport(CompleteTest firstTestSetup, int totalErrors, Api api)
		{
			ModelsLibrary.Models.Report report = new ModelsLibrary.Models.Report();
			report.Errors = totalErrors;
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
	}
}
